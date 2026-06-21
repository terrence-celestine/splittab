import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getSettlements } from "../../api/expense";
import { useAuth } from "../../context/AuthContext";

export default function SettlePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["settlements", id],
    queryFn: () => getSettlements(id!),
  });

  const settlements = data?.settlements ?? [];

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

  return (
    <div className="min-h-screen bg-white max-w-sm mx-auto">
      <div className="bg-emerald-500 px-5 pt-12 pb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-white/70 text-sm mb-4 flex items-center gap-1"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          back
        </button>
        <h1 className="text-white text-lg font-semibold">settle up</h1>
        <p className="text-emerald-100 text-xs mt-1">
          minimum transfers to close the tab
        </p>
      </div>

      <div className="px-5 py-4">
        {isLoading && (
          <div className="animate-pulse space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-50 rounded-xl" />
            ))}
          </div>
        )}

        {!isLoading && settlements.length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <svg
                className="w-8 h-8 text-emerald-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              all settled up!
            </h3>
            <p className="text-xs text-gray-400">no payments needed</p>
          </div>
        )}

        {!isLoading && settlements.length > 0 && (
          <div className="space-y-3">
            <p className="text-xs text-gray-400 mb-4">
              {settlements.length} transfer{settlements.length !== 1 ? "s" : ""}{" "}
              needed
            </p>
            {settlements.map((s: any, i: number) => {
              const isYouFrom = s.from.id === user?.id;
              const isYouTo = s.to.id === user?.id;
              return (
                <div key={i} className="bg-gray-50 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium ${getAvatarColor(s.from.name)}`}
                    >
                      {s.from.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {isYouFrom ? "You" : s.from.name}
                        <span className="text-gray-400 font-normal"> → </span>
                        {isYouTo ? "You" : s.to.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {isYouFrom
                          ? "you owe"
                          : isYouTo
                            ? "you get back"
                            : "transfer"}
                      </p>
                    </div>
                    <span
                      className={`text-base font-semibold ${isYouFrom ? "text-red-400" : isYouTo ? "text-emerald-500" : "text-gray-900"}`}
                    >
                      ${s.amount.toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
