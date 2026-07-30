import Link from "next/link";

export default function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
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

        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            Home
          </Link>

          <Link
            href="/about"
            className="text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            About
          </Link>

          <Link
            href="/contact"
            className="text-sm font-medium text-slate-700 transition hover:text-orange-500"
          >
            Contact
          </Link>

          <Link
            href="/login"
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Sign in
          </Link>

          <Link
            href="/register"
            className="rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
          >
            Get started
          </Link>
        </nav>
      </div>
    </header>
  );
}