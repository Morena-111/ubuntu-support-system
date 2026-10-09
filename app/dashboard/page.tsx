import Link from "next/link";
import { connection } from "next/server";
import {
  DonationStatus,
  VolunteerStatus,
} from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

function formatStatus(status: string) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

export default async function DashboardPage() {
  await connection();

  const [
    totalRequests,
    donationGroups,
    activeVolunteerGroups,
    recentRequests,
    impact,
  ] = await Promise.all([
    prisma.donationRequest.count(),
    prisma.donation.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.volunteerAssignment.groupBy({
      by: ["volunteerId"],
      where: {
        status: { in: [VolunteerStatus.ASSIGNED, VolunteerStatus.IN_TRANSIT] },
      },
    }),
    prisma.donationRequest.findMany({
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        status: true,
        beneficiary: {
          select: { firstName: true, lastName: true },
        },
      },
    }),
    prisma.impactReport.aggregate({
      _sum: { beneficiariesSupported: true },
      _count: { _all: true },
    }),
  ]);

  const countDonations = (status: DonationStatus) =>
    donationGroups.find((group) => group.status === status)?._count._all ?? 0;
  const activeDonations =
    countDonations(DonationStatus.PENDING) +
    countDonations(DonationStatus.COLLECTED) +
    countDonations(DonationStatus.IN_TRANSIT);
  const stats = [
    {
      label: "Total Requests",
      value: totalRequests,
      detail: "Support requests recorded",
    },
    {
      label: "Active Donations",
      value: activeDonations,
      detail: "Awaiting delivery",
    },
    {
      label: "Completed Donations",
      value: countDonations(DonationStatus.DELIVERED),
      detail: "Marked as delivered",
    },
    {
      label: "Active Volunteers",
      value: activeVolunteerGroups.length,
      detail: "With an active assignment",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <div className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Overview</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
        </div>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Platform summary"
            className="grid gap-6 md:grid-cols-2 xl:grid-cols-4"
          >
            {stats.map((stat) => (
              <article
                key={stat.label}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-slate-500">{stat.label}</p>
                <div className="mt-3 flex items-end justify-between gap-3">
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value.toLocaleString()}
                  </p>
                  <span className="text-right text-xs text-slate-500">
                    {stat.detail}
                  </span>
                </div>
              </article>
            ))}
          </section>

          <div className="mt-8 grid gap-6 xl:grid-cols-3">
            <section className="rounded-2xl border bg-white p-6 shadow-sm xl:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Recent Requests
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest community support requests.
                  </p>
                </div>
                <Link
                  href="/requests"
                  className="text-sm font-medium text-orange-500"
                >
                  View all
                </Link>
              </div>

              <div className="mt-6 divide-y">
                {recentRequests.map((request) => (
                  <div
                    key={request.id}
                    className="flex items-center justify-between gap-4 py-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-800">
                        {request.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {request.beneficiary.firstName}{" "}
                        {request.beneficiary.lastName}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {formatStatus(request.status)}
                    </span>
                  </div>
                ))}
                {recentRequests.length === 0 && (
                  <p className="py-8 text-center text-sm text-slate-500">
                    No support requests have been recorded yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-2xl border bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-400">Platform impact</p>
              <h2 className="mt-2 text-3xl font-bold">
                {(
                  impact._sum.beneficiariesSupported ?? 0
                ).toLocaleString()}
              </h2>
              <p className="mt-2 text-sm text-slate-400">
                beneficiaries supported through the platform.
              </p>
              <p className="mt-8 border-t border-slate-800 pt-4 text-xs text-slate-500">
                Reported across {impact._count._all.toLocaleString()} impact{" "}
                {impact._count._all === 1 ? "report" : "reports"}.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
