import { supabase } from '@/integrations/supabase/client';
import { Material } from '@/types';

export const materialsService = {
  async getMaterialsByClass(classId: string) {
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('classid', classId)
      .order('createdat', { ascending: false });
    return { data, error };
  },

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(path, file);
    return { data, error };
  },

  async createMaterial(material: Omit<Material, 'id'>) {
    const { data, error } = await supabase
      .from('materials')
      .insert([material])
      .select()
      .single();
    return { data, error };
  },

  async deleteMaterial(id: string) {
    const { error } = await supabase
      .from('materials')
      .delete()
      .eq('id', id);
    return { error };
  }
};
