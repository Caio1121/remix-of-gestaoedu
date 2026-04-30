-- Remove any accidental duplicates first (keep highest grade_value)
DELETE FROM public.grades
WHERE id NOT IN (
  SELECT DISTINCT ON (student_id, class_id) id
  FROM public.grades
  ORDER BY student_id, class_id, grade_value DESC NULLS LAST
);

-- Add the uniqueness constraint
ALTER TABLE public.grades
ADD CONSTRAINT grades_student_class_unique UNIQUE (student_id, class_id);
