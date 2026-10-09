import { connection } from "next/server";
import { RequestStatus } from "@/app/generated/prisma/enums";
import Sidebar from "@/components/layout/Sidebar";
import { prisma } from "@/lib/prisma";

const statusStyles: Record<RequestStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-green-100 text-green-800",
  MATCHED: "bg-blue-100 text-blue-800",
  REJECTED: "bg-red-100 text-red-800",
  COMPLETED: "bg-slate-100 text-slate-700",
};

function formatLabel(value: string) {
  return value.charAt(0) + value.slice(1).toLowerCase();
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default async function RequestsPage() {
  await connection();

  const requests = await prisma.donationRequest.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      category: true,
      quantityNeeded: true,
      status: true,
      createdAt: true,
      beneficiary: {
        select: { firstName: true, lastName: true },
      },
    },
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Community support</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Donation Requests
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review and manage requests for community assistance.
          </p>
        </header>

        <div className="p-6 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">All Requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                {requests.length}{" "}
                {requests.length === 1 ? "request" : "requests"} recorded
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th scope="col" className="px-6 py-4">Request</th>
                    <th scope="col" className="px-6 py-4">Beneficiary</th>
                    <th scope="col" className="px-6 py-4">Category</th>
                    <th scope="col" className="px-6 py-4">Quantity</th>
                    <th scope="col" className="px-6 py-4">Status</th>
                    <th scope="col" className="px-6 py-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {requests.map((request) => (
                    <tr
                      key={request.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-5">
                        <p className="font-medium text-slate-900">
                          {request.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          #{request.id.slice(0, 8).toUpperCase()}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {request.beneficiary.firstName}{" "}
                        {request.beneficiary.lastName}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {formatLabel(request.category)}
                      </td>
                      <td className="px-6 py-5 text-sm text-slate-600">
                        {request.quantityNeeded.toLocaleString()}
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${statusStyles[request.status]}`}
                        >
                          {formatLabel(request.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-5 text-sm text-slate-500">
                        {formatDate(request.createdAt)}
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center">
                        <p className="font-medium text-slate-800">
                          No support requests yet
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Requests created by beneficiaries will appear here.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
