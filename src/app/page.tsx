"use client";

import { Button, Hero } from "@/shared/ui";
import { Eye, Search } from "lucide-react";
import Link from "next/link";

const soonToBeSupported = [
  {
    title: "2025년 상생페이백",
    count: 18449,
    daysLeft: 1,
  },
  {
    title: "청년 일자리 도약 장려금",
    count: 15285,
    daysLeft: 2,
  },
  {
    title: "경차 유류세 환급 제도",
    count: 5144,
    daysLeft: 3,
  },
];

const themes = [
  { key: "pet", title: "반려동물 지원", description: "진료비·입양·등록 지원 등" },
  { key: "housing", title: "주거·전월세", description: "청년 전월세, 보증금, 에너지 바우처" },
  { key: "job", title: "취업·창업", description: "청년 일자리·창업 지원 한 번에" },
];

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      {/* 메인 컨테이너 */}
      <div className="flex flex-col gap-4">
        {/* 시작하기 */}
        <Hero bigtitle="잠자고 있는 내 지원금 찾아보세요">
          <Link href="/find">
            <Button fullWidth variant="primary">
              <Search size={14} />
              찾아보기
            </Button>
          </Link>
        </Hero>

        {/* 현재 주목받는 지원금 */}
        <Hero title="👀 현재 주목받는 지원금">
          <div className="flex flex-col gap-4">
            {soonToBeSupported.map((policy, index) => (
              <div
                key={index}
                className={`flex flex-col gap-2 pb-2 ${
                  index !== soonToBeSupported.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex flex-col gap-1">
                    <h4 className="text-base font-semibold">{policy.title}</h4>
                    <div className="flex items-center gap-2">
                      <Eye width={15} />
                      <p className="text-sm text-gray-500">{policy.count?.toLocaleString() || 0}</p>
                    </div>
                  </div>
                  <Button variant="ghost">신청하기</Button>
                </div>
              </div>
            ))}
          </div>
        </Hero>

        {/* 테마 섹션 */}
        <Hero title="상황별로 골라보기" bgColor="bg-orange-50">
          <Hero>
            <div className="flex flex-col gap-4">
              {themes.map((t) => (
                <div key={t.key} className="flex justify-between items-center">
                  <div className="flex flex-col text-left">
                    <span className="font-semibold">{t.title}</span>
                    <span className="text-xs text-gray-500">{t.description}</span>
                  </div>
                  <Button variant="ghost" size="sm">
                    자세히
                  </Button>
                </div>
              ))}
            </div>
          </Hero>
        </Hero>

        {/* 곧 놓치는 지원금 */}
        <Hero title="💡 곧 놓치는 지원금" bgColor="bg-red-50">
          <Hero>
            <div className="flex flex-col gap-4">
              {soonToBeSupported.map((support, index) => (
                <div key={index} className={`flex flex-col gap-2 pb-2 `}>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-col gap-1">
                      <h4 className="text-base font-semibold">{support.title}</h4>
                      <div className="flex items-center gap-2">
                        <Eye width={15} />
                        <p className="text-sm text-gray-500">{support.count.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">{support.daysLeft}일 남음</p>
                      </div>
                    </div>
                    <Button variant="ghost">신청하기</Button>
                  </div>
                </div>
              ))}
            </div>
          </Hero>
        </Hero>
      </div>
    </div>
  );
}
