import { supabaseClient } from '../supabase';

export const getUsers = async () => {
  try {
    const { data, error } = await supabaseClient.from('users').select('*');

    if (error) {
      console.error('Error fetching users:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};