import Link from "next/link";

const navigation = [
  { name: "Overview", href: "/dashboard" },
  { name: "Requests", href: "/requests" },
  { name: "Donations", href: "/donations" },
  { name: "Beneficiaries", href: "/beneficiaries" },
  { name: "Donors", href: "/donors" },
  { name: "Volunteers", href: "/volunteers" },
  { name: "Notifications", href: "/notifications" },
  { name: "Monitoring", href: "/monitoring" },
  { name: "Reports", href: "/reports" },
  { name: "Settings", href: "/settings" },
];

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r bg-slate-950 text-white lg:block">
      <div className="sticky top-0 flex h-screen flex-col">
        <div className="border-b border-slate-800 px-6 py-6">
          <h1 className="text-xl font-bold">Ubuntu Support</h1>
          <p className="mt-1 text-xs text-slate-400">
            Community platform
          </p>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="block rounded-lg px-4 py-3 text-sm text-slate-300 transition hover:bg-slate-900 hover:text-white"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="border-t border-slate-800 p-4">
          <p className="text-sm font-medium">Research Artefact</p>
          <p className="mt-1 text-xs text-slate-500">
            Next.js implementation
          </p>
        </div>
      </div>
    </aside>
  );
}