export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-100 bg-white py-8 text-center text-xs text-slate-500">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <p className="font-medium text-slate-600">
          Connected by IoT. Driven by AI. Built for Net Zero.
        </p>
        <p className="mt-1 text-slate-400">
          &copy; {new Date().getFullYear()} Sustainabyte Technologies · Chennai, India
        </p>
      </div>
    </footer>
  );
}
