import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xyetgykagqvezuhconys.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh5ZXRneWthZ3F2ZXp1aGNvbnlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2NzU0MTQsImV4cCI6MjA3NTI1MTQxNH0.HN0E3ngXOiy8N6pzwLyIRwym8XmT8BXDGg_Y_HlKNew';

export const supabase = createClient(supabaseUrl, supabaseKey);