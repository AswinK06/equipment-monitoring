export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
      <p className="font-medium text-slate-600">
        Connected by IoT. Driven by AI. Built for Net Zero.
      </p>
      <p className="mt-1 text-slate-400">
        &copy; {new Date().getFullYear()} Sustainabyte Technologies · Chennai, India
      </p>
    </footer>
  );
}
