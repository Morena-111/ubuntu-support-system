import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold text-white">
            U
          </div>

          <div>
            <p className="text-lg font-bold text-slate-950">
              Ubuntu Support
            </p>
            <p className="text-xs text-slate-500">
              Community support platform
            </p>
          </div>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex w-full items-center gap-4 overflow-x-auto whitespace-nowrap pb-1 sm:w-auto sm:justify-end sm:gap-6 sm:overflow-visible sm:pb-0"
        >
          <Link
            href="/"
            className="shrink-0 text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="shrink-0 text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="shrink-0 text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            Contact
          </Link>

          <Link
            href="/login"
            className="shrink-0 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="shrink-0 rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}