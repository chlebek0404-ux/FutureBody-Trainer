/**
 * Warstwa danych trenera.
 *
 * Odczyt i zapis podopiecznych, terminów oraz pomiarów w Supabase, wraz
 * z subskrypcją zmian w czasie rzeczywistym. Moduł nie zna interfejsu —
 * zwraca modele widoku używane przez aplikację, więc podmiana źródła danych
 * nie wymaga zmian w komponentach.
 *
 * Dostęp do wierszy ogranicza Row Level Security po stronie bazy. Tutaj
 * filtrujemy dodatkowo po organizacji, żeby nie pobierać cudzych danych,
 * gdy trener należy do kilku.
 */

import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";

import type { CalendarAppointment, Client } from "@/lib/demo-data";
import {
  appointmentStatusToLabel,
  clientStatusToLabel,
  labelToAppointmentStatus,
  labelToClientStatus,
  type AppointmentRow,
  type ClientRow,
  type MeasurementRow,
} from "@/lib/database.types";

export type Measurement = {
  id: string;
  clientId: string;
  date: string;
  weight: string;
  bodyFat: string;
  note: string;
};

const clientColumns =
  "id, organization_id, assigned_trainer_id, auth_user_id, status, first_name, last_name, email, phone, goal_summary, notes, tags, joined_at, created_at, updated_at, archived_at";
const appointmentColumns =
  "id, organization_id, trainer_id, client_id, title, appointment_type, starts_at, ends_at, status, location, notes";
const measurementColumns =
  "id, organization_id, client_id, measured_at, weight_kg, body_fat_percent, notes";

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return parts.map((part) => part[0]).join("").slice(0, 2).toUpperCase() || "?";
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("pl-PL").format(parsed);
}

function dateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function mapClient(row: ClientRow): Client {
  const name = `${row.first_name} ${row.last_name}`.trim() || "Podopieczny";
  return {
    id: row.id,
    name,
    initials: initials(name),
    email: row.email ?? "",
    phone: row.phone ?? "",
    status: clientStatusToLabel[row.status] ?? "Do kontaktu",
    goal: row.goal_summary ?? "Cel do ustalenia",
    plan: "Brak planu",
    nextSession: "Brak terminu",
    progress: 0,
    joined: formatDate(row.joined_at),
    lastCheckin: "Brak",
    weight: "—",
    bodyFat: "—",
    attendance: "—",
    tags: row.tags ?? [],
  };
}

export function mapAppointment(row: AppointmentRow): CalendarAppointment {
  const starts = new Date(row.starts_at);
  return {
    id: row.id,
    clientId: row.client_id ?? "",
    date: dateKey(starts),
    hour: starts.getHours(),
    kind: row.appointment_type || row.title,
    status: appointmentStatusToLabel[row.status] ?? "Zaplanowany",
  };
}

export function mapMeasurement(row: MeasurementRow): Measurement {
  return {
    id: row.id,
    clientId: row.client_id,
    date: formatDate(row.measured_at),
    weight: row.weight_kg === null ? "" : String(row.weight_kg),
    bodyFat: row.body_fat_percent === null ? "" : String(row.body_fat_percent),
    note: row.notes ?? "",
  };
}

/** Organizacja zalogowanego trenera. Bez niej nie da się nic zapisać. */
export async function fetchOrganizationId(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", userId)
    .eq("active", true)
    .limit(1)
    .maybeSingle();
  if (error || !data) return null;
  return data.organization_id as string;
}

export async function fetchClients(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("clients")
    .select(clientColumns)
    .eq("organization_id", organizationId)
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return (data as ClientRow[]).map(mapClient);
}

export async function fetchAppointments(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentColumns)
    .eq("organization_id", organizationId)
    .order("starts_at", { ascending: true });
  if (error || !data) return [];
  return (data as AppointmentRow[]).map(mapAppointment);
}

export async function fetchMeasurements(supabase: SupabaseClient, organizationId: string) {
  const { data, error } = await supabase
    .from("measurements")
    .select(measurementColumns)
    .eq("organization_id", organizationId)
    .order("measured_at", { ascending: false });
  if (error || !data) return [];
  return (data as MeasurementRow[]).map(mapMeasurement);
}

export async function insertClient(
  supabase: SupabaseClient,
  organizationId: string,
  trainerId: string,
  input: { name: string; email?: string; phone?: string; goal?: string },
) {
  const [firstName, ...rest] = input.name.trim().split(/\s+/);
  const { data, error } = await supabase
    .from("clients")
    .insert({
      organization_id: organizationId,
      assigned_trainer_id: trainerId,
      created_by: trainerId,
      status: "active",
      first_name: firstName ?? input.name,
      last_name: rest.join(" "),
      email: input.email || null,
      phone: input.phone || null,
      goal_summary: input.goal || null,
      joined_at: dateKey(new Date()),
    })
    .select(clientColumns)
    .single();
  if (error || !data) return null;
  return mapClient(data as ClientRow);
}

export async function upsertAppointment(
  supabase: SupabaseClient,
  organizationId: string,
  trainerId: string,
  input: { id?: string; clientId: string; date: string; hour: number; title?: string },
) {
  const starts = new Date(`${input.date}T${String(input.hour).padStart(2, "0")}:00:00`);
  const ends = new Date(starts.getTime() + 60 * 60 * 1000);
  const payload = {
    organization_id: organizationId,
    trainer_id: trainerId,
    client_id: input.clientId,
    title: input.title ?? "Trening personalny",
    appointment_type: "Trening personalny",
    starts_at: starts.toISOString(),
    ends_at: ends.toISOString(),
  };
  const query = input.id
    ? supabase.from("appointments").update(payload).eq("id", input.id).select(appointmentColumns).single()
    : supabase.from("appointments").insert(payload).select(appointmentColumns).single();
  const { data, error } = await query;
  if (error || !data) return null;
  return mapAppointment(data as AppointmentRow);
}

export async function setAppointmentStatus(
  supabase: SupabaseClient,
  id: string,
  label: "Zaplanowany" | "Wykonany" | "Anulowany",
) {
  const { error } = await supabase
    .from("appointments")
    .update({ status: labelToAppointmentStatus[label] })
    .eq("id", id);
  return !error;
}

export async function deleteAppointment(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("appointments").delete().eq("id", id);
  return !error;
}

export async function setClientStatus(
  supabase: SupabaseClient,
  id: string,
  label: "Aktywny" | "Do kontaktu" | "Wstrzymany",
) {
  const { error } = await supabase.from("clients").update({ status: labelToClientStatus[label] }).eq("id", id);
  return !error;
}

export async function insertMeasurement(
  supabase: SupabaseClient,
  organizationId: string,
  trainerId: string,
  input: { clientId: string; weight: string; bodyFat: string; note: string },
) {
  const toNumber = (value: string) => {
    const parsed = Number(value.replace(",", "."));
    return Number.isFinite(parsed) ? parsed : null;
  };
  const { data, error } = await supabase
    .from("measurements")
    .insert({
      organization_id: organizationId,
      client_id: input.clientId,
      created_by: trainerId,
      weight_kg: toNumber(input.weight),
      body_fat_percent: toNumber(input.bodyFat),
      notes: input.note || null,
    })
    .select(measurementColumns)
    .single();
  if (error || !data) return null;
  return mapMeasurement(data as MeasurementRow);
}

/**
 * Subskrypcja zmian w czasie rzeczywistym.
 *
 * Jeden kanał na organizację obejmuje trzy tabele — zmiana wprowadzona przez
 * współpracownika albo na drugim urządzeniu trafia do aplikacji bez
 * odświeżania. Wywołanie zwrotne dostaje wyłącznie sygnał, a ponowny odczyt
 * zostaje po stronie wywołującego, żeby uniknąć rozjazdu stanu.
 */
export function subscribeToWorkspace(
  supabase: SupabaseClient,
  organizationId: string,
  onChange: (table: "clients" | "appointments" | "measurements") => void,
): RealtimeChannel {
  const filter = `organization_id=eq.${organizationId}`;
  return supabase
    .channel(`workspace:${organizationId}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "clients", filter }, () => onChange("clients"))
    .on("postgres_changes", { event: "*", schema: "public", table: "appointments", filter }, () => onChange("appointments"))
    .on("postgres_changes", { event: "*", schema: "public", table: "measurements", filter }, () => onChange("measurements"))
    .subscribe();
}
