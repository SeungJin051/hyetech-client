import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import axios from "axios";

// Supabase Client (Service Role Key 사용 권장)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// API Keys & URLs
const YOUTH_CENTER_API_KEY = process.env.YOUTH_CENTER_API_KEY;
const YOUTH_CENTER_URL = "https://www.youthcenter.go.kr/go/ythip/getPlcy";

const GOV24_API_KEY = process.env.GOV24_API_KEY;
const GOV24_BASE_URL = "https://api.odcloud.kr/api/gov24/v3";

// 날짜 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
const formatDate = (dateStr: string) => {
  if (!dateStr || dateStr.length !== 8) return null;
  return `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`;
};

async function syncYouthCenter() {
  if (!YOUTH_CENTER_API_KEY) throw new Error("YOUTH_CENTER_API_KEY is missing");

  console.log("[YouthCenter] Starting sync...");

  // 1. 온통청년 API 호출
  const params = new URLSearchParams({
    apiKeyNm: YOUTH_CENTER_API_KEY,
    pageNum: "1",
    pageSize: "20",
    rtnType: "json",
    zipCd: "11000", // 서울
  });

  const { data } = await axios.get(`${YOUTH_CENTER_URL}?${params}`);

  if (!data.youthPolicyList) {
    throw new Error("[YouthCenter] Invalid API response format");
  }

  const policies = data.youthPolicyList;
  const upsertData = [];

  // 2. 데이터 정규화
  for (const p of policies) {
    const benefitTags = [];
    const content = (p.plcySprtCn || "") + (p.plcyExplnCn || "");
    if (content.includes("현금") || content.includes("지원금") || content.includes("수당"))
      benefitTags.push("지원금");
    if (content.includes("대출") || content.includes("융자")) benefitTags.push("대출");
    if (content.includes("환급") || content.includes("공제")) benefitTags.push("환급금");
    if (content.includes("교육") || content.includes("컨설팅")) benefitTags.push("정보제공");

    if (benefitTags.length === 0) benefitTags.push("정보제공");

    upsertData.push({
      source: "youthcenter",
      external_id: p.plcyNo,
      title: p.plcyNm,
      summary: p.plcyExplnCn?.substring(0, 200) + (p.plcyExplnCn?.length > 200 ? "..." : ""),
      detail_url:
        p.aplyUrlAddr ||
        `https://www.youthcenter.go.kr/youngPlcyUnif/youngPlcyUnifDtl.do?bizId=${p.plcyNo}`,
      min_age: parseInt(p.sprtTrgtMinAge) || null,
      max_age: parseInt(p.sprtTrgtMaxAge) || null,
      region_codes: ["11000"],
      start_date: formatDate(p.bizPrdBgngYmd),
      end_date: formatDate(p.bizPrdEndYmd),
      benefit_tags: benefitTags,
      raw_payload: p,
    });
  }

  // 3. Supabase Upsert
  const { error } = await supabase.from("policies").upsert(upsertData, {
    onConflict: "source, external_id",
  });

  if (error) {
    console.error("[YouthCenter] Supabase upsert error:", error);
    throw error;
  }

  console.log(`[YouthCenter] Synced ${upsertData.length} policies.`);
  return upsertData.length;
}

async function syncGov24() {
  if (!GOV24_API_KEY) throw new Error("GOV24_API_KEY is missing");

  console.log("[Gov24] Starting sync...");

  // 1. 목록 조회
  const listParams = new URLSearchParams({
    page: "1",
    perPage: "10",
    serviceKey: GOV24_API_KEY,
  });

  const { data: listData } = await axios.get(`${GOV24_BASE_URL}/serviceList?${listParams}`);

  if (!listData.data) throw new Error("[Gov24] Invalid API response");

  const upsertData = [];

  // 2. 상세 정보 및 조건 조회
  for (const item of listData.data) {
    const svcId = item["서비스ID"];

    // 상세 조회
    const detailParams = new URLSearchParams({
      "cond[서비스ID::EQ]": svcId,
      serviceKey: GOV24_API_KEY,
    });
    const { data: detailJson } = await axios.get(`${GOV24_BASE_URL}/serviceDetail?${detailParams}`);
    const detail = detailJson.data ? detailJson.data[0] : {};

    // 조건 조회
    const condParams = new URLSearchParams({
      "cond[서비스ID::EQ]": svcId,
      serviceKey: GOV24_API_KEY,
    });
    const { data: condJson } = await axios.get(`${GOV24_BASE_URL}/supportConditions?${condParams}`);
    const conditions = condJson.data ? condJson.data[0] : {};

    const benefitTags = [];
    if (item["지원유형"]?.includes("현금")) benefitTags.push("지원금");
    if (item["지원유형"]?.includes("보육")) benefitTags.push("돌봄");
    if (benefitTags.length === 0) benefitTags.push("정보제공");

    upsertData.push({
      source: "gov24",
      external_id: svcId,
      title: item["서비스명"],
      summary: detail["서비스목적"]?.substring(0, 200) || item["서비스명"],
      detail_url: detail["온라인신청사이트URL"] || detail["상세조회URL"] || "",
      min_age: parseInt(conditions["JA0101"]) || null,
      max_age: parseInt(conditions["JA0102"]) || null,
      region_codes: ["ALL"],
      benefit_tags: benefitTags,
      raw_payload: { list: item, detail, conditions },
    });
  }

  const { error } = await supabase.from("policies").upsert(upsertData, {
    onConflict: "source, external_id",
  });

  if (error) {
    console.error("[Gov24] Supabase upsert error:", error);
    throw error;
  }
  console.log(`[Gov24] Synced ${upsertData.length} policies.`);
  return upsertData.length;
}

export async function GET(request: Request) {
  try {
    console.log("Starting batch sync for all policy sources...");

    const results = await Promise.allSettled([
      syncYouthCenter().catch((e) => {
        console.error(`[YouthCenter] Sync failed: ${e.message}`);
        throw e;
      }),
      syncGov24().catch((e) => {
        console.error(`[Gov24] Sync failed: ${e.message}`);
        throw e;
      }),
    ]);

    const summary = results.map((r, i) => ({
      source: i === 0 ? "YouthCenter" : "Gov24",
      status: r.status,
      value: r.status === "fulfilled" ? r.value : r.reason.message,
    }));

    return NextResponse.json({
      success: true,
      message: "Batch sync completed.",
      summary,
    });
  } catch (error: any) {
    console.error("Batch sync failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
