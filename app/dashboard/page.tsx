import Sidebar from "@/components/layout/Sidebar";

const stats = [
  {
    label: "Total Requests",
    value: "128",
    change: "+12%",
  },
  {
    label: "Active Donations",
    value: "46",
    change: "+8%",
  },
  {
    label: "Completed Donations",
    value: "312",
    change: "+18%",
  },
  {
    label: "Active Volunteers",
    value: "84",
    change: "+5%",
  },
];

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1">
        <div className="border-b bg-white px-6 py-5 lg:px-10">
          <p className="text-sm text-slate-500">
            Overview
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            Dashboard
          </h1>
        </div>

        <div className="p-6 lg:p-10">
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border bg-white p-6 shadow-sm"
              >
                <p className="text-sm text-slate-500">
                  {stat.label}
                </p>

                <div className="mt-3 flex items-end justify-between">
                  <p className="text-3xl font-bold text-slate-900">
                    {stat.value}
                  </p>

                  <span className="text-sm font-medium text-green-600">
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

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

                <a
                  href="/requests"
                  className="text-sm font-medium text-orange-500"
                >
                  View all
                </a>
              </div>

              <div className="mt-6 divide-y">
                {[
                  ["School shoes for Grade 7 learners", "Pending"],
                  ["Food parcel support", "Approved"],
                  ["Computer equipment", "Matched"],
                  ["Winter clothing", "Completed"],
                ].map(([title, status]) => (
                  <div
                    key={title}
                    className="flex items-center justify-between py-4"
                  >
                    <p className="font-medium text-slate-800">
                      {title}
                    </p>

                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                      {status}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border bg-slate-950 p-6 text-white">
              <p className="text-sm text-slate-400">
                Platform impact
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                1,248
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                beneficiaries supported through the platform.
              </p>

              <div className="mt-8 h-2 rounded-full bg-slate-800">
                <div className="h-2 w-3/4 rounded-full bg-orange-500" />
              </div>

              <p className="mt-3 text-xs text-slate-500">
                75% of this quarter's support target
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}