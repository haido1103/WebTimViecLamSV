'use client';
import { createClient } from '@/lib/supabase/client';
export default function GoogleButton(){return <button type="button" className="w-full rounded-xl border p-3 font-semibold hover:bg-slate-50" onClick={async()=>{
 const db=createClient();const {error}=await db.auth.signInWithOAuth({provider:'google',options:{redirectTo:`${window.location.origin}/auth/callback`}});
 if(error)alert(error.message);
 }}>Tiếp tục với Google</button>}
