"use client";

import { REGIONS } from "@/shared/config";
import { Button, GenderToggle, Hero, StateInput, YearInput } from "@/shared/ui";
import { Baby, ChevronRight, DecimalsArrowRight, MapPinHouse } from "lucide-react";
import { useState } from "react";

// case 1: 거주지 선택
// case 2: 나이 입력
// case 3: 성별 선택
// case 4: 상태 선택
// case 5: 전체 확인 후 검색

export default function FindPage() {
  const [selectedRegion, setSelectedRegion] = useState<string | null>("서울특별시");
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const [step, setStep] = useState<number>(1);

  const handleNext = () => {
    setStep(step + 1);
  };

  return (
    <div className="flex-1 flex flex-col gap-4">
      {/* case 1: 거주지 선택 */}
      {step === 1 && (
        <>
          <Hero>
            <div className="flex items-center gap-4">
              <MapPinHouse />
              <p className="text-xl font-light">혜택 지역 확인을 위해 거주지를 선택해주세요.</p>
            </div>
          </Hero>
          <Hero>
            <div className="flex gap-2 sm:gap-4 max-h-[400px] sm:max-h-[600px] md:max-h-[700px]">
              <div className="flex flex-col gap-2 sm:gap-3 md:gap-4 overflow-y-auto w-[40%]">
                {Object.keys(REGIONS).map((region) => (
                  <div
                    key={region}
                    onClick={() => setSelectedRegion(region)}
                    className={`cursor-pointer px-2 sm:px-4 md:px-6 lg:px-10 py-1.5 sm:py-2 mr-2 sm:mr-4 rounded-lg ${selectedRegion === region ? "bg-gray-100" : ""}`}
                  >
                    <p className="text-xs sm:text-sm md:text-base text-gray-900 font-semibold">
                      {region}
                    </p>
                  </div>
                ))}
              </div>
              <div className="overflow-y-auto overflow-x-hidden w-[60%]">
                {selectedRegion &&
                  REGIONS[selectedRegion as keyof typeof REGIONS].map((district, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedDistrict(district)}
                      className={`cursor-pointer w-full px-2 sm:px-4 md:px-6 lg:px-10 py-1.5 sm:py-2 mr-2 sm:mr-4 rounded-lg ${selectedDistrict === district ? "bg-gray-100" : ""}`}
                    >
                      <p className="text-xs sm:text-sm md:text-base text-gray-900 font-base">
                        {district}
                      </p>
                    </div>
                  ))}
              </div>
            </div>
          </Hero>
        </>
      )}

      {/* case 2: 나이 입력 */}
      {step === 2 && (
        <>
          <Hero>
            <div className="flex items-center gap-4">
              <DecimalsArrowRight />
              <p className="text-xl font-light">혜택 확인을 위해 출생년도를 입력해주세요.</p>
            </div>
          </Hero>
          <Hero>
            <YearInput placeholder="2025" />
          </Hero>
        </>
      )}

      {/* case 3: 성별 선택 */}
      {step === 3 && (
        <>
          <Hero>
            <div className="flex items-center gap-4">
              <Baby />
              <p className="text-xl font-light">혜택 확인을 위해 성별을 선택해주세요.</p>
            </div>
          </Hero>
          <Hero>
            <GenderToggle />
          </Hero>
        </>
      )}

      {/* case 4: 상태 선택 */}
      {step === 4 && (
        <>
          <Hero>
            <div className="flex items-center gap-4">
              <p className="text-xl font-light">혜택 확인을 위해 상태를 선택해주세요.</p>
            </div>
          </Hero>
          <Hero>
            <StateInput />
          </Hero>
        </>
      )}

      {/* 다음 */}
      <Button variant="primary" fullWidth rightIcon={<ChevronRight />} onClick={handleNext}>
        다음
      </Button>
    </div>
  );
}
