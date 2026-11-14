"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

export function DeleteProductButton({ slug, name }: { slug: string; name: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/admin/products/${slug}`, { method: "DELETE" });
    const data = await res.json().catch(() => null);
    setBusy(false);

    if (!res.ok) {
      setError(data?.message ?? "Couldn't delete this product.");
      setConfirming(false);
      return;
    }
    router.refresh();
  }

  if (!confirming) {
    return (
      <div className="flex flex-col items-end gap-[4px]">
        <button
          type="button"
          onClick={() => setConfirming(true)}
          aria-label={`Delete ${name}`}
          className="flex h-[32px] items-center gap-[6px] rounded-[4px] px-[10px] text-[13px] text-[#C62828] transition-colors hover:bg-[#FDECEC]"
        >
          <Trash2 strokeWidth={1.75} className="size-[16px]" />
          Delete
        </button>
        {error && <p className="max-w-[220px] text-right text-[12px] leading-[16px] text-[#C62828]">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-[6px]">
      <span className="text-[13px] text-[#6B6B6B]">Sure?</span>
      <button
        type="button"
        onClick={remove}
        disabled={busy}
        className="flex h-[32px] items-center gap-[6px] rounded-[4px] bg-[#C62828] px-[10px] text-[13px] font-semibold text-white transition-colors hover:bg-[#A71F1F] disabled:opacity-60"
      >
        {busy && <Loader2 className="size-[14px] animate-spin" />}
        Yes, delete
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        disabled={busy}
        className="h-[32px] rounded-[4px] px-[10px] text-[13px] text-black transition-colors hover:bg-[#F2F2F2]"
      >
        Cancel
      </button>
    </div>
  );
}