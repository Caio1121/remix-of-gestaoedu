import { describe, it, expect, vi } from 'vitest';
import { gradesService } from '@/services/gradesService';
import { supabase } from '@/integrations/supabase/client';

// Mock do cliente Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1', gradevalue: 10 }, error: null })),
        })),
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      upsert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { id: '1' }, error: null })),
        })),
      })),
    })),
  },
}));

describe('gradesService', () => {
  it('deve buscar notas por aluno com join em classes', async () => {
    const mockData = [{ id: '1', gradevalue: 8, classes: { name: 'Math' } }];
    
    // Configura o mock para este teste específico
    (supabase.from as any).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    });

    const { data, error } = await gradesService.getGradesByStudent('student-123');
    
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
    expect(data![0].classes?.name).toBe('Math');
  });

  it('deve salvar nota com sucesso', async () => {
    const grade = { studentid: 's1', classid: 'c1', gradevalue: 9 };
    
    (supabase.from as any).mockReturnValue({
      upsert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'new-id' }, error: null }),
    });

    const { data, error } = await gradesService.saveGrade(grade);
    
    expect(error).toBeNull();
    expect(data).toHaveProperty('id');
  });
});
