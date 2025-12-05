import type { InputHTMLAttributes } from "react";

type InputVariant = "text" | "year" | "underline" | "filled";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  variant?: InputVariant;
}

export const Input = ({
  label,
  error,
  helperText,
  variant = "text",
  className = "",
  ...props
}: InputProps) => {
  const inputProps =
    variant === "year"
      ? {
          type: "number",
          min: 1900,
          max: new Date().getFullYear(),
          ...props,
        }
      : props;

  const baseClass =
    "w-full transition-colors placeholder:text-gray-400 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed outline-none";

  const variantClass =
    variant === "underline"
      ? "px-0 border-0 border-b border-gray-300 rounded-none focus:border-blue-500 focus:ring-0"
      : variant === "filled"
        ? "px-4 py-3 text-base rounded-lg border border-transparent bg-gray-50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        : "px-4 py-3 text-base rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-sm font-semibold text-gray-900">{label}</label>}
      <input
        className={`${baseClass} ${variantClass} ${
          error ? "border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-100" : ""
        } ${className}`}
        {...inputProps}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      {helperText && !error && <p className="text-sm text-gray-500">{helperText}</p>}
    </div>
  );
};
