import 'server-only';
import { demoJobs } from '@/data/demo-jobs';
import { createClient } from '@/lib/supabase/server';
import type { Job } from '@/types/job';

export const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

type JobRow = {
 id:string; title:string; location:string; category:string; employment_type:string; salary_min:number|null; salary_max:number|null; salary_type:string; description:string; requirements:string[]|null; benefits:string[]|null; created_at:string; featured:boolean|null; urgent:boolean|null; companies: {name:string; logo_url:string|null} | {name:string; logo_url:string|null}[] | null;
};
function convert(row: JobRow): Job {
 const company = Array.isArray(row.companies) ? row.companies[0] : row.companies;
 const name = company?.name ?? 'Nhà tuyển dụng';
 return {id:row.id,title:row.title,company_name:name,company_initials:name.split(/\s+/).slice(0,2).map(s=>s[0]).join('').toUpperCase(),company_color:'#eaf3ff',company_logo_url:company?.logo_url,location:row.location,category:row.category,employment_type:row.employment_type,salary_min:row.salary_min,salary_max:row.salary_max,salary_type:row.salary_type,description:row.description,requirements:row.requirements ?? [],benefits:row.benefits ?? [],posted_at:row.created_at,featured:row.featured ?? false,urgent:row.urgent ?? false};
}
export async function getJobs(): Promise<Job[]> {
 if (!hasSupabase) return demoJobs;
 try {
   const supabase = await createClient();
   const {data,error} = await supabase.from('jobs').select('id,title,location,category,employment_type,salary_min,salary_max,salary_type,description,requirements,benefits,created_at,featured,urgent,companies(name,logo_url)').eq('status','published').order('created_at',{ascending:false}).limit(100);
   if (error) { console.error('Supabase job list:',error.message); return []; }
   return (data as unknown as JobRow[]).map(convert);
 } catch(err) {console.error('Supabase connection:',err);return [];}
}
export async function getJob(id:string): Promise<Job | null> {
 if (!hasSupabase) return demoJobs.find(j=>j.id===id) ?? null;
 try {
   const supabase = await createClient();
   const {data,error} = await supabase.from('jobs').select('id,title,location,category,employment_type,salary_min,salary_max,salary_type,description,requirements,benefits,created_at,featured,urgent,companies(name,logo_url)').eq('id',id).eq('status','published').maybeSingle();
   if(error || !data) return null;
   return convert(data as unknown as JobRow);
 } catch {return null;}
}
