import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8 text-center">
        <h1 className="text-2xl font-bold text-[#001F3F]">Unauthorized</h1>
        <p className="mt-3 text-sm text-slate-600">
          You do not have permission to access this page.
        </p>
        <Link
          to="/login"
          className="inline-block mt-6 px-4 py-2 rounded-lg bg-[#001F3F] text-white text-sm font-semibold hover:opacity-90"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}
