"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#f0f4f8] p-6 text-center dark:bg-[#0f1f1a]">
      <div className="text-7xl">⚠️</div>
      <h1 className="mt-4 font-[Poppins] text-4xl font-extrabold text-navy dark:text-white">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-slate-500 dark:text-slate-400">
        Our system encountered an unexpected error. Please try again or contact
        the clinic IT support.
      </p>
      <button onClick={reset} className="mt-6 rounded-xl bg-navy px-6 py-3 font-semibold text-white shadow-lg transition hover:brightness-110">
        Try Again
      </button>
    </div>
  );
}
