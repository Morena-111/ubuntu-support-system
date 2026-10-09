import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import {
  markAllNotificationsRead,
  markNotificationRead,
  sendNotification,
} from "./actions";

type NotificationsPageProps = {
  searchParams: Promise<{ filter?: string; sent?: string; error?: string }>;
};

const filters = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function NotificationsPage({
  searchParams,
}: NotificationsPageProps) {
  await connection();
  const session = await auth();
  const userId = session?.user?.id;

  if (!userId) {
    redirect("/login");
  }

  const { filter: requestedFilter, sent, error } = await searchParams;
  const isAdmin = session.user.role === "ADMIN";
  const filter = filters.some((option) => option.value === requestedFilter)
    ? requestedFilter!
    : "all";
  const readFilter =
    filter === "unread" ? false : filter === "read" ? true : undefined;

  const [totalCount, unreadCount, notifications, recipients] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.findMany({
      where: {
        userId,
        ...(readFilter === undefined ? {} : { isRead: readFilter }),
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        title: true,
        message: true,
        isRead: true,
        createdAt: true,
      },
    }),
    isAdmin
      ? prisma.user.findMany({
          orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
            inAppNotificationsEnabled: true,
          },
        })
      : Promise.resolve([]),
  ]);

  const visibleCount =
    filter === "unread"
      ? unreadCount
      : filter === "read"
        ? totalCount - unreadCount
        : totalCount;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Your account</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Notifications
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Stay up to date with activity on your community support account.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          {isAdmin && (
            <section className="mb-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
              <div className="border-b px-6 py-5">
                <h2 className="text-lg font-semibold text-slate-900">
                  Send a notification
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Send a private notification to a specific user.
                </p>
              </div>

              <form action={sendNotification} className="grid gap-5 p-6">
                <div>
                  <label
                    htmlFor="recipientId"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Recipient
                  </label>
                  <select
                    id="recipientId"
                    name="recipientId"
                    required
                    defaultValue=""
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                  >
                    <option value="" disabled>
                      Select a user
                    </option>
                    {recipients.map((recipient) => (
                      <option key={recipient.id} value={recipient.id}>
                        {recipient.firstName} {recipient.lastName} ·{" "}
                        {recipient.email} · {recipient.role.toLowerCase()}
                        {!recipient.inAppNotificationsEnabled &&
                          " · notifications off"}
                      </option>
                    ))}
                  </select>
                  {recipients.length === 0 && (
                    <p className="mt-2 text-sm text-slate-500">
                      No users are available to receive a notification yet.
                    </p>
                  )}
                  {error === "recipient-disabled" && (
                    <p
                      role="alert"
                      className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm font-medium text-amber-800"
                    >
                      This user has turned off in-app notifications. They need to enable
                      notifications in Settings before you can send one.
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="notification-title"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Title
                  </label>
                  <input
                    id="notification-title"
                    name="title"
                    type="text"
                    required
                    maxLength={120}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Notification title"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notification-message"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Message
                  </label>
                  <textarea
                    id="notification-message"
                    name="message"
                    required
                    maxLength={2000}
                    rows={4}
                    className="w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                    placeholder="Write your notification..."
                  />
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Only administrators can send notifications to users.
                  </p>
                  <button
                    type="submit"
                    disabled={recipients.length === 0}
                    className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Send notification
                  </button>
                </div>
              </form>
            </section>
          )}

          {sent === "1" && (
            <p
              role="status"
              className="mb-6 rounded-xl border border-green-200 bg-green-50 px-5 py-4 text-sm font-medium text-green-800"
            >
              Notification sent successfully.
            </p>
          )}

          <section className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-5 border-b px-6 py-5 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Your notifications
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {unreadCount} unread · {visibleCount}{" "}
                  {visibleCount === 1 ? "notification" : "notifications"} shown
                </p>
              </div>
              {unreadCount > 0 && (
                <form action={markAllNotificationsRead}>
                  <button
                    type="submit"
                    className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Mark all as read
                  </button>
                </form>
              )}
            </div>

            <nav
              aria-label="Filter notifications"
              className="flex gap-2 border-b px-6 py-3"
            >
              {filters.map((option) => {
                const isActive = filter === option.value;

                return (
                  <Link
                    key={option.value}
                    href={
                      option.value === "all"
                        ? "/notifications"
                        : `/notifications?filter=${option.value}`
                    }
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-orange-50 text-orange-700"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    {option.label}
                    {option.value === "unread" && unreadCount > 0 && (
                      <span className="ml-2 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-800">
                        {unreadCount}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="divide-y divide-slate-100">
              {notifications.map((notification) => (
                <article
                  key={notification.id}
                  className={`flex gap-4 px-6 py-5 ${
                    notification.isRead ? "bg-white" : "bg-orange-50/50"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                      notification.isRead
                        ? "bg-slate-100 text-slate-500"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {notification.isRead ? "✓" : "!"}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
                      <h3
                        className={`font-semibold ${
                          notification.isRead
                            ? "text-slate-700"
                            : "text-slate-900"
                        }`}
                      >
                        {notification.title}
                      </h3>
                      <time
                        dateTime={notification.createdAt.toISOString()}
                        className="shrink-0 text-xs text-slate-500"
                      >
                        {formatDate(notification.createdAt)}
                      </time>
                    </div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
                      {notification.message}
                    </p>
                    {!notification.isRead && (
                      <form action={markNotificationRead} className="mt-3">
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <button
                          type="submit"
                          className="text-sm font-semibold text-orange-700 hover:text-orange-800"
                        >
                          Mark as read
                        </button>
                      </form>
                    )}
                  </div>
                </article>
              ))}

              {notifications.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <span
                    aria-hidden="true"
                    className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-lg text-slate-500"
                  >
                    ✓
                  </span>
                  <p className="mt-4 font-semibold text-slate-800">
                    {filter === "unread"
                      ? "You're all caught up"
                      : filter === "read"
                        ? "No read notifications"
                        : "No notifications yet"}
                  </p>
                  <p className="mt-2 text-sm text-slate-500">
                    {filter === "unread"
                      ? "You have no unread notifications."
                      : "Updates about your account and community activity will appear here."}
                  </p>
                </div>
              )}
            </div>

            {totalCount > 50 && (
              <p className="border-t px-6 py-4 text-center text-xs text-slate-500">
                Showing the 50 most recent notifications.
              </p>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
