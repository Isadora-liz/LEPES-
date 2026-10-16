
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = 'https://kwpdizpwaauuxmhpndpe.supabase.co';
const supabaseKey = 'sb_publishable_SyXjR3TOWO64g7kSo-LbZw_BGbLb1sT';

export const supabase = createClient(
    supabaseUrl,
    supabaseKey
);
