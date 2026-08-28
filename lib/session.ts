import type { SupabaseClient } from "@supabase/supabase-js";

import type { Client, ClientStatus } from "@/lib/demo-data";

export type AccountRole = "trainer" | "client";

export type AccountSession = {
  userId: string;
  email: string;
  role: AccountRole;
  fullName: string;
  /** Rekord podopiecznego powiązany z kontem. Trener nie ma własnego rekordu. */
  clientRecord: Client | null;
};

type ClientRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  goal_summary: string | null;
  tags: string[] | null;
  joined_at: string | null;
};

const clientStatusLabels: Record<string, ClientStatus> = {
  active: "Aktywny",
  lead: "Do kontaktu",
  paused: "Wstrzymany",
  archived: "Wstrzymany",
};

function toInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : new Intl.DateTimeFormat("pl-PL").format(parsed);
}

export function mapClientRow(row: ClientRow): Client {
  const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "Podopieczny";
  return {
    id: row.id,
    name,
    initials: toInitials(name) || "?",
    email: row.email ?? "",
    phone: row.phone ?? "",
    status: clientStatusLabels[row.status ?? ""] ?? "Do kontaktu",
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

const clientColumns = "id, first_name, last_name, email, phone, status, goal_summary, tags, joined_at";

/**
 * Odczytuje rolę i profil podopiecznego dla wskazanego konta.
 * Zwraca `null`, gdy konto nie ma jeszcze profilu w bazie.
 */
export async function loadAccountSession(
  supabase: SupabaseClient,
  userId: string,
  email: string,
): Promise<AccountSession | null> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", userId)
    .maybeSingle();

  if (error || !profile) return null;

  const role: AccountRole = profile.role === "client" ? "client" : "trainer";
  const base: AccountSession = {
    userId,
    email,
    role,
    fullName: profile.full_name ?? "",
    clientRecord: null,
  };

  if (role !== "client") return base;

  const { data: clientRow } = await supabase
    .from("clients")
    .select(clientColumns)
    .eq("auth_user_id", userId)
    .maybeSingle();

  return { ...base, clientRecord: clientRow ? mapClientRow(clientRow as ClientRow) : null };
}

/** Odtwarza sesję z aktywnego tokenu Supabase. Zwraca `null`, gdy nikt nie jest zalogowany. */
export async function restoreAccountSession(supabase: SupabaseClient): Promise<AccountSession | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return loadAccountSession(supabase, data.user.id, data.user.email ?? "");
}
