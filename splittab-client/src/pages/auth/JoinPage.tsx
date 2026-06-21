import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { createTab, joinTab } from "../../api/tabs";
import JoinPageSkeleton from "../../skeletons/JoinPageSkeleton";

export default function JoinPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState("");
  const [tabName, setTabName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleJoin() {
    if (!roomCode.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await joinTab(roomCode.trim().toUpperCase());
      navigate(`/tabs/${data.tab.id}`);
    } catch {
      setError("Tab not found. Check the room code and try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate() {
    if (!tabName.trim()) return;
    setError("");
    setLoading(true);
    try {
      const data = await createTab(tabName.trim());
      navigate(`/tabs/${data.tab.id}`);
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading) return <JoinPageSkeleton />;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center w-14 h-14 bg-emerald-500 rounded-2xl mb-6 mx-auto">
          <svg
            className="w-7 h-7 text-white"
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
        </div>

        <h1 className="text-2xl font-semibold text-gray-900 text-center mb-1">
          hey, {user?.name.split(" ")[0]}
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          join a tab or start a new one
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <div className="mb-3">
          <label className="text-xs text-gray-400 mb-1 block">room code</label>
          <input
            type="text"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            maxLength={4}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400 tracking-widest font-mono text-center uppercase"
            placeholder="K7X2"
          />
        </div>

        <button
          onClick={handleJoin}
          disabled={loading || !roomCode.trim()}
          className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 mb-6"
        >
          join tab
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-100" />
          <span className="text-xs text-gray-300">or</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>

        <div className="bg-gray-50 rounded-2xl p-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            create a new tab
          </p>
          <p className="text-xs text-gray-400 mb-4">
            name your group and share the code
          </p>
          <div className="mb-3">
            <label className="text-xs text-gray-400 mb-1 block">tab name</label>
            <input
              type="text"
              value={tabName}
              onChange={(e) => setTabName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              className="w-full bg-white rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Weekend Trip"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={loading || !tabName.trim()}
            className="w-full border border-gray-200 text-gray-700 rounded-xl py-3 text-sm font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            create tab
          </button>
        </div>

        <button
          onClick={logout}
          className="w-full text-center text-xs text-gray-300 hover:text-gray-400 mt-6"
        >
          sign out
        </button>
      </div>
    </div>
  );
}
