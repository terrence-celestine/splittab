import { useNavigate, useLocation } from "react-router-dom";

interface Props {
  tabId: string;
  onAddExpense: () => void;
}

export default function BottomNav({ tabId, onAddExpense }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const isSettle = location.pathname.includes("settle");

  function NavItem({
    icon,
    label,
    onClick,
    active,
  }: {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    active?: boolean;
  }) {
    return (
      <button
        onClick={onClick}
        className={`flex flex-col items-center gap-1 text-xs transition-colors ${active ? "text-emerald-500" : "text-gray-400"}`}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-100 px-6 pb-6 pt-3 flex items-center justify-between">
      <NavItem
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        }
        label="home"
        onClick={() => navigate(`/tabs/${tabId}`)}
        active={!isSettle}
      />

      <button
        onClick={onAddExpense}
        className="w-14 h-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg hover:bg-emerald-600 transition-colors -mt-6"
      >
        <svg
          className="w-6 h-6 text-white"
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

      <NavItem
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        }
        label="settle up"
        onClick={() => navigate(`/tabs/${tabId}/settle`)}
        active={isSettle}
      />
    </div>
  );
}
