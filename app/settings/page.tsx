import { auth } from "@/auth";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import {
  changePassword,
  updateNotificationPreference,
  updateProfile,
} from "./actions";

type SettingsPageProps = {
  searchParams: Promise<{ status?: string; error?: string }>;
};

const statusMessages: Record<string, string> = {
  "profile-saved": "Your profile has been updated.",
  "password-saved": "Your password has been changed.",
  "notifications-saved": "Your notification preference has been updated.",
};

const errorMessages: Record<string, string> = {
  profile: "Enter a first and last name. Names are limited to 80 characters and phone numbers to 40.",
  "password-required": "Complete all password fields.",
  "password-length": "Your new password must be at least 8 characters and no more than 72 bytes.",
  "password-mismatch": "The new password and confirmation do not match.",
  "current-password": "Your current password is incorrect.",
  "account-not-found": "Your account could not be found. Please sign in again.",
};

export default async function SettingsPage({
  searchParams,
}: SettingsPageProps) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const [user, params] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        inAppNotificationsEnabled: true,
      },
    }),
    searchParams,
  ]);

  if (!user) {
    redirect("/login");
  }

  const statusMessage = params.status
    ? statusMessages[params.status]
    : undefined;
  const errorMessage = params.error ? errorMessages[params.error] : undefined;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Your account</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your profile, password, and in-app notifications.
          </p>
        </header>

        <div className="mx-auto max-w-4xl space-y-8 p-6 lg:p-10">
          {statusMessage && (
            <p
              role="status"
              className="rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
            >
              {statusMessage}
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-800"
            >
              {errorMessage}
            </p>
          )}

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Profile details
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Update the name and contact number associated with your account.
              </p>
            </div>
            <form action={updateProfile} className="grid gap-5 p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={user.firstName}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Last name
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    maxLength={80}
                    defaultValue={user.lastName}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  maxLength={40}
                  defaultValue={user.phone ?? ""}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  placeholder="Add a contact number"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </span>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    {user.email}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Email changes are not available here.
                  </p>
                </div>
                <div>
                  <span className="mb-2 block text-sm font-medium text-slate-700">
                    Account type
                  </span>
                  <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm capitalize text-slate-600">
                    {user.role.toLowerCase()}
                  </p>
                </div>
              </div>

              <div className="flex justify-end border-t pt-5">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Save profile
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Change password
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Confirm your current password before choosing a new one.
              </p>
            </div>
            <form action={changePassword} className="grid gap-5 p-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Current password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="newPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    New password
                  </label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Use at least 8 characters.
                  </p>
                </div>
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Confirm new password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    minLength={8}
                    maxLength={72}
                    autoComplete="new-password"
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>
              <div className="flex justify-end border-t pt-5">
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Update password
                </button>
              </div>
            </form>
          </section>

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Notification preferences
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Choose whether to receive in-app notifications in your inbox.
              </p>
            </div>
            <form
              action={updateNotificationPreference}
              className="flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <label
                  htmlFor="inAppNotificationsEnabled"
                  className="font-medium text-slate-800"
                >
                  In-app notifications
                </label>
                <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500">
                  When turned off, admin-sent notifications will not be added to
                  your inbox. Email notifications are not available.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <label className="inline-flex cursor-pointer items-center gap-3">
                  <span className="text-sm text-slate-600">
                    {user.inAppNotificationsEnabled ? "On" : "Off"}
                  </span>
                  <input
                    id="inAppNotificationsEnabled"
                    name="inAppNotificationsEnabled"
                    type="checkbox"
                    defaultChecked={user.inAppNotificationsEnabled}
                    className="h-5 w-5 rounded border-slate-300 accent-orange-500 focus:ring-orange-500"
                  />
                </label>
                <button
                  type="submit"
                  className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                >
                  Save preference
                </button>
              </div>
            </form>
          </section>
        </div>
      </main>
    </div>
  );
}
