interface Props {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
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
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
          />
        </svg>
      </div>
      <h3 className="text-sm font-medium text-gray-900 mb-1">{title}</h3>
      <p className="text-xs text-gray-400 mb-6 max-w-xs">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="bg-emerald-500 text-white rounded-xl px-5 py-2.5 text-sm font-medium hover:bg-emerald-600 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
