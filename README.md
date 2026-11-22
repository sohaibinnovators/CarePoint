# CarePoint — Clinic Management System (Demo)

CarePoint is a **frontend portfolio demonstration** of a multi-role clinic management UI. It covers public marketing pages plus admin, doctor, receptionist, and patient dashboards for scheduling, clinical notes, prescriptions, billing, expenses, and reports.

All names, appointments, clinical records, invoices, payments, and expenses are **fictional demo data** stored in the browser via `localStorage`. CarePoint is **not** a production EHR, validated prescribing system, payment gateway, accounting platform, or HIPAA-compliant product. There is **no real authentication**, backend, or database.

## Features

- Public site: home, about, doctors, services, contact, appointment booking, demo login/signup
- Shared localStorage store for patients, doctors, departments, services, appointments, and schedules
- Conflict-aware appointment booking, doctor availability, and day/week/month calendars
- Clinical demo workflows: medical records, consultations, prescriptions, medical timeline
- Billing demo workflows: invoices, partial payments, expenses, reports, CSV export
- Role dashboards: admin, doctor, receptionist, patient (demo role switcher only)

## Tech stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- lucide-react icons

## Getting started

### Requirements

- Node.js 20+ recommended
- npm (comes with Node)

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Lint

```bash
npm run lint
```

### Production build

```bash
npm run build
npm start
```

## Environment variables

No environment variables are required for the demo. There is no database URL, auth secret, or payment API key.

If you later add secrets, keep them in `.env.local` (already ignored by Git) and never commit them.

## Demo roles

Use `/login` to open a demo dashboard:

| Role | Path | Sample persona |
|------|------|----------------|
| Admin | `/admin` | Priya Nair |
| Doctor | `/doctor` | Dr. Elena Hayes |
| Receptionist | `/receptionist` | Front desk |
| Patient | `/patient` | Ava Thompson (`pt-1001`) |

Dashboards are reachable by URL for portfolio review. They are **not** secured multi-user accounts.

### Resetting demo data

Admin → **Settings** → **Reset local demo data** restores the seeded fictional dataset in the current browser.

Storage key: `carepoint-demo-data-v5` (older keys are migrated when possible).

## Project structure (high level)

- `app/` — routes for public site and role dashboards
- `components/` — UI, layout, management, scheduling, clinical, billing
- `lib/` — types, seed data, store, scheduling, clinical, billing utilities
- `public/` — static assets

## Deployment on Vercel

1. Push the repository to GitHub/GitLab/Bitbucket (or import the folder in Vercel).
2. In [Vercel](https://vercel.com), create a new project and import the repo.
3. Framework preset: **Next.js** (auto-detected).
4. Build command: `npm run build`
5. Output: Next.js default (no special env vars required).
6. Deploy.
7. After deploy, open the site and use `/login` to reach demo dashboards.
8. If localStorage from an older version looks incomplete, use Admin → Settings → Reset demo data.

Do not enable indexing expectations for `/admin`, `/doctor`, `/receptionist`, or `/patient` — `app/robots.ts` disallows those paths.

## Demo limitations

- No backend, database, or real authentication
- No real payments, card capture, or accounting compliance
- No medical-device / clinical decision support; diagnoses and prescriptions are fictional UI entries
- Public marketing pages may use seed catalogs; dashboards use the live local store
- Staff directory and notification feeds remain lightweight UI demos
- Data exists only in the visitor’s browser and can be cleared anytime

## License

Private portfolio project unless otherwise stated by the author.
