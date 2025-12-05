"use client";

import { useState } from "react";
import {
  Baby,
  BanknoteArrowDown,
  HeartHandshake,
  IdCardLanyard,
  PersonStanding,
  School,
} from "lucide-react";

export const StateInput = () => {
  const [selectedStates, setSelectedStates] = useState<string[]>([]);

  const states = [
    {
      label: "대학생",
      value: "student",
      icon: <School />,
    },
    {
      label: "청년",
      value: "youth",
      icon: <PersonStanding />,
    },
    {
      label: "직장인",
      value: "employee",
      icon: <IdCardLanyard />,
    },
    {
      label: "기혼",
      value: "married",
      icon: <HeartHandshake />,
    },
    {
      label: "차상위",
      value: "low_income",
      icon: <BanknoteArrowDown />,
    },
    {
      label: "자녀",
      value: "child",
      icon: <Baby />,
    },
  ];

  const toggleState = (value: string) => {
    setSelectedStates((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 w-full justify-items-center">
      {states.map((state) => (
        <button
          key={state.value}
          onClick={() => toggleState(state.value)}
          className={`w-[100px] h-[100px] sm:w-[125px] sm:h-[125px] text-xs font-semibold rounded-xl transition-all flex flex-col items-center justify-center gap-2 border-2 ${
            selectedStates.includes(state.value)
              ? "border-blue-500 bg-blue-50"
              : "border-gray-200 hover:border-blue-500 hover:bg-blue-50"
          }`}
        >
          <span className="w-6 h-6 sm:w-8 sm:h-8">{state.icon}</span>
          <span>{state.label}</span>
        </button>
      ))}
    </div>
  );
};
