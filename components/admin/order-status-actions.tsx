"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const buttonLabels: Record<string, string> = {
  shipped: "Mark as shipped",
  delivered: "Mark as delivered",
  cancelled: "Cancel order",
};

export function OrderStatusActions({
  orderNumber,
  options,
  wasPaid,
}: {
  orderNumber: string;
  options: string[]; // the statuses this order may move to
  wasPaid: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [error, setError] = useState("");

  if (options.length === 0) {
    return <p className="text-[14px] leading-[20px] text-[#6B6B6B]">No further changes are possible for this order.</p>;
  }

  async function change(status: string) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Something went wrong");
        return;
      }
      setConfirmCancel(false);
      router.refresh(); // reload the page's data
    } catch {
      setError("Could not reach the server");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-[8px]">
        {options.map((status) => {
          if (status === "cancelled") {
            return (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => (confirmCancel ? change(status) : setConfirmCancel(true))}
                className={`flex h-[44px] items-center rounded-full px-[20px] text-[14px] font-semibold transition-colors disabled:opacity-60 ${
                  confirmCancel ? "bg-[#D92D20] text-white" : "bg-[#EBEBEB] text-black hover:bg-[#DCDCDC]"
                }`}
              >
                {confirmCancel ? "Yes, cancel this order" : buttonLabels[status]}
              </button>
            );
          }
          return (
            <button
              key={status}
              type="button"
              disabled={busy}
              onClick={() => change(status)}
              className="flex h-[44px] items-center rounded-full bg-black px-[20px] text-[14px] font-semibold text-white transition-colors hover:bg-[#333333] disabled:opacity-60"
            >
              {buttonLabels[status]}
            </button>
          );
        })}
        {confirmCancel && (
          <button
            type="button"
            onClick={() => setConfirmCancel(false)}
            className="flex h-[44px] items-center px-[12px] text-[14px] text-black underline underline-offset-[3px]"
          >
            Keep order
          </button>
        )}
      </div>

      {confirmCancel && (
        <p className="mt-[10px] text-[13px] leading-[18px] text-[#6B6B6B]">
          Cancelling puts the items back in stock.
          {wasPaid && " This order was paid, so refund the customer yourself in the Paystack dashboard."}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-[10px] text-[13px] leading-[18px] text-[#D92D20]">
          {error}
        </p>
      )}
    </div>
  );
}