import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";
import { getTab } from "../../api/tabs";
import { getExpenses, getBalances } from "../../api/expense";
import { useAuth } from "../../context/AuthContext";
import type { Expense, Balance, TabMember } from "../../types";
import AddExpenseModal from "../../components/AddExpenseModal";
import TabPageSkeleton from "../../skeletons/TabPageSkeleton";
import EmptyState from "../../components/EmptyState";
import { useNavigate } from "react-router-dom";

export default function TabPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
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
    <div className="min-h-screen bg-white max-w-sm mx-auto">
      {/* header */}
      <div className="bg-emerald-500 px-5 pt-12 pb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-100 text-xs mb-0.5">active tab</p>
            <h1 className="text-white text-lg font-semibold">
              {tab?.name ?? "..."}
            </h1>
          </div>
          <div className="bg-white/20 rounded-xl px-3 py-2 text-center">
            <p className="text-white font-mono font-semibold tracking-widest text-sm">
              {tab?.roomCode}
            </p>
            <p className="text-emerald-100 text-xs">room code</p>
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
      <div className="px-5 py-3 border-b border-gray-100">
        <button
          onClick={() => navigate(`/tabs/${id}/settle`)}
          className="w-full bg-gray-50 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          settle up
        </button>
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
      // in the expenses list section, replace the empty check:
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
            expenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center gap-3 px-5 py-4"
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
              </div>
            ))
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
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 ${getAvatarColor(b.name)}`}
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2">
        <button
          onClick={() => setShowAddExpenseModal(true)}
          className="bg-emerald-500 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </button>
      </div>
      {showAddExpenseModal && (
        <AddExpenseModal
          tabId={id!}
          members={members}
          onClose={() => setShowAddExpenseModal(false)}
        />
      )}
    </div>
  );
}
