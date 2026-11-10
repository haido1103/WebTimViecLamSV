-- JOBSTUDENT — TUẦN 2: database schema (idempotent where possible)
-- Run in Supabase > SQL Editor on a NEW project.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student','employer','admin')),
  phone text,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  description text,
  logo_url text,
  website text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  description text not null,
  requirements text[] not null default '{}',
  benefits text[] not null default '{}',
  location text not null,
  category text not null,
  employment_type text not null,
  salary_min integer check(salary_min is null or salary_min >= 0),
  salary_max integer check(salary_max is null or salary_max >= 0),
  salary_type text not null default 'hour' check(salary_type in ('hour','shift','month')),
  status text not null default 'pending' check(status in ('pending','published','rejected','closed')),
  featured boolean not null default false,
  urgent boolean not null default false,
  created_at timestamptz not null default now(),
  check(salary_min is null or salary_max is null or salary_max >= salary_min)
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  cover_letter text,
  cv_path text,
  status text not null default 'pending' check(status in ('pending','reviewing','accepted','rejected')),
  created_at timestamptz not null default now(),
  unique(job_id,student_id)
);

create table if not exists public.saved_jobs (
  student_id uuid not null references public.profiles(id) on delete cascade,
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(student_id,job_id)
);
create index if not exists idx_jobs_status_created on public.jobs(status,created_at desc);
create index if not exists idx_jobs_category on public.jobs(category);
create index if not exists idx_apps_student on public.applications(student_id);

-- RLS baseline: only public read of published jobs and their company information.
-- CRUD access is intentionally DENIED until week 3 policies are tested.
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.saved_jobs enable row level security;

-- Companies public read is required for company names in published jobs.
-- Future phase: restrict private employer fields / use public views if needed.
drop policy if exists "companies_public_read" on public.companies;
create policy "companies_public_read" on public.companies for select to anon, authenticated using (true);
drop policy if exists "jobs_published_read" on public.jobs;
create policy "jobs_published_read" on public.jobs for select to anon, authenticated using (status = 'published');

-- NOTE: do NOT allow clients to set role=admin. Implement secure role assignment
-- and ownership checks in week 3 before granting any write policy.
