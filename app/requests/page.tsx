import Sidebar from "../../components/layout/Sidebar";

const requests = [
  {
    id: "REQ-001",
    title: "School shoes for Grade 7 learners",
    beneficiary: "Ubuntu Primary School",
    category: "Education",
    quantity: 100,
    status: "Pending",
    urgency: "High",
    date: "30 July 2026",
  },
  {
    id: "REQ-002",
    title: "Food parcel support",
    beneficiary: "Hope Community Centre",
    category: "Food",
    quantity: 50,
    status: "Approved",
    urgency: "Medium",
    date: "28 July 2026",
  },
  {
    id: "REQ-003",
    title: "Computer equipment",
    beneficiary: "Mamelodi Youth Centre",
    category: "Technology",
    quantity: 15,
    status: "Matched",
    urgency: "Medium",
    date: "26 July 2026",
  },
  {
    id: "REQ-004",
    title: "Winter clothing",
    beneficiary: "Thabong Community Project",
    category: "Clothing",
    quantity: 80,
    status: "Completed",
    urgency: "Low",
    date: "20 July 2026",
  },
];

function statusStyle(status: string) {
  switch (status) {
    case "Approved":
      return "bg-green-100 text-green-700";
    case "Matched":
      return "bg-blue-100 text-blue-700";
    case "Completed":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-yellow-100 text-yellow-700";
  }
}

function urgencyStyle(urgency: string) {
  switch (urgency) {
    case "High":
      return "bg-red-100 text-red-700";
    case "Medium":
      return "bg-orange-100 text-orange-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function RequestsPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1">
        <div className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">Community support</p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Donation Requests
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Review and manage requests for community assistance.
          </p>
        </div>

        <div className="p-6 lg:p-10">
          <div className="mb-6 flex flex-col gap-4 rounded-2xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                All Requests
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {requests.length} active records displayed
              </p>
            </div>

            <button className="rounded-lg bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600">
              + New Request
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="border-b bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-4">Request</th>
                    <th className="px-6 py-4">Beneficiary</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Quantity</th>
                    <th className="px-6 py-4">Urgency</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
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
                          {request.id}
                        </p>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {request.beneficiary}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {request.category}
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-600">
                        {request.quantity}
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${urgencyStyle(
                            request.urgency
                          )}`}
                        >
                          {request.urgency}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyle(
                            request.status
                          )}`}
                        >
                          {request.status}
                        </span>
                      </td>

                      <td className="px-6 py-5 text-sm text-slate-500">
                        {request.date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}