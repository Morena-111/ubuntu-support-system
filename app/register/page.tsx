"use client";

import { useState } from "react";
import { registerUser } from "../actions/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function handleSubmit(formData: FormData) {
    setMessage("");

    const result = await registerUser(formData);

    setMessage(result.message);

    if (result.success) {
      router.push("/login");
    }
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
              Join the platform
            </p>

            <h1 className="mt-4 max-w-lg text-5xl font-bold leading-tight text-white">
              Become part of a connected community support network.
            </h1>

            <p className="mt-6 max-w-xl leading-7 text-slate-400">
              Create an account to participate in the Ubuntu Support platform.
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
                Create account
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-950">
                Get started
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Create your account to join the Ubuntu Support platform.
              </p>

              <form
                action={handleSubmit}
                className="mt-8 space-y-4"
              >
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      First name
                    </label>

                    <input
                      name="firstName"
                      type="text"
                      placeholder="First name"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Last name
                    </label>

                    <input
                      name="lastName"
                      type="text"
                      placeholder="Last name"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>

                  <input
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>

                  <input
                    name="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    required
                    minLength={8}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>

                {message && (
                  <div className="rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600"
                >
                  Create account
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-slate-500">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-orange-500"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}