/**
 * Typy wierszy bazy odwzorowujące migracje z `supabase/migrations`.
 *
 * Pisane ręcznie, żeby projekt nie zależał od generatora ani od dostępu
 * do instancji. Przy zmianie migracji trzeba je zaktualizować razem z nią.
 */

export type ClientStatusRow = "lead" | "active" | "paused" | "archived";
export type AppointmentStatusRow = "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";

export type ClientRow = {
  id: string;
  organization_id: string;
  assigned_trainer_id: string | null;
  auth_user_id: string | null;
  status: ClientStatusRow;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  goal_summary: string | null;
  notes: string | null;
  tags: string[];
  joined_at: string | null;
  created_at: string;
  updated_at: string;
  archived_at: string | null;
};

export type AppointmentRow = {
  id: string;
  organization_id: string;
  trainer_id: string;
  client_id: string | null;
  title: string;
  appointment_type: string;
  starts_at: string;
  ends_at: string;
  status: AppointmentStatusRow;
  location: string | null;
  notes: string | null;
};

export type MeasurementRow = {
  id: string;
  organization_id: string;
  client_id: string;
  measured_at: string;
  weight_kg: number | null;
  body_fat_percent: number | null;
  notes: string | null;
};

export type ProfileRow = {
  id: string;
  role: "trainer" | "client";
  full_name: string | null;
  phone: string | null;
};

/** Mapowania między słownikami bazy a etykietami interfejsu. */
export const clientStatusToLabel: Record<ClientStatusRow, "Aktywny" | "Do kontaktu" | "Wstrzymany"> = {
  active: "Aktywny",
  lead: "Do kontaktu",
  paused: "Wstrzymany",
  archived: "Wstrzymany",
};

export const labelToClientStatus: Record<"Aktywny" | "Do kontaktu" | "Wstrzymany", ClientStatusRow> = {
  Aktywny: "active",
  "Do kontaktu": "lead",
  Wstrzymany: "paused",
};

export const appointmentStatusToLabel: Record<AppointmentStatusRow, "Zaplanowany" | "Wykonany" | "Anulowany"> = {
  scheduled: "Zaplanowany",
  confirmed: "Zaplanowany",
  completed: "Wykonany",
  cancelled: "Anulowany",
  no_show: "Anulowany",
};

export const labelToAppointmentStatus: Record<"Zaplanowany" | "Wykonany" | "Anulowany", AppointmentStatusRow> = {
  Zaplanowany: "scheduled",
  Wykonany: "completed",
  Anulowany: "cancelled",
};
