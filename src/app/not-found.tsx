import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4f8] p-6 text-center dark:bg-[#0f1f1a]">
      <div className="text-7xl">🩺</div>
      <h1 className="mt-4 font-[Poppins] text-5xl font-extrabold text-navy dark:text-white">404</h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        This page seems to have checked out. The record you&apos;re looking for
        doesn&apos;t exist in our system.
      </p>
      <Link href="/dashboard" className="mt-6 rounded-xl bg-navy px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110">
        Return to Dashboard
      </Link>
    </div>
  );
}
