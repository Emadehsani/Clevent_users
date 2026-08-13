-- Run this in Supabase SQL Editor only if the id column is NOT already
-- configured to auto-generate values.
-- Adjust to your current schema before running.
--
-- For a production app, do NOT expose password values through a public table.
-- Prefer Supabase Auth for login credentials.

-- Example optional policies for a temporary private test:
-- These policies allow the public anon role to CRUD this table.
-- DO NOT use these policies for a real production personnel system.

alter table public."Clevent_Users" enable row level security;

create policy "temporary anon select"
on public."Clevent_Users"
for select
to anon
using (true);

create policy "temporary anon insert"
on public."Clevent_Users"
for insert
to anon
with check (true);

create policy "temporary anon update"
on public."Clevent_Users"
for update
to anon
using (true)
with check (true);

create policy "temporary anon delete"
on public."Clevent_Users"
for delete
to anon
using (true);
