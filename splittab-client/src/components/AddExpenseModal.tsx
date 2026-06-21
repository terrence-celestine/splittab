import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addExpense } from "../api/expense";
import type { TabMember } from "../types";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Props {
  tabId: string;
  members: TabMember[];
  onClose: () => void;
}

const CATEGORIES = [
  { value: "food", label: "food", emoji: "🍽️" },
  { value: "transport", label: "transport", emoji: "⛽" },
  { value: "stay", label: "stay", emoji: "⛺" },
  { value: "drinks", label: "drinks", emoji: "🍹" },
  { value: "shopping", label: "shopping", emoji: "🛍️" },
  { value: "other", label: "other", emoji: "📦" },
];

export default function AddExpenseModal({ tabId, members, onClose }: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [step, setStep] = useState<"amount" | "details" | "split">("amount");
  const [amount, setAmount] = useState("0");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("food");
  const [splitWith, setSplitWith] = useState<string[]>(
    members.map((m) => m.id),
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      addExpense(tabId, {
        description,
        amount: parseFloat(amount),
        category,
        splitWith,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tabId] });
      queryClient.invalidateQueries({ queryKey: ["balances", tabId] });
      toast.success("expense added");
      onClose();
    },
  });

  function handleNumpad(val: string) {
    if (val === "del") {
      setAmount((prev) => (prev.length <= 1 ? "0" : prev.slice(0, -1)));
      return;
    }
    if (val === "." && amount.includes(".")) return;
    if (amount === "0" && val !== ".") {
      setAmount(val);
      return;
    }
    const parts = amount.split(".");
    if (parts[1]?.length >= 2) return;
    setAmount((prev) => prev + val);
  }

  function toggleMember(id: string) {
    setSplitWith((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function getAvatarColor(name: string) {
    const colors = [
      "bg-violet-100 text-violet-700",
      "bg-emerald-100 text-emerald-700",
      "bg-orange-100 text-orange-700",
      "bg-pink-100 text-pink-700",
      "bg-blue-100 text-blue-700",
    ];
    return colors[name.charCodeAt(0) % colors.length];
  }

  const splitAmount =
    splitWith.length > 0
      ? (parseFloat(amount) / splitWith.length).toFixed(2)
      : "0.00";

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50">
      <div className="bg-white w-full max-w-sm rounded-t-3xl overflow-hidden">
        {/* handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button
            onClick={
              step === "amount"
                ? onClose
                : () => setStep(step === "split" ? "details" : "amount")
            }
            className="text-gray-400 text-sm"
          >
            {step === "amount" ? "cancel" : "← back"}
          </button>
          <p className="text-sm font-medium text-gray-900">add expense</p>
          <div className="flex gap-1">
            {["amount", "details", "split"].map((s, i) => (
              <div
                key={s}
                className={`w-1.5 h-1.5 rounded-full ${step === s ? "bg-emerald-500" : i < ["amount", "details", "split"].indexOf(step) ? "bg-emerald-200" : "bg-gray-200"}`}
              />
            ))}
          </div>
        </div>

        {/* step 1 — amount */}
        {step === "amount" && (
          <>
            <div className="px-5 py-6 text-center border-b border-gray-100">
              <p className="text-xs text-gray-400 mb-2">how much?</p>
              <p className="text-5xl font-semibold text-gray-900">
                ${amount}
                <span className="text-gray-300 text-3xl">
                  {amount.includes(".") ? "" : ".00"}
                </span>
              </p>
            </div>
            <div className="grid grid-cols-3">
              {[
                "1",
                "2",
                "3",
                "4",
                "5",
                "6",
                "7",
                "8",
                "9",
                ".",
                "0",
                "del",
              ].map((k) => (
                <button
                  key={k}
                  onClick={() => handleNumpad(k)}
                  className="py-4 text-xl font-medium text-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-r border-gray-50"
                >
                  {k === "del" ? "⌫" : k}
                </button>
              ))}
            </div>
            <div className="px-5 py-4">
              <button
                onClick={() => setStep("details")}
                disabled={parseFloat(amount) <= 0}
                className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                next
              </button>
            </div>
          </>
        )}

        {/* step 2 — details */}
        {step === "details" && (
          <div className="px-5 py-4">
            <div className="mb-4">
              <label className="text-xs text-gray-400 mb-1 block">
                description
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
                placeholder="Dinner at the campsite"
                autoFocus
              />
            </div>
            <div className="mb-6">
              <label className="text-xs text-gray-400 mb-2 block">
                category
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CATEGORIES.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setCategory(c.value)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${category === c.value ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-400" : "bg-gray-50 text-gray-600"}`}
                  >
                    <span>{c.emoji}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={() => setStep("split")}
              disabled={!description.trim()}
              className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              next
            </button>
          </div>
        )}

        {/* step 3 — split */}
        {step === "split" && (
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-gray-400">split between</p>
              <p className="text-xs text-emerald-500 font-medium">
                ${splitAmount} each
              </p>
            </div>
            <div className="divide-y divide-gray-50 mb-4 rounded-xl overflow-hidden border border-gray-100">
              {members.map((m) => {
                const selected = splitWith.includes(m.id);
                const isYou = m.id === user?.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMember(m.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(m.name)}`}
                    >
                      {m.name[0]}
                    </div>
                    <p className="flex-1 text-sm text-gray-900 text-left">
                      {isYou ? "You" : m.name}
                    </p>
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${selected ? "bg-emerald-500" : "border border-gray-200"}`}
                    >
                      {selected && (
                        <svg
                          className="w-3 h-3 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => mutate()}
              disabled={isPending || splitWith.length === 0}
              className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            >
              {isPending ? "adding..." : `add $${amount} expense`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
