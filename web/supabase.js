import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { auth } from './firebase.js';

const supabaseUrl = 'https://kwpdizpwaauuxmhpndpe.supabase.co';
const supabaseKey = 'sb_publishable_SyXjR3TOWO64g7kSo-LbZw_BGbLb1sT';

export const supabase = createClient(supabaseUrl, supabaseKey, {
    accessToken: async () => {
        const usuario = auth.currentUser;
        return usuario ? await usuario.getIdToken() : null;
    }
});