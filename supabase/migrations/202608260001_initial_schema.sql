-- Movendo Trainer — początkowy model danych Supabase
-- Uruchamiaj jako wersjonowaną migrację, nie jako ręczny zestaw zmian produkcyjnych.

create extension if not exists "pgcrypto";

create type public.member_role as enum ('owner', 'admin', 'trainer', 'collaborator');
create type public.account_role as enum ('trainer', 'client');
create type public.client_status as enum ('lead', 'active', 'paused', 'archived');
create type public.appointment_status as enum ('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show');
create type public.invitation_status as enum ('active', 'used', 'expired', 'revoked');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.account_role not null default 'trainer',
  full_name text,
  phone text,
  avatar_path text,
  timezone text not null default 'Europe/Warsaw',
  locale text not null default 'pl-PL',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_path text,
  timezone text not null default 'Europe/Warsaw',
  owner_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.organization_members (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.member_role not null default 'trainer',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table public.clients (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_trainer_id uuid references public.profiles(id),
  auth_user_id uuid references auth.users(id) on delete set null,
  status public.client_status not null default 'lead',
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  birth_date date,
  source text,
  goal_summary text,
  notes text,
  tags text[] not null default '{}',
  joined_at date,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.client_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  code_hash bytea not null unique,
  code_preview text not null,
  status public.invitation_status not null default 'active',
  expires_at timestamptz not null,
  used_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now()
);

create unique index client_invitations_one_active_idx
on public.client_invitations (client_id)
where status = 'active';

create table public.health_profiles (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null unique references public.clients(id) on delete cascade,
  medical_notes text,
  injuries text,
  limitations text,
  medications text,
  emergency_contact jsonb not null default '{}',
  parq_answers jsonb not null default '{}',
  updated_by uuid references public.profiles(id),
  updated_at timestamptz not null default now()
);

create table public.goals (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  title text not null,
  description text,
  target_value numeric,
  target_unit text,
  target_date date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table public.measurements (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  measured_at timestamptz not null default now(),
  weight_kg numeric(6,2),
  body_fat_percent numeric(5,2),
  resting_heart_rate integer,
  blood_pressure text,
  circumferences jsonb not null default '{}',
  performance_tests jsonb not null default '{}',
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.exercises (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  name text not null,
  category text,
  muscles text[] not null default '{}',
  equipment text[] not null default '{}',
  difficulty text,
  instructions text,
  common_mistakes text,
  safety_notes text,
  media_path text,
  is_shared boolean not null default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workout_plans (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  category text,
  duration_weeks integer,
  status text not null default 'draft',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  archived_at timestamptz
);

create table public.workout_days (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.workout_plans(id) on delete cascade,
  name text not null,
  week_number integer not null default 1,
  day_number integer not null,
  notes text,
  sort_order integer not null default 0
);

create table public.workout_items (
  id uuid primary key default gen_random_uuid(),
  workout_day_id uuid not null references public.workout_days(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  block_name text,
  sets integer,
  reps text,
  tempo text,
  rir numeric(3,1),
  rpe numeric(3,1),
  rest_seconds integer,
  load_instruction text,
  notes text,
  sort_order integer not null default 0
);

create table public.client_plan_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  plan_id uuid not null references public.workout_plans(id),
  starts_on date not null,
  ends_on date,
  active boolean not null default true,
  assigned_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.workout_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  assignment_id uuid references public.client_plan_assignments(id),
  workout_day_id uuid references public.workout_days(id),
  started_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer,
  perceived_difficulty numeric(3,1),
  pain_report text,
  comment text,
  results jsonb not null default '[]',
  created_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  appointment_type text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status public.appointment_status not null default 'scheduled',
  location text,
  meeting_url text,
  notes text,
  recurrence_rule text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint valid_appointment_time check (ends_at > starts_at)
);

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  submitted_at timestamptz not null default now(),
  energy integer check (energy between 1 and 10),
  sleep_quality integer check (sleep_quality between 1 and 10),
  stress integer check (stress between 1 and 10),
  pain integer check (pain between 0 and 10),
  weight_kg numeric(6,2),
  motivation integer check (motivation between 1 and 10),
  answers jsonb not null default '{}',
  trainer_note text,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  sender_user_id uuid not null references auth.users(id),
  recipient_user_id uuid references auth.users(id),
  client_id uuid references public.clients(id) on delete cascade,
  body text not null,
  attachment_path text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  client_id uuid references public.clients(id) on delete cascade,
  title text not null,
  description text,
  category text,
  priority text not null default 'medium',
  due_at timestamptz,
  completed_at timestamptz,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.automations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  trigger_type text not null,
  trigger_config jsonb not null default '{}',
  action_type text not null,
  action_config jsonb not null default '{}',
  active boolean not null default true,
  last_run_at timestamptz,
  run_count integer not null default 0,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.materials (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  category text,
  material_type text not null,
  file_path text,
  external_url text,
  file_size bigint,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.material_assignments (
  material_id uuid not null references public.materials(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  viewed_at timestamptz,
  primary key (material_id, client_id)
);

create table public.file_objects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  owner_user_id uuid references auth.users(id),
  client_id uuid references public.clients(id) on delete cascade,
  bucket text not null default 'movendo-files',
  object_key text not null unique,
  original_name text not null,
  content_type text not null,
  size_bytes bigint not null,
  visibility text not null default 'private',
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  client_id uuid not null references public.clients(id) on delete cascade,
  consent_type text not null,
  version text not null,
  accepted_at timestamptz,
  withdrawn_at timestamptz,
  document_path text,
  metadata jsonb not null default '{}'
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  body text,
  notification_type text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  actor_user_id uuid references auth.users(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index clients_org_status_idx on public.clients (organization_id, status);
create index clients_trainer_idx on public.clients (assigned_trainer_id);
create index appointments_org_starts_idx on public.appointments (organization_id, starts_at);
create index measurements_client_date_idx on public.measurements (client_id, measured_at desc);
create index workout_logs_client_date_idx on public.workout_logs (client_id, completed_at desc);
create index checkins_client_date_idx on public.checkins (client_id, submitted_at desc);
create index messages_client_date_idx on public.messages (client_id, created_at desc);
create index tasks_assignee_due_idx on public.tasks (assigned_to, due_at);

create or replace function public.is_org_member(target_organization uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.organization_members
    where organization_id = target_organization
      and user_id = auth.uid()
      and active = true
  );
$$;

grant execute on function public.is_org_member(uuid) to authenticated;

create or replace function public.can_access_client(target_client uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.clients c
    left join public.organization_members m
      on m.organization_id = c.organization_id
     and m.user_id = auth.uid()
     and m.active = true
    where c.id = target_client
      and (
        c.auth_user_id = auth.uid()
        or (
          m.user_id is not null
          and (m.role in ('owner', 'admin') or c.assigned_trainer_id = auth.uid())
        )
      )
  );
$$;

grant execute on function public.can_access_client(uuid) to authenticated;

create or replace function public.generate_client_invitation(target_client uuid, validity_days integer default 30)
returns table (code text, expires_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  allowed_chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  random_bytes bytea := gen_random_bytes(12);
  raw_code text := '';
  target_org uuid;
  valid_until timestamptz := now() + make_interval(days => greatest(1, least(validity_days, 90)));
  index_value integer;
begin
  select c.organization_id into target_org
  from public.clients c
  left join public.organization_members m
    on m.organization_id = c.organization_id
   and m.user_id = auth.uid()
   and m.active = true
  where c.id = target_client
    and (
      c.assigned_trainer_id = auth.uid()
      or m.role in ('owner', 'admin')
    );

  if target_org is null then
    raise exception 'client_not_available' using errcode = '42501';
  end if;

  update public.client_invitations
  set status = 'revoked', revoked_at = now()
  where client_id = target_client and status = 'active';

  for index_value in 0..11 loop
    raw_code := raw_code || substr(allowed_chars, (get_byte(random_bytes, index_value) % 32) + 1, 1);
  end loop;

  insert into public.client_invitations (
    organization_id, client_id, trainer_id, code_hash, code_preview, expires_at
  ) values (
    target_org,
    target_client,
    auth.uid(),
    digest(raw_code, 'sha256'),
    right(raw_code, 4),
    valid_until
  );

  return query select raw_code, valid_until;
end;
$$;

create or replace function public.validate_client_invitation(invitation_code text)
returns table (valid boolean, client_id uuid, client_name text, trainer_name text)
language sql
security definer
set search_path = public
as $$
  select
    true,
    c.id,
    trim(c.first_name || ' ' || c.last_name),
    coalesce(p.full_name, 'Trener Movendo')
  from public.client_invitations i
  join public.clients c on c.id = i.client_id
  join public.profiles p on p.id = i.trainer_id
  where i.code_hash = digest(upper(trim(invitation_code)), 'sha256')
    and i.status = 'active'
    and i.expires_at > now()
  limit 1;
$$;

create or replace function public.claim_client_invitation(invitation_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  invitation public.client_invitations%rowtype;
begin
  if auth.uid() is null then
    raise exception 'authentication_required' using errcode = '42501';
  end if;

  select * into invitation
  from public.client_invitations
  where code_hash = digest(upper(trim(invitation_code)), 'sha256')
    and status = 'active'
    and expires_at > now()
  for update;

  if invitation.id is null then
    raise exception 'invalid_or_expired_invitation' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.clients
    where id = invitation.client_id and auth_user_id is not null
  ) then
    raise exception 'client_account_already_linked' using errcode = '23505';
  end if;

  update public.clients
  set auth_user_id = auth.uid(), updated_at = now()
  where id = invitation.client_id;

  update public.profiles
  set role = 'client', updated_at = now()
  where id = auth.uid();

  update public.client_invitations
  set status = 'used', used_at = now()
  where id = invitation.id;

  return invitation.client_id;
end;
$$;

revoke all on function public.generate_client_invitation(uuid, integer) from public;
revoke all on function public.validate_client_invitation(text) from public;
revoke all on function public.claim_client_invitation(text) from public;
grant execute on function public.generate_client_invitation(uuid, integer) to authenticated;
grant execute on function public.validate_client_invitation(text) to anon, authenticated;
grant execute on function public.claim_client_invitation(text) to authenticated;

alter table public.profiles enable row level security;
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.clients enable row level security;
alter table public.client_invitations enable row level security;
alter table public.health_profiles enable row level security;
alter table public.goals enable row level security;
alter table public.measurements enable row level security;
alter table public.exercises enable row level security;
alter table public.workout_plans enable row level security;
alter table public.workout_days enable row level security;
alter table public.workout_items enable row level security;
alter table public.client_plan_assignments enable row level security;
alter table public.workout_logs enable row level security;
alter table public.appointments enable row level security;
alter table public.checkins enable row level security;
alter table public.messages enable row level security;
alter table public.tasks enable row level security;
alter table public.automations enable row level security;
alter table public.materials enable row level security;
alter table public.material_assignments enable row level security;
alter table public.file_objects enable row level security;
alter table public.consents enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

create policy "profiles_read_own" on public.profiles for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "organizations_members_read" on public.organizations for select using (public.is_org_member(id));
create policy "organizations_owner_create" on public.organizations for insert with check (owner_id = auth.uid());
create policy "organizations_owner_update" on public.organizations for update using (owner_id = auth.uid()) with check (owner_id = auth.uid());
create policy "members_read_same_org" on public.organization_members for select using (public.is_org_member(organization_id));
create policy "members_create_self_or_by_owner" on public.organization_members for insert with check (
  user_id = auth.uid() or exists (
    select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid()
  )
);
create policy "members_manage_by_owner" on public.organization_members for update using (
  exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid())
) with check (
  exists (select 1 from public.organizations o where o.id = organization_id and o.owner_id = auth.uid())
);

create policy "clients_scoped_read" on public.clients for select using (public.can_access_client(id));
create policy "clients_scoped_insert" on public.clients for insert with check (
  public.is_org_member(organization_id)
  and (
    assigned_trainer_id = auth.uid()
    or exists (
      select 1 from public.organization_members m
      where m.organization_id = clients.organization_id
        and m.user_id = auth.uid()
        and m.active = true
        and m.role in ('owner', 'admin')
    )
  )
);
create policy "clients_scoped_update" on public.clients for update using (public.can_access_client(id)) with check (public.can_access_client(id));
create policy "clients_scoped_delete" on public.clients for delete using (public.can_access_client(id));
create policy "client_invitations_trainer_read" on public.client_invitations for select using (
  trainer_id = auth.uid()
  or exists (
    select 1 from public.organization_members m
    where m.organization_id = client_invitations.organization_id
      and m.user_id = auth.uid()
      and m.active = true
      and m.role in ('owner', 'admin')
  )
);
create policy "goals_client_scope" on public.goals for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "measurements_client_scope" on public.measurements for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "exercises_org_access" on public.exercises for all using (organization_id is null or public.is_org_member(organization_id)) with check (organization_id is null or public.is_org_member(organization_id));
create policy "plans_org_access" on public.workout_plans for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "assignments_client_scope" on public.client_plan_assignments for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "logs_client_scope" on public.workout_logs for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "appointments_client_scope" on public.appointments for all using (trainer_id = auth.uid() or (client_id is not null and public.can_access_client(client_id))) with check (trainer_id = auth.uid() or (client_id is not null and public.can_access_client(client_id)));
create policy "checkins_client_scope" on public.checkins for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "messages_participant_scope" on public.messages for all using (sender_user_id = auth.uid() or recipient_user_id = auth.uid() or (client_id is not null and public.can_access_client(client_id))) with check (sender_user_id = auth.uid() or (client_id is not null and public.can_access_client(client_id)));
create policy "tasks_scoped_access" on public.tasks for all using (
  assigned_to = auth.uid()
  or created_by = auth.uid()
  or (client_id is not null and public.can_access_client(client_id))
) with check (
  assigned_to = auth.uid()
  or created_by = auth.uid()
  or (client_id is not null and public.can_access_client(client_id))
);
create policy "automations_org_access" on public.automations for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "materials_org_access" on public.materials for all using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));
create policy "files_scoped_access" on public.file_objects for all using (
  owner_user_id = auth.uid() or (client_id is not null and public.can_access_client(client_id))
) with check (
  owner_user_id = auth.uid() or (client_id is not null and public.can_access_client(client_id))
);
create policy "consents_client_scope" on public.consents for all using (public.can_access_client(client_id)) with check (public.can_access_client(client_id));
create policy "notifications_own" on public.notifications for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "audit_org_read" on public.audit_log for select using (organization_id is null or public.is_org_member(organization_id));

create policy "health_profile_via_client" on public.health_profiles for all
using (public.can_access_client(client_id))
with check (public.can_access_client(client_id));

create policy "workout_days_via_plan" on public.workout_days for all
using (exists (select 1 from public.workout_plans p where p.id = plan_id and public.is_org_member(p.organization_id)))
with check (exists (select 1 from public.workout_plans p where p.id = plan_id and public.is_org_member(p.organization_id)));

create policy "workout_items_via_day" on public.workout_items for all
using (exists (select 1 from public.workout_days d join public.workout_plans p on p.id = d.plan_id where d.id = workout_day_id and public.is_org_member(p.organization_id)))
with check (exists (select 1 from public.workout_days d join public.workout_plans p on p.id = d.plan_id where d.id = workout_day_id and public.is_org_member(p.organization_id)));

create policy "material_assignments_via_material" on public.material_assignments for all
using (public.can_access_client(client_id))
with check (public.can_access_client(client_id));

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    case when new.raw_user_meta_data->>'role' = 'client' then 'client'::public.account_role else 'trainer'::public.account_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
