/* =====================================================
   Finance Assistant
   Module      : Supabase
   File        : supabase.js
   Version     : 1.0.0

   Description :
   Supabase client untuk Authentication.

   IMPORTANT :
   Hanya gunakan Publishable Key.
   JANGAN gunakan Secret Key.
===================================================== */

import {
    createClient
} from "https://esm.sh/@supabase/supabase-js@2";


/* =====================================================
   CONFIG
===================================================== */

const SUPABASE_URL =
    "https://vimijrijelqarbyyqwhq.supabase.co";


const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_TiFpOaVDlOS--L_Vauj3iw_DRB344qe";


/* =====================================================
   CLIENT
===================================================== */

export const supabase =

    createClient(

        SUPABASE_URL,

        SUPABASE_PUBLISHABLE_KEY,

        {

            auth : {

                persistSession :

                    true,

                autoRefreshToken :

                    true,

                detectSessionInUrl :

                    true

            }

        }

    );


/* =====================================================
   DEBUG
===================================================== */

console.log(

    "===== SUPABASE INITIALIZED ====="

);

console.log(

    "Supabase URL:",

    SUPABASE_URL

);
