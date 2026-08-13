-- Stops two concurrent requests from booking the same appointment slot.
--
-- `activeSlot` holds "YYYY-MM-DD HH:mm" while the booking is CONFIRMED and NULL
-- once it is cancelled. Postgres treats NULLs as distinct, so the unique index
-- locks a live slot while still allowing any number of cancelled history rows.
-- Application-side sync lives in src/lib/appointments.ts.

ALTER TABLE "Appointment" ADD COLUMN "activeSlot" TEXT;

-- Backfill live bookings. If a database already contains double bookings, only
-- the earliest row per slot claims it, so creating the index below cannot fail.
UPDATE "Appointment" a
SET "activeSlot" = a.date || ' ' || a.time
WHERE a.status = 'CONFIRMED'
  AND a.id = (
    SELECT b.id FROM "Appointment" b
    WHERE b."dentistId" = a."dentistId" AND b.date = a.date
      AND b.time = a.time AND b.status = 'CONFIRMED'
    ORDER BY b."createdAt", b.id
    LIMIT 1
  );

CREATE UNIQUE INDEX "Appointment_dentistId_activeSlot_key" ON "Appointment"("dentistId", "activeSlot");
