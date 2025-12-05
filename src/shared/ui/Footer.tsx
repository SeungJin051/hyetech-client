"use client";

import { usePathname } from "next/navigation";

export const Footer = () => {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <footer className="bg-blue-50 border-t border-gray-100 mt-4">
      <div className="container mx-auto max-w-4xl p-5 h-40 flex flex-col gap-2">
        <h4 className="text-base font-bold">혜테크 - 잠자고 있는 내 지원금 찾기</h4>
        <p className="text-xs/6 text-gray-400">
          사용자의 거주지, 나이, 성별 정보를 기반으로 맞춤형 지원금을 쉽게 찾아주는 서비스입니다. 본
          서비스에서 제공하는 정보는 참고용이며, 최종 확인은 반드시 해당 정부 기관에서 진행해
          주세요. 정보는 신뢰할 수 있는 출처에서 제공되지만, 정확성이나 최신성을 완전히 보장할 수
          없으며, 내용이 변경될 수 있습니다. 서비스 이용으로 발생하는 누락 또는 오류에 대해서는
          개발자가 법적 책임을 지지 않습니다.
        </p>
      </div>
    </footer>
  );
};
