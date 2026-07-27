import { supabaseClient } from '../supabase';

export const updateUser = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabaseClient
      .from('users')
      .update(updates)
      .eq('id', userId);

    if (error) {
      console.error('Error updating user:', error);
      throw error;
    }

    return data[0];
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

export const deleteUser = async (userId: string) => {
  try {
    const { error } = await supabaseClient
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};