import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await register(name, email, password);
      navigate("/join");
    } catch {
      setError("Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

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
          create account
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          join your friends on SplitTab
        </p>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm rounded-xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">
              full name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="Terrence C."
            />
          </div>

          <div className="mb-4">
            <label className="text-xs text-gray-400 mb-1 block">email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="you@email.com"
            />
          </div>

          <div className="mb-6">
            <label className="text-xs text-gray-400 mb-1 block">password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-400"
              placeholder="••••••••"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
            type="submit"
          >
            {loading ? "creating account..." : "create account"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          already have an account?{" "}
          <Link to="/login" className="text-emerald-500 font-medium">
            sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
