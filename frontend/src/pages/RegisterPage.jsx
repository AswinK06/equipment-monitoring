import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { validateRegistration } from "../utils/validation";
import AuthLayout from "../components/layout/AuthLayout";
import FormField from "../components/ui/FormField";
import PasswordInput from "../components/ui/PasswordInput";
import Button from "../components/ui/Button";
import ErrorMessage from "../components/ui/ErrorMessage";

export default function RegisterPage() {
  const { token, register, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    const validationErrors = validateRegistration(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});

    try {
      setLoading(true);
      await register(form.name, form.email, form.password);
      navigate("/", { replace: true });
    } catch (err) {
      setServerError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <span>
      Already have an account?{" "}
      <Link to="/login" className="font-semibold text-brand-green hover:underline">
        Sign in
      </Link>
    </span>
  );

  return (
    <AuthLayout
      title="Create your account"
      subtitle="New accounts get Viewer access. An administrator can grant more."
      footer={footer}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormField label="Full name" error={errors.name}>
          <input
            id="register-name"
            type="text"
            required
            autoFocus
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Jane Doe"
            className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-green focus:outline-none"
          />
        </FormField>

        <FormField label="Work email" error={errors.email}>
          <input
            id="register-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="jane@sustainabyte.local"
            className="w-full h-11 px-3.5 rounded-lg border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-green focus:outline-none"
          />
        </FormField>

        <FormField label="Password" error={errors.password}>
          <PasswordInput
            id="register-password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            placeholder="••••••••"
            required
          />
          <p className="mt-1 text-xs text-slate-400">
            At least 8 characters, with a letter and a number
          </p>
        </FormField>

        <FormField label="Confirm password" error={errors.confirmPassword}>
          <PasswordInput
            id="register-confirm-password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            placeholder="••••••••"
            required
          />
        </FormField>

        {(serverError || authError) && <ErrorMessage message={serverError || authError} />}

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
            className="w-full h-11 text-sm font-bold"
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
