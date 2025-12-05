import type { InputHTMLAttributes } from "react";
import { Input } from "./Input";

interface YearInputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "type" | "min" | "max" | "inputMode"
> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const YearInput = ({ label = "", error, helperText, ...props }: YearInputProps) => {
  const currentYear = new Date().getFullYear();
  const { className, placeholder, ...rest } = props;

  return (
    <Input
      label={label}
      error={error}
      helperText={helperText}
      variant="underline"
      type="number"
      inputMode="numeric"
      min={1900}
      max={currentYear}
      placeholder={placeholder ?? "2000"}
      className={`text-5xl leading-none font-semibold text-center tracking-[0.35em] py-6 border-b-2 ${className ?? ""}`}
      {...rest}
    />
  );
};
