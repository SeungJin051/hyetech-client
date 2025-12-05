"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50 mb-4">
      <div className="container mx-auto max-w-4xl px-4 h-16 flex items-center justify-between">
        <>
          <div className="flex items-center gap-2">
            <Image src="/vercel.svg" alt="Logo" width={50} height={50} />
            <h1 className="text-xl font-bold text-gray-900">혜테크</h1>
          </div>
          <div className="flex items-center gap-8">
            {/* 데스크탑 메뉴 */}
            <nav className="hidden md:flex items-center gap-8 text-gray-700">
              <Link href="/">홈</Link>
              <Link href="/">혜택 찾기</Link>
            </nav>

            {/* 모바일 햄버거 */}
            <button
              type="button"
              className="md:hidden p-2 rounded-md text-gray-700"
              onClick={() => setOpen((prev) => !prev)}
              aria-label="메뉴 토글"
              aria-expanded={open}
            >
              {open ? <X /> : <Menu />}
            </button>
          </div>
        </>
      </div>

      {/* 모바일 메뉴 */}
      {open && (
        <nav className="md:hidden border-t border-gray-100 bg-white">
          <div className="container mx-auto max-w-4xl px-4 py-2 flex flex-col gap-5 text-gray-700">
            <Link href="/" onClick={() => setOpen(false)}>
              홈
            </Link>
            <Link href="/" onClick={() => setOpen(false)}>
              혜택 찾기
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};
