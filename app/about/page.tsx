import Navbar from "../../components/layout/Navbar";

const values = [
  {
    title: "Transparency",
    description:
      "Support activities are organised in a structured environment where requests, donations and progress can be monitored.",
  },
  {
    title: "Community",
    description:
      "The platform connects people, organisations, volunteers and beneficiaries around shared support initiatives.",
  },
  {
    title: "Impact",
    description:
      "Activities can be monitored and evaluated to understand how resources are being used and who is being supported.",
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            About Ubuntu Support
          </p>

          <h1 className="mt-4 text-5xl font-bold leading-tight">
            A central platform for community support.
          </h1>

          <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
            Ubuntu Support is a web-based community support management
            platform designed to coordinate requests for assistance, donations,
            volunteers and organisational support.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-14 px-6 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              Our purpose
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950">
              Bringing the support process together.
            </h2>

            <p className="mt-5 leading-8 text-slate-600">
              Community support often involves multiple stakeholders. A person
              or organisation may submit a request, an administrator may review
              it, a donor may provide resources and a volunteer may assist with
              delivery.
            </p>

            <p className="mt-5 leading-8 text-slate-600">
              Ubuntu Support provides a central environment where these
              activities can be coordinated and tracked.
            </p>
          </div>

          <div className="rounded-3xl bg-slate-950 p-8 text-white">
            <p className="text-sm text-slate-400">Platform roles</p>

            <div className="mt-6 space-y-4">
              {[
                "Administrators",
                "Donors and organisations",
                "Beneficiaries",
                "Volunteers",
              ].map((role) => (
                <div
                  key={role}
                  className="rounded-xl border border-slate-800 bg-slate-900 px-5 py-4"
                >
                  {role}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
            Our principles
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-2xl border bg-white p-7"
              >
                <h3 className="text-xl font-bold text-slate-950">
                  {value.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}