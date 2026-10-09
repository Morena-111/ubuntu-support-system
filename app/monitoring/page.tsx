import Link from "next/link";
import { connection } from "next/server";
import {
  CampaignStatus,
  DonationStatus,
  RequestStatus,
  VolunteerStatus,
} from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

const requestStatusStyles: Record<RequestStatus, string> = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-green-500",
  MATCHED: "bg-blue-500",
  REJECTED: "bg-red-500",
  COMPLETED: "bg-slate-400",
};

const donationStatusStyles: Record<DonationStatus, string> = {
  PENDING: "bg-amber-500",
  COLLECTED: "bg-blue-500",
  IN_TRANSIT: "bg-violet-500",
  DELIVERED: "bg-green-500",
  CANCELLED: "bg-slate-400",
};

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default async function MonitoringPage() {
  await connection();

  let databaseAvailable = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    console.error("Monitoring database health check failed:", error);
    databaseAvailable = false;
  }

  if (!databaseAvailable) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <main className="min-w-0 flex-1">
          <header className="border-b bg-white px-6 py-5 lg:px-10">
            <p className="text-sm text-slate-500">Platform operations</p>
            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Monitoring
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Monitor service health, community support activity, and delivery
              progress.
            </p>
          </header>
          <div className="p-6 lg:p-10">
            <section
              role="alert"
              className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <span
                  aria-hidden="true"
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700"
                >
                  !
                </span>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Database unavailable
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    The monitoring data could not be loaded because the
                    database health check failed. Check the database
                    connection and try again.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    );
  }

  const [
    userCount,
    requestGroups,
    donationGroups,
    assignmentGroups,
    activeCampaigns,
    recentActivity,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.donationRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.donation.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { quantityDonated: true },
    }),
    prisma.volunteerAssignment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.campaign.count({ where: { status: CampaignStatus.ACTIVE } }),
    prisma.activityLog.findMany({
      take: 8,
      orderBy: { timestamp: "desc" },
      select: {
        id: true,
        action: true,
        entity: true,
        entityId: true,
        timestamp: true,
        user: {
          select: {
            firstName: true,
            lastName: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const countRequests = (status: RequestStatus) =>
    requestGroups.find((group) => group.status === status)?._count._all ?? 0;
  const countDonations = (status: DonationStatus) =>
    donationGroups.find((group) => group.status === status)?._count._all ?? 0;
  const countAssignments = (status: VolunteerStatus) =>
    assignmentGroups.find((group) => group.status === status)?._count._all ?? 0;

  const requestTotal = requestGroups.reduce(
    (total, group) => total + group._count._all,
    0
  );
  const donationTotal = donationGroups.reduce(
    (total, group) => total + group._count._all,
    0
  );
  const contributedItems = donationGroups.reduce(
    (total, group) => total + (group._sum.quantityDonated ?? 0),
    0
  );
  const stats = [
    {
      label: "Platform users",
      value: userCount,
      detail: "Across all account types",
      marker: "U",
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Support requests",
      value: requestTotal,
      detail: `${countRequests(RequestStatus.PENDING)} awaiting review`,
      marker: "R",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Donations",
      value: donationTotal,
      detail: `${contributedItems.toLocaleString()} items contributed`,
      marker: "D",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Active campaigns",
      value: activeCampaigns,
      detail: "Currently running",
      marker: "C",
      color: "bg-green-100 text-green-700",
    },
  ];

  const requestStatuses: RequestStatus[] = [
    RequestStatus.PENDING,
    RequestStatus.APPROVED,
    RequestStatus.MATCHED,
    RequestStatus.COMPLETED,
    RequestStatus.REJECTED,
  ];
  const donationStatuses: DonationStatus[] = [
    DonationStatus.PENDING,
    DonationStatus.COLLECTED,
    DonationStatus.IN_TRANSIT,
    DonationStatus.DELIVERED,
    DonationStatus.CANCELLED,
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Platform operations</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Monitoring
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Monitor service health, community support activity, and delivery
            progress.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Platform overview"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border bg-white p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {stat.label}
                  </p>
                  <span
                    aria-hidden="true"
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${stat.color}`}
                  >
                    {stat.marker}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">
                  {stat.value.toLocaleString()}
                </p>
                <p className="mt-1 text-xs text-slate-500">{stat.detail}</p>
              </article>
            ))}
          </section>

          <section
            aria-label="Service health"
            className="mt-8 rounded-2xl border bg-white p-6 shadow-sm"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Service health
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Live check performed while loading this page.
                </p>
              </div>
              <span className="inline-flex w-fit items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-medium text-green-700">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Database connected
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                <span className="text-sm text-slate-600">PostgreSQL</span>
                <span className="text-sm font-semibold text-green-700">
                  Connected
                </span>
              </div>
            </div>
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Request pipeline
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {requestTotal.toLocaleString()} total requests
                  </p>
                </div>
                <Link
                  href="/requests"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  View requests
                </Link>
              </div>
              <div className="mt-6 space-y-5">
                {requestStatuses.map((status) => {
                  const count = countRequests(status);
                  const width =
                    requestTotal === 0 ? 0 : (count / requestTotal) * 100;

                  return (
                    <div key={status}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {formatStatus(status)}
                        </span>
                        <span className="font-medium text-slate-800">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${formatStatus(status)} requests`}
                        aria-valuemin={0}
                        aria-valuemax={requestTotal}
                        aria-valuenow={count}
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          className={`h-full rounded-full ${requestStatusStyles[status]}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Donation progress
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {donationTotal.toLocaleString()} total donations
                  </p>
                </div>
                <Link
                  href="/donations"
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  View donations
                </Link>
              </div>
              <div className="mt-6 space-y-5">
                {donationStatuses.map((status) => {
                  const count = countDonations(status);
                  const width =
                    donationTotal === 0 ? 0 : (count / donationTotal) * 100;

                  return (
                    <div key={status}>
                      <div className="mb-2 flex items-center justify-between text-sm">
                        <span className="text-slate-600">
                          {formatStatus(status)}
                        </span>
                        <span className="font-medium text-slate-800">
                          {count.toLocaleString()}
                        </span>
                      </div>
                      <div
                        role="progressbar"
                        aria-label={`${formatStatus(status)} donations`}
                        aria-valuemin={0}
                        aria-valuemax={donationTotal}
                        aria-valuenow={count}
                        className="h-2 overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          className={`h-full rounded-full ${donationStatusStyles[status]}`}
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="mt-6 border-t pt-4 text-sm text-slate-500">
                {countAssignments(VolunteerStatus.ASSIGNED)} volunteer{" "}
                {countAssignments(VolunteerStatus.ASSIGNED) === 1
                  ? "assignment"
                  : "assignments"}{" "}
                awaiting pickup ·{" "}
                {countAssignments(VolunteerStatus.IN_TRANSIT)} in transit ·{" "}
                {countAssignments(VolunteerStatus.DELIVERED)} delivered
              </p>
            </section>
          </div>

          <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center justify-between border-b px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Recent activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Latest events recorded in the activity log.
                </p>
              </div>
            </div>
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-slate-100">
                {recentActivity.map((activity) => (
                  <article
                    key={activity.id}
                    className="flex flex-col gap-2 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-slate-800">
                        {activity.action}{" "}
                        <span className="font-normal text-slate-500">
                          · {activity.entity}
                          {activity.entityId
                            ? ` #${activity.entityId.slice(0, 8)}`
                            : ""}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {activity.user.firstName} {activity.user.lastName} ·{" "}
                        {formatStatus(activity.user.role)}
                      </p>
                    </div>
                    <time
                      dateTime={activity.timestamp.toISOString()}
                      className="shrink-0 text-xs text-slate-500"
                    >
                      {formatDate(activity.timestamp)}
                    </time>
                  </article>
                ))}
              </div>
            ) : (
              <div className="px-6 py-12 text-center">
                <p className="font-medium text-slate-800">
                  No activity has been logged yet
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Recorded platform activity will appear here.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
