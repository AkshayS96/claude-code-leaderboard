import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (!supabaseUrl || !supabaseKey) {
    // Only warn in development, but don't crash to allow building without env vars
    if (process.env.NODE_ENV === 'development') {
        console.warn('Missing Supabase environment variables');
    }
}

export const supabase = createClient(supabaseUrl, supabaseKey);
