import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://0ec90b57d6e95fcbda19832f.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  role: 'client' | 'trainer';
  created_at: string;
  updated_at: string;
};

export type ClientRegistration = {
  id: string;
  user_id: string | null;
  full_name: string;
  email: string;
  phone: string;
  age: number;
  weight: number;
  height: number;
  goal_weight: number | null;
  fitness_goal: string;
  activity_level: string;
  dietary_preferences: string;
  medical_conditions: string;
  status: 'pending' | 'approved' | 'active' | 'inactive';
  created_at: string;
  updated_at: string;
};

export type ClientProgress = {
  id: string;
  client_id: string;
  weight: number;
  notes: string;
  recorded_at: string;
  created_at: string;
};
