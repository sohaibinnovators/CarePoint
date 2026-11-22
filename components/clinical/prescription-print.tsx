"use client";

import { Button } from "@/components/ui/button";
import { DEMO_CLINICAL_NOTICE } from "@/lib/clinical";
import type { Prescription } from "@/lib/types";

export function PrescriptionPrintView({
  prescription,
}: {
  prescription: Prescription;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <p className="text-xs text-muted">{DEMO_CLINICAL_NOTICE}</p>
        <Button type="button" onClick={() => window.print()}>
          Print prescription
        </Button>
      </div>

      <div className="rounded-xl border border-border bg-white p-6 print:border-0">
        <div className="border-b border-border pb-4">
          <h2 className="text-xl font-semibold">CarePoint Demo Prescription</h2>
          <p className="mt-1 text-sm text-muted">
            Portfolio UI demonstration — not valid for dispensing.
          </p>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <p>
            <span className="text-muted">Prescription ID:</span> {prescription.id}
          </p>
          <p>
            <span className="text-muted">Date:</span> {prescription.date}
          </p>
          <p>
            <span className="text-muted">Patient:</span> {prescription.patientName}
          </p>
          <p>
            <span className="text-muted">Doctor:</span> {prescription.doctorName}
          </p>
          <p>
            <span className="text-muted">Status:</span> {prescription.status}
          </p>
        </div>
        <table className="mt-6 w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border text-xs uppercase text-muted">
              <th className="py-2">Medication</th>
              <th className="py-2">Dosage</th>
              <th className="py-2">Frequency</th>
              <th className="py-2">Duration</th>
            </tr>
          </thead>
          <tbody>
            {prescription.medications.map((med) => (
              <tr key={med.id} className="border-b border-border align-top">
                <td className="py-3">
                  <p className="font-medium">{med.name}</p>
                  <p className="text-xs text-muted">{med.instructions}</p>
                </td>
                <td className="py-3">{med.dosage}</td>
                <td className="py-3">{med.frequency}</td>
                <td className="py-3">{med.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {prescription.notes ? (
          <p className="mt-4 text-sm">
            <span className="text-muted">Notes:</span> {prescription.notes}
          </p>
        ) : null}
      </div>
    </div>
  );
}
