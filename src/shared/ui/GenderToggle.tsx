"use client";

import { useState } from "react";
import { Mars, Venus } from "lucide-react";

export const GenderToggle = () => {
  const [selected, setSelected] = useState<"male" | "female">("male");

  return (
    <div className="flex gap-4 w-full">
      <button
        onClick={() => setSelected("male")}
        className={`flex-1 py-6 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          selected === "male"
            ? "bg-blue-400 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Mars />
        남성
      </button>
      <button
        onClick={() => setSelected("female")}
        className={`flex-1 py-6 text-lg font-semibold rounded-xl transition-all flex items-center justify-center gap-2 ${
          selected === "female"
            ? "bg-pink-400 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <Venus />
        여성
      </button>
    </div>
  );
};
