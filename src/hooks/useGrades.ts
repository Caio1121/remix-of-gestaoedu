/**
 * @deprecated — DELETADO
 *
 * Este arquivo usava nomes de colunas incorretos (student_id, class_id, grade_value)
 * que não existem no schema. O hook sempre retornava [] silenciosamente.
 *
 * Use os hooks corretos:
 *   - Leitura de notas do aluno → useStudentData.ts (useStudentGrades)
 *   - Upsert de notas (docente) → useClassActions.ts (useUpsertGrades)
 *
 * Ambos são re-exportados pelo barrel em src/hooks/index.ts
 */
export {};
