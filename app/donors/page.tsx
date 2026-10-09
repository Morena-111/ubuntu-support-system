import Link from "next/link";
import { connection } from "next/server";
import { DonationStatus, Role } from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

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

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function DonorsPage() {
  await connection();

  const [donorCount, donationGroups, donors] = await Promise.all([
    prisma.user.count({ where: { role: Role.DONOR } }),
    prisma.donation.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { quantityDonated: true },
    }),
    prisma.user.findMany({
      where: { role: Role.DONOR },
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
          select: { donations: true },
        },
        donations: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            quantityDonated: true,
            status: true,
            createdAt: true,
            request: {
              select: { title: true },
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
  const deliveredItems =
    donationGroups.find((group) => group.status === DonationStatus.DELIVERED)
      ?._sum.quantityDonated ?? 0;
  const stats = [
    {
      label: "Registered donors",
      value: donorCount,
      detail: "Community contributors",
      marker: "D",
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Donations made",
      value: totalDonations,
      detail: "Contributions recorded",
      marker: "＋",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Items contributed",
      value: totalItems,
      detail: "Across all donation statuses",
      marker: "I",
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "Items delivered",
      value: deliveredItems,
      detail: "Marked as delivered",
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
          <h1 className="mt-1 text-3xl font-bold text-slate-900">Donors</h1>
          <p className="mt-2 text-sm text-slate-500">
            Recognise community contributors and see the support they have
            provided.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Donor summary"
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
                  Registered donors
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {donorCount.toLocaleString()}{" "}
                  {donorCount === 1 ? "donor" : "donors"} · showing the latest{" "}
                  {donors.length}
                </p>
              </div>
              <Link
                href="/donations"
                className="inline-flex items-center justify-center rounded-lg bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
              >
                View donations
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b bg-slate-50">
                  <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Donor</th>
                    <th scope="col" className="px-6 py-4">Organisation</th>
                    <th scope="col" className="px-6 py-4">Location</th>
                    <th scope="col" className="px-6 py-4">Donations</th>
                    <th scope="col" className="px-6 py-4">Latest contribution</th>
                    <th scope="col" className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {donors.map((donor) => {
                    const latestDonation = donor.donations[0];
                    const location = [
                      donor.organisation?.city,
                      donor.organisation?.province,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={donor.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {donor.firstName} {donor.lastName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            #{donor.id.slice(0, 8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {donor.organisation?.name ?? "Individual"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {location || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {donor._count.donations}
                        </td>
                        <td className="px-6 py-4">
                          {latestDonation ? (
                            <>
                              <p className="max-w-56 truncate text-sm font-medium text-slate-800">
                                {latestDonation.request.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {latestDonation.quantityDonated.toLocaleString()}{" "}
                                {latestDonation.quantityDonated === 1
                                  ? "item"
                                  : "items"}{" "}
                                · {formatDate(latestDonation.createdAt)}
                              </p>
                              <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[latestDonation.status]}`}
                              >
                                {formatStatus(latestDonation.status)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No donations yet
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(donor.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                  {donors.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="font-semibold text-slate-800">
                          No donors registered yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Donor accounts will appear here when they register
                          and join the community.
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
