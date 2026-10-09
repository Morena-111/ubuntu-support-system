import Link from "next/link";
import { connection } from "next/server";
import { RequestStatus, Role } from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  MATCHED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-slate-100 text-slate-700",
};

function formatStatus(status: RequestStatus) {
  return status.charAt(0) + status.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function BeneficiariesPage() {
  await connection();

  const [beneficiaryCount, requestGroups, beneficiaries] = await Promise.all([
    prisma.user.count({ where: { role: Role.BENEFICIARY } }),
    prisma.donationRequest.groupBy({
      by: ["status"],
      where: {
        beneficiary: {
          is: { role: Role.BENEFICIARY },
        },
      },
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: Role.BENEFICIARY },
      take: 12,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
        organisation: {
          select: {
            name: true,
            city: true,
            province: true,
          },
        },
        _count: {
          select: { donationRequests: true },
        },
        donationRequests: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            title: true,
            status: true,
          },
        },
      },
    }),
  ]);

  const countForStatus = (status: RequestStatus) =>
    requestGroups.find((group) => group.status === status)?._count._all ?? 0;
  const stats = [
    {
      label: "Beneficiaries",
      value: beneficiaryCount,
      detail: "Registered community members",
      marker: "B",
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Pending requests",
      value: countForStatus(RequestStatus.PENDING),
      detail: "Waiting for review",
      marker: "P",
      color: "bg-amber-100 text-amber-700",
    },
    {
      label: "Matched requests",
      value: countForStatus(RequestStatus.MATCHED),
      detail: "Connected with donations",
      marker: "M",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Completed requests",
      value: countForStatus(RequestStatus.COMPLETED),
      detail: "Support delivered",
      marker: "✓",
      color: "bg-green-100 text-green-700",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Community support</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Beneficiaries
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View community members and follow the progress of their support
            requests.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Beneficiary summary"
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

          <section className="mt-8 overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Registered beneficiaries
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {beneficiaryCount.toLocaleString()}{" "}
                  {beneficiaryCount === 1 ? "beneficiary" : "beneficiaries"} ·
                  showing the latest {beneficiaries.length}
                </p>
              </div>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Register beneficiary
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Beneficiary</th>
                    <th scope="col" className="px-6 py-4">Organisation</th>
                    <th scope="col" className="px-6 py-4">Location</th>
                    <th scope="col" className="px-6 py-4">Requests</th>
                    <th scope="col" className="px-6 py-4">Latest request</th>
                    <th scope="col" className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {beneficiaries.map((beneficiary) => {
                    const latestRequest = beneficiary.donationRequests[0];
                    const location = [
                      beneficiary.organisation?.city,
                      beneficiary.organisation?.province,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={beneficiary.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {beneficiary.firstName} {beneficiary.lastName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            #{beneficiary.id.slice(0, 8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {beneficiary.organisation?.name ?? "Individual"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {location || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {beneficiary._count.donationRequests}
                        </td>
                        <td className="px-6 py-4">
                          {latestRequest ? (
                            <>
                              <p className="max-w-56 truncate text-sm font-medium text-slate-800">
                                {latestRequest.title}
                              </p>
                              <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[latestRequest.status]}`}
                              >
                                {formatStatus(latestRequest.status)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No requests yet
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(beneficiary.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                  {beneficiaries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="font-semibold text-slate-800">
                          No beneficiaries registered yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Register a beneficiary to start coordinating
                          community support.
                        </p>
                        <Link
                          href="/register"
                          className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          Register the first beneficiary
                        </Link>
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
