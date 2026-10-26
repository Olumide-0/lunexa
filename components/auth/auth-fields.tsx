"use client";

import { useState, type ComponentProps } from "react";
import { Eye, EyeOff } from "lucide-react";

type InputProps = ComponentProps<"input"> & { error?: string };

const inputBase =
  "h-[46px] w-full rounded-[4px] border bg-white px-[14px] text-[15px] text-black outline-none transition-colors placeholder:text-[#737373]";

function borderClass(error?: string) {
  return error ? "border-[#D92D20]" : "border-[#CFCFCF] focus:border-black";
}

function ErrorText({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-[6px] text-left text-[13px] leading-[18px] text-[#D92D20]">{error}</p>;
}

export function AuthInput({ error, ...props }: InputProps) {
  return (
    <div>
      <input {...props} aria-invalid={!!error} className={`${inputBase} ${borderClass(error)}`} />
      <ErrorText error={error} />
    </div>
  );
}

export function PasswordInput({ error, ...props }: InputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <div className="relative">
        <input
          {...props}
          type={visible ? "text" : "password"}
          aria-invalid={!!error}
          className={`${inputBase} pr-[46px] ${borderClass(error)}`}
        />
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((prev) => !prev)}
          className="absolute right-[12px] top-1/2 -translate-y-1/2 text-[#737373] transition-colors hover:text-black"
        >
          {visible ? (
            <Eye strokeWidth={1.5} className="size-[20px]" />
          ) : (
            <EyeOff strokeWidth={1.5} className="size-[20px]" />
          )}
        </button>
      </div>
      <ErrorText error={error} />
    </div>
  );
}