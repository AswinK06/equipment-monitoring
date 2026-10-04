import { useState } from "react";
import { useNavigate, useLocation, Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/layout/AuthLayout";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import ErrorMessage from "../components/ui/ErrorMessage";

export default function LoginPage() {
  const { token, login, authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [localError, setLocalError] = useState("");

  const destination = location.state?.from?.pathname || "/";

  if (token) {
    return <Navigate to="/" replace />;
  }

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
      navigate(destination, { replace: true });
    } catch (err) {
      setLocalError(err.message || "Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <span>
      New here?{" "}
      <Link to="/register" className="font-semibold text-brand-green hover:underline">
        Create an account
      </Link>
    </span>
  );

  return (
    <AuthLayout title="Sign in" subtitle="Use your work account to continue" footer={footer}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <FormField label="Email address">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. operator@sustainabyte.local"
            className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-green focus:outline-none"
          />
        </FormField>

        <FormField label="Password">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </FormField>

        {(localError || authError) && <ErrorMessage message={localError || authError} />}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-11 text-sm font-bold"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
