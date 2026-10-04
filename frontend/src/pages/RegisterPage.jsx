import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import AuthLayout from "../components/AuthLayout";
import FormField from "../components/FormField";
import PasswordInput from "../components/PasswordInput";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

export default function RegisterPage() {
  const { token, register, authError } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) {
    return <Navigate to="/" replace />;
  }

  const validate = () => {
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
    let isValid = true;

    if (!form.name.trim() || form.name.trim().length < 2) {
      nextErrors.name = "Name must be at least 2 characters.";
      isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
      nextErrors.email = "Please enter a valid email address.";
      isValid = false;
    }

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(form.password)) {
      nextErrors.password =
        "Password must be at least 8 characters and contain a letter and a number.";
      isValid = false;
    }

    if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      return;
    }

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

        {(serverError || authError) && (
          <ErrorMessage message={serverError || authError} />
        )}

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
