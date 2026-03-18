import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://aseefhqhksblqagehklg.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZWVmaHFoa3NibHFhZ2Voa2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1ODIxNzUsImV4cCI6MjA4NjE1ODE3NX0.6Alu8Cv6rqSoHZW-sHs1dbzPyj0bl1POFIQ42xWVebo";

// SSR-safe storage — localStorage is not available during server-side rendering
const safeStorage = typeof window !== "undefined" ? window.localStorage : {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: safeStorage as any,
    persistSession: typeof window !== "undefined",
    autoRefreshToken: typeof window !== "undefined",
  }
});
