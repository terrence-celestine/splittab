import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getTab } from "../../api/tabs";
import { getExpenses, getBalances, deleteExpense } from "../../api/expense";
import { useAuth } from "../../context/AuthContext";
import type { Expense, Balance, TabMember } from "../../types";
import AddExpenseModal from "../../components/AddExpenseModal";
import TabPageSkeleton from "../../skeletons/TabPageSkeleton";
import EmptyState from "../../components/EmptyState";
import BottomNav from "../../components/BottomNav";
import EditExpenseModal from "../../components/EditExpenseModal";

export default function TabPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [copied, setCopied] = useState(false);
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { mutate: mutateDelete } = useMutation({
    mutationFn: (expenseId: string) => deleteExpense(id!, expenseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
    },
  });

  const [activeTab, setActiveTab] = useState<"expenses" | "balances">(
    "expenses",
  );
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);

  const { data: tabData } = useQuery({
    queryKey: ["tab", id],
    queryFn: () => getTab(id!),
  });

  const { data: expensesData } = useQuery({
    queryKey: ["expenses", id],
    queryFn: () => getExpenses(id!),
  });

  const { data: balancesData } = useQuery({
    queryKey: ["balances", id],
    queryFn: () => getBalances(id!),
  });

  useEffect(() => {
    const s = io(import.meta.env.VITE_API_URL);
    s.emit("join-tab", id);

    s.on("expense-added", () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
    });

    s.on("member-joined", () => {
      queryClient.invalidateQueries({ queryKey: ["tab", id] });
    });

    s.on("expense-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
    });

    s.on("expense-deleted", () => {
      queryClient.invalidateQueries({ queryKey: ["expenses", id] });
      queryClient.invalidateQueries({ queryKey: ["balances", id] });
    });

    return () => {
      s.emit("leave-tab", id);
      s.disconnect();
    };
  }, [id, queryClient]);

  const tab = tabData?.tab;
  const members: TabMember[] = tabData?.members ?? [];
  const expenses: Expense[] = expensesData?.expenses ?? [];
  const balances: Balance[] = balancesData?.balances ?? [];

  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(e.amount), 0);
  const perPerson = members.length > 0 ? totalSpent / members.length : 0;

  function getCategoryEmoji(category: string) {
    const map: Record<string, string> = {
      food: "🍽️",
      transport: "⛽",
      stay: "⛺",
      drinks: "🍹",
      shopping: "🛍️",
      other: "📦",
    };
    return map[category] ?? "📦";
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

  if (!tabData || !expensesData || !balancesData) return <TabPageSkeleton />;

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto pb-24">
      {/* header */}
      <div className="bg-emerald-500 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-xs mb-0.5">active tab</p>
            <h1 className="text-white text-lg font-semibold">
              {tab?.name ?? "..."}
            </h1>
          </div>
          <div
            className="bg-white/20 rounded-xl px-3 py-2 text-center cursor-pointer active:bg-white/30 transition-colors"
            onClick={() => {
              const text = `join my tab on splittab! code: ${tab?.roomCode} — split-tab.theteecee.dev/join`;
              if (navigator.share) {
                navigator.share({ title: "SplitTab", text });
              } else {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }
            }}
          >
            <p className="text-white font-mono font-semibold tracking-widest text-sm">
              {tab?.roomCode}
            </p>
            <p className="text-emerald-100 text-xs">
              {copied ? "copied!" : "tap to share"}
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-white font-semibold">${totalSpent.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs">total spent</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-white font-semibold">${perPerson.toFixed(2)}</p>
            <p className="text-emerald-100 text-xs">per person</p>
          </div>
          <div className="flex-1 bg-white/15 rounded-xl p-3 text-center">
            <p className="text-white font-semibold">{members.length}</p>
            <p className="text-emerald-100 text-xs">members</p>
          </div>
        </div>
      </div>
      {/* members row */}
      <div className="px-5 py-3 flex items-center gap-2 border-b border-gray-100">
        {members.map((m) => (
          <div
            key={m.id}
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(m.name)}`}
          >
            {m.name[0]}
          </div>
        ))}
        <p className="text-xs text-gray-400 ml-1">
          {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
      </div>
      {/* tabs */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => setActiveTab("expenses")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "expenses" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-400"}`}
        >
          expenses
        </button>
        <button
          onClick={() => setActiveTab("balances")}
          className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === "balances" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-gray-400"}`}
        >
          balances
        </button>
      </div>
      {/* expenses list */}
      {activeTab === "expenses" && (
        <div className="divide-y divide-gray-50">
          {expenses.length === 0 ? (
            <EmptyState
              title="no expenses yet"
              description="add your first expense and split it with the group"
              action={{
                label: "add expense",
                onClick: () => setShowAddExpenseModal(true),
              }}
            />
          ) : (
            expenses.map((expense) => {
              const isPayer = expense.paidBy === user?.id;
              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 px-5 py-4 border-b border-gray-50"
                >
                  <div className="w-9 h-9 bg-gray-50 rounded-xl flex items-center justify-center text-lg shrink-0">
                    {getCategoryEmoji(expense.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-gray-400">
                      paid by{" "}
                      {expense.paidByUser?.name === user?.name
                        ? "you"
                        : expense.paidByUser?.name}{" "}
                      · {expense.splits.length} ways
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold text-gray-900">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-400">
                      ${parseFloat(expense.splits[0]?.amount ?? "0").toFixed(2)}{" "}
                      each
                    </p>
                  </div>
                  {isPayer && (
                    <div className="flex flex-col gap-1   shrink-0">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="w-7 h-7 bg-gray-50 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        onClick={() => mutateDelete(expense.id)}
                        className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center hover:bg-red-100 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
      {/* balances list */}
      {activeTab === "balances" && (
        <div className="divide-y divide-gray-50">
          {balances.length === 0 ? (
            <EmptyState
              title="no balances yet"
              description="add some expenses to see who owes what"
            />
          ) : (
            balances.map((b) => (
              <div key={b.id} className="flex items-center gap-3 px-5 py-4">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${getAvatarColor(b.name)}`}
                >
                  {b.name[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {b.name === user?.name ? "You" : b.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {b.balance >= 0 ? "is owed" : "owes"}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${b.balance > 0 ? "text-emerald-500" : b.balance < 0 ? "text-red-400" : "text-gray-400"}`}
                >
                  {b.balance >= 0 ? "+" : ""}
                  {b.balance.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      )}
      {/* add expense fab */}
      <BottomNav
        tabId={id!}
        onAddExpense={() => setShowAddExpenseModal(true)}
      />
      {showAddExpenseModal && (
        <AddExpenseModal
          tabId={id!}
          members={members}
          onClose={() => setShowAddExpenseModal(false)}
        />
      )}
      {editingExpense && (
        <EditExpenseModal
          tabId={id!}
          expense={editingExpense}
          members={members}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
