export type ClientStatus = "Aktywny" | "Do kontaktu" | "Wstrzymany";

export type Client = {
  id: string;
  name: string;
  initials: string;
  email: string;
  phone: string;
  status: ClientStatus;
  goal: string;
  plan: string;
  nextSession: string;
  progress: number;
  joined: string;
  lastCheckin: string;
  weight: string;
  bodyFat: string;
  attendance: string;
  tags: string[];
};

export type TrainerTask = {
  id: string;
  title: string;
  due: string;
  category: string;
  priority: "Wysoki" | "Średni" | "Niski";
  done: boolean;
};

export type CheckinRecord = {
  client: string;
  initials: string;
  date: string;
  energy: number;
  sleep: number;
  stress: number;
  weight: string;
  status: "Nowy" | "Sprawdzony";
  note: string;
};

export type ConversationRecord = {
  id: string;
  name: string;
  initials: string;
  preview: string;
  time: string;
  unread: number;
  online: boolean;
};

export type AutomationRecord = {
  name: string;
  trigger: string;
  action: string;
  runs: number;
  active: boolean;
};

export type MaterialRecord = {
  title: string;
  type: "PDF" | "Wideo" | "Lista";
  category: string;
  shared: number;
  size: string;
};

// Dane użytkowników pochodzą wyłącznie z backendu. Te kolekcje są celowo puste.
export const initialClients: Client[] = [];
export const initialTasks: TrainerTask[] = [];
export const checkins: CheckinRecord[] = [];
export const conversations: ConversationRecord[] = [];
export const automations: AutomationRecord[] = [];
export const materials: MaterialRecord[] = [];
