import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import axios from "axios";

// ------------------------------------------------------------------
// 1. Configuration & Constants
// ------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const YOUTH_CENTER_API_KEY = process.env.YOUTH_CENTER_API_KEY;
const GOV24_API_KEY = process.env.GOV24_API_KEY;

// ------------------------------------------------------------------
// 2. Helper Functions (Parsers & Mappers)
// ------------------------------------------------------------------

/**
 * 날짜 문자열(YYYYMMDD)을 YYYY-MM-DD 형식으로 변환
 */
const formatDate = (dateStr: string | undefined | null): string | null => {
  if (!dateStr) return null;
  const clean = dateStr.replace(/[^0-9]/g, "");
  if (clean.length === 8) {
    return `${clean.substring(0, 4)}-${clean.substring(4, 6)}-${clean.substring(6, 8)}`;
  }
  return null;
};

/**
 * 지역명 또는 코드를 표준화된 지역 코드 배열로 매핑
 */
const mapRegion = (regionNameOrCode: string | undefined): string[] => {
  if (!regionNameOrCode) return ["ALL"];

  const normalized = regionNameOrCode.replace(/\s/g, "");

  // 전국/중앙
  if (/전국|중앙|^00/.test(normalized)) return ["ALL"];

  // 광역 지자체
  if (/서울|^11/.test(normalized)) return ["SEOUL"];
  if (/부산|^26/.test(normalized)) return ["BUSAN"];
  if (/대구|^27/.test(normalized)) return ["DAEGU"];
  if (/인천|^28/.test(normalized)) return ["INCHEON"];
  if (/광주|^29/.test(normalized)) return ["GWANGJU"];
  if (/대전|^30/.test(normalized)) return ["DAEJEON"];
  if (/울산|^31/.test(normalized)) return ["ULSAN"];
  if (/세종|^36/.test(normalized)) return ["SEJONG"];
  if (/경기|^41/.test(normalized)) return ["GYEONGGI"];
  if (/강원|^42/.test(normalized)) return ["GANGWON"];
  if (/충(청)?북|^43/.test(normalized)) return ["CHUNGBUK"];
  if (/충(청)?남|^44/.test(normalized)) return ["CHUNGNAM"];
  if (/전(라)?북|^45/.test(normalized)) return ["JEONBUK"];
  if (/전(라)?남|^46/.test(normalized)) return ["JEONNAM"];
  if (/경(상)?북|^47/.test(normalized)) return ["GYEONGBUK"];
  if (/경(상)?남|^48/.test(normalized)) return ["GYEONGNAM"];
  if (/제주|^50/.test(normalized)) return ["JEJU"];

  // 주요 기초 지자체 예외 처리 (광역으로 매핑)
  if (
    /창원|진주|통영|사천|김해|밀양|거제|양산|의령|함안|창녕|고성|남해|하동|산청|함양|거창|합천/.test(
      normalized,
    )
  )
    return ["GYEONGNAM"];
  if (
    /포항|경주|김천|안동|구미|영주|영천|상주|문경|경산|군위|의성|청송|영양|영덕|청도|고령|성주|칠곡|예천|봉화|울진|울릉/.test(
      normalized,
    )
  )
    return ["GYEONGBUK"];
  if (
    /목포|여수|순천|나주|광양|담양|곡성|구례|고흥|보성|화순|장흥|강진|해남|영암|무안|함평|영광|장성|완도|진도|신안/.test(
      normalized,
    )
  )
    return ["JEONNAM"];
  if (/전주|군산|익산|정읍|남원|김제|완주|진안|무주|장수|임실|순창|고창|부안/.test(normalized))
    return ["JEONBUK"];
  if (/천안|공주|보령|아산|서산|논산|계룡|당진|금산|부여|서천|청양|홍성|예산|태안/.test(normalized))
    return ["CHUNGNAM"];
  if (/청주|충주|제천|보은|옥천|영동|증평|진천|괴산|음성|단양/.test(normalized))
    return ["CHUNGBUK"];
  if (
    /춘천|원주|강릉|동해|태백|속초|삼척|홍천|횡성|영월|평창|정선|철원|화천|양구|인제|고성|양양/.test(
      normalized,
    )
  )
    return ["GANGWON"];
  if (
    /수원|성남|의정부|안양|부천|광명|평택|동두천|안산|고양|과천|구리|남양주|오산|시흥|군포|의왕|하남|용인|파주|이천|안성|김포|화성|광주|양주|포천|여주|연천|가평|양평/.test(
      normalized,
    )
  )
    return ["GYEONGGI"];

  return ["ALL"];
};

/**
 * 정책 내용에서 혜택 태그를 추출
 */
const parseBenefitTags = (content: string): string[] => {
  const keywordMap: Record<string, string[]> = {
    "지원금/보조": ["현금", "지원금", "보조금", "수당", "장려금", "정착금", "비용", "부담금"],
    "대출/금융": ["대출", "융자", "보증", "이자지원", "채무", "금융", "신용", "자금"],
    "환급/감면": ["환급", "감면", "면제", "세액공제", "세제지원", "할인", "경감"],
    "현물/바우처": ["현물", "바우처", "물품", "쿠폰", "상품권", "급식", "식사", "주유권", "의료비"],
    "주거/시설": [
      "주거",
      "주택",
      "전세",
      "월세",
      "임대",
      "공간",
      "시설",
      "거주",
      "입주",
      "보금자리",
    ],
    "정보/교육": [
      "교육",
      "컨설팅",
      "상담",
      "자문",
      "정보",
      "매칭",
      "제공",
      "연계",
      "취업",
      "훈련",
      "기술",
      "노하우",
    ],
    "행정/법률": ["법률", "변호사", "행정", "절차", "신고", "인허가", "허가", "심사", "자격"],
  };

  const tags = new Set<string>();
  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((k) => content.includes(k))) {
      tags.add(category);
    }
  }

  if (tags.size === 0) tags.add("기타");
  return Array.from(tags);
};

/**
 * 정책 내용에서 대상(Target) 태그를 추출
 */
const parseStatusTargets = (content: string): string[] => {
  const keywordMap: Record<string, string[]> = {
    // 포괄 및 특수 대상
    청년: ["청년", "미래세대", "만 19세", "만 34세", "세대"],
    "외국인/이주민": ["외국인", "다문화", "이주민", "난민", "귀화", "비자", "이주여성", "국제결혼"],
    반려동물: [
      "반려동물",
      "반려견",
      "반려묘",
      "동물등록",
      "유기동물",
      "펫",
      "동물보호",
      "동물복지",
    ],

    // 생애 주기 및 성별
    "노인/은퇴": [
      "노인",
      "고령자",
      "은퇴",
      "퇴직",
      "재취업",
      "경로",
      "만 60세",
      "만 65세",
      "시니어",
    ],
    "여성/경력단절": [
      "여성",
      "경력단절",
      "육아휴직",
      "출산",
      "전업주부",
      "새로일하기",
      "여성 기업",
      "새일센터",
    ],
    "신혼/출산/아동": [
      "신혼부부",
      "출산",
      "임산부",
      "자녀",
      "다자녀",
      "영유아",
      "보육",
      "아동",
      "한부모",
    ],

    // 경제 및 복지 취약 계층
    저소득층: [
      "기초생활수급",
      "차상위",
      "기준 중위소득",
      "저소득",
      "경제적 어려움",
      "취약계층",
      "희망키움",
    ],
    "장애인/보훈": ["장애인", "장애의 정도", "장애 등록", "국가유공자", "보훈대상", "상이군경"],
    "이탈/보호종료": [
      "북한이탈주민",
      "학교 밖 청소년",
      "시설 퇴소 청소년",
      "쉼터 재입소",
      "보호종료",
      "자립지원",
    ],

    // 직업 및 학력 상태
    "대학생/재학생": [
      "대학생",
      "재학생",
      "휴학생",
      "대학원",
      "고등학생",
      "졸업예정",
      "입시",
      "특성화고",
    ],
    구직자: ["구직", "실업", "미취업", "미등록", "고용보험 미가입", "일자리 찾기", "취업 준비"],
    "직장인/재직자": ["재직", "근로", "직장인", "사업자", "고용보험 가입", "중소기업", "대기업"],
    전역예정장병: [
      "전역예정장병",
      "전직상담",
      "취업 서비스 지원",
      "군인",
      "제대",
      "예비군",
      "복무",
    ],

    // 특수 직업 및 산업
    "어업/농업인": [
      "생산자단체",
      "수산자원 관리",
      "어업",
      "농가",
      "영농",
      "농업",
      "농촌",
      "귀농",
      "귀어",
    ],
    "기술/창업": [
      "스마트 디바이스",
      "창의적 아이디어",
      "시제품",
      "사업화",
      "인프라 구축",
      "스타트업",
      "벤처기업",
      "기술보증",
    ],
    "예술/문화": ["예술인", "문화", "예술", "창작", "창의", "콘텐츠"],
    "의료/보건": ["의료인", "간호사", "의사", "보건소", "공중보건", "건강증진", "방역"],
    "교육/교직": ["교사", "교직원", "강사", "교육청", "방과후", "학교폭력", "학습"],

    // 주거 및 환경
    주거취약: [
      "무주택",
      "주거급여",
      "주택 지원",
      "전세",
      "월세",
      "임대",
      "주거비 부담",
      "LH",
      "SH",
    ],
    "환경/에너지": ["환경", "에너지", "탄소중립", "폐기물", "패널", "태양광", "쓰레기", "오염방지"],

    // 지역 및 행정
    지역특화: ["지역 정착 유도", "지역경제 활성화", "특화산업", "도내", "특정 지역"],
    "행정/규제개선": ["규제 완화", "법률 지원", "인허가", "신고", "절차 간소화", "법적"],
    "공공/사회봉사": ["공공기관", "자원봉사", "사회 공헌", "시민단체", "협의체", "시민참여"],
  };

  const tags = new Set<string>();
  const normalizedContent = content.toLowerCase().replace(/\s/g, "");

  for (const [category, keywords] of Object.entries(keywordMap)) {
    if (keywords.some((k) => normalizedContent.includes(k))) {
      tags.add(category);
    }
  }

  return Array.from(tags);
};

// ------------------------------------------------------------------
// 3. Sync Functions
// ------------------------------------------------------------------

/**
 * 청년센터 (Youth Center) 데이터 동기화
 */
async function syncYouthCenter() {
  if (!YOUTH_CENTER_API_KEY) throw new Error("YOUTH_CENTER_API_KEY is missing");

  console.log("[YouthCenter] Starting full sync...");

  let pageIndex = 1;
  const pageSize = 100;
  let totalCount = 0;
  let totalSynced = 0;

  // 1. 전체 개수 파악
  const firstParams = new URLSearchParams({
    apiKeyNm: YOUTH_CENTER_API_KEY,
    pageNum: "1",
    pageSize: "1",
    rtnType: "json",
  });
  const { data: firstData } = await axios.get(
    `https://www.youthcenter.go.kr/go/ythip/getPlcy?${firstParams}`,
  );
  const paging = firstData.result?.pagging || firstData.pagging; // API 응답 구조 대응

  if (paging && paging.totCount) {
    totalCount = paging.totCount;
    console.log(`[YouthCenter] Total policies to sync: ${totalCount}`);
  } else {
    console.warn("[YouthCenter] Cannot determine total count, defaulting to 1 page check.");
    totalCount = 100; // Fallback
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  // 2. 페이지네이션 루프
  for (let i = 1; i <= totalPages; i++) {
    console.log(`[YouthCenter] Fetching page ${i}/${totalPages}...`);

    const params = new URLSearchParams({
      apiKeyNm: YOUTH_CENTER_API_KEY,
      pageNum: i.toString(),
      pageSize: pageSize.toString(),
      rtnType: "json",
    });

    let policies = [];
    try {
      const { data } = await axios.get(`https://www.youthcenter.go.kr/go/ythip/getPlcy?${params}`);
      policies = data.youthPolicyList || data.result?.youthPolicyList || [];
    } catch (e) {
      console.error(`[YouthCenter] Failed to fetch page ${i}:`, e);
      continue;
    }

    if (policies.length === 0) continue;

    const upsertData = policies.map((p: any) => {
      const content = (p.plcySprtCn || "") + (p.plcyExplnCn || "") + (p.plcyNm || "");

      return {
        api_source: "YOUTH",
        source_id: p.plcyNo,
        title: p.plcyNm,
        summary: p.plcyExplnCn?.substring(0, 300),
        agency_name: p.sprvsnInstCdNm,
        apply_url: `https://www.youthcenter.go.kr/youthPolicy/ythPlcyTotalSearch/ythPlcyDetail/${p.plcyNo}`,
        min_age: parseInt(p.sprtTrgtMinAge) || 0,
        max_age: parseInt(p.sprtTrgtMaxAge) || 100,
        region_codes: mapRegion(p.zipCd || p.polyBizSecd),
        status_targets: parseStatusTargets(content),
        start_date: formatDate(p.bizPrdBgngYmd),
        end_date: formatDate(p.bizPrdEndYmd),
        benefit_tags: parseBenefitTags(content),
        topic_tags: [p.lclsfNm || "기타"],
        view_count: parseInt(p.inqCnt) || 0,
      };
    });

    if (upsertData.length > 0) {
      const { error } = await supabase.from("policies").upsert(upsertData, {
        onConflict: "api_source, source_id",
      });
      if (error) {
        console.error(`[YouthCenter] Page ${i} upsert error:`, error);
      } else {
        totalSynced += upsertData.length;
      }
    }
  }

  console.log(`[YouthCenter] ✅ Sync Completed! Total Synced: ${totalSynced}`);
  return totalSynced;
}

// Helper: 지연 함수 (Rate Limit 방지)
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * 정부24 (Gov24) 데이터 동기화
 */
async function syncGov24() {
  if (!GOV24_API_KEY) throw new Error("GOV24_API_KEY is missing");

  console.log("[Gov24] Starting full sync...");

  const pageSize = 50; // 상세 조회 부하 고려하여 50개씩
  let totalCount = 0;
  let totalSynced = 0;

  // 1. 전체 개수 파악
  const firstParams = new URLSearchParams({
    serviceKey: GOV24_API_KEY,
    page: "1",
    perPage: "1",
    returnType: "JSON",
  });
  const { data: firstData } = await axios.get(
    `https://api.odcloud.kr/api/gov24/v3/serviceList?${firstParams}`,
  );

  if (firstData.totalCount) {
    totalCount = firstData.totalCount;
    console.log(`[Gov24] Total services to sync: ${totalCount}`);
  } else {
    console.warn("[Gov24] Cannot determine total count, defaulting to 100.");
    totalCount = 100;
  }

  // 너무 많은 요청 방지를 위해 최대 2000개로 제한 (필요 시 해제)
  // totalCount = Math.min(totalCount, 2000);

  const totalPages = Math.ceil(totalCount / pageSize);

  // 2. 페이지네이션 루프
  for (let i = 1; i <= totalPages; i++) {
    console.log(`[Gov24] Fetching page ${i}/${totalPages}...`);

    const params = new URLSearchParams({
      serviceKey: GOV24_API_KEY,
      page: i.toString(),
      perPage: pageSize.toString(),
      returnType: "JSON",
    });

    let services = [];
    try {
      const { data: listData } = await axios.get(
        `https://api.odcloud.kr/api/gov24/v3/serviceList?${params}`,
      );
      services = listData.data || [];
    } catch (e) {
      console.error(`[Gov24] Failed to fetch page ${i}:`, e);
      continue; // 해당 페이지 실패 시 다음 페이지로 진행
    }

    if (services.length === 0) continue;

    // 병렬 처리로 상세 정보 조회 (Rate Limit 고려하여 청크 단위 처리 또는 지연 추가 권장)
    // 여기서는 단순 병렬 처리하되, 너무 빠르면 400/429 에러 발생 가능성 있음
    const promises = services.map(async (item: any, index: number) => {
      // 약간의 지연 추가 (순차적 실행 효과)
      await delay(index * 50);

      const svcId = item["서비스ID"];
      let detail = {};

      try {
        const baseParams = new URLSearchParams({
          serviceKey: GOV24_API_KEY!,
          returnType: "JSON",
        });
        const queryString = `${baseParams.toString()}&cond[서비스ID::EQ]=${svcId}`;

        const { data: detailData } = await axios.get(
          `https://api.odcloud.kr/api/gov24/v3/serviceDetail?${queryString}`,
        );
        if (detailData.data && detailData.data.length > 0) {
          detail = detailData.data[0];
        }
      } catch (e) {
        console.error(`Failed to fetch detail for ${svcId}`, e);
      }

      const content =
        (item["지원대상"] || "") + (item["선정기준"] || "") + ((detail as any)["지원대상"] || "");
      const benefitContent =
        (item["지원유형"] || "") + (item["서비스명"] || "") + ((detail as any)["서비스목적"] || "");

      return {
        api_source: "GOV24",
        source_id: svcId,
        title: item["서비스명"],
        summary: (detail as any)["서비스목적"] || item["서비스목적요약"],
        agency_name: item["소관기관명"],
        apply_url: `https://www.gov.kr/portal/service/serviceInfo/${svcId}`,
        min_age: 0,
        max_age: 100,
        region_codes: mapRegion(item["소관기관명"]),
        status_targets: parseStatusTargets(content),
        start_date: null,
        end_date: null,
        benefit_tags: parseBenefitTags(benefitContent),
        topic_tags: item["서비스분야"] ? [item["서비스분야"]] : ["기타"],
        view_count: parseInt(item["조회수"]) || 0,
      };
    });

    const upsertData = await Promise.all(promises);

    if (upsertData.length > 0) {
      const { error } = await supabase.from("policies").upsert(upsertData, {
        onConflict: "api_source, source_id",
      });
      if (error) {
        console.error(`[Gov24] Page ${i} upsert error:`, error);
      } else {
        totalSynced += upsertData.length;
      }
    }
  }

  console.log(`[Gov24] ✅ Sync Completed! Total Synced: ${totalSynced}`);
  return totalSynced;
}

// ------------------------------------------------------------------
// 4. API Handler
// ------------------------------------------------------------------

export async function GET(request: Request) {
  try {
    // 보안 인증: CRON_SECRET 확인
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.time("BatchSync");
    const [youthCount, govCount] = await Promise.all([syncYouthCenter(), syncGov24()]);
    console.timeEnd("BatchSync");
    console.log("🎉 All Sync Tasks Completed Successfully!");

    return NextResponse.json({
      success: true,
      message: `Synced ${youthCount} Youth Center policies and ${govCount} Gov24 policies.`,
    });
  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
