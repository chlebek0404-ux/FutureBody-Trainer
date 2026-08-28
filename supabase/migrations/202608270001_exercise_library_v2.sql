-- Structured exercise library. Additive migration: existing exercise ids and workout history remain unchanged.

create table if not exists public.exercise_families (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid references public.organizations(id) on delete cascade,
  slug text not null,
  name text not null,
  movement_pattern text not null,
  description text,
  created_at timestamptz not null default now(),
  unique nulls not distinct (organization_id, slug)
);

alter table public.exercises
  add column if not exists english_name text,
  add column if not exists aliases text[] not null default '{}',
  add column if not exists primary_muscles text[] not null default '{}',
  add column if not exists secondary_muscles text[] not null default '{}',
  add column if not exists movement_pattern text,
  add column if not exists exercise_types text[] not null default '{}',
  add column if not exists laterality text not null default 'bilateral',
  add column if not exists family_id uuid references public.exercise_families(id),
  add column if not exists tags text[] not null default '{}',
  add column if not exists technique_cues text[] not null default '{}',
  add column if not exists media_end_path text,
  add column if not exists source text not null default 'system',
  add column if not exists parent_exercise_id uuid references public.exercises(id),
  add column if not exists status text not null default 'active',
  add column if not exists archived_at timestamptz;

create table if not exists public.exercise_aliases (
  id uuid primary key default gen_random_uuid(),
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  alias text not null,
  normalized_alias text not null,
  locale text not null default 'pl',
  alias_type text not null default 'synonym',
  unique (exercise_id, normalized_alias)
);

create table if not exists public.exercise_favorites (
  user_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, exercise_id)
);

create table if not exists public.exercise_usage (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  trainer_id uuid not null references public.profiles(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id) on delete cascade,
  use_count integer not null default 0,
  last_used_at timestamptz,
  last_settings jsonb not null default '{}',
  primary key (trainer_id, exercise_id)
);

create table if not exists public.exercise_relations (
  source_exercise_id uuid not null references public.exercises(id) on delete cascade,
  target_exercise_id uuid not null references public.exercises(id) on delete cascade,
  relation_type text not null default 'substitution',
  similarity_score numeric(5,2),
  reason text,
  created_at timestamptz not null default now(),
  primary key (source_exercise_id, target_exercise_id, relation_type),
  check (source_exercise_id <> target_exercise_id)
);

create index if not exists exercises_family_idx on public.exercises (family_id) where archived_at is null;
create index if not exists exercises_pattern_idx on public.exercises (movement_pattern) where archived_at is null;
create index if not exists exercises_primary_muscles_gin on public.exercises using gin (primary_muscles);
create index if not exists exercises_equipment_gin on public.exercises using gin (equipment);
create index if not exists exercises_tags_gin on public.exercises using gin (tags);
create index if not exists exercise_aliases_normalized_idx on public.exercise_aliases (normalized_alias);
create index if not exists exercise_usage_trainer_recent_idx on public.exercise_usage (trainer_id, last_used_at desc);

alter table public.exercise_families enable row level security;
alter table public.exercise_aliases enable row level security;
alter table public.exercise_favorites enable row level security;
alter table public.exercise_usage enable row level security;
alter table public.exercise_relations enable row level security;

create policy "exercise_families_org_access" on public.exercise_families for all
using (organization_id is null or public.is_org_member(organization_id))
with check (organization_id is null or public.is_org_member(organization_id));

create policy "exercise_aliases_via_exercise" on public.exercise_aliases for select
using (exists (select 1 from public.exercises e where e.id = exercise_id and (e.organization_id is null or public.is_org_member(e.organization_id))));

create policy "exercise_aliases_manage_own_org" on public.exercise_aliases for all
using (exists (select 1 from public.exercises e where e.id = exercise_id and e.organization_id is not null and public.is_org_member(e.organization_id)))
with check (exists (select 1 from public.exercises e where e.id = exercise_id and e.organization_id is not null and public.is_org_member(e.organization_id)));

create policy "exercise_favorites_own" on public.exercise_favorites for all
using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "exercise_usage_own" on public.exercise_usage for all
using (trainer_id = auth.uid() and public.is_org_member(organization_id))
with check (trainer_id = auth.uid() and public.is_org_member(organization_id));

create policy "exercise_relations_read" on public.exercise_relations for select
using (exists (select 1 from public.exercises e where e.id = source_exercise_id and (e.organization_id is null or public.is_org_member(e.organization_id))));

create policy "exercise_relations_manage_org" on public.exercise_relations for all
using (exists (select 1 from public.exercises e where e.id = source_exercise_id and e.organization_id is not null and public.is_org_member(e.organization_id)))
with check (exists (select 1 from public.exercises e where e.id = source_exercise_id and e.organization_id is not null and public.is_org_member(e.organization_id)));

comment on column public.exercises.parent_exercise_id is 'Original system exercise used when a trainer creates a private variant.';
comment on column public.exercises.media_path is 'Start frame or primary short video stored in R2.';
comment on column public.exercises.media_end_path is 'End frame used by the two-phase exercise demonstration.';
