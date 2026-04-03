// Untyped Supabase client for tables not yet in the generated types.
// Import this instead of the typed client when referencing tables
// that haven't been added to the schema yet.
import { supabase } from "./client";

export const db: any = supabase;
