import { useState, useEffect } from "react";
import { useSupabaseAuth } from "@/lib/SupabaseAuthProvider";
import { useLocation } from "wouter";

export default function AdminLogin() {
  const { signInWithEmail, signInWithGoogle, loading, isAuthenticated } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      setLocation("/admin/dashboard");
    }
  }, [loading, isAuthenticated, setLocation]);

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const result = await signInWithEmail(email, password);
    setSubmitting(false);
    if (result.error) {
      setError(result.error);
    } else {
      setLocation("/admin/dashboard");
    }
  }

  return (
    <main className="min-h-screen bg-[#d7ff3f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-[28px] bg-[#050505] p-8 shadow-2xl">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 rounded-2xl bg-[#d7ff3f] mb-4" />
          <h1 className="text-xl font-bold text-zinc-50">Boss Hookah Admin</h1>
          <p className="text-xs text-zinc-500 mt-1">Sign in to your dashboard</p>
        </div>

        {/* Google */}
        <button
          onClick={() => signInWithGoogle()}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 hover:border-[#d7ff3f] hover:text-[#d7ff3f] transition-colors mb-6"
        >
          <svg width="18" height="18" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34.5 6.5 29.6 4 24 4 16.3 4 9.7 8.4 6.3 14.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.1-11.3-7.5l-6.6 5.1C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C40.9 35.6 44 30.2 44 24c0-1.2-.1-2.3-.4-3.5z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-zinc-800" />
          <span className="text-[10px] text-zinc-600 uppercase tracking-widest">or</span>
          <div className="flex-1 h-px bg-zinc-800" />
        </div>

        {/* Email / Password */}
        <form onSubmit={handleEmailLogin} className="space-y-3">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder="admin@bosshookah.site"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#d7ff3f] transition-colors"
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-zinc-500 mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-[#d7ff3f] transition-colors"
            />
          </div>
          {error && (
            <p className="text-xs text-red-400 bg-red-900/20 rounded-lg px-3 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full rounded-xl bg-[#d7ff3f] text-zinc-900 font-semibold py-3 text-sm hover:bg-[#c8f030] transition-colors disabled:opacity-50 mt-2"
          >
            {submitting ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-[10px] text-zinc-700 mt-6">
          Powered by Supabase Auth
        </p>
      </div>
    </main>
  );
}
