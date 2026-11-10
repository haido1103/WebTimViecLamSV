import 'server-only';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
export type Role='student'|'employer'|'admin';
export async function getSessionProfile(){
 if(!process.env.NEXT_PUBLIC_SUPABASE_URL) return null;
 const db=await createClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user)return null;
 const {data:profile}=await db.from('profiles').select('id,full_name,role').eq('id',user.id).maybeSingle();
 return {user,profile:profile as {id:string;full_name:string;role:Role}|null,db};
}
export async function requireRole(...roles:Role[]){
 const session=await getSessionProfile();
 if(!session)redirect('/login?error=auth');
 if(!session.profile || !roles.includes(session.profile.role))redirect('/dashboard?error=permission');
 return {...session,profile:session.profile};
}
