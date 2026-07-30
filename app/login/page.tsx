"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (!result || result.error) {
      setError("The email address or password is incorrect.");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-2">
        <div className="hidden flex-col justify-between p-12 lg:flex">
          <Link href="/" className="flex items-center gap-3 text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500 font-bold">
              U
            </div>
            <span className="font-bold">Ubuntu Support</span>
          </Link>

          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
              Welcome back
            </p>

            <h1 className="mt-4 max-w-lg text-5xl font-bold leading-tight text-white">
              Continue supporting communities through one connected platform.
            </h1>

            <p className="mt-6 max-w-xl leading-7 text-slate-400">
              Access your requests, donations, assignments and community
              activities.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            Ubuntu Support Management Platform
          </p>
        </div>

        <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <Link
                href="/"
                className="text-xl font-bold text-slate-950"
              >
                Ubuntu Support
              </Link>
            </div>

            <div className="rounded-3xl border bg-white p-8 shadow-sm md:p-10">
              <p className="text-sm font-semibold text-orange-500">
                Account access
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Sign in
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to access your Ubuntu Support account.
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-8 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(event) =>
                      setEmail(event.target.value)
                    }
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <div className="mb-2 flex justify-between">
                    <label className="text-sm font-medium text-slate-700">
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-orange-500"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <input
                    type="password"
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Enter your password"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {error && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600"
                >
                  Sign in
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Don't have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-orange-500"
                >
                  Create one
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}