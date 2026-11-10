-- Chạy SAU schema.sql trên project Supabase mới.
-- Không sử dụng user metadata để cấp admin.
create or replace function public.create_profile_for_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
 insert into public.profiles(id,full_name,role)
 values(new.id,coalesce(new.raw_user_meta_data->>'full_name',''),
 case when new.raw_user_meta_data->>'role'='employer' then 'employer' else 'student' end)
 on conflict(id) do nothing;
 return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.create_profile_for_new_user();

create or replace function public.my_role() returns text
language sql stable security definer set search_path = '' as $$
 select role from public.profiles where id=(select auth.uid());
$$;
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
 select coalesce((select role='admin' from public.profiles where id=(select auth.uid())),false);
$$;
create or replace function public.owns_company(cid uuid) returns boolean
language sql stable security definer set search_path = '' as $$
 select exists(select 1 from public.companies where id=cid and owner_id=(select auth.uid()));
$$;
-- Prevent users escalating roles or changing another profile.
create or replace function public.protect_profile_fields() returns trigger language plpgsql set search_path = '' as $$
begin
 if new.id <> old.id or new.role <> old.role then raise exception 'Role and ID cannot be updated'; end if;
 return new;
end; $$;
drop trigger if exists prevent_profile_escalation on public.profiles;
create trigger prevent_profile_escalation before update on public.profiles for each row execute procedure public.protect_profile_fields();

create policy "profile_self_read" on public.profiles for select to authenticated using (id=(select auth.uid()) or public.is_admin());
create policy "profile_self_update" on public.profiles for update to authenticated using (id=(select auth.uid())) with check (id=(select auth.uid()));
create policy "companies_employer_create" on public.companies for insert to authenticated with check(owner_id=(select auth.uid()) and public.my_role()='employer');
create policy "companies_owner_update" on public.companies for update to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
create policy "jobs_owner_read" on public.jobs for select to authenticated using(public.owns_company(company_id) or public.is_admin());
create policy "jobs_owner_create" on public.jobs for insert to authenticated with check(public.owns_company(company_id) and public.my_role()='employer' and status='pending' and featured=false and urgent=false);
-- Force edits back through admin approval via trigger (including trying to publish a job).
create or replace function public.protect_job_fields() returns trigger language plpgsql set search_path = '' as $$
begin
 if public.is_admin() then return new; end if;
 if new.company_id <> old.company_id or new.featured <> old.featured or new.urgent <> old.urgent then raise exception 'Protected job fields'; end if;
 new.status := 'pending';
 return new;
end; $$;
drop trigger if exists job_field_protection on public.jobs;
create trigger job_field_protection before update on public.jobs for each row execute procedure public.protect_job_fields();
create policy "jobs_owner_update" on public.jobs for update to authenticated using(public.owns_company(company_id) or public.is_admin()) with check(public.owns_company(company_id) or public.is_admin());
create policy "jobs_admin_all" on public.jobs for delete to authenticated using(public.is_admin());
create policy "applications_student_read" on public.applications for select to authenticated using(student_id=(select auth.uid()) or public.owns_company((select company_id from public.jobs where id=job_id)) or public.is_admin());
create policy "applications_student_create" on public.applications for insert to authenticated with check(student_id=(select auth.uid()) and public.my_role()='student' and status='pending' and exists(select 1 from public.jobs where id=job_id and status='published'));
create policy "applications_employer_update" on public.applications for update to authenticated using(public.owns_company((select company_id from public.jobs where id=job_id)) or public.is_admin()) with check(public.owns_company((select company_id from public.jobs where id=job_id)) or public.is_admin());
-- Employer can modify only status, not reassociate student/job/CV.
create or replace function public.protect_application_fields() returns trigger language plpgsql set search_path = '' as $$
begin
 if old.job_id<>new.job_id or old.student_id<>new.student_id or old.cv_path is distinct from new.cv_path or old.cover_letter is distinct from new.cover_letter then raise exception 'Application details are immutable'; end if;
 return new;
end; $$;
drop trigger if exists application_field_protection on public.applications;
create trigger application_field_protection before update on public.applications for each row execute procedure public.protect_application_fields();
create policy "saved_self_read" on public.saved_jobs for select to authenticated using(student_id=(select auth.uid()));
create policy "saved_self_create" on public.saved_jobs for insert to authenticated with check(student_id=(select auth.uid()) and public.my_role()='student');
create policy "saved_self_delete" on public.saved_jobs for delete to authenticated using(student_id=(select auth.uid()));
-- Private CV files. Prefix of object path must be student's UUID.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('cvs','cvs',false,5242880,array['application/pdf']) on conflict(id) do nothing;
create policy "cv_owner_upload" on storage.objects for insert to authenticated
with check(bucket_id='cvs' and (storage.foldername(name))[1]=(select auth.uid())::text and public.my_role()='student');
create policy "cv_owner_read" on storage.objects for select to authenticated
using(bucket_id='cvs' and ((storage.foldername(name))[1]=(select auth.uid())::text or exists(
 select 1 from public.applications a join public.jobs j on j.id=a.job_id join public.companies c on c.id=j.company_id
 where a.cv_path=name and c.owner_id=(select auth.uid())) or public.is_admin()));
-- Manually promote one trusted user to admin in SQL editor (never in browser):
-- update public.profiles set role='admin' where id='USER-UUID';
-- For this setup remove trigger temporarily in SQL editor transaction, or use a dedicated admin-only RPC.

create or replace function public.promote_admin(target uuid) returns void
language plpgsql security definer set search_path = '' as $$
begin
 if current_user not in ('postgres','supabase_admin') then raise exception 'Not allowed'; end if;
 -- admin setup must run from SQL editor as database owner
 alter table public.profiles disable trigger prevent_profile_escalation;
 update public.profiles set role='admin' where id=target;
 alter table public.profiles enable trigger prevent_profile_escalation;
end; $$;
revoke all on function public.promote_admin(uuid) from public,anon,authenticated;
-- select public.promote_admin('USER-UUID'::uuid);
