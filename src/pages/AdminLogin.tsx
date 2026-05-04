import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { loginAdmin } from "@/lib/portfolio-api";

export default function AdminLogin() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loginAdmin({ username, password });
      navigate("/admin/dashboard");
    } catch {
      setError(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm p-8 rounded-2xl border border-border bg-card shadow-card">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 rounded-xl gradient-accent-bg flex items-center justify-center">
            <Lock size={22} className="text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-center text-foreground mb-6">Admin Panel</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              placeholder="Username"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 mb-3"
              autoComplete="username"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Enter password"
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              autoComplete="current-password"
            />
            {error && <p className="text-xs text-destructive mt-2">Invalid username or password</p>}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-lg gradient-accent-bg text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
