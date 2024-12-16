// supabaseClient.js
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "react-native-url-polyfill/auto";

const supabaseUrl = "https://akkhudxiysxxbmuhkips.supabase.co";
const supabaseAnonKey =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFra2h1ZHhpeXN4eGJtdWhraXBzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzE2NDY4OTMsImV4cCI6MjA0NzIyMjg5M30.ybzZy8mzeGnqVeHA3d_b0zjz4TcbksnNTL_nFaVWib8";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
