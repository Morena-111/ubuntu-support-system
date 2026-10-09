import Link from "next/link";
import { connection } from "next/server";
import { Role, VolunteerStatus } from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<VolunteerStatus, string> = {
  ASSIGNED: "bg-amber-100 text-amber-800",
  IN_TRANSIT: "bg-blue-100 text-blue-800",
  DELIVERED: "bg-green-100 text-green-800",
};

function formatStatus(status: VolunteerStatus) {
  return status
    .toLowerCase()
    .replace("_", " ")
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function formatDate(date: Date | null) {
  if (!date) return "Not scheduled";

  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default async function VolunteersPage() {
  await connection();

  const [volunteerCount, assignmentGroups, volunteers] = await Promise.all([
    prisma.user.count({ where: { role: Role.VOLUNTEER } }),
    prisma.volunteerAssignment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.user.findMany({
      where: { role: Role.VOLUNTEER },
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
          select: { assignments: true },
        },
        assignments: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: {
            status: true,
            pickupDate: true,
            deliveryDate: true,
            donation: {
              select: {
                request: {
                  select: { title: true },
                },
              },
            },
          },
        },
      },
    }),
  ]);

  const countForStatus = (status: VolunteerStatus) =>
    assignmentGroups.find((group) => group.status === status)?._count._all ?? 0;
  const activeAssignments =
    countForStatus(VolunteerStatus.ASSIGNED) +
    countForStatus(VolunteerStatus.IN_TRANSIT);

  const stats = [
    {
      label: "Registered volunteers",
      value: volunteerCount,
      detail: "Community members",
      marker: "V",
      color: "bg-orange-100 text-orange-700",
    },
    {
      label: "Active assignments",
      value: activeAssignments,
      detail: "Assigned or in transit",
      marker: "A",
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Deliveries in transit",
      value: countForStatus(VolunteerStatus.IN_TRANSIT),
      detail: "Currently being delivered",
      marker: "→",
      color: "bg-violet-100 text-violet-700",
    },
    {
      label: "Completed deliveries",
      value: countForStatus(VolunteerStatus.DELIVERED),
      detail: "Assignments delivered",
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
            Volunteers
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Coordinate volunteers and track the progress of their delivery
            assignments.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <section
            aria-label="Volunteer summary"
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
                  Registered volunteers
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {volunteerCount.toLocaleString()}{" "}
                  {volunteerCount === 1 ? "volunteer" : "volunteers"} · showing
                  the latest {volunteers.length}
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
                    <th scope="col" className="px-6 py-4">Volunteer</th>
                    <th scope="col" className="px-6 py-4">Organisation</th>
                    <th scope="col" className="px-6 py-4">Location</th>
                    <th scope="col" className="px-6 py-4">Assignments</th>
                    <th scope="col" className="px-6 py-4">Latest assignment</th>
                    <th scope="col" className="px-6 py-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {volunteers.map((volunteer) => {
                    const latestAssignment = volunteer.assignments[0];
                    const location = [
                      volunteer.organisation?.city,
                      volunteer.organisation?.province,
                    ]
                      .filter(Boolean)
                      .join(", ");

                    return (
                      <tr
                        key={volunteer.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <p className="font-medium text-slate-900">
                            {volunteer.firstName} {volunteer.lastName}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            #{volunteer.id.slice(0, 8).toUpperCase()}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {volunteer.organisation?.name ?? "Individual"}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {location || "—"}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-700">
                          {volunteer._count.assignments}
                        </td>
                        <td className="px-6 py-4">
                          {latestAssignment ? (
                            <>
                              <p className="max-w-56 truncate text-sm font-medium text-slate-800">
                                {latestAssignment.donation.request.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Pickup: {formatDate(latestAssignment.pickupDate)}
                              </p>
                              <span
                                className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusStyles[latestAssignment.status]}`}
                              >
                                {formatStatus(latestAssignment.status)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400">
                              No assignments yet
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-500">
                          {formatDate(volunteer.createdAt)}
                        </td>
                      </tr>
                    );
                  })}
                  {volunteers.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <p className="font-semibold text-slate-800">
                          No volunteers registered yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Volunteer accounts will appear here when they join
                          the community.
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
