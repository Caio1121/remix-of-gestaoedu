-- attendance: most frequent query pattern is by student+class+date
CREATE INDEX IF NOT EXISTS idx_attendance_student_class_date
  ON public.attendance(student_id, class_id, date DESC);

-- chat_messages: conversations are loaded by participant pair, sorted by time
CREATE INDEX IF NOT EXISTS idx_chat_messages_participants
  ON public.chat_messages(sender_id, receiver_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver
  ON public.chat_messages(receiver_id, created_at DESC);

-- grades: student transcript view
CREATE INDEX IF NOT EXISTS idx_grades_student
  ON public.grades(student_id);

-- financial_records: billing dashboard queries by student
CREATE INDEX IF NOT EXISTS idx_financial_records_student
  ON public.financial_records(student_id, due_date DESC);

-- materials: class material listing
CREATE INDEX IF NOT EXISTS idx_materials_class
  ON public.materials(class_id);

-- enrollments: already has UNIQUE index, no extra needed
