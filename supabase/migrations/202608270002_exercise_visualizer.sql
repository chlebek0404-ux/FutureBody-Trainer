-- Scalable media pipeline for the shared ExerciseVisualizer component.
-- Assets live in R2; PostgreSQL stores stable paths and visualization metadata.

alter table public.exercises
  add column if not exists animation_asset_path text,
  add column if not exists animation_asset_kind text,
  add column if not exists animation_frame_count integer,
  add column if not exists animation_asset_version text,
  add column if not exists anatomy_asset_path text,
  add column if not exists preferred_camera_angle text,
  add column if not exists primary_muscle_ids text[] not null default '{}',
  add column if not exists secondary_muscle_ids text[] not null default '{}',
  add column if not exists movement_phases jsonb not null default '[]';

alter table public.exercises
  add constraint exercises_animation_kind_check
  check (animation_asset_kind is null or animation_asset_kind in ('sprite', 'video', 'imageSequence'));

alter table public.exercises
  add constraint exercises_camera_angle_check
  check (preferred_camera_angle is null or preferred_camera_angle in ('front', 'back', 'side', 'frontThreeQuarter', 'rearThreeQuarter'));

alter table public.exercises
  add constraint exercises_frame_count_check
  check (animation_frame_count is null or animation_frame_count between 1 and 120);

create index if not exists exercises_primary_muscle_ids_gin on public.exercises using gin (primary_muscle_ids);
create index if not exists exercises_secondary_muscle_ids_gin on public.exercises using gin (secondary_muscle_ids);

comment on column public.exercises.animation_asset_path is 'R2 object path for a reviewed movement sprite, video loop, or image sequence manifest.';
comment on column public.exercises.anatomy_asset_path is 'R2 object path for the shared anatomical model base.';
comment on column public.exercises.movement_phases is 'Ordered labels and timing used by ExerciseVisualizer; never stores executable code.';
