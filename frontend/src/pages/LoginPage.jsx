import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import FormField from "../components/FormField";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";
import { Activity } from "lucide-react";

export default function LoginPage() {
  const { login, authError } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setLocalError("Please enter both email and password.");
      return;
    }

    try {
      setLocalError("");
      setLoading(true);
      await login(email, password);
    } catch (err) {
      setLocalError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl ring-1 ring-slate-200">
        {/* Brand header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-navy text-brand-mint shadow-md">
            <Activity size={26} />
          </div>
          <h2 className="text-xl font-extrabold tracking-tight text-brand-navy">
            SUSTAINABYTE
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-brand-green mt-0.5">
            Equipment Monitor
          </p>
          <p className="mt-2 text-xs text-slate-500">
            Sign in to access industrial telemetry and equipment controls.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField label="Email address">
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. operator@sustainabyte.local"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </FormField>

          <FormField label="Password">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:border-brand-green focus:outline-none focus:ring-1 focus:ring-brand-green"
            />
          </FormField>

          {(localError || authError) && (
            <div className="pt-1">
              <ErrorMessage message={localError || authError} />
            </div>
          )}

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full py-2.5 text-sm font-bold"
            >
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </div>
        </form>

        <div className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
          Demo: admin@sustainabyte.local · viewer@sustainabyte.local
        </div>
      </div>
    </div>
  );
}
