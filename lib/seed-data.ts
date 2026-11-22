import type {
  Appointment,
  CarePointData,
  Consultation,
  Department,
  Doctor,
  DoctorSchedule,
  Expense,
  Invoice,
  MedicalRecord,
  Patient,
  Payment,
  Prescription,
  Service,
  Weekday,
} from "./types";
import { calculateInvoiceTotals, deriveInvoiceStatus } from "./billing";
import { createDefaultSchedule } from "./scheduling";

export const DATA_VERSION = 5;
export const STORAGE_KEY = "carepoint-demo-data-v5";
export const LEGACY_STORAGE_KEYS = [
  "carepoint-demo-data-v4",
  "carepoint-demo-data-v3",
  "carepoint-demo-data-v2",
];

export const seedDepartments: Department[] = [
  {
    id: "primary-care",
    name: "Primary Care",
    doctors: 1,
    patients: 0,
    description: "First-line care for adults and families.",
  },
  {
    id: "cardiology",
    name: "Cardiology",
    doctors: 1,
    patients: 0,
    description: "Heart health evaluation and monitoring.",
  },
  {
    id: "pediatrics",
    name: "Pediatrics",
    doctors: 1,
    patients: 0,
    description: "Child and adolescent wellness services.",
  },
  {
    id: "orthopedics",
    name: "Orthopedics",
    doctors: 1,
    patients: 0,
    description: "Bones, joints, and injury recovery.",
  },
  {
    id: "dermatology",
    name: "Dermatology",
    doctors: 1,
    patients: 0,
    description: "Medical dermatology and skin care.",
  },
  {
    id: "diagnostics",
    name: "Diagnostics",
    doctors: 0,
    patients: 0,
    description: "Lab coordination and screening support.",
  },
  {
    id: "internal-medicine",
    name: "Internal Medicine",
    doctors: 1,
    patients: 0,
    description: "Adult medicine and chronic condition management.",
  },
];

export const seedDoctors: Doctor[] = [
  {
    id: "dr-elena-hayes",
    name: "Dr. Elena Hayes",
    specialty: "Cardiology",
    department: "Cardiology",
    departmentId: "cardiology",
    experience: "14 years",
    experienceYears: 14,
    education: "MD, Johns Hopkins University",
    qualification: "MD, Johns Hopkins University",
    bio: "Dr. Hayes focuses on preventive cardiology and patient education, helping adults manage heart health with clear care plans.",
    rating: 4.9,
    patients: 1820,
    availability: "Mon, Wed, Fri",
    availabilityStatus: "available",
    consultationFee: "$160",
    email: "elena.hayes@carepoint.demo",
    phone: "+1 (555) 201-1101",
    imageInitials: "EH",
  },
  {
    id: "dr-marcus-chen",
    name: "Dr. Marcus Chen",
    specialty: "Family Medicine",
    department: "Primary Care",
    departmentId: "primary-care",
    experience: "11 years",
    experienceYears: 11,
    education: "MD, University of Michigan",
    qualification: "MD, University of Michigan",
    bio: "Dr. Chen provides comprehensive primary care for families, with an emphasis on long-term wellness and coordinated referrals.",
    rating: 4.8,
    patients: 2410,
    availability: "Tue–Sat",
    availabilityStatus: "available",
    consultationFee: "$95",
    email: "marcus.chen@carepoint.demo",
    phone: "+1 (555) 201-1102",
    imageInitials: "MC",
  },
  {
    id: "dr-sofia-ramirez",
    name: "Dr. Sofia Ramirez",
    specialty: "Pediatrics",
    department: "Pediatrics",
    departmentId: "pediatrics",
    experience: "9 years",
    experienceYears: 9,
    education: "MD, UCLA",
    qualification: "MD, UCLA",
    bio: "Dr. Ramirez delivers calm, family-friendly pediatric care for newborns through adolescents.",
    rating: 4.9,
    patients: 1560,
    availability: "Mon–Thu",
    availabilityStatus: "available",
    consultationFee: "$110",
    email: "sofia.ramirez@carepoint.demo",
    phone: "+1 (555) 201-1103",
    imageInitials: "SR",
  },
  {
    id: "dr-james-okonkwo",
    name: "Dr. James Okonkwo",
    specialty: "Orthopedics",
    department: "Orthopedics",
    departmentId: "orthopedics",
    experience: "16 years",
    experienceYears: 16,
    education: "MD, Harvard Medical School",
    qualification: "MD, Harvard Medical School",
    bio: "Dr. Okonkwo specializes in sports injuries and joint care with a focus on recovery planning.",
    rating: 4.7,
    patients: 1340,
    availability: "Wed–Sat",
    availabilityStatus: "available",
    consultationFee: "$150",
    email: "james.okonkwo@carepoint.demo",
    phone: "+1 (555) 201-1104",
    imageInitials: "JO",
  },
  {
    id: "dr-amira-patel",
    name: "Dr. Amira Patel",
    specialty: "Dermatology",
    department: "Dermatology",
    departmentId: "dermatology",
    experience: "8 years",
    experienceYears: 8,
    education: "MD, Stanford University",
    qualification: "MD, Stanford University",
    bio: "Dr. Patel provides medical dermatology services with clear treatment pathways and follow-up plans.",
    rating: 4.8,
    patients: 980,
    availability: "Tue, Thu, Fri",
    availabilityStatus: "available",
    consultationFee: "$125",
    email: "amira.patel@carepoint.demo",
    phone: "+1 (555) 201-1105",
    imageInitials: "AP",
  },
  {
    id: "dr-noah-bennett",
    name: "Dr. Noah Bennett",
    specialty: "Internal Medicine",
    department: "Internal Medicine",
    departmentId: "internal-medicine",
    experience: "12 years",
    experienceYears: 12,
    education: "MD, Yale School of Medicine",
    qualification: "MD, Yale School of Medicine",
    bio: "Dr. Bennett manages complex adult conditions and coordinates multidisciplinary care.",
    rating: 4.8,
    patients: 1675,
    availability: "Mon–Fri",
    availabilityStatus: "unavailable",
    consultationFee: "$140",
    email: "noah.bennett@carepoint.demo",
    phone: "+1 (555) 201-1106",
    imageInitials: "NB",
  },
];

export const seedServices: Service[] = [
  {
    id: "general-consultation",
    name: "General Consultation",
    category: "Primary Care",
    departmentId: "primary-care",
    description:
      "Comprehensive evaluation for new and returning patients with care planning and referrals when needed.",
    duration: "30 min",
    price: "$85",
    features: ["Health assessment", "Treatment plan", "Follow-up guidance"],
  },
  {
    id: "cardiac-screening",
    name: "Cardiac Screening",
    category: "Cardiology",
    departmentId: "cardiology",
    description:
      "Preventive heart health screening including vitals review and risk assessment with a cardiologist.",
    duration: "45 min",
    price: "$160",
    features: ["ECG review", "Risk scoring", "Lifestyle recommendations"],
  },
  {
    id: "pediatric-wellness",
    name: "Pediatric Wellness Visit",
    category: "Pediatrics",
    departmentId: "pediatrics",
    description:
      "Age-appropriate wellness visits covering growth, vaccines, and developmental check-ins.",
    duration: "40 min",
    price: "$95",
    features: ["Growth tracking", "Vaccine schedule", "Parent guidance"],
  },
  {
    id: "orthopedic-evaluation",
    name: "Orthopedic Evaluation",
    category: "Orthopedics",
    departmentId: "orthopedics",
    description:
      "Evaluation for joint pain, mobility issues, and sports-related injuries with recovery planning.",
    duration: "45 min",
    price: "$140",
    features: ["Injury assessment", "Imaging referral", "Rehab roadmap"],
  },
  {
    id: "dermatology-consult",
    name: "Dermatology Consult",
    category: "Dermatology",
    departmentId: "dermatology",
    description:
      "Medical dermatology consultation for skin concerns with clear treatment recommendations.",
    duration: "30 min",
    price: "$120",
    features: ["Skin exam", "Treatment options", "Follow-up plan"],
  },
  {
    id: "lab-diagnostics",
    name: "Lab & Diagnostics",
    category: "Diagnostics",
    departmentId: "diagnostics",
    description:
      "On-site sample collection and coordinated diagnostic testing with results tracking.",
    duration: "20 min",
    price: "From $45",
    features: ["Sample collection", "Result tracking", "Provider review"],
  },
];

export const seedPatients: Patient[] = [
  {
    id: "pt-1001",
    name: "Ava Thompson",
    dateOfBirth: "1992-03-14",
    age: 34,
    gender: "Female",
    phone: "+1 (555) 300-1001",
    email: "ava.thompson@demo.mail",
    address: "42 Lakeview Road, Riverside",
    emergencyContact: "Mark Thompson · +1 (555) 300-1099",
    bloodType: "A+",
    notes: "Prefers morning appointments.",
    registrationDate: "2025-01-12",
    lastVisit: "2026-11-18",
    status: "active",
    condition: "Annual checkup",
  },
  {
    id: "pt-1002",
    name: "Liam Foster",
    dateOfBirth: "1979-07-22",
    age: 47,
    gender: "Male",
    phone: "+1 (555) 300-1002",
    email: "liam.foster@demo.mail",
    address: "18 Cedar Lane, Riverside",
    emergencyContact: "Helen Foster · +1 (555) 300-1088",
    bloodType: "O+",
    notes: "Hypertension follow-up schedule.",
    registrationDate: "2024-11-03",
    lastVisit: "2026-11-19",
    status: "active",
    condition: "Hypertension follow-up",
  },
  {
    id: "pt-1003",
    name: "Maya Singh",
    dateOfBirth: "1997-09-08",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 300-1003",
    email: "maya.singh@demo.mail",
    address: "9 Harbor Court, Riverside",
    emergencyContact: "Raj Singh · +1 (555) 300-1077",
    bloodType: "B+",
    notes: "",
    registrationDate: "2025-06-20",
    lastVisit: "2026-11-12",
    status: "active",
    condition: "Dermatology consult",
  },
  {
    id: "pt-1004",
    name: "Ethan Brooks",
    dateOfBirth: "1965-01-30",
    age: 61,
    gender: "Male",
    phone: "+1 (555) 300-1004",
    email: "ethan.brooks@demo.mail",
    address: "77 Oak Street, Riverside",
    emergencyContact: "Laura Brooks · +1 (555) 300-1066",
    bloodType: "AB-",
    notes: "Cardiac screening history (demo).",
    registrationDate: "2024-04-18",
    lastVisit: "2026-11-08",
    status: "active",
    condition: "Cardiac screening",
  },
  {
    id: "pt-1005",
    name: "Nora Alvarez",
    dateOfBirth: "2018-05-11",
    age: 8,
    gender: "Female",
    phone: "+1 (555) 300-1005",
    email: "parent.alvarez@demo.mail",
    address: "5 Maple Avenue, Riverside",
    emergencyContact: "Sofia Alvarez · +1 (555) 300-1055",
    bloodType: "O-",
    notes: "Pediatric wellness patient (demo).",
    registrationDate: "2025-09-01",
    lastVisit: "2026-11-20",
    status: "active",
    condition: "Pediatric wellness",
  },
  {
    id: "pt-1006",
    name: "Owen Carter",
    dateOfBirth: "1974-12-02",
    age: 52,
    gender: "Male",
    phone: "+1 (555) 300-1006",
    email: "owen.carter@demo.mail",
    address: "301 Pine Crest, Riverside",
    emergencyContact: "Dana Carter · +1 (555) 300-1044",
    bloodType: "A-",
    notes: "Knee evaluation — inactive status for demo.",
    registrationDate: "2023-08-15",
    lastVisit: "2026-10-30",
    status: "inactive",
    condition: "Knee evaluation",
  },
];

export const seedAppointments: Appointment[] = [
  {
    id: "apt-501",
    patientId: "pt-1001",
    doctorId: "dr-marcus-chen",
    patientName: "Ava Thompson",
    doctorName: "Dr. Marcus Chen",
    department: "Primary Care",
    departmentId: "primary-care",
    date: "2026-11-22",
    time: "09:00 AM",
    status: "confirmed",
    type: "Consultation",
    visitType: "in-person",
    reason: "Annual checkup",
    durationMinutes: 30,
  },
  {
    id: "apt-502",
    patientId: "pt-1002",
    doctorId: "dr-elena-hayes",
    patientName: "Liam Foster",
    doctorName: "Dr. Elena Hayes",
    department: "Cardiology",
    departmentId: "cardiology",
    date: "2026-11-22",
    time: "10:30 AM",
    status: "checked-in",
    type: "Follow-up",
    visitType: "in-person",
    reason: "Blood pressure review",
    durationMinutes: 30,
  },
  {
    id: "apt-503",
    patientId: "pt-1005",
    doctorId: "dr-sofia-ramirez",
    patientName: "Nora Alvarez",
    doctorName: "Dr. Sofia Ramirez",
    department: "Pediatrics",
    departmentId: "pediatrics",
    date: "2026-11-22",
    time: "11:00 AM",
    status: "pending",
    type: "Wellness",
    visitType: "in-person",
    reason: "Well-child visit",
    durationMinutes: 30,
  },
  {
    id: "apt-504",
    patientId: "pt-1004",
    doctorId: "dr-elena-hayes",
    patientName: "Ethan Brooks",
    doctorName: "Dr. Elena Hayes",
    department: "Cardiology",
    departmentId: "cardiology",
    date: "2026-11-22",
    time: "01:00 PM",
    status: "scheduled",
    type: "Screening",
    visitType: "in-person",
    reason: "Cardiac screening",
    durationMinutes: 30,
  },
  {
    id: "apt-505",
    patientId: "pt-1003",
    doctorId: "dr-amira-patel",
    patientName: "Maya Singh",
    doctorName: "Dr. Amira Patel",
    department: "Dermatology",
    departmentId: "dermatology",
    date: "2026-11-23",
    time: "02:30 PM",
    status: "scheduled",
    type: "Consult",
    visitType: "online",
    reason: "Skin irritation follow-up",
    durationMinutes: 30,
  },
  {
    id: "apt-506",
    patientId: "pt-1006",
    doctorId: "dr-james-okonkwo",
    patientName: "Owen Carter",
    doctorName: "Dr. James Okonkwo",
    department: "Orthopedics",
    departmentId: "orthopedics",
    date: "2026-11-21",
    time: "03:00 PM",
    status: "completed",
    type: "Evaluation",
    visitType: "in-person",
    reason: "Right knee pain",
    durationMinutes: 30,
  },
  {
    id: "apt-507",
    patientId: "pt-1001",
    doctorId: "dr-noah-bennett",
    patientName: "Ava Thompson",
    doctorName: "Dr. Noah Bennett",
    department: "Internal Medicine",
    departmentId: "internal-medicine",
    date: "2026-11-20",
    time: "09:30 AM",
    status: "cancelled",
    type: "Consultation",
    visitType: "online",
    reason: "General consult — cancelled demo",
    durationMinutes: 30,
  },
];

function scheduleForDoctor(
  doctorId: string,
  workingDays: Weekday[],
  extras?: Partial<DoctorSchedule>,
): DoctorSchedule {
  return {
    ...createDefaultSchedule(doctorId),
    workingDays,
    ...extras,
  };
}

export const seedSchedules: DoctorSchedule[] = [
  scheduleForDoctor("dr-elena-hayes", [1, 3, 5], {
    unavailableDates: ["2026-11-27"],
    maxAppointmentsPerDay: 10,
  }),
  scheduleForDoctor("dr-marcus-chen", [2, 3, 4, 5, 6], {
    startTime: "09:00",
    endTime: "16:00",
  }),
  scheduleForDoctor("dr-sofia-ramirez", [1, 2, 3, 4], {
    slotDurationMinutes: 30,
  }),
  scheduleForDoctor("dr-james-okonkwo", [3, 4, 5, 6], {
    startTime: "10:00",
    endTime: "18:00",
    breaks: [
      {
        id: "brk-jo-lunch",
        start: "13:00",
        end: "14:00",
        label: "Lunch",
      },
    ],
  }),
  scheduleForDoctor("dr-amira-patel", [2, 4, 5], {
    slotDurationMinutes: 30,
    unavailableDates: ["2026-11-24"],
  }),
  scheduleForDoctor("dr-noah-bennett", [1, 2, 3, 4, 5], {
    maxAppointmentsPerDay: 8,
  }),
];

function withDepartmentCounts(
  departments: Department[],
  doctors: Doctor[],
  patients: Patient[],
): Department[] {
  return departments.map((dept) => ({
    ...dept,
    doctors: doctors.filter((d) => d.departmentId === dept.id).length,
    patients: patients.filter((p) =>
      // rough association via appointments not needed for seed counts
      p.status === "active",
    ).length,
  }));
}

export const seedMedicalRecords: MedicalRecord[] = [
  {
    patientId: "pt-1001",
    allergies: ["Penicillin (demo)"],
    conditions: ["Seasonal allergies (demo)"],
    pastHistory: "Tonsillectomy in childhood (demo history).",
    currentMedications: ["Loratadine 10mg — as needed (demo)"],
    familyHistory: "Maternal hypertension (demo).",
    clinicalNotes: "Prefers morning visits. Demo chart only.",
    updatedAt: "2026-11-18T10:00:00",
    updatedByDoctorId: "dr-marcus-chen",
  },
  {
    patientId: "pt-1002",
    allergies: ["None recorded (demo)"],
    conditions: ["Hypertension (demo)"],
    pastHistory: "Elevated BP readings over the past year (demo).",
    currentMedications: ["Lisinopril 10mg — once daily (demo)"],
    familyHistory: "Father with coronary disease (demo).",
    clinicalNotes: "Bring home BP log to visits. Demo chart only.",
    updatedAt: "2026-11-19T11:00:00",
    updatedByDoctorId: "dr-elena-hayes",
  },
  {
    patientId: "pt-1003",
    allergies: ["Nickel (demo)"],
    conditions: ["Contact dermatitis (demo)"],
    pastHistory: "Recurrent dry skin flares (demo).",
    currentMedications: ["Moisturizer — twice daily (demo)"],
    familyHistory: "No significant family history recorded (demo).",
    clinicalNotes: "Avoid scented soaps. Demo chart only.",
    updatedAt: "2026-11-12T14:00:00",
    updatedByDoctorId: "dr-amira-patel",
  },
];

export const seedConsultations: Consultation[] = [
  {
    id: "con-1001",
    appointmentId: "apt-506",
    patientId: "pt-1006",
    doctorId: "dr-james-okonkwo",
    patientName: "Owen Carter",
    doctorName: "Dr. James Okonkwo",
    chiefComplaint: "Right knee pain after jogging (demo)",
    symptoms: "Mild swelling, pain with stairs (demo)",
    observations: "Stable gait, localized tenderness (demo)",
    diagnosis: "Right knee strain — demo entry only",
    treatmentPlan: "Rest, ice, short-term NSAID as directed (demo)",
    followUp: "Return if pain persists beyond 2 weeks (demo)",
    additionalNotes: "Physiotherapy referral discussed (demo).",
    status: "finalized",
    createdAt: "2026-11-21T15:10:00",
    updatedAt: "2026-11-21T15:25:00",
    finalizedAt: "2026-11-21T15:25:00",
  },
];

export const seedPrescriptions: Prescription[] = [
  {
    id: "rx-1001",
    patientId: "pt-1002",
    doctorId: "dr-elena-hayes",
    appointmentId: "apt-502",
    patientName: "Liam Foster",
    doctorName: "Dr. Elena Hayes",
    date: "2026-11-19",
    status: "issued",
    notes: "Demo prescription only — not for real dispensing.",
    createdAt: "2026-11-19T10:45:00",
    updatedAt: "2026-11-19T10:45:00",
    medications: [
      {
        id: "med-1001",
        name: "Lisinopril (demo)",
        dosage: "10mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take in the morning with water (demo).",
      },
      {
        id: "med-1002",
        name: "Aspirin (demo)",
        dosage: "81mg",
        frequency: "Once daily",
        duration: "30 days",
        instructions: "Take with food (demo).",
      },
    ],
  },
  {
    id: "rx-1002",
    patientId: "pt-1006",
    doctorId: "dr-james-okonkwo",
    consultationId: "con-1001",
    appointmentId: "apt-506",
    patientName: "Owen Carter",
    doctorName: "Dr. James Okonkwo",
    date: "2026-11-21",
    status: "issued",
    notes: "Demo prescription linked to finalized consultation.",
    createdAt: "2026-11-21T15:30:00",
    updatedAt: "2026-11-21T15:30:00",
    medications: [
      {
        id: "med-1003",
        name: "Ibuprofen (demo)",
        dosage: "400mg",
        frequency: "As needed with food",
        duration: "7 days",
        instructions: "Do not exceed labeled demo instructions.",
      },
    ],
  },
  {
    id: "rx-1003",
    patientId: "pt-1001",
    doctorId: "dr-marcus-chen",
    patientName: "Ava Thompson",
    doctorName: "Dr. Marcus Chen",
    date: "2026-11-10",
    status: "issued",
    notes: "Demo prescription for patient portal history only.",
    createdAt: "2026-11-10T09:30:00",
    updatedAt: "2026-11-10T09:30:00",
    medications: [
      {
        id: "med-1004",
        name: "Loratadine (demo)",
        dosage: "10mg",
        frequency: "Once daily as needed",
        duration: "14 days",
        instructions: "Take for seasonal allergy symptoms (demo).",
      },
    ],
  },
];

function buildSeedInvoice(base: {
  id: string;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  doctorId?: string;
  doctorName?: string;
  date: string;
  dueDate: string;
  items: Invoice["items"];
  discount: number;
  taxRate: number;
  amountPaid: number;
  status?: Invoice["status"];
  notes: string;
  createdAt: string;
  updatedAt: string;
}): Invoice {
  const totals = calculateInvoiceTotals({
    items: base.items,
    discount: base.discount,
    taxRate: base.taxRate,
    amountPaid: base.amountPaid,
  });
  return {
    ...base,
    subtotal: totals.subtotal,
    taxAmount: totals.taxAmount,
    total: totals.total,
    amountPaid: totals.amountPaid,
    balanceDue: totals.balanceDue,
    status:
      base.status === "cancelled" || base.status === "draft"
        ? base.status
        : deriveInvoiceStatus({
            status: base.status,
            total: totals.total,
            amountPaid: totals.amountPaid,
            dueDate: base.dueDate,
            today: "2026-11-22",
          }),
  };
}

export const seedInvoices: Invoice[] = [
  buildSeedInvoice({
    id: "inv-2041",
    patientId: "pt-1001",
    patientName: "Ava Thompson",
    appointmentId: "apt-501",
    doctorId: "dr-marcus-chen",
    doctorName: "Dr. Marcus Chen",
    date: "2026-11-18",
    dueDate: "2026-11-25",
    discount: 0,
    taxRate: 5,
    amountPaid: 89.25,
    notes: "Demo paid consultation invoice.",
    createdAt: "2026-11-18T10:00:00",
    updatedAt: "2026-11-18T10:30:00",
    items: [
      {
        id: "ili-1001",
        description: "General Consultation (demo)",
        quantity: 1,
        unitPrice: 85,
      },
    ],
  }),
  buildSeedInvoice({
    id: "inv-2042",
    patientId: "pt-1002",
    patientName: "Liam Foster",
    appointmentId: "apt-502",
    doctorId: "dr-elena-hayes",
    doctorName: "Dr. Elena Hayes",
    date: "2026-11-19",
    dueDate: "2026-11-26",
    discount: 10,
    taxRate: 5,
    amountPaid: 0,
    notes: "Demo unpaid cardiac screening invoice.",
    createdAt: "2026-11-19T11:00:00",
    updatedAt: "2026-11-19T11:00:00",
    items: [
      {
        id: "ili-1002",
        description: "Cardiac Screening (demo)",
        quantity: 1,
        unitPrice: 160,
      },
    ],
  }),
  buildSeedInvoice({
    id: "inv-2043",
    patientId: "pt-1003",
    patientName: "Maya Singh",
    doctorId: "dr-amira-patel",
    doctorName: "Dr. Amira Patel",
    date: "2026-11-12",
    dueDate: "2026-11-19",
    discount: 0,
    taxRate: 5,
    amountPaid: 126,
    notes: "Demo paid dermatology consult.",
    createdAt: "2026-11-12T14:00:00",
    updatedAt: "2026-11-12T15:00:00",
    items: [
      {
        id: "ili-1003",
        description: "Dermatology Consult (demo)",
        quantity: 1,
        unitPrice: 120,
      },
    ],
  }),
  buildSeedInvoice({
    id: "inv-2044",
    patientId: "pt-1004",
    patientName: "Ethan Brooks",
    appointmentId: "apt-504",
    doctorId: "dr-elena-hayes",
    doctorName: "Dr. Elena Hayes",
    date: "2026-11-08",
    dueDate: "2026-11-15",
    discount: 0,
    taxRate: 5,
    amountPaid: 50,
    notes: "Demo overdue invoice with partial payment.",
    createdAt: "2026-11-08T09:00:00",
    updatedAt: "2026-11-10T09:00:00",
    items: [
      {
        id: "ili-1004",
        description: "Cardiac Screening (demo)",
        quantity: 1,
        unitPrice: 160,
      },
      {
        id: "ili-1005",
        description: "Lab panel (demo)",
        quantity: 1,
        unitPrice: 40,
      },
    ],
  }),
  buildSeedInvoice({
    id: "inv-2045",
    patientId: "pt-1006",
    patientName: "Owen Carter",
    appointmentId: "apt-506",
    doctorId: "dr-james-okonkwo",
    doctorName: "Dr. James Okonkwo",
    date: "2026-10-30",
    dueDate: "2026-11-06",
    discount: 0,
    taxRate: 5,
    amountPaid: 0,
    status: "draft",
    notes: "Draft demo orthopedic evaluation invoice.",
    createdAt: "2026-10-30T16:00:00",
    updatedAt: "2026-10-30T16:00:00",
    items: [
      {
        id: "ili-1006",
        description: "Orthopedic Evaluation (demo)",
        quantity: 1,
        unitPrice: 140,
      },
    ],
  }),
];

export const seedPayments: Payment[] = [
  {
    id: "pay-3001",
    invoiceId: "inv-2041",
    patientId: "pt-1001",
    patientName: "Ava Thompson",
    date: "2026-11-18",
    amount: 89.25,
    method: "card" as const,
    reference: "SIM-CARD-4411",
    notes: "Simulated card payment — demo only.",
    createdAt: "2026-11-18T10:30:00",
  },
  {
    id: "pay-3002",
    invoiceId: "inv-2043",
    patientId: "pt-1003",
    patientName: "Maya Singh",
    date: "2026-11-12",
    amount: 126,
    method: "bank-transfer" as const,
    reference: "TXN-DEMO-7781",
    notes: "Demo bank transfer.",
    createdAt: "2026-11-12T15:00:00",
  },
  {
    id: "pay-3003",
    invoiceId: "inv-2044",
    patientId: "pt-1004",
    patientName: "Ethan Brooks",
    date: "2026-11-10",
    amount: 50,
    method: "cash" as const,
    notes: "Partial cash payment (demo).",
    createdAt: "2026-11-10T09:00:00",
  },
];

export const seedExpenses: Expense[] = [
  {
    id: "exp-4001",
    title: "November clinic rent",
    category: "rent",
    amount: 4200,
    date: "2026-11-01",
    paymentMethod: "bank-transfer",
    description: "Demo monthly rent payment.",
    reference: "RENT-NOV-26",
    createdAt: "2026-11-01T09:00:00",
    updatedAt: "2026-11-01T09:00:00",
  },
  {
    id: "exp-4002",
    title: "Medical supply restock",
    category: "medical-supplies",
    amount: 680.5,
    date: "2026-11-08",
    paymentMethod: "card",
    description: "Gloves, gauze, and disposables (demo).",
    reference: "SUP-882",
    createdAt: "2026-11-08T11:00:00",
    updatedAt: "2026-11-08T11:00:00",
  },
  {
    id: "exp-4003",
    title: "Utility bill",
    category: "utilities",
    amount: 410,
    date: "2026-11-15",
    paymentMethod: "bank-transfer",
    description: "Electricity and water (demo).",
    createdAt: "2026-11-15T10:00:00",
    updatedAt: "2026-11-15T10:00:00",
  },
  {
    id: "exp-4004",
    title: "Equipment maintenance",
    category: "maintenance",
    amount: 250,
    date: "2026-11-20",
    paymentMethod: "cash",
    description: "ECG device service visit (demo).",
    createdAt: "2026-11-20T14:00:00",
    updatedAt: "2026-11-20T14:00:00",
  },
];

export function createSeedData(): CarePointData {
  const departments = withDepartmentCounts(
    seedDepartments,
    seedDoctors,
    seedPatients,
  ).map((dept) => ({
    ...dept,
    // keep a stable demo patient count feel without hardcoding stats elsewhere
    patients:
      dept.id === "primary-care"
        ? 2
        : dept.id === "cardiology"
          ? 2
          : dept.id === "pediatrics"
            ? 1
            : dept.id === "dermatology"
              ? 1
              : dept.id === "orthopedics"
                ? 1
                : 0,
  }));

  return {
    version: DATA_VERSION,
    patients: seedPatients.map((p) => ({ ...p })),
    doctors: seedDoctors.map((d) => ({ ...d })),
    departments,
    services: seedServices.map((s) => ({ ...s })),
    appointments: seedAppointments.map((a) => ({ ...a })),
    schedules: seedSchedules.map((s) => ({
      ...s,
      workingDays: [...s.workingDays],
      breaks: s.breaks.map((b) => ({ ...b })),
      unavailableDates: [...s.unavailableDates],
    })),
    medicalRecords: seedMedicalRecords.map((record) => ({
      ...record,
      allergies: [...record.allergies],
      conditions: [...record.conditions],
      currentMedications: [...record.currentMedications],
    })),
    consultations: seedConsultations.map((item) => ({ ...item })),
    prescriptions: seedPrescriptions.map((rx) => ({
      ...rx,
      medications: rx.medications.map((med) => ({ ...med })),
    })),
    invoices: seedInvoices.map((invoice) => ({
      ...invoice,
      items: invoice.items.map((item) => ({ ...item })),
    })),
    payments: seedPayments.map((payment) => ({ ...payment })),
    expenses: seedExpenses.map((expense) => ({ ...expense })),
  };
}

export function ensureSchedules(
  doctors: Doctor[],
  schedules: DoctorSchedule[] | undefined,
): DoctorSchedule[] {
  const map = new Map((schedules ?? []).map((s) => [s.doctorId, s]));
  return doctors.map((doctor) => {
    const existing = map.get(doctor.id);
    if (existing) {
      return {
        ...existing,
        workingDays: [...existing.workingDays],
        breaks: existing.breaks.map((b) => ({ ...b })),
        unavailableDates: [...existing.unavailableDates],
      };
    }
    return createDefaultSchedule(doctor.id);
  });
}

export function normalizeAppointments(
  appointments: Appointment[] | undefined,
): Appointment[] {
  if (!Array.isArray(appointments)) return [];
  return appointments
    .filter(
      (apt): apt is Appointment =>
        Boolean(apt) &&
        typeof apt === "object" &&
        typeof apt.id === "string" &&
        typeof apt.patientId === "string" &&
        typeof apt.doctorId === "string" &&
        typeof apt.date === "string" &&
        typeof apt.time === "string",
    )
    .map((apt) => ({
      ...apt,
      durationMinutes: apt.durationMinutes || 30,
      reason: apt.reason || "",
      visitType: apt.visitType || "in-person",
      status: apt.status || "scheduled",
    }));
}

export function ensureClinicalCollections(data: CarePointData): CarePointData {
  const medicalRecords =
    Array.isArray(data.medicalRecords) && data.medicalRecords.length > 0
      ? data.medicalRecords
      : seedMedicalRecords.map((record) => ({
          ...record,
          allergies: [...record.allergies],
          conditions: [...record.conditions],
          currentMedications: [...record.currentMedications],
        }));
  const consultations =
    Array.isArray(data.consultations) && data.consultations.length > 0
      ? data.consultations
      : seedConsultations.map((item) => ({ ...item }));
  const prescriptions =
    Array.isArray(data.prescriptions) && data.prescriptions.length > 0
      ? data.prescriptions
      : seedPrescriptions.map((rx) => ({
          ...rx,
          medications: rx.medications.map((med) => ({ ...med })),
        }));

  return {
    ...data,
    medicalRecords,
    consultations,
    prescriptions,
  };
}

export function ensureBillingCollections(data: CarePointData): CarePointData {
  const invoices =
    Array.isArray(data.invoices) && data.invoices.length > 0
      ? data.invoices.map((invoice) => ({
          ...invoice,
          items: Array.isArray(invoice.items)
            ? invoice.items.map((item) => ({ ...item }))
            : [],
        }))
      : seedInvoices.map((invoice) => ({
          ...invoice,
          items: invoice.items.map((item) => ({ ...item })),
        }));
  const payments =
    Array.isArray(data.payments) && data.payments.length > 0
      ? data.payments.map((payment) => ({ ...payment }))
      : seedPayments.map((payment) => ({ ...payment }));
  const expenses =
    Array.isArray(data.expenses) && data.expenses.length > 0
      ? data.expenses.map((expense) => ({ ...expense }))
      : seedExpenses.map((expense) => ({ ...expense }));

  return {
    ...data,
    invoices,
    payments,
    expenses,
  };
}
