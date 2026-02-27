-- Add application URL to job postings so admins can link to external application forms/pages.
-- Safe to run even if the column already exists.

alter table if exists public.job_postings
  add column if not exists application_url text;

comment on column public.job_postings.application_url is 'External link for job applications (e.g., Google Form, ATS, email link).';
