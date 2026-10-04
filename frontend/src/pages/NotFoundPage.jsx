import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import Button from "../components/Button";

export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <AlertTriangle size={32} />
      </div>
      <h1 className="text-3xl font-extrabold text-brand-navy">404 - Page Not Found</h1>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6">
        <Link to="/">
          <Button variant="primary">
            <ArrowLeft size={16} /> Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
