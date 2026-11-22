import Link from "next/link";
import { Logo } from "./logo";
import { clinicInfo } from "@/lib/mock-data";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-1">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-slate-400">
            {clinicInfo.tagline}
          </p>
          <p className="mt-4 text-xs leading-relaxed text-slate-500">
            {clinicInfo.demoNotice}
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Explore</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/about" className="hover:text-white">About Clinic</Link></li>
            <li><Link href="/doctors" className="hover:text-white">Our Doctors</Link></li>
            <li><Link href="/services" className="hover:text-white">Our Services</Link></li>
            <li><Link href="/appointment" className="hover:text-white">Book Appointment</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Demo dashboards</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link href="/login" className="hover:text-white">Role login (demo)</Link></li>
            <li><Link href="/admin" className="hover:text-white">Admin workspace</Link></li>
            <li><Link href="/doctor" className="hover:text-white">Doctor workspace</Link></li>
            <li><Link href="/receptionist" className="hover:text-white">Receptionist workspace</Link></li>
            <li><Link href="/patient" className="hover:text-white">Patient portal</Link></li>
          </ul>
          <p className="mt-3 text-xs text-slate-500">
            Demo role switcher only — no real authentication or secure multi-user access.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white">Contact</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>{clinicInfo.phone}</li>
            <li>{clinicInfo.email}</li>
            <li className="leading-relaxed">{clinicInfo.address}</li>
            <li>{clinicInfo.hours}</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© 2026 CarePoint Demo. All rights reserved.</p>
          <p>Frontend portfolio demo — fictional localStorage data only.</p>
        </div>
      </div>
    </footer>
  );
}
