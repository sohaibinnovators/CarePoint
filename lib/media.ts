/** Curated Unsplash demo imagery — fictional clinic branding only. */

const u = (id: string, opts = "auto=format&fit=crop&q=80") =>
  `https://images.unsplash.com/${id}?${opts}`;

export const clinicImages = {
  hero: u("photo-1519494026892-80bbd2d6fd0d", "auto=format&fit=crop&w=1400&q=80"),
  lobby: u("photo-1631217868264-e5b90bb7e133", "auto=format&fit=crop&w=1200&q=80"),
  careTeam: u("photo-1579684385127-1ef15d508118", "auto=format&fit=crop&w=1200&q=80"),
  reception: u("photo-1666214280557-f1b5022eb634", "auto=format&fit=crop&w=1200&q=80"),
  about: u("photo-1586773860418-d37222d8fce3", "auto=format&fit=crop&w=1200&q=80"),
} as const;

export const serviceImages: Record<string, string> = {
  "general-consultation": u(
    "photo-1576091160399-112ba8d25d1d",
    "auto=format&fit=crop&w=900&q=80",
  ),
  "cardiac-screening": u(
    "photo-1530026405186-ed1f139313f8",
    "auto=format&fit=crop&w=900&q=80",
  ),
  "pediatric-wellness": u(
    "photo-1576765608535-5f04d1e3f289",
    "auto=format&fit=crop&w=900&q=80",
  ),
  "dermatology-consult": u(
    "photo-1581056771107-24ca5f033842",
    "auto=format&fit=crop&w=900&q=80",
  ),
  "orthopedic-evaluation": u(
    "photo-1551076805-e1869033e561",
    "auto=format&fit=crop&w=900&q=80",
  ),
  "lab-diagnostics": u(
    "photo-1582719471384-894fbb16e074",
    "auto=format&fit=crop&w=900&q=80",
  ),
};

/** Fallback service imagery when a service id is unknown. */
export const defaultServiceImage = u(
  "photo-1516549655169-df83a0774514",
  "auto=format&fit=crop&w=900&q=80",
);

export const doctorImages: Record<string, string> = {
  "dr-elena-hayes": u(
    "photo-1559839734-2b71ea197ec2",
    "auto=format&fit=crop&w=800&q=80",
  ),
  "dr-marcus-chen": u(
    "photo-1612349317150-e413f6a5b16d",
    "auto=format&fit=crop&w=800&q=80",
  ),
  "dr-sofia-ramirez": u(
    "photo-1594824476967-48c8b964273f",
    "auto=format&fit=crop&w=800&q=80",
  ),
  "dr-james-okonkwo": u(
    "photo-1622253692010-333f2da6031d",
    "auto=format&fit=crop&w=800&q=80",
  ),
  "dr-amira-patel": u(
    "photo-1527613426441-4da17471b66d",
    "auto=format&fit=crop&w=800&q=80",
  ),
  "dr-noah-bennett": u(
    "photo-1582750433449-648ed127bb54",
    "auto=format&fit=crop&w=800&q=80",
  ),
};

export function getDoctorImage(doctorId: string) {
  return doctorImages[doctorId] ?? clinicImages.careTeam;
}

export function getServiceImage(serviceId: string) {
  return serviceImages[serviceId] ?? defaultServiceImage;
}

/** Demo map centered near a fictional Riverside Medical District (NYC area). */
export const clinicMap = {
  lat: 40.758,
  lng: -73.9855,
  label: "CarePoint Demo Clinic",
  /** OpenStreetMap embed — no API key required. */
  embedUrl:
    "https://www.openstreetmap.org/export/embed.html?bbox=-73.995%2C40.752%2C-73.976%2C40.764&layer=mapnik&marker=40.758%2C-73.9855",
  openUrl:
    "https://www.openstreetmap.org/?mlat=40.758&mlon=-73.9855#map=16/40.758/-73.9855",
};
