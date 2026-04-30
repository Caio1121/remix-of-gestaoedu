-- Step 1: Backfill status to match is_present for existing rows
UPDATE public.attendance
SET status = CASE
  WHEN is_present = true THEN 'presente'
  WHEN is_present = false THEN 'ausente'
  ELSE 'presente'
END;

-- Step 2: Add a CHECK constraint to enforce consistency going forward
ALTER TABLE public.attendance
ADD CONSTRAINT attendance_status_consistent
CHECK (
  (is_present = true AND status = 'presente') OR
  (is_present = false AND status IN ('ausente', 'justificado'))
);

-- Step 3: Add a comment marking is_present as soft-deprecated
COMMENT ON COLUMN public.attendance.is_present IS
  'DEPRECATED: Use status column instead. Kept for backwards compatibility.';
