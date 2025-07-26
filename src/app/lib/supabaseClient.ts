import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lrmgymtgzugjimvlhpsl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxybWd5bXRnenVnamltdmxocHNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MTQ1MDgsImV4cCI6MjA2OTA5MDUwOH0.4Gvjq74YQPH2QcXNKhbh2j8KfVD8Ie1ihs7tOCFOhwY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);