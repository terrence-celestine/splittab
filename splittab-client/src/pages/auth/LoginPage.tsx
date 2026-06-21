import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/join");
    } catch {
      setError("Invalid email or password");
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
          welcome back
        </h1>
        <p className="text-sm text-gray-400 text-center mb-8">
          sign in to your account
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
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-500 text-white rounded-xl py-3 text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
          >
            {loading ? "signing in..." : "sign in"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          don't have an account?{" "}
          <Link to="/register" className="text-emerald-500 font-medium">
            sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
