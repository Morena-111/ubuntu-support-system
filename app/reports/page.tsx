import Link from "next/link";
import { connection } from "next/server";
import { DonationStatus } from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

type ReportsPageProps = {
  searchParams: Promise<{ period?: string }>;
};

const periods = [
  { label: "Last 30 days", value: "30d" },
  { label: "Last 90 days", value: "90d" },
  { label: "Last 12 months", value: "12m" },
  { label: "All time", value: "all" },
] as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

export default async function ReportsPage({
  searchParams,
}: ReportsPageProps) {
  await connection();

  const { period: requestedPeriod } = await searchParams;
  const period = periods.some((option) => option.value === requestedPeriod)
    ? requestedPeriod!
    : "30d";

  const since = new Date();
  if (period === "30d") since.setDate(since.getDate() - 30);
  if (period === "90d") since.setDate(since.getDate() - 90);
  if (period === "12m") since.setFullYear(since.getFullYear() - 1);

  const reportWhere =
    period === "all" ? {} : { reportDate: { gte: since } };

  const [
    impactTotals,
    impactReports,
    impactByCampaign,
    requestGroups,
    donationGroups,
  ] = await Promise.all([
      prisma.impactReport.aggregate({
        where: reportWhere,
        _sum: {
          beneficiariesSupported: true,
          donationsReceived: true,
          volunteersInvolved: true,
        },
        _count: { _all: true },
      }),
      prisma.impactReport.findMany({
        where: reportWhere,
        take: 12,
        orderBy: { reportDate: "desc" },
        select: {
          id: true,
          reportDate: true,
          beneficiariesSupported: true,
          donationsReceived: true,
          volunteersInvolved: true,
          campaign: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
      }),
      prisma.impactReport.groupBy({
        by: ["campaignId"],
        where: reportWhere,
        _count: { _all: true },
        _sum: {
          beneficiariesSupported: true,
          donationsReceived: true,
          volunteersInvolved: true,
        },
      }),
      prisma.donationRequest.groupBy({
        by: ["status"],
        where: period === "all" ? {} : { createdAt: { gte: since } },
        _count: { _all: true },
      }),
      prisma.donation.groupBy({
        by: ["status"],
        where: period === "all" ? {} : { createdAt: { gte: since } },
        _count: { _all: true },
        _sum: { quantityDonated: true },
      }),
    ]);

  const campaigns = await prisma.campaign.findMany({
    where: { id: { in: impactByCampaign.map((group) => group.campaignId) } },
    select: { id: true, title: true },
  });
  const campaignNames = new Map(
    campaigns.map((campaign) => [campaign.id, campaign.title])
  );
  const totalRequests = requestGroups.reduce(
    (total, group) => total + group._count._all,
    0
  );
  const totalDonations = donationGroups.reduce(
    (total, group) => total + group._count._all,
    0
  );
  const deliveredDonations =
    donationGroups.find((group) => group.status === DonationStatus.DELIVERED)?._count
      ._all ?? 0;
  const deliveredItems =
    donationGroups.find((group) => group.status === DonationStatus.DELIVERED)?._sum
      .quantityDonated ?? 0;

  const stats = [
    {
      label: "Beneficiaries supported",
      value: impactTotals._sum.beneficiariesSupported ?? 0,
      detail: "From submitted impact reports",
      marker: "B",
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Reported donations",
      value: impactTotals._sum.donationsReceived ?? 0,
      detail: "Recorded in impact reports",
      marker: "D",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Volunteers involved",
      value: impactTotals._sum.volunteersInvolved ?? 0,
      detail: "From submitted impact reports",
      marker: "V",
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "Impact reports",
      value: impactTotals._count._all,
      detail: "Submitted in this period",
      marker: "R",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Community support</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Reports</h1>
          <p className="mt-2 text-sm text-slate-500">
            Review reported impact and platform activity over time.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <nav
            aria-label="Report date range"
            className="mb-6 flex flex-wrap gap-2"
          >
            {periods.map((option) => {
              const isActive = period === option.value;
              return (
                <Link
                  key={option.value}
                  href={`/reports?period=${option.value}`}
                  aria-current={isActive ? "page" : undefined}
                  className={`rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>

          <section
            aria-label="Impact summary"
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

          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Platform activity
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Transaction totals for the selected period, based on
                  recorded requests and donations.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/requests"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View requests
                </Link>
                <Link
                  href="/donations"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  View donations
                </Link>
              </div>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { label: "Support requests", value: totalRequests },
                { label: "Donations recorded", value: totalDonations },
                { label: "Donations delivered", value: deliveredDonations },
                { label: "Items delivered", value: deliveredItems },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-slate-100 bg-slate-50 p-4"
                >
                  <p className="text-sm text-slate-500">{item.label}</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    {item.value.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Campaign impact
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Totals grouped from impact reports submitted during the
                selected period.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Campaign</th>
                    <th scope="col" className="px-6 py-4">Reports</th>
                    <th scope="col" className="px-6 py-4">Beneficiaries</th>
                    <th scope="col" className="px-6 py-4">Donations</th>
                    <th scope="col" className="px-6 py-4">Volunteers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {impactByCampaign.map((group) => (
                    <tr key={group.campaignId} className="hover:bg-slate-50">
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {campaignNames.get(group.campaignId) ??
                          "Unknown campaign"}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {group._count._all.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(
                          group._sum.beneficiariesSupported ?? 0
                        ).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(group._sum.donationsReceived ?? 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {(group._sum.volunteersInvolved ?? 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {impactByCampaign.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="font-medium text-slate-800">
                          No campaign impact reports for this period
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Submitted campaign impact reports will appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="border-b px-6 py-5">
              <h2 className="text-lg font-semibold text-slate-900">
                Recent impact reports
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {impactReports.length > 0
                  ? `Showing the latest ${impactReports.length} reports in this period.`
                  : "Impact reports submitted by campaigns will appear here."}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Report date</th>
                    <th scope="col" className="px-6 py-4">Campaign</th>
                    <th scope="col" className="px-6 py-4">Beneficiaries</th>
                    <th scope="col" className="px-6 py-4">Donations</th>
                    <th scope="col" className="px-6 py-4">Volunteers</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {impactReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-600">
                        {formatDate(report.reportDate)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {report.campaign.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatStatus(report.campaign.status)}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {report.beneficiariesSupported.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {report.donationsReceived.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {report.volunteersInvolved.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  {impactReports.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="font-medium text-slate-800">
                          No impact reports for this period
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Try a longer reporting period or check back after
                          campaigns submit reports.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
