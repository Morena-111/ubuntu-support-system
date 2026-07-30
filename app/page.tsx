import Link from "next/link";
import Navbar from "../components/layout/Navbar";

const features = [
  {
    number: "01",
    title: "Support Requests",
    description:
      "Communities can submit and track requests for essential resources and assistance.",
  },
  {
    number: "02",
    title: "Donation Management",
    description:
      "Donors and organisations can coordinate contributions and monitor their progress.",
  },
  {
    number: "03",
    title: "Impact Monitoring",
    description:
      "Administrators can monitor activities, outcomes and the impact of support initiatives.",
  },
];

const stats = [
  ["120+", "Support requests"],
  ["340+", "Donations coordinated"],
  ["85+", "Active volunteers"],
  ["25+", "Communities reached"],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="overflow-hidden bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-16 px-6 py-24 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-32">
          <div>
            <div className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-4 py-2 text-sm font-medium text-orange-300">
              Community Support Management
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-bold leading-tight tracking-tight md:text-6xl">
              Connecting people, resources and communities.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">
              Ubuntu Support provides a central platform for coordinating
              community requests, donations, volunteers and support activities
              in one place.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/register"
                className="rounded-xl bg-orange-500 px-6 py-3.5 font-semibold text-white transition hover:bg-orange-600"
              >
                Get started
              </Link>

              <Link
                href="/about"
                className="rounded-xl border border-slate-700 px-6 py-3.5 font-semibold text-white transition hover:bg-slate-900"
              >
                Learn about the platform
              </Link>
            </div>
          </div>

          {/* Hero card */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Platform overview</p>
                  <p className="mt-1 text-2xl font-bold">Community Impact</p>
                </div>

                <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                  Active
                </span>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {stats.map(([value, label]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
                  >
                    <p className="text-3xl font-bold text-white">{value}</p>
                    <p className="mt-2 text-sm text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Intro */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-orange-500">
              What the platform does
            </p>

            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-4xl">
              One platform for the entire support lifecycle.
            </h2>

            <p className="mt-5 text-lg leading-8 text-slate-600">
              From the moment a support request is submitted to the point where
              a donation is delivered, Ubuntu Support provides a structured
              environment for coordinating the complete process.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.number}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-7"
              >
                <p className="text-sm font-bold text-orange-500">
                  {feature.number}
                </p>

                <h3 className="mt-5 text-xl font-bold text-slate-950">
                  {feature.title}
                </h3>

                <p className="mt-3 leading-7 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-slate-100 py-20">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="text-3xl font-bold text-slate-950 md:text-4xl">
            Ready to make a difference?
          </h2>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
            Register on the platform to submit a request, support a community
            initiative or participate as a volunteer.
          </p>

          <Link
            href="/register"
            className="mt-8 inline-flex rounded-xl bg-orange-500 px-7 py-3.5 font-semibold text-white transition hover:bg-orange-600"
          >
            Create an account
          </Link>
        </div>
      </section>
    </main>
  );
}