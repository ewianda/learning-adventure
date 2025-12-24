import React, { useState } from "react";
import { useAppContext } from "../hooks/useAppContext";

type Mode = "signin" | "signup";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<Mode>("signin");
  const [error, setError] = useState<string | null>(null);
  const { login, isLoading } = useAppContext();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    try {
      setError(null);
      await login({
        email: email.trim(),
        password,
        mode,
        username: username.trim() || undefined,
      });
    } catch (err: any) {
      const message =
        err?.message || "Authentication failed. Please try again.";
      setError(message);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 rounded-2xl shadow-lg">
      <h2 className="text-3xl font-bold text-center text-slate-700 mb-2">
        Parent Portal
      </h2>
      <p className="text-center text-slate-500 mb-8">
        Sign in with your email to manage profiles and track progress.
      </p>

      <div className="flex mb-6 rounded-xl overflow-hidden border border-slate-200">
        <button
          type="button"
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 font-semibold ${
            mode === "signin"
              ? "bg-sky-500 text-white"
              : "bg-white text-slate-500"
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 font-semibold ${
            mode === "signup"
              ? "bg-sky-500 text-white"
              : "bg-white text-slate-500"
          }`}
        >
          Create Account
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block mb-2 text-sm font-bold text-slate-600"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="you@example.com"
            required
            disabled={isLoading}
          />
        </div>
        {mode === "signup" && (
          <div className="mb-4">
            <label
              htmlFor="username"
              className="block mb-2 text-sm font-bold text-slate-600"
            >
              Display Name
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="e.g., Jane Doe"
              disabled={isLoading}
            />
          </div>
        )}
        <div className="mb-6">
          <label
            htmlFor="password"
            className="block mb-2 text-sm font-bold text-slate-600"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 text-slate-700 bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            placeholder="Enter a secure password"
            required
            disabled={isLoading}
            minLength={6}
          />
        </div>

        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-sky-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-sky-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300 disabled:cursor-not-allowed flex justify-center items-center gap-3"
        >
          {isLoading && (
            <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white" />
          )}
          {mode === "signin" ? "Sign In" : "Create Account"}
        </button>
      </form>
    </div>
  );
}
