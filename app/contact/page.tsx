import Navbar from "../../components/layout/Navbar";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <Navbar />

      <section className="bg-slate-950 py-20 text-white">
        <div className="mx-auto max-w-4xl px-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-orange-400">
            Contact
          </p>

          <h1 className="mt-4 text-5xl font-bold">
            Get in touch with us.
          </h1>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
            Have a question about the platform or need assistance with a
            support request? Send us a message.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold text-slate-950">
              Contact information
            </h2>

            <p className="mt-4 leading-7 text-slate-600">
              For this research artefact, contact details are represented as
              placeholder information and can be replaced with the final
              organisation details later.
            </p>

            <div className="mt-8 space-y-5">
              <div className="rounded-2xl border bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Email</p>
                <p className="mt-1 font-semibold text-slate-900">
                  support@ubuntusupport.example
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Phone</p>
                <p className="mt-1 font-semibold text-slate-900">
                  +27 00 000 0000
                </p>
              </div>

              <div className="rounded-2xl border bg-slate-50 p-5">
                <p className="text-sm text-slate-500">Operating area</p>
                <p className="mt-1 font-semibold text-slate-900">
                  South Africa
                </p>
              </div>
            </div>
          </div>

          <form className="rounded-3xl border bg-white p-8 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-950">
              Send us a message
            </h2>

            <div className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Full name
                </label>

                <input
                  type="text"
                  placeholder="Your name"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Email address
                </label>

                <input
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Message
                </label>

                <textarea
                  rows={6}
                  placeholder="How can we help?"
                  className="w-full resize-none rounded-xl border border-slate-300 px-4 py-3 outline-none transition focus:border-orange-500"
                />
              </div>

              <button
                type="button"
                className="w-full rounded-xl bg-orange-500 px-5 py-3.5 font-semibold text-white transition hover:bg-orange-600"
              >
                Send message
              </button>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}