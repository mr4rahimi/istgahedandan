/**
 * `Appointment.activeSlot` holds `"YYYY-MM-DD HH:mm"` while a booking is live
 * and `NULL` once it is cancelled. Together with the unique index on
 * `(dentistId, activeSlot)` that is what stops two concurrent requests from
 * booking the same slot — checking with a SELECT before INSERT cannot, because
 * nothing prevents both requests passing the check.
 *
 * Every place that creates an appointment or changes its status must go through
 * these helpers so the column never drifts out of sync with `status`.
 */

export function activeSlotFor(date: string, time: string): string {
  return `${date} ${time}`;
}

/** The `activeSlot` value an appointment should have for a given status. */
export function activeSlotForStatus(
  status: "CONFIRMED" | "CANCELLED",
  date: string,
  time: string,
): string | null {
  return status === "CONFIRMED" ? activeSlotFor(date, time) : null;
}

/** True when Prisma rejected a write because of a unique-constraint violation. */
export function isUniqueViolation(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: string }).code === "P2002";
}
