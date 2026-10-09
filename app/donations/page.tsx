import Link from "next/link";
import { connection } from "next/server";
import { DonationStatus } from "@/app/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import Sidebar from "@/components/layout/Sidebar";

const statusStyles: Record<DonationStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  COLLECTED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-violet-100 text-violet-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-slate-100 text-slate-600",
};

function formatStatus(status: DonationStatus) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatName(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`;
}

export default async function DonationsPage() {
  await connection();

  const [donationGroups, donations] = await Promise.all([
    prisma.donation.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { quantityDonated: true },
    }),
    prisma.donation.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        quantityDonated: true,
        status: true,
        createdAt: true,
        donor: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        request: {
          select: {
            title: true,
            beneficiary: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    }),
  ]);

  const totalDonations = donationGroups.reduce(
    (total, group) => total + group._count._all,
    0
  );
  const totalItems = donationGroups.reduce(
    (total, group) => total + (group._sum.quantityDonated ?? 0),
    0
  );
  const countForStatus = (status: DonationStatus) =>
    donationGroups.find((group) => group.status === status)?._count._all ?? 0;

  const stats = [
    {
      label: "Total donations",
      value: totalDonations,
      detail: "Contributions recorded",
      accent: "bg-orange-100 text-orange-700",
      marker: "D",
    },
    {
      label: "Items contributed",
      value: totalItems,
      detail: "Across all donations",
      accent: "bg-blue-100 text-blue-700",
      marker: "I",
    },
    {
      label: "Awaiting collection",
      value: countForStatus(DonationStatus.PENDING),
      detail: "Pending donations",
      accent: "bg-amber-100 text-amber-700",
      marker: "A",
    },
    {
      label: "Delivered",
      value: countForStatus(DonationStatus.DELIVERED),
      detail: "Successfully delivered",
      accent: "bg-green-100 text-green-700",
      marker: "✓",
    },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Community support</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Donations</h1>
          <p className="mt-2 text-sm text-slate-500">
            Track contributions and follow them through to delivery.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Donation summary"
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
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-bold ${stat.accent}`}
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
                  Recent donations
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {totalDonations.toLocaleString()} total{" "}
                  {totalDonations === 1 ? "donation" : "donations"} · showing
                  the latest {donations.length}
                </p>
              </div>
              <Link
                href="/requests"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                Browse requests
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Request</th>
                    <th scope="col" className="px-6 py-4">Donor</th>
                    <th scope="col" className="px-6 py-4">Beneficiary</th>
                    <th scope="col" className="px-6 py-4">Items</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donations.map((donation) => (
                    <tr key={donation.id} className="transition hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-slate-900">
                          {donation.request.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          #{donation.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatName(donation.donor.firstName, donation.donor.lastName)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatName(
                          donation.request.beneficiary.firstName,
                          donation.request.beneficiary.lastName
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-slate-700">
                        {donation.quantityDonated.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles[donation.status]}`}
                        >
                          {formatStatus(donation.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                        {new Intl.DateTimeFormat("en-ZA", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }).format(donation.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="font-semibold text-slate-800">
                          No donations recorded yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Browse open requests to find a community that needs
                          support.
                        </p>
                        <Link
                          href="/requests"
                          className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                        >
                          View donation requests
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
