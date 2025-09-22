import { supabase } from '../lib/supabase';

/**
 * Placeholder for checking if current user has moderation capability.
 * In production, prefer Row Level Security policies and backend checks.
 */
export async function isModerator(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  if (error) return false;
  return data?.role === 'moderator' || data?.role === 'admin';
}
