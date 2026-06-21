import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateExpense } from "../api/expense";
import type { Expense, TabMember } from "../types";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

interface Props {
  tabId: string;
  expense: Expense;
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

export default function EditExpenseModal({
  tabId,
  expense,
  members,
  onClose,
}: Props) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [description, setDescription] = useState(expense.description);
  const [amount, setAmount] = useState(expense.amount);
  const [category, setCategory] = useState(expense.category);
  const [splitWith, setSplitWith] = useState<string[]>(
    expense.splits.map((s) => s.userId),
  );

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      updateExpense(tabId, expense.id, {
        description,
        amount: parseFloat(amount),
        category,
        splitWith,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", tabId] });
      queryClient.invalidateQueries({ queryKey: ["balances", tabId] });
      toast.success("expense updated");
      onClose();
    },
    onError: () => {
      toast.error("failed to update expense");
    },
  });

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
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-200 rounded-full" />
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <button onClick={onClose} className="text-gray-400 text-sm">
            cancel
          </button>
          <p className="text-sm font-medium text-gray-900">edit expense</p>
          <div className="w-10" />
        </div>

        <div className="px-5 py-4">
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">amount</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">
              description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-2 block">category</label>
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

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gray-400">split between</label>
              <p className="text-xs text-emerald-500 font-medium">
                ${splitAmount} each
              </p>
            </div>
            <div className="divide-y divide-gray-50 rounded-xl overflow-hidden border border-gray-100">
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
          </div>

          <button
            onClick={() => mutate()}
            disabled={
              isPending || !description.trim() || splitWith.length === 0
            }
            className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {isPending ? "saving..." : "save changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
