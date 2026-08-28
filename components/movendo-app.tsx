"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  Circle,
  Download,
  Dumbbell,
  Eye,
  EyeOff,
  FileText,
  Filter,
  Flame,
  FolderOpen,
  LayoutDashboard,
  Library,
  LockKeyhole,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  Monitor,
  MoreHorizontal,
  Moon,
  Plus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Sparkles,
  Sun,
  TrendingUp,
  Upload,
  UserPlus,
  Users,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  automations,
  checkins,
  conversations,
  initialTasks,
  materials,
  type CalendarAppointment,
  type Client,
  type ClientInvitation,
} from "@/lib/demo-data";
import ExerciseMotion from "@/components/exercise-motion";
import ExerciseLibraryPanel from "@/components/exercise-library-panel";
import { PlanEditor } from "@/components/training-plan";
import { ClientWorkout } from "@/components/client-workout";
import { exerciseLibrary, searchExercises, suggestExercises } from "@/lib/exercise-library";
import { createTrainingProgram, type TrainingProgram, type WorkoutCompletion } from "@/lib/training-programs";
import { downloadMovendoPdf } from "@/lib/pdf-export";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase";
import { buildPreviewWorkspace, isPreviewBuild, matchPreviewAccount, previewClientEmail, previewClientId, previewTrainerEmail } from "@/lib/preview-workspace";
import { loadAccountSession, restoreAccountSession, type AccountRole, type AccountSession } from "@/lib/session";

type View =
  | "dashboard"
  | "clients"
  | "calendar"
  | "plans"
  | "exercises"
  | "progress"
  | "checkins"
  | "messages"
  | "tasks"
  | "automations"
  | "materials"
  | "reports"
  | "settings";

type ModalType = "client" | "measurement" | null;

type NavigationItem = { id: View; label: string; shortLabel?: string; icon: LucideIcon; count?: number };

const primaryNavigation: NavigationItem[] = [
  { id: "dashboard", label: "Pulpit", icon: LayoutDashboard },
  { id: "calendar", label: "Kalendarz", icon: CalendarDays },
  { id: "clients", label: "Podopieczni", icon: Users },
  { id: "plans", label: "Plany", icon: Dumbbell },
];

const secondaryNavigation: NavigationItem[] = [
  { id: "exercises", label: "Biblioteka ćwiczeń", shortLabel: "Ćwiczenia", icon: Library },
  { id: "progress", label: "Postępy", icon: TrendingUp },
  { id: "checkins", label: "Check-iny", icon: CheckSquare },
  { id: "messages", label: "Wiadomości", icon: MessageCircle, count: 3 },
  { id: "tasks", label: "Zadania", icon: CheckCircle2, count: 4 },
  { id: "reports", label: "Raporty", icon: BarChart3 },
  { id: "materials", label: "Materiały", icon: FolderOpen },
  { id: "automations", label: "Automatyzacje", icon: Zap },
  { id: "settings", label: "Ustawienia", icon: Settings },
];

const cardClass = "ui-surface rounded-[24px] border border-black/[0.07] bg-white shadow-[0_12px_38px_rgba(0,0,0,.035)]";

function Avatar({ initials, size = "md", dark = false }: { initials: string; size?: "sm" | "md" | "lg"; dark?: boolean }) {
  const sizes = size === "sm" ? "h-8 w-8 text-[9px]" : size === "lg" ? "h-14 w-14 text-sm" : "h-10 w-10 text-[11px]";
  return <div className={`grid shrink-0 place-items-center rounded-full font-black ${sizes} ${dark ? "bg-black text-white" : "bg-[#ededeb] text-black"}`}>{initials}</div>;
}

function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "dark" | "good" | "warn" | "bad" }) {
  const tones = {
    neutral: "bg-black/[0.055] text-black/52",
    dark: "bg-black text-white",
    good: "bg-emerald-50 text-emerald-700",
    warn: "bg-amber-50 text-amber-700",
    bad: "bg-red-50 text-red-700",
  };
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.08em] ${tones[tone]}`}>{children}</span>;
}

function ProgressBar({ value, dark = false }: { value: number; dark?: boolean }) {
  return (
    <div className={`h-1.5 overflow-hidden rounded-full ${dark ? "bg-white/12" : "bg-black/[0.07]"}`}>
      <div className={`ui-progress h-full rounded-full ${dark ? "bg-white" : "bg-black"}`} style={{ width: `${Math.min(value, 100)}%` }} />
    </div>
  );
}

function PageHeader({ title, subtitle, action, onAction, secondary }: { title: string; subtitle: string; action?: string; onAction?: () => void; secondary?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-[34px] font-black tracking-[-0.055em] sm:text-[42px]">{title}</h1>
        <p className="mt-1.5 text-sm text-black/42">{subtitle}</p>
      </div>
      <div className="flex items-center gap-2">
        {secondary}
        {action ? (
          <button onClick={onAction} className="flex h-11 items-center gap-2 rounded-full bg-black px-5 text-xs font-black uppercase tracking-[0.08em] text-white transition hover:-translate-y-0.5">
            <Plus size={16} /> {action}
          </button>
        ) : null}
      </div>
    </div>
  );
}

function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="grid min-h-[280px] place-items-center text-center">
      <div>
        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-black text-white"><Icon size={19} /></div>
        <h3 className="mt-4 font-black">{title}</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-black/40">{text}</p>
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <path fill="#4285F4" d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5.1-4.4 6.6v5.5h7.1c4.2-3.8 6.6-9.5 6.6-16.3z"/>
      <path fill="#34A853" d="M24 46c6 0 11-2 14.6-5.2l-7.1-5.5c-2 1.3-4.5 2.1-7.5 2.1-5.8 0-10.7-3.9-12.4-9.1H4.3v5.7C7.9 41.1 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.6 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-3 .7-4.3v-5.7H4.3C2.8 17 2 20.4 2 24s.8 7 2.3 10l7.3-5.7z"/>
      <path fill="#EA4335" d="M24 10.6c3.3 0 6.2 1.1 8.5 3.3l6.3-6.3C35 4.1 30 2 24 2 15.4 2 7.9 6.9 4.3 14l7.3 5.7c1.7-5.2 6.6-9.1 12.4-9.1z"/>
    </svg>
  );
}

type AuthMode = "login" | "trainer-register" | "forgot" | "code" | "client-register";
type ActivationInfo = { clientId: string; clientName: string; trainerName: string; code: string };

type LoginScreenProps = {
  initialCode?: string;
  onLogin: (email: string, password: string) => Promise<string | null>;
  onRegisterTrainer: (name: string, email: string, password: string) => Promise<string | null>;
  onResetPassword: (email: string) => Promise<string | null>;
  onValidateCode: (code: string) => Promise<{ info?: ActivationInfo; error?: string }>;
  onActivateClient: (info: ActivationInfo, email: string, password: string) => Promise<string | null>;
  showPreviewAccounts?: boolean;
  onGoogleSignIn: () => Promise<string | null>;
};

function FutureBodySplash() {
  return <main className="futurebody-splash fixed inset-0 z-[200] grid min-h-[100svh] place-items-center overflow-hidden bg-[#050505]" aria-label="Uruchamianie FutureBody Trainer">
    <div className="futurebody-splash-glow"/>
    <img src="/futurebody-mark-transparent-v1.png" alt="FutureBody" className="futurebody-splash-logo relative h-auto w-56 object-contain sm:w-72"/>
  </main>;
}

function LoginScreen({ initialCode = "", onLogin, onRegisterTrainer, onResetPassword, onValidateCode, onActivateClient, showPreviewAccounts = false, onGoogleSignIn }: LoginScreenProps) {
  const normalizedInitialCode = initialCode.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12);
  const [mode, setMode] = useState<AuthMode>(normalizedInitialCode ? "code" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState(normalizedInitialCode);
  const [activation, setActivation] = useState<ActivationInfo | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function signInWithGoogle() {
    setGoogleLoading(true);
    setError(null);
    setSuccess(null);
    const message = await onGoogleSignIn();
    // Przy powodzeniu przeglądarka odchodzi na stronę Google, więc stan gaśnie tylko przy błędzie.
    if (message) setError(message);
    setGoogleLoading(false);
  }

  function changeMode(next: AuthMode) {
    setMode(next);
    setError(null);
    setSuccess(null);
    if (next !== "client-register") setActivation(null);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      setError(await onLogin(email, password));
    } else if (mode === "trainer-register") {
      if (password !== confirmPassword) setError("Hasła nie są identyczne.");
      else {
        const result = await onRegisterTrainer(name, email, password);
        if (result?.startsWith("INFO:")) setSuccess(result.slice(5)); else setError(result);
      }
    } else if (mode === "forgot") {
      const result = await onResetPassword(email);
      setError(result);
      if (!result) setSuccess("Wysłaliśmy instrukcję ustawienia nowego hasła.");
    } else if (mode === "code") {
      const result = await onValidateCode(code);
      if (result.error) setError(result.error);
      if (result.info) {
        setActivation(result.info);
        setEmail("");
        setPassword("");
        setConfirmPassword("");
        setMode("client-register");
      }
    } else if (mode === "client-register" && activation) {
      if (password.length < 8) setError("Hasło musi mieć co najmniej 8 znaków.");
      else if (password !== confirmPassword) setError("Hasła nie są identyczne.");
      else {
        const result = await onActivateClient(activation, email, password);
        if (result?.startsWith("INFO:")) setSuccess(result.slice(5)); else setError(result);
      }
    }
    setLoading(false);
  }

  const titles: Record<AuthMode, [string, string]> = {
    login: ["Zaloguj się", "Dostęp do panelu trenera i podopiecznego."],
    "trainer-register": ["Utwórz konto trenera", "Rozpocznij pracę w FutureBody Trainer."],
    forgot: ["Odzyskaj dostęp", "Podaj adres przypisany do Twojego konta."],
    code: ["Dołącz do swojego trenera", "Wpisz kod otrzymany od trenera."],
    "client-register": ["Utwórz swoje konto", "Kod został zweryfikowany. Ustaw dane logowania."],
  };

  return (
    <main className="futurebody-app futurebody-login-enter relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#050505] px-4 py-[max(2.5rem,env(safe-area-inset-top))] text-[#f7f7f7] sm:px-6">
      <div className="pointer-events-none absolute left-1/2 top-[-14rem] h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-[#ffc400]/[0.055] blur-[100px]" />
      <section className="w-full max-w-[440px]">
        <div className="mb-9 flex flex-col items-center text-center">
          <img src="/futurebody-logo.png" alt="FutureBody Trainer" className="h-20 w-20 rounded-[22px] object-cover shadow-[0_18px_55px_rgba(255,196,0,.10)] ring-1 ring-white/10" />
          <p className="mt-5 text-[13px] font-black tracking-[0.24em]">FUTUREBODY</p>
          <p className="mt-1 text-[9px] uppercase tracking-[0.42em] text-black/35">Trainer</p>
          <p className="mt-5 text-[11px] text-white/34">Twój trening. Twoi podopieczni. Twój system.</p>
        </div>

        <div className="rounded-[24px] border border-white/[0.07] bg-[#111214] p-6 shadow-[0_28px_90px_rgba(0,0,0,.36)] sm:p-8">
          {mode !== "login" ? (
            <button type="button" onClick={() => changeMode(mode === "client-register" ? "code" : "login")} className="mb-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.08em] text-white/42 hover:text-white">
              <ChevronLeft size={14} /> Wróć
            </button>
          ) : null}

          <div>
            <h1 className="text-[30px] font-black tracking-[-0.05em]">{titles[mode][0]}</h1>
            <p className="mt-2 text-sm leading-6 text-white/42">{titles[mode][1]}</p>
          </div>

          {activation ? (
            <div className="mt-5 rounded-2xl bg-[#f3f3f1] p-4">
              <div className="flex items-center gap-3"><Avatar initials={activation.clientName.split(" ").map((part) => part[0]).join("").slice(0, 2)} dark /><div><p className="text-xs font-black">{activation.clientName}</p><p className="mt-0.5 text-[10px] text-black/40">Trener: {activation.trainerName}</p></div></div>
            </div>
          ) : null}

          {mode === "login" || mode === "trainer-register" ? (
            <div className="mt-7">
              <button type="button" onClick={signInWithGoogle} disabled={googleLoading || loading} className="flex h-12 w-full items-center justify-center gap-3 rounded-[16px] border border-black/12 px-5 text-[11px] font-black uppercase tracking-[0.06em] transition hover:bg-black hover:text-white disabled:opacity-50">
                <GoogleMark />
                {googleLoading ? "Przekierowanie…" : mode === "login" ? "Zaloguj się przez Google" : "Załóż konto przez Google"}
              </button>
              <div className="mt-5 flex items-center gap-3" aria-hidden="true">
                <span className="h-px flex-1 bg-black/[0.09]" />
                <span className="text-[9px] font-black uppercase tracking-[0.14em] text-black/28">albo e-mailem</span>
                <span className="h-px flex-1 bg-black/[0.09]" />
              </div>
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={submit}>
            {mode === "trainer-register" ? <AuthInput label="Imię i nazwisko" value={name} onChange={setName} icon={Users} autoComplete="name" /> : null}
            {mode === "code" ? (
              <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[0.12em] text-black/38">12-znakowy kod</span><div className="flex h-13 items-center rounded-xl border border-black/10 bg-[#f7f7f5] px-4 focus-within:border-black"><LockKeyhole size={15} className="mr-3 text-black/28" /><input value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12))} className="h-12 min-w-0 flex-1 bg-transparent font-mono text-base font-black tracking-[0.18em] outline-none placeholder:text-black/20" placeholder="WPROWADŹ KOD" autoComplete="one-time-code" /></div><p className="mt-2 text-[10px] text-black/32">Kod ma dokładnie 12 znaków i można użyć go tylko raz.</p></label>
            ) : null}
            {mode !== "code" ? <AuthInput label="Adres e-mail" value={email} onChange={setEmail} icon={Mail} type="email" autoComplete="email" /> : null}
            {mode === "login" || mode === "trainer-register" || mode === "client-register" ? <PasswordInput label="Hasło" value={password} onChange={setPassword} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete={mode === "login" ? "current-password" : "new-password"} /> : null}
            {mode === "trainer-register" || mode === "client-register" ? <PasswordInput label="Powtórz hasło" value={confirmPassword} onChange={setConfirmPassword} visible={showPassword} onToggle={() => setShowPassword(!showPassword)} autoComplete="new-password" /> : null}

            {mode === "login" ? <button type="button" onClick={() => changeMode("forgot")} className="text-[10px] font-black text-black/42 hover:text-black">Nie pamiętasz hasła?</button> : null}
            {error ? <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-semibold text-red-700">{error}</p> : null}
            {success ? <p className="rounded-xl bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-700">{success}</p> : null}

            <button disabled={loading} type="submit" className="flex h-12 w-full items-center justify-center rounded-[16px] bg-[#ffc400] px-5 text-[11px] font-black uppercase tracking-[0.1em] text-[#050505] shadow-[0_10px_30px_rgba(255,196,0,.13)] transition hover:bg-[#ffd21a] disabled:opacity-50">
              {loading ? "Proszę czekać…" : mode === "login" ? "Zaloguj się" : mode === "trainer-register" ? "Utwórz konto" : mode === "forgot" ? "Wyślij instrukcję" : mode === "code" ? "Dalej" : "Aktywuj konto"}
            </button>
          </form>

          {mode === "login" ? (
            <>
              <p className="mt-5 text-center text-[11px] text-black/38">Nie masz konta? <button onClick={() => changeMode("trainer-register")} className="font-black text-black">Zarejestruj się jako trener</button></p>
              <div className="my-6 h-px bg-black/[0.07]" />
              <div className="text-center"><p className="text-xs font-black">Jesteś podopiecznym?</p><p className="mt-1 text-[10px] text-black/35">Aktywuj konto kodem otrzymanym od trenera.</p><button onClick={() => changeMode("code")} className="mt-4 h-11 w-full rounded-full border border-black/12 text-[10px] font-black uppercase tracking-[0.09em] transition hover:bg-black hover:text-white">Mam kod od trenera</button></div>
              {showPreviewAccounts ? (
                <div className="mt-6 rounded-2xl border border-dashed border-black/12 bg-[#f7f7f5] p-4">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-black/40">Tryb podglądu · tylko do recenzji</p>
                  <p className="mt-2 text-[10px] leading-4 text-black/45">Baza nie jest podłączona. Te konta służą wyłącznie do przeglądania interfejsu i nie istnieją w buildzie produkcyjnym.</p>
                  <div className="mt-3 space-y-2">
                    {[["Trener", previewTrainerEmail], ["Podopieczny", previewClientEmail]].map(([label, address]) => (
                      <button key={address} type="button" onClick={() => { setEmail(address); setPassword("demo1234"); }} className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-left transition hover:bg-black hover:text-white">
                        <span className="min-w-0"><span className="block text-[9px] font-black uppercase tracking-wider opacity-50">{label}</span><span className="block truncate text-[11px] font-bold">{address}</span></span>
                        <span className="shrink-0 text-[9px] font-black uppercase tracking-wider opacity-60">Wypełnij</span>
                      </button>
                    ))}
                  </div>
                  <p className="mt-3 text-[9px] text-black/32">Hasło dla obu kont: <strong className="font-black text-black/55">demo1234</strong></p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.11em] text-white/24"><ShieldCheck size={13} /> Bezpieczne logowanie</div>
      </section>
    </main>
  );
}

function AuthInput({ label, value, onChange, icon: Icon, type = "text", autoComplete }: { label: string; value: string; onChange: (value: string) => void; icon: LucideIcon; type?: string; autoComplete?: string }) {
  return <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[0.12em] text-black/38">{label}</span><div className="flex h-12 items-center rounded-xl border border-black/10 bg-[#f7f7f5] px-4 focus-within:border-black"><Icon size={15} className="mr-3 text-black/28" /><input required value={value} onChange={(event) => onChange(event.target.value)} type={type} autoComplete={autoComplete} className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" /></div></label>;
}

function PasswordInput({ label, value, onChange, visible, onToggle, autoComplete }: { label: string; value: string; onChange: (value: string) => void; visible: boolean; onToggle: () => void; autoComplete?: string }) {
  return <label className="block"><span className="mb-2 block text-[9px] font-black uppercase tracking-[0.12em] text-black/38">{label}</span><div className="flex h-12 items-center rounded-xl border border-black/10 bg-[#f7f7f5] px-4 focus-within:border-black"><LockKeyhole size={15} className="mr-3 text-black/28" /><input required value={value} onChange={(event) => onChange(event.target.value)} type={visible ? "text" : "password"} autoComplete={autoComplete} className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none" /><button type="button" onClick={onToggle} aria-label={visible ? "Ukryj hasło" : "Pokaż hasło"}>{visible ? <EyeOff size={16} /> : <Eye size={16} />}</button></div></label>;
}

type TrainerNotification = { id: string; title: string; detail: string; view: View; read: boolean };
type ThemePreference = "dark" | "light" | "system";
type TrainerWorkoutRoute = { clientId: string; planId: string; dayId: string };

function readThemePreference(): ThemePreference {
  if (typeof window === "undefined") return "dark";
  const saved = window.localStorage.getItem("futurebody_theme");
  return saved === "light" || saved === "system" ? saved : "dark";
}

function readStoredJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    return saved ? JSON.parse(saved) as T : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
}

// Rola nie jest odtwarzana z przeglądarki. Jedynym źródłem prawdy jest sesja Supabase,
// dzięki czemu wygaszony token nie otwiera panelu trenera.
function prepareStorage() {
  if (typeof window === "undefined") return null;
  clearExampleDataOnce();
  window.localStorage.removeItem("futurebody_role");
  return null;
}

function readStoredPlans(): TrainingProgram[] {
  return readStoredJson<TrainingProgram[]>("futurebody_plans", []);
}

function clearExampleDataOnce() {
  if (typeof window === "undefined") return;
  const cleanupKey = "futurebody_clean_start_2026_08_28";
  if (window.localStorage.getItem(cleanupKey) === "1") return;
  const exactKeys = [
    "futurebody_role",
    "futurebody_clients",
    "futurebody_tasks",
    "futurebody_plans",
    "futurebody_workout_history",
    "futurebody_invitations",
    "futurebody_plans_schema_2026_08_28",
    "movendo_calendar_history",
    "movendo_pending_invitation",
    "movendo-demo-exercise-favorites",
    "movendo-demo-exercise-recents",
    "movendo-demo-trainer-exercises",
  ];
  exactKeys.forEach((key) => window.localStorage.removeItem(key));
  for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
    const key = window.localStorage.key(index);
    if (key?.startsWith("futurebody_workout_draft_")) window.localStorage.removeItem(key);
  }
  window.localStorage.setItem(cleanupKey, "1");
  if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(value: string) {
  return new Date(`${value}T12:00:00`);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function startOfWeek(date: Date) {
  const next = new Date(date);
  const day = next.getDay() || 7;
  next.setDate(next.getDate() - day + 1);
  next.setHours(12, 0, 0, 0);
  return next;
}

function formatCalendarDate(value: string) {
  return new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(dateFromKey(value));
}

function generateActivationCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const random = new Uint32Array(12);
  window.crypto.getRandomValues(random);
  return Array.from(random, (value) => alphabet[value % alphabet.length]).join("");
}

export default function MovendoApp({ initialActivationCode = "" }: { initialActivationCode?: string }) {
  const [booting, setBooting] = useState(true);
  const [themePreference, setThemePreference] = useState<ThemePreference>(readThemePreference);
  const [systemDark, setSystemDark] = useState(() => typeof window === "undefined" || window.matchMedia("(prefers-color-scheme: dark)").matches);
  const [role, setRole] = useState<AccountRole | null>(prepareStorage);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [moreNavigationOpen, setMoreNavigationOpen] = useState(false);
  const [clients, setClients] = useState<Client[]>(() => readStoredJson("futurebody_clients", []));
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<typeof initialTasks>(() => readStoredJson("futurebody_tasks", []));
  const [modal, setModal] = useState<ModalType>(null);
  const [query, setQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState("");
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [searchFocused, setSearchFocused] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [trainerNotifications, setTrainerNotifications] = useState<TrainerNotification[]>([]);
  const [invitations, setInvitations] = useState<ClientInvitation[]>(() => readStoredJson("futurebody_invitations", []));
  const [inviteDialog, setInviteDialog] = useState<ClientInvitation | null>(null);
  const [clientSession, setClientSession] = useState<Client | null>(null);
  const [previewMode, setPreviewMode] = useState(false);
  const [handoff, setHandoff] = useState(false);
  const handoffTimer = useRef<number | null>(null);
  const [calendarIntent, setCalendarIntent] = useState(false);
  const [appointments, setAppointments] = useState<CalendarAppointment[]>(() => readStoredJson("movendo_calendar_history", []));
  const [workoutPlans, setWorkoutPlans] = useState<TrainingProgram[]>(readStoredPlans);
  const [workoutHistory, setWorkoutHistory] = useState<WorkoutCompletion[]>(() => readStoredJson("futurebody_workout_history", []));
  const [trainerWorkout, setTrainerWorkout] = useState<TrainerWorkoutRoute | null>(null);

  const resolvedTheme = themePreference === "system" ? (systemDark ? "dark" : "light") : themePreference;

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", updateSystemTheme);
    return () => media.removeEventListener("change", updateSystemTheme);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("futurebody_theme", themePreference);
    document.documentElement.dataset.theme = resolvedTheme;
    document.documentElement.style.colorScheme = resolvedTheme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", resolvedTheme === "dark" ? "#050505" : "#f4f4f2");
  }, [resolvedTheme, themePreference]);

  useEffect(() => {
    function syncRouteFromHash() {
      const parts = window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
      const routeHead = parts[0];
      const knownViews = new Set<View>([...primaryNavigation, ...secondaryNavigation].map((item) => item.id));
      if (routeHead === "clients" && parts[1]) {
        setActiveView("clients");
        setSelectedClient(parts[1]);
        setSelectedPlanId(null);
        setTrainerWorkout(null);
        return;
      }
      if (routeHead === "plans" && parts[1]) {
        setActiveView("plans");
        setSelectedPlanId(parts[1]);
        setSelectedClient(null);
        setTrainerWorkout(null);
        return;
      }
      if (routeHead === "workouts" && parts[1] && parts[2] && parts[3]) {
        setTrainerWorkout({ clientId: parts[1], planId: parts[2], dayId: parts[3] });
        setSelectedClient(null);
        setSelectedPlanId(null);
        return;
      }
      const view = routeHead as View | undefined;
      if (view && knownViews.has(view)) {
        setActiveView(view);
        setSelectedPlanId(null);
        setSelectedClient(null);
        setTrainerWorkout(null);
      }
    }

    syncRouteFromHash();
    window.addEventListener("popstate", syncRouteFromHash);
    return () => window.removeEventListener("popstate", syncRouteFromHash);
  }, []);

  // Krótka zasłona przykrywa zamianę ekranu logowania na panel,
  // żeby wejście do aplikacji nie było cięciem.
  const startHandoff = useCallback(() => {
    setHandoff(true);
    if (handoffTimer.current) window.clearTimeout(handoffTimer.current);
    handoffTimer.current = window.setTimeout(() => setHandoff(false), 560);
  }, []);

  useEffect(() => () => { if (handoffTimer.current) window.clearTimeout(handoffTimer.current); }, []);

  const applySession = useCallback((session: AccountSession | null) => {
    setRole(session?.role ?? null);
    setClientSession(session?.clientRecord ?? null);
    if (session) startHandoff();
  }, [startHandoff]);

  // Splash trwa tyle co dotychczas, ale ekran startowy czeka też na odtworzenie sesji,
  // żeby zalogowany użytkownik nie zobaczył formularza logowania na ułamek sekundy.
  useEffect(() => {
    let active = true;
    let timer = 0;
    const splashDelay = new Promise<void>((resolve) => {
      timer = window.setTimeout(resolve, 3400);
    });
    const supabase = getSupabaseBrowserClient();

    async function boot() {
      let restored = supabase ? await restoreAccountSession(supabase) : null;
      // Konto podopiecznego bez przypisanego profilu nie ma czego wyświetlić —
      // zamykamy sesję zamiast zapętlać ekran logowania.
      if (supabase && restored?.role === "client" && !restored.clientRecord) {
        await supabase.auth.signOut();
        restored = null;
      }
      await splashDelay;
      if (!active) return;
      if (restored) applySession(restored);
      setBooting(false);
    }

    void boot();
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [applySession]);

  // Wygaśnięcie tokenu albo wylogowanie w innej karcie natychmiast zamyka panel.
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setRole(null);
        setClientSession(null);
        setSelectedClient(null);
        setTrainerWorkout(null);
        setActiveView("dashboard");
        return;
      }
      // Powrót z Google kończy się zdarzeniem SIGNED_IN. Zapytania do bazy muszą
      // wyjść poza ten callback, inaczej klient Supabase się zakleszcza.
      if (event !== "SIGNED_IN" || !session?.user) return;
      const user = session.user;
      window.setTimeout(async () => {
        const resolved = await loadAccountSession(supabase, user.id, user.email ?? "");
        if (!resolved) return;
        if (resolved.role === "client" && !resolved.clientRecord) {
          await supabase.auth.signOut();
          return;
        }
        applySession(resolved);
      }, 0);
    });
    return () => data.subscription.unsubscribe();
  }, [applySession]);

  useEffect(() => {
    if ("serviceWorker" in navigator && window.isSecureContext) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("movendo_calendar_history", JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    window.localStorage.setItem("futurebody_clients", JSON.stringify(clients));
    window.localStorage.setItem("futurebody_tasks", JSON.stringify(tasks));
    window.localStorage.setItem("futurebody_plans", JSON.stringify(workoutPlans));
    window.localStorage.setItem("futurebody_workout_history", JSON.stringify(workoutHistory));
    window.localStorage.setItem("futurebody_invitations", JSON.stringify(invitations));
  }, [clients, invitations, tasks, workoutHistory, workoutPlans]);

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (event.key === "Escape") {
        setSearchFocused(false);
        setNotificationsOpen(false);
      }
    }
    window.addEventListener("keydown", handleShortcut);
    return () => window.removeEventListener("keydown", handleShortcut);
  }, []);

  function notify(text: string) {
    setToast(text);
    window.setTimeout(() => setToast(null), 2600);
  }

  // Wejście do trybu podglądu. Nieosiągalne przy skonfigurowanym Supabase
  // oraz w buildzie produkcyjnym — patrz `isPreviewBuild`.
  function loginToPreview(email: string, password: string) {
    if (!isPreviewBuild()) return "Logowanie zostanie uruchomione po podłączeniu bezpiecznej bazy danych.";
    const previewRole = matchPreviewAccount(email, password);
    if (!previewRole) return "Baza nie jest podłączona. Użyj konta podglądu albo skonfiguruj Supabase.";
    const workspace = buildPreviewWorkspace();
    setClients(workspace.clients);
    setTasks(workspace.tasks);
    setWorkoutPlans(workspace.plans);
    setAppointments(workspace.appointments);
    setInvitations(workspace.invitations);
    setTrainerNotifications([
      { id: "preview-note-1", title: "Nowy check-in", detail: "Anna Kowalska przesłała pomiary tygodniowe.", view: "checkins", read: false },
      { id: "preview-note-2", title: "Plan do przygotowania", detail: "Julia Wrona czeka na pierwszy plan treningowy.", view: "plans", read: false },
    ]);
    setPreviewMode(true);
    startHandoff();
    if (previewRole === "client") {
      setClientSession(workspace.clients.find((client) => client.id === previewClientId) ?? null);
      setRole("client");
      return null;
    }
    setRole("trainer");
    return null;
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return "Logowanie przez Google będzie dostępne po podłączeniu bazy danych.";
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Powrót na ten sam adres zachowuje kontekst aktywacji konta podopiecznego.
        redirectTo: `${window.location.origin}${window.location.pathname}`,
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) return "Nie udało się otworzyć logowania Google. Spróbuj ponownie.";
    return null;
  }

  async function login(email: string, password: string) {
    if (!email || !password) return "Uzupełnij adres e-mail i hasło.";
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return loginToPreview(email, password);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return "Nie udało się zalogować. Sprawdź dane i spróbuj ponownie.";
    const pendingInvitation = window.localStorage.getItem("movendo_pending_invitation");
    if (pendingInvitation) {
      const { error: claimError } = await supabase.rpc("claim_client_invitation", { invitation_code: pendingInvitation });
      if (!claimError) window.localStorage.removeItem("movendo_pending_invitation");
    }
    const session = await loadAccountSession(supabase, data.user.id, data.user.email ?? email);
    if (!session) return "To konto nie ma jeszcze profilu w systemie. Skontaktuj się z trenerem prowadzącym.";
    if (session.role === "client" && !session.clientRecord) return "Konto nie jest przypisane do trenera. Użyj kodu aktywacyjnego otrzymanego od trenera.";
    applySession(session);
    return null;
  }

  async function registerTrainer(name: string, email: string, password: string) {
    if (!name.trim() || !email || password.length < 8) return "Uzupełnij dane. Hasło musi mieć co najmniej 8 znaków.";
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return "Rejestracja zostanie uruchomiona po podłączeniu bezpiecznej bazy danych.";
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name, role: "trainer" } } });
    if (error) return "Nie udało się utworzyć konta. Ten adres może być już zajęty.";
    if (!data.session) return "INFO:Konto utworzone. Potwierdź adres e-mail, aby się zalogować.";
    const session = data.user ? await loadAccountSession(supabase, data.user.id, data.user.email ?? email) : null;
    applySession(session ?? { userId: data.user?.id ?? "", email, role: "trainer", fullName: name, clientRecord: null });
    return null;
  }

  async function resetPassword(email: string) {
    if (!email) return "Podaj adres e-mail.";
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/` });
      if (error) return "Nie udało się wysłać wiadomości. Spróbuj ponownie.";
    }
    return null;
  }

  async function validateCode(rawCode: string): Promise<{ info?: ActivationInfo; error?: string }> {
    const normalized = rawCode.trim().toUpperCase();
    if (normalized.length !== 12) return { error: "Kod musi mieć dokładnie 12 znaków." };
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.rpc("validate_client_invitation", { invitation_code: normalized });
      const result = Array.isArray(data) ? data[0] : data;
      if (error || !result?.valid) return { error: "Kod jest nieprawidłowy, wygasł albo został już wykorzystany." };
      return { info: { clientId: result.client_id, clientName: result.client_name, trainerName: result.trainer_name, code: normalized } };
    }
    const invitation = invitations.find((item) => item.code === normalized);
    if (!invitation || invitation.status !== "active") return { error: "Kod jest nieprawidłowy, wygasł albo został już wykorzystany." };
    return { info: { clientId: invitation.clientId, clientName: invitation.clientName, trainerName: invitation.trainerName, code: normalized } };
  }

  async function activateClient(info: ActivationInfo, email: string, password: string) {
    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { role: "client" } } });
      if (error) return "Nie udało się utworzyć konta. Ten adres może być już zajęty.";
      if (!data.session) {
        window.localStorage.setItem("movendo_pending_invitation", info.code);
        return "INFO:Konto utworzone. Potwierdź e-mail, a następnie zaloguj się — przypisanie do trenera dokończy się automatycznie.";
      }
      const { error: claimError } = await supabase.rpc("claim_client_invitation", { invitation_code: info.code });
      if (claimError) return "Konto powstało, ale nie udało się przypisać profilu. Skontaktuj się z trenerem.";
      setInvitations((current) => current.map((item) => item.code === info.code ? { ...item, status: "used" } : item));
      const session = data.user ? await loadAccountSession(supabase, data.user.id, data.user.email ?? email) : null;
      if (!session?.clientRecord) return "Konto powstało, ale profil podopiecznego nie jest jeszcze dostępny. Zaloguj się za chwilę.";
      applySession(session);
      return null;
    }
    setInvitations((current) => current.map((item) => item.code === info.code ? { ...item, status: "used" } : item));
    const matchedClient = clients.find((client) => client.id === info.clientId);
    if (matchedClient) setClientSession(matchedClient);
    setRole("client");
    return null;
  }

  async function logout() {
    const supabase = getSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    if (previewMode) {
      setPreviewMode(false);
      setClients([]);
      setTasks([]);
      setWorkoutPlans([]);
      setAppointments([]);
      setInvitations([]);
      setWorkoutHistory([]);
      setTrainerNotifications([]);
    }
    setRole(null);
    setClientSession(null);
    setActiveView("dashboard");
    setSelectedClient(null);
    setTrainerWorkout(null);
    updateRoute("dashboard", true);
  }

  async function createInvitation(client: Client) {
    const supabase = getSupabaseBrowserClient();
    let generatedCode = "";
    let expiresAt = "25.09.2026";
    if (supabase && /^[0-9a-f-]{36}$/i.test(client.id)) {
      const { data, error } = await supabase.rpc("generate_client_invitation", { target_client: client.id, validity_days: 30 });
      const result = Array.isArray(data) ? data[0] : data;
      if (error || !result?.code) {
        notify("Nie udało się wygenerować kodu. Spróbuj ponownie.");
        return null;
      }
      generatedCode = result.code;
      expiresAt = new Intl.DateTimeFormat("pl-PL").format(new Date(result.expires_at));
    } else {
      generatedCode = generateActivationCode();
    }
    const next: ClientInvitation = { clientId: client.id, clientName: client.name, trainerName: "Trener prowadzący", code: generatedCode, status: "active", createdAt: new Intl.DateTimeFormat("pl-PL").format(new Date()), expiresAt };
    setInvitations((current) => [...current.map((item) => item.clientId === client.id && item.status === "active" ? { ...item, status: "revoked" as const } : item), next]);
    setInviteDialog(next);
    return next;
  }

  async function copyText(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    notify(`${label} skopiowany`);
  }

  function updateRoute(path: string, replace = false) {
    const target = `#/${path}`;
    if (window.location.hash === target) return;
    window.history[replace ? "replaceState" : "pushState"]({}, "", target);
  }

  // „Dodaj trening” prowadzi wprost do wyboru terminu, a nie tylko do kalendarza.
  function openScheduling() {
    setCalendarIntent(true);
    navigate("calendar");
  }

  function navigate(view: View) {
    if (view !== "calendar") setCalendarIntent(false);
    setActiveView(view);
    setSelectedClient(null);
    setTrainerWorkout(null);
    setSelectedPlanId(null);
    setMobileMenu(false);
    setMoreNavigationOpen(false);
    updateRoute(view);
  }

  function openClient(clientId: string) {
    setActiveView("clients");
    setSelectedClient(clientId);
    setTrainerWorkout(null);
    setSelectedPlanId(null);
    setMobileMenu(false);
    updateRoute(`clients/${clientId}`);
  }

  function startTrainerWorkout(clientId: string) {
    const plan = workoutPlans.find((item) => item.clientId === clientId);
    const day = plan?.trainingDays[0];
    if (!plan || !day) {
      notify("Ten podopieczny nie ma jeszcze gotowego treningu");
      navigate("plans");
      return;
    }
    const route = { clientId, planId: plan.id, dayId: day.id };
    setTrainerWorkout(route);
    setSelectedClient(null);
    setSelectedPlanId(null);
    updateRoute(`workouts/${clientId}/${plan.id}/${day.id}`);
  }

  function openPlanForClient(clientId: string) {
    const plan = workoutPlans.find((item) => item.clientId === clientId);
    if (!plan) {
      notify("Ten podopieczny nie ma jeszcze przypisanego planu");
      navigate("plans");
      return;
    }
    setActiveView("plans");
    setSelectedPlanId(plan.id);
    setSelectedClient(null);
    setTrainerWorkout(null);
    updateRoute(`plans/${plan.id}`);
  }

  function openPlanById(planId: string) {
    setActiveView("plans");
    setSelectedPlanId(planId);
    setSelectedClient(null);
    setTrainerWorkout(null);
    updateRoute(`plans/${planId}`);
  }

  function scheduleAppointment(input: { id?: string; date: string; hour: number; clientId: string }) {
    setAppointments((current) => {
      const existing = input.id ? current.find((item) => item.id === input.id) : current.find((item) => item.date === input.date && item.hour === input.hour);
      const appointment: CalendarAppointment = {
        id: existing?.id ?? `a-${input.date}-${input.hour}-${Date.now()}`,
        clientId: input.clientId,
        date: input.date,
        hour: input.hour,
        kind: existing?.kind ?? "Trening personalny",
        status: existing?.status ?? "Zaplanowany",
      };
      return [...current.filter((item) => item.id !== appointment.id && !(item.date === input.date && item.hour === input.hour)), appointment];
    });
    setClients((current) => current.map((client) => client.id === input.clientId ? { ...client, nextSession: `${formatCalendarDate(input.date)}, ${String(input.hour).padStart(2, "0")}:00` } : client));
    const client = clients.find((item) => item.id === input.clientId);
    notify(`Trening z ${client?.name ?? "podopiecznym"} zapisany`);
  }

  function cancelAppointment(id: string) {
    setAppointments((current) => current.map((appointment) => appointment.id === id ? { ...appointment, status: "Anulowany" } : appointment));
    notify("Termin został anulowany i pozostaje w historii");
  }

  function deleteAppointment(id: string) {
    setAppointments((current) => current.filter((appointment) => appointment.id !== id));
    notify("Termin został usunięty");
  }

  function savePersonalPlan(plan: TrainingProgram, clientId: string) {
    setWorkoutPlans((current) => [plan, ...current.filter((item) => item.id !== plan.id && item.clientId !== clientId)]);
    setClients((current) => current.map((client) => client.id === clientId ? { ...client, plan: plan.name, progress: 0 } : client));
    notify("Plan został utworzony i przypisany podopiecznemu");
  }

  function updateWorkoutPlan(plan: TrainingProgram) {
    setWorkoutPlans((current) => current.map((item) => item.id === plan.id ? plan : item));
    setClients((current) => current.map((client) => client.id === plan.clientId ? { ...client, plan: plan.name } : client));
    notify("Zmiany w planie zostały zapisane");
  }

  function completeWorkout(completion: WorkoutCompletion) {
    setWorkoutHistory((current) => [completion, ...current]);
    setClients((current) => current.map((client) => client.id === completion.clientId ? { ...client, progress: Math.min(100, client.progress + 4), lastCheckin: "Trening zapisany teraz" } : client));
    if (clientSession?.id === completion.clientId) setClientSession((current) => current ? ({ ...current, progress: Math.min(100, current.progress + 4), lastCheckin: "Trening zapisany teraz" }) : current);
    notify("Trening zapisany. Wyniki są widoczne dla trenera.");
  }

  async function enablePhoneNotifications() {
    if (!("Notification" in window)) {
      notify("Ta przeglądarka nie obsługuje powiadomień telefonu");
      return false;
    }
    if (!window.isSecureContext) {
      notify("Powiadomienia ekranu blokady wymagają wersji online HTTPS");
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      notify("Zezwól na powiadomienia w ustawieniach przeglądarki");
      return false;
    }
    const registration = "serviceWorker" in navigator ? await navigator.serviceWorker.ready.catch(() => null) : null;
    if (registration) {
      await registration.showNotification("FutureBody Trainer", { body: "Powiadomienia treningowe są aktywne.", icon: "/icon-192.png", tag: "futurebody-test" });
    } else {
      new Notification("FutureBody Trainer", { body: "Powiadomienia treningowe są aktywne.", icon: "/icon-192.png" });
    }
    notify("Powiadomienia telefonu zostały aktywowane");
    return true;
  }

  function exportWeeklyReport(weekLabel = "Bieżący tydzień") {
    const completed = workoutHistory.length;
    downloadMovendoPdf({
      title: "Raport tygodniowy trenera",
      subtitle: `${weekLabel} | wygenerowano ${new Intl.DateTimeFormat("pl-PL").format(new Date())}`,
      filename: "FutureBody-raport-tygodniowy.pdf",
      metrics: [
        { label: "Podopieczni", value: String(clients.length) },
        { label: "Treningi w kalendarzu", value: String(appointments.length) },
        { label: "Ukończone treningi", value: String(completed) },
        { label: "Regularność", value: "91%" },
      ],
      sections: [
        { title: "Podsumowanie tygodnia", rows: ["Realizacja planów: 87%", "Frekwencja spotkań: 92%", "Odebrane check-iny: 78%", "Największy postęp: siła dolnej części ciała (+14%)"] },
        { title: "Podopieczni wymagający uwagi", rows: clients.slice(0, 6).map((client) => `${client.name} | ${client.goal} | plan: ${client.plan} | realizacja: ${client.progress}%`) },
        { title: "Najbliższe działania", rows: tasks.filter((task) => !task.done).slice(0, 8).map((task) => `${task.due} | ${task.title} | priorytet: ${task.priority}`) },
      ],
    });
    notify("Raport tygodniowy PDF został utworzony");
  }

  function exportAllData() {
    downloadMovendoPdf({
      title: "Eksport danych FutureBody Trainer",
      subtitle: `Kompletne podsumowanie | ${new Intl.DateTimeFormat("pl-PL").format(new Date())}`,
      filename: "FutureBody-eksport-danych.pdf",
      metrics: [
        { label: "Podopieczni", value: String(clients.length) },
        { label: "Programy", value: String(workoutPlans.length) },
        { label: "Terminy", value: String(appointments.length) },
        { label: "Treningi zapisane", value: String(workoutHistory.length) },
      ],
      sections: [
        { title: "Podopieczni", rows: clients.map((client) => `${client.name} | ${client.email || "brak e-mail"} | cel: ${client.goal} | plan: ${client.plan} | postęp: ${client.progress}%`) },
        { title: "Plany treningowe", rows: workoutPlans.map((plan) => `${plan.name} | ${plan.days} dni | ${plan.exercises} ćwiczeń | ${plan.duration} | realizacja: ${plan.completion}%`) },
        { title: "Historia kalendarza", rows: [...appointments].sort((a, b) => `${a.date}-${a.hour}`.localeCompare(`${b.date}-${b.hour}`)).map((item) => { const client = clients.find((candidate) => candidate.id === item.clientId); return `${formatCalendarDate(item.date)} ${String(item.hour).padStart(2, "0")}:00 | ${client?.name ?? "Podopieczny"}`; }) },
      ],
    });
    notify("Czytelny eksport danych PDF został pobrany");
  }

  const normalizedQuery = query.trim().toLowerCase();
  const searchResults = normalizedQuery ? [
    ...clients.filter((client) => `${client.name} ${client.goal} ${client.plan}`.toLowerCase().includes(normalizedQuery)).slice(0, 4).map((client) => ({ id: `client-${client.id}`, title: client.name, detail: `${client.goal} · ${client.plan}`, icon: Users, clientId: client.id })),
    ...workoutPlans.filter((plan) => `${plan.name} ${plan.category}`.toLowerCase().includes(normalizedQuery)).slice(0, 3).map((plan) => ({ id: `plan-${plan.id}`, title: plan.name, detail: `Plan treningowy · ${plan.days} dni`, icon: Dumbbell, view: "plans" as View })),
    ...tasks.filter((task) => `${task.title} ${task.category}`.toLowerCase().includes(normalizedQuery)).slice(0, 3).map((task) => ({ id: `task-${task.id}`, title: task.title, detail: `Zadanie · ${task.due}`, icon: CheckCircle2, view: "tasks" as View })),
    ...[...primaryNavigation, ...secondaryNavigation].filter((item) => item.label.toLowerCase().includes(normalizedQuery)).slice(0, 3).map((item) => ({ id: `view-${item.id}`, title: item.label, detail: "Przejdź do modułu", icon: item.icon, view: item.id })),
  ].slice(0, 8) : [];

  function openSearchResult(result: (typeof searchResults)[number]) {
    setQuery("");
    setSearchFocused(false);
    if ("clientId" in result && result.clientId) {
      openClient(result.clientId);
    } else if ("view" in result && result.view) {
      navigate(result.view);
    }
  }

  function openTrainerNotification(item: TrainerNotification) {
    setTrainerNotifications((current) => current.map((notification) => notification.id === item.id ? { ...notification, read: true } : notification));
    setNotificationsOpen(false);
    navigate(item.view);
  }

  const currentClient = clients.find((client) => client.id === selectedClient) ?? null;
  const trainerWorkoutClient = trainerWorkout ? clients.find((client) => client.id === trainerWorkout.clientId) ?? null : null;
  const trainerWorkoutPlan = trainerWorkout ? workoutPlans.find((plan) => plan.id === trainerWorkout.planId && plan.clientId === trainerWorkout.clientId) ?? null : null;
  const trainerWorkoutDay = trainerWorkoutPlan && trainerWorkout ? trainerWorkoutPlan.trainingDays.find((day) => day.id === trainerWorkout.dayId) ?? null : null;
  const secondaryActive = secondaryNavigation.some((item) => item.id === activeView) && !selectedClient && !trainerWorkout;
  const focusedFlow = Boolean(trainerWorkout || selectedPlanId);

  if (booting) return <FutureBodySplash/>;
  if (!role) return <LoginScreen initialCode={initialActivationCode} onLogin={login} onRegisterTrainer={registerTrainer} onResetPassword={resetPassword} onValidateCode={validateCode} onActivateClient={activateClient} onGoogleSignIn={signInWithGoogle} showPreviewAccounts={!isSupabaseConfigured() && isPreviewBuild()} />;
  if (role === "client" && clientSession) return <ClientPortal client={clientSession} program={workoutPlans.find((plan) => plan.clientId === clientSession.id)} completedWorkouts={workoutHistory.filter((entry) => entry.clientId === clientSession.id).length} onComplete={completeWorkout} onLogout={logout} notify={notify} previewMode={previewMode} />;
  if (role === "client") return <LoginScreen initialCode={initialActivationCode} onLogin={login} onRegisterTrainer={registerTrainer} onResetPassword={resetPassword} onValidateCode={validateCode} onActivateClient={activateClient} onGoogleSignIn={signInWithGoogle} showPreviewAccounts={!isSupabaseConfigured() && isPreviewBuild()} />;

  return (
    <div className="futurebody-app futurebody-app-enter min-h-[100svh] bg-[#050505] text-[#f7f7f7]">
      {handoff ? <div className="futurebody-handoff"><img src="/futurebody-mark-transparent-v1.png" alt="" /></div> : null}
      {mobileMenu ? <button className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden" onClick={() => setMobileMenu(false)} aria-label="Zamknij menu" /> : null}
      <aside className={`fb-dark-surface fixed inset-y-0 left-0 z-50 w-[268px] flex-col border-r border-white/[0.07] bg-[#0b0b0d] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-white transition-transform duration-300 ${focusedFlow ? "hidden" : "flex lg:translate-x-0"} ${mobileMenu ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center gap-3 px-2 pb-6">
          <img src="/futurebody-logo.png" alt="FutureBody Trainer" className="h-11 w-11 rounded-[14px] object-cover ring-1 ring-white/15" />
          <div className="min-w-0"><p className="truncate text-[13px] font-black tracking-[0.16em]">FUTUREBODY</p><p className="text-[8px] uppercase tracking-[0.38em] text-white/32">Trainer</p></div>
          <button className="ml-auto text-white/60 lg:hidden" onClick={() => setMobileMenu(false)}><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 [scrollbar-width:none]">
          <div className="mb-4">
            <p className="mb-2 px-3 text-[9px] font-black uppercase tracking-[0.2em] text-white/25">Główne</p>
            <nav className="space-y-0.5">
              {primaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id && !selectedClient && !trainerWorkout;
                return (
                  <button key={item.id} onClick={() => navigate(item.id)} className={`flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-left text-[12px] font-semibold transition ${active ? "bg-[#ffc400] text-[#050505] shadow-[0_8px_26px_rgba(255,196,0,.12)]" : "text-white/54 hover:bg-white/[0.06] hover:text-white"}`}>
                    <Icon size={16} strokeWidth={active ? 2.5 : 1.8} /><span className="min-w-0 flex-1 truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
          <button onClick={() => setMoreNavigationOpen((current) => !current)} className={`mb-2 flex h-11 w-full items-center gap-3 rounded-[14px] px-3 text-left text-[12px] font-semibold transition ${secondaryActive ? "bg-white/[0.09] text-white" : "text-white/54 hover:bg-white/[0.06] hover:text-white"}`} aria-expanded={moreNavigationOpen || secondaryActive}>
            <MoreHorizontal size={16} /><span className="min-w-0 flex-1">Więcej</span><ChevronRight size={14} className={`transition-transform ${moreNavigationOpen || secondaryActive ? "rotate-90" : ""}`}/>
          </button>
          {moreNavigationOpen || secondaryActive ? (
            <nav className="mb-5 space-y-0.5 border-l border-white/10 pl-2">
              {secondaryNavigation.map((item) => {
                const Icon = item.icon;
                const active = activeView === item.id && !selectedClient && !trainerWorkout;
                return (
                  <button key={item.id} onClick={() => navigate(item.id)} className={`flex h-10 w-full items-center gap-3 rounded-[13px] px-3 text-left text-[11px] font-semibold transition ${active ? "bg-[#ffc400] text-[#050505]" : "text-white/48 hover:bg-white/[0.06] hover:text-white"}`}>
                    <Icon size={15} /><span className="min-w-0 flex-1 truncate">{item.label}</span>{item.count ? <span className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[8px] font-black ${active ? "bg-[#050505] text-[#ffc400]" : "bg-white/12 text-white"}`}>{item.count}</span> : null}
                  </button>
                );
              })}
            </nav>
          ) : null}
        </div>
        {previewMode ? <p className="mb-2 rounded-[14px] border border-dashed border-[#ffc400]/35 bg-[#ffc400]/[0.07] px-3 py-2 text-[9px] font-black uppercase tracking-[0.11em] text-[#ffc400]">Tryb podglądu · dane tylko do recenzji</p> : null}
        <div className="rounded-[18px] border border-white/[0.07] bg-[#111214] p-3">
          <div className="flex items-center gap-3"><Avatar initials="TR" size="sm" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">Konto trenera</p><p className="truncate text-[9px] text-white/35">{previewMode ? "Konto podglądu" : "Trener"}</p></div><button onClick={logout} className="text-white/35 hover:text-white" aria-label="Wyloguj"><LogOut size={16} /></button></div>
        </div>
      </aside>

      <div className={`min-h-screen ${focusedFlow ? "" : "lg:pl-[268px]"}`}>
        <header className={`fb-dark-surface sticky top-0 z-30 h-[calc(72px+env(safe-area-inset-top))] items-end border-b border-white/[0.07] bg-[#050505]/90 px-4 pb-4 pt-[env(safe-area-inset-top)] text-white backdrop-blur-xl sm:px-7 lg:h-[72px] lg:items-center lg:pb-0 lg:pt-0 lg:px-9 ${focusedFlow ? "hidden" : "flex"}`}>
          <button className="mr-3 grid h-11 w-11 place-items-center rounded-[14px] bg-[#ffc400] text-[#050505] lg:hidden" onClick={() => setMobileMenu(true)} aria-label="Otwórz menu"><Menu size={18} /></button>
          <div className="relative hidden w-full max-w-[430px] sm:block">
            <div className="flex items-center gap-2.5 rounded-[16px] border border-white/[0.07] bg-[#111214] px-4 py-2.5"><Search size={16} className="text-white/30" /><input ref={searchInputRef} value={query} onFocus={() => setSearchFocused(true)} onChange={(event) => { setQuery(event.target.value); setSearchFocused(true); }} placeholder="Szukaj podopiecznego, planu, zadania…" className="min-w-0 flex-1 bg-transparent text-xs text-white outline-none placeholder:text-white/28" /><span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[9px] text-white/30">Ctrl K</span></div>
            {searchFocused && query.trim() ? <div className="ui-popover absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-[22px] border border-black/10 bg-white p-2 shadow-2xl"><p className="px-3 py-2 text-[8px] font-black uppercase tracking-wider text-black/30">Wyniki wyszukiwania</p>{searchResults.length ? searchResults.map((result) => { const Icon = result.icon; return <button key={result.id} onMouseDown={(event) => event.preventDefault()} onClick={() => openSearchResult(result)} className="flex w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[#f3f3f1]"><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><Icon size={14} /></span><span className="min-w-0"><span className="block truncate text-xs font-black">{result.title}</span><span className="block truncate text-[9px] text-black/38">{result.detail}</span></span></button>; }) : <div className="px-3 py-6 text-center text-xs text-black/38">Brak wyników. Spróbuj innego hasła.</div>}</div> : null}
          </div>
          <div className="ml-auto flex items-center gap-2"><span className="hidden text-right sm:block"><span className="block text-[11px] font-bold">{new Intl.DateTimeFormat("pl-PL", { weekday: "long", day: "numeric", month: "long" }).format(new Date())}</span><span className="block text-[9px] text-white/34">Warszawa</span></span><div className="relative"><button onClick={() => { setNotificationsOpen((current) => !current); setSearchFocused(false); }} className="relative grid h-11 w-11 place-items-center rounded-[14px] border border-white/[0.07] bg-[#111214]" aria-label="Powiadomienia"><Bell size={17} />{trainerNotifications.some((item) => !item.read) ? <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-[#ffc400] ring-2 ring-[#111214]" /> : null}</button>{notificationsOpen ? <div className="ui-popover absolute right-0 top-13 z-50 w-[min(360px,calc(100vw-32px))] overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#111214] shadow-2xl"><div className="flex items-center justify-between border-b border-white/[0.07] p-4"><div><p className="text-sm font-black">Powiadomienia</p><p className="text-[9px] text-white/35">{trainerNotifications.filter((item) => !item.read).length} nieprzeczytane</p></div><button onClick={() => setTrainerNotifications((current) => current.map((item) => ({ ...item, read: true })))} className="text-[8px] font-black uppercase tracking-wider text-[#ffc400]">Oznacz wszystkie</button></div><div className="max-h-[360px] overflow-auto p-2">{trainerNotifications.map((item) => <button key={item.id} onClick={() => openTrainerNotification(item)} className={`flex w-full gap-3 rounded-2xl p-3 text-left ${item.read ? "opacity-45" : "bg-white/[0.045]"}`}><span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.read ? "bg-white/15" : "bg-[#ffc400]"}`} /><span><span className="block text-xs font-black">{item.title}</span><span className="mt-1 block text-[9px] leading-4 text-white/40">{item.detail}</span></span></button>)}</div><button onClick={enablePhoneNotifications} className="flex w-full items-center justify-center gap-2 border-t border-white/[0.07] px-4 py-3 text-[9px] font-black uppercase tracking-wider"><Bell size={13} />Włącz powiadomienia telefonu</button></div> : null}</div><button onClick={() => navigate("settings")}><Avatar initials="ŁK" size="sm" dark /></button></div>
        </header>

        {!focusedFlow ? <button onClick={() => setSearchFocused(true)} className="fixed right-[7.5rem] top-[max(.85rem,env(safe-area-inset-top))] z-40 grid h-11 w-11 place-items-center rounded-[14px] border border-white/[0.07] bg-[#111214] text-white sm:hidden" aria-label="Otwórz wyszukiwanie"><Search size={17}/></button> : null}
        {searchFocused ? <div className="fixed inset-0 z-[75] bg-black/60 p-3 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm sm:hidden"><button className="absolute inset-0" onClick={() => setSearchFocused(false)} aria-label="Zamknij wyszukiwanie"/><section role="dialog" aria-modal="true" aria-label="Wyszukiwanie" className="relative rounded-[24px] bg-white p-3 shadow-2xl"><div className="flex h-12 items-center gap-3 rounded-2xl bg-[#f3f3f1] px-4"><Search size={16} className="text-black/30"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Podopieczny, plan, zadanie…"/><button onClick={() => { setQuery(""); setSearchFocused(false); }} className="grid h-9 w-9 place-items-center rounded-full bg-white" aria-label="Zamknij"><X size={15}/></button></div><div className="mt-2 max-h-[65svh] overflow-auto">{query.trim() ? searchResults.length ? searchResults.map((result) => { const Icon = result.icon; return <button key={result.id} onClick={() => openSearchResult(result)} className="flex min-h-14 w-full items-center gap-3 rounded-2xl p-3 text-left hover:bg-[#f3f3f1]"><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><Icon size={14}/></span><span className="min-w-0"><span className="block truncate text-xs font-black">{result.title}</span><span className="block truncate text-[9px] text-black/38">{result.detail}</span></span></button>; }) : <p className="px-3 py-8 text-center text-xs text-black/38">Brak wyników</p> : <p className="px-3 py-8 text-center text-xs text-black/38">Zacznij wpisywać imię podopiecznego, nazwę planu lub zadania.</p>}</div></section></div> : null}

        <main className={`mx-auto max-w-[1540px] px-[max(1rem,env(safe-area-inset-left))] pt-7 sm:px-7 lg:px-9 lg:pt-9 ${focusedFlow ? "pb-[max(2rem,env(safe-area-inset-bottom))]" : "pb-[calc(10rem+env(safe-area-inset-bottom))] md:pb-12"}`}>
          <div key={trainerWorkout?.dayId ?? currentClient?.id ?? selectedPlanId ?? activeView} className="ui-view">
          {trainerWorkout && trainerWorkoutClient && trainerWorkoutPlan && trainerWorkoutDay ? (
            <ClientWorkout
              clientId={trainerWorkoutClient.id}
              clientName={trainerWorkoutClient.name}
              plan={trainerWorkoutPlan}
              day={trainerWorkoutDay}
              onBack={() => navigate("dashboard")}
              onComplete={(completion) => { completeWorkout(completion); navigate("dashboard"); }}
            />
          ) : currentClient ? (
            <ClientProfile
              client={currentClient}
              invitation={invitations.find((item) => item.clientId === currentClient.id && item.status === "active")}
              onBack={() => navigate("clients")}
              onAction={(type) => setModal(type)}
              onOpenCalendar={() => navigate("calendar")}
              onOpenPlan={() => openPlanForClient(currentClient.id)}
              onStartWorkout={() => startTrainerWorkout(currentClient.id)}
              onNewInvitation={() => createInvitation(currentClient)}
              onCopy={copyText}
              notify={notify}
            />
          ) : (
            <ViewRenderer view={activeView} clients={clients} setClients={setClients} query={query} onClient={openClient} onStartWorkout={startTrainerWorkout} onOpenPlan={openPlanById} onNavigate={navigate} onAddWorkout={openScheduling} calendarIntent={calendarIntent} selectedPlanId={selectedPlanId} tasks={tasks} setTasks={setTasks} onModal={setModal} notify={notify} selectedConversation={selectedConversation} setSelectedConversation={setSelectedConversation} chatMessages={chatMessages} setChatMessages={setChatMessages} message={message} setMessage={setMessage} appointments={appointments} onSchedule={scheduleAppointment} onCancelAppointment={cancelAppointment} onDeleteAppointment={deleteAppointment} workoutPlans={workoutPlans} workoutHistory={workoutHistory} onSavePlan={savePersonalPlan} onUpdatePlan={updateWorkoutPlan} onExportWeekly={exportWeeklyReport} onExportAll={exportAllData} onEnablePhoneNotifications={enablePhoneNotifications} themePreference={themePreference} onThemeChange={setThemePreference} />
          )}
          </div>
        </main>
      </div>

      {!focusedFlow ? <nav className="fb-dark-surface fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 flex items-center justify-around rounded-[22px] border border-white/[0.08] bg-[#0b0b0d]/95 px-2 py-2 text-white shadow-[0_18px_50px_rgba(0,0,0,.45)] backdrop-blur-xl md:hidden">
        {primaryNavigation.map((item) => { const Icon = item.icon; const active = activeView === item.id && !selectedClient && !trainerWorkout; return <button key={item.id} onClick={() => navigate(item.id)} className={`flex min-h-12 min-w-[52px] flex-col items-center justify-center gap-1 rounded-[16px] px-1.5 py-1.5 text-[8px] font-bold ${active ? "bg-[#ffc400] text-[#050505]" : "text-white/42"}`}><Icon size={17} /><span>{item.label}</span></button>; })}
        <button onClick={() => { setMoreNavigationOpen(true); setMobileMenu(true); }} className={`flex min-h-12 min-w-[52px] flex-col items-center justify-center gap-1 rounded-[16px] px-1.5 py-1.5 text-[8px] font-bold ${secondaryActive ? "bg-[#ffc400] text-[#050505]" : "text-white/42"}`}><MoreHorizontal size={17}/><span>Więcej</span></button>
      </nav> : null}

      {modal ? <ActionModal type={modal} onClose={() => setModal(null)} onSave={(payload) => {
        if (modal === "client" && payload.name) {
          const names = payload.name.split(" ");
          const newClient: Client = { id: `c${Date.now()}`, name: payload.name, initials: names.map((part) => part[0]).join("").slice(0, 2).toUpperCase(), email: payload.email || "", phone: payload.phone || "", status: "Aktywny", goal: payload.goal || "Cel do ustalenia", plan: "Brak planu", nextSession: "Brak terminu", progress: 0, joined: "26.08.2026", lastCheckin: "Brak", weight: "—", bodyFat: "—", attendance: "—", tags: ["Nowy podopieczny"] };
          setClients((current) => [newClient, ...current]);
          createInvitation(newClient);
        } else {
          notify("Zapisano zmiany");
        }
        setModal(null);
      }} /> : null}
      {inviteDialog ? <InvitationDialog invitation={inviteDialog} onClose={() => setInviteDialog(null)} onCopy={copyText} /> : null}
      {toast ? <div className="ui-toast fixed bottom-24 right-4 z-[70] flex items-center gap-2 rounded-[16px] border border-white/10 bg-[#17181b] px-4 py-3 text-xs font-bold text-white shadow-2xl lg:bottom-6"><Check size={15} className="text-[#ffc400]"/> {toast}</div> : null}
    </div>
  );
}

function ViewRenderer(props: {
  view: View; clients: Client[]; setClients: React.Dispatch<React.SetStateAction<Client[]>>; query: string; onClient: (id: string) => void;
  onStartWorkout: (clientId: string) => void; onOpenPlan: (planId: string) => void; onNavigate: (view: View) => void;
  selectedPlanId: string | null; onAddWorkout: () => void; calendarIntent: boolean;
  tasks: typeof initialTasks; setTasks: React.Dispatch<React.SetStateAction<typeof initialTasks>>; onModal: (type: ModalType) => void; notify: (text: string) => void;
  selectedConversation: string; setSelectedConversation: (id: string) => void; chatMessages: string[]; setChatMessages: React.Dispatch<React.SetStateAction<string[]>>; message: string; setMessage: (value: string) => void;
  appointments: CalendarAppointment[]; onSchedule: (input: { id?: string; date: string; hour: number; clientId: string }) => void;
  onCancelAppointment: (id: string) => void; onDeleteAppointment: (id: string) => void;
  workoutPlans: TrainingProgram[]; onSavePlan: (plan: TrainingProgram, clientId: string) => void; onUpdatePlan: (plan: TrainingProgram) => void;
  workoutHistory: WorkoutCompletion[]; onExportWeekly: (weekLabel?: string) => void; onExportAll: () => void; onEnablePhoneNotifications: () => Promise<boolean>;
  themePreference: ThemePreference; onThemeChange: (theme: ThemePreference) => void;
}) {
  switch (props.view) {
    case "dashboard": return <Dashboard clients={props.clients} appointments={props.appointments} tasks={props.tasks} onModal={props.onModal} onClient={props.onClient} onStartWorkout={props.onStartWorkout} onNavigate={props.onNavigate} onAddWorkout={props.onAddWorkout} />;
    case "clients": return <ClientsView clients={props.clients} query={props.query} onClient={props.onClient} onAdd={() => props.onModal("client")} />;
    case "calendar": return <CalendarView clients={props.clients} appointments={props.appointments} onSchedule={props.onSchedule} onOpenClient={props.onClient} onStartWorkout={props.onStartWorkout} onCancel={props.onCancelAppointment} onDelete={props.onDeleteAppointment} autoSchedule={props.calendarIntent} />;
    case "plans": return <PlansView clients={props.clients} workoutPlans={props.workoutPlans} initialPlanId={props.selectedPlanId} onOpenDetail={props.onOpenPlan} onCloseDetail={() => props.onNavigate("plans")} onSavePlan={props.onSavePlan} onUpdatePlan={props.onUpdatePlan} notify={props.notify} />;
    case "exercises": return <ExercisesView />;
    case "progress": return <ProgressView clients={props.clients} workoutHistory={props.workoutHistory} onMeasurement={() => props.onModal("measurement")} />;
    case "checkins": return <CheckinsView notify={props.notify} />;
    case "messages": return <MessagesView selected={props.selectedConversation} onSelect={props.setSelectedConversation} messages={props.chatMessages} setMessages={props.setChatMessages} message={props.message} setMessage={props.setMessage} />;
    case "tasks": return <TasksView tasks={props.tasks} setTasks={props.setTasks} />;
    case "automations": return <AutomationsView notify={props.notify} />;
    case "materials": return <MaterialsView notify={props.notify} />;
    case "reports": return <ReportsView clients={props.clients} appointments={props.appointments} workoutHistory={props.workoutHistory} onExport={props.onExportWeekly} />;
    case "settings": return <SettingsView notify={props.notify} onExport={props.onExportAll} onEnablePhoneNotifications={props.onEnablePhoneNotifications} themePreference={props.themePreference} onThemeChange={props.onThemeChange} />;
  }
}

function Dashboard({ clients, appointments, tasks, onModal, onClient, onStartWorkout, onNavigate, onAddWorkout }: { clients: Client[]; appointments: CalendarAppointment[]; tasks: typeof initialTasks; onModal: (type: ModalType) => void; onClient: (id: string) => void; onStartWorkout: (id: string) => void; onNavigate: (view: View) => void; onAddWorkout: () => void }) {
  const today = appointments.filter((item) => item.date === dateKey(new Date())).sort((a, b) => a.hour - b.hour);
  const nextAppointment = today.find((item) => item.hour >= new Date().getHours()) ?? today[0];
  const nextClient = nextAppointment ? clients.find((client) => client.id === nextAppointment.clientId) ?? null : null;
  const openTasks = tasks.filter((task) => !task.done).slice(0, 4);
  const clientsWithoutPlan = clients.filter((client) => client.plan === "Brak planu");
  return (
    <>
      <PageHeader title="Dzień dobry." subtitle={`Dzisiaj: ${today.length} ${today.length === 1 ? "trening" : today.length >= 2 && today.length <= 4 ? "treningi" : "treningów"}. Najważniejsze działania masz poniżej.`} action="Dodaj podopiecznego" onAction={() => onModal("client")} />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Szybkie akcje">
        <button onClick={onAddWorkout} className={`${cardClass} flex min-h-20 items-center gap-4 p-4 text-left transition hover:-translate-y-0.5`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><CalendarPlus size={18}/></span><span><span className="block text-xs font-black">Dodaj trening</span><span className="mt-1 block text-[10px] text-black/38">Od razu wybierz podopiecznego i godzinę</span></span></button>
        <button onClick={() => onModal("client")} className={`${cardClass} flex min-h-20 items-center gap-4 p-4 text-left transition hover:-translate-y-0.5`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><UserPlus size={18}/></span><span><span className="block text-xs font-black">Dodaj klienta</span><span className="mt-1 block text-[10px] text-black/38">Utwórz profil i kod dostępu</span></span></button>
        <button onClick={() => onNavigate("plans")} className={`${cardClass} flex min-h-20 items-center gap-4 p-4 text-left transition hover:-translate-y-0.5`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><Dumbbell size={18}/></span><span><span className="block text-xs font-black">Utwórz plan</span><span className="mt-1 block text-[10px] text-black/38">Przejdź do planów treningowych</span></span></button>
        <button onClick={() => onNavigate("calendar")} className={`${cardClass} flex min-h-20 items-center gap-4 p-4 text-left transition hover:-translate-y-0.5`}><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-black text-white"><CalendarDays size={18}/></span><span><span className="block text-xs font-black">Otwórz kalendarz</span><span className="mt-1 block text-[10px] text-black/38">Dzień, tydzień i historia</span></span></button>
      </section>

      {nextAppointment && nextClient ? <section className="fb-dark-surface mt-4 overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#0b0b0d] p-5 text-white shadow-[0_18px_50px_rgba(0,0,0,.16)] sm:p-7"><div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"><div className="flex min-w-0 items-start gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-[#ffc400] text-xl font-black text-[#050505]">{String(nextAppointment.hour).padStart(2, "0")}</span><div className="min-w-0"><p className="text-[9px] font-black uppercase tracking-[0.16em] text-white/38">Najbliższy trening · dziś {String(nextAppointment.hour).padStart(2, "0")}:00</p><h2 className="mt-2 truncate text-2xl font-black tracking-[-0.04em] sm:text-3xl">{nextClient.name}</h2><p className="mt-1 text-xs text-white/45">{nextClient.plan} · {nextAppointment.kind ?? "Trening personalny"} · 60 min</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => onClient(nextClient.id)} className="h-11 rounded-full border border-white/15 px-5 text-[10px] font-black uppercase tracking-wider">Otwórz klienta</button><button onClick={() => onStartWorkout(nextClient.id)} className="h-11 rounded-full bg-[#ffc400] px-6 text-[10px] font-black uppercase tracking-wider text-[#050505]">Rozpocznij trening</button></div></div></section> : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.35fr_.85fr]">
        <section className={cardClass}>
          <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4 sm:px-6"><div><h2 className="font-black">Dzisiaj</h2><p className="text-[11px] text-black/36">Treningi pochodzą z kalendarza</p></div><button onClick={() => onNavigate("calendar")} className="text-[9px] font-black uppercase tracking-wider">Pełny kalendarz</button></div>
          {today.length ? <div className="divide-y divide-black/[0.055]">{today.map((item) => { const client = clients.find((person) => person.id === item.clientId); if (!client) return null; const isNext = item.id === nextAppointment?.id; return <div key={item.id} className="grid grid-cols-[54px_1fr] items-center gap-3 px-5 py-4 sm:grid-cols-[62px_40px_1fr_auto] sm:px-6"><div><p className="text-sm font-black">{String(item.hour).padStart(2, "0")}:00</p><p className="text-[9px] text-black/32">60 min</p></div><div className="hidden sm:block"><Avatar initials={client.initials}/></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><button onClick={() => onClient(client.id)} className="truncate text-left text-sm font-black hover:underline">{client.name}</button>{isNext ? <Badge tone="dark">Następny</Badge> : <Badge>{item.status ?? "Zaplanowany"}</Badge>}</div><p className="truncate text-[10px] text-black/38">{client.plan}</p></div><button onClick={() => onStartWorkout(client.id)} className="col-span-2 mt-1 h-11 rounded-full bg-black px-4 text-[9px] font-black uppercase text-white sm:col-span-1 sm:mt-0">Start</button></div>; })}</div> : <div className="p-7 text-center"><CalendarDays size={22} className="mx-auto text-black/25"/><p className="mt-3 text-sm font-black">Nie masz dziś zaplanowanych treningów</p><button onClick={onAddWorkout} className="mt-4 h-11 rounded-full bg-black px-5 text-[9px] font-black uppercase text-white">Dodaj trening</button></div>}
        </section>
        <section className={`${cardClass} overflow-hidden`}><div className="border-b border-black/[0.06] px-5 py-4"><h2 className="font-black">Do zrobienia</h2><p className="text-[11px] text-black/36">Sprawy wymagające uwagi</p></div><div className="divide-y divide-black/[0.055]">{clientsWithoutPlan.slice(0, 2).map((client) => <button key={client.id} onClick={() => onClient(client.id)} className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left"><span className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-amber-800"><Dumbbell size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{client.name} nie ma planu</span><span className="mt-1 block text-[9px] text-black/36">Otwórz profil i przypisz program</span></span><ChevronRight size={14}/></button>)}{openTasks.map((task) => <button key={task.id} onClick={() => onNavigate("tasks")} className="flex min-h-16 w-full items-center gap-3 px-5 py-3 text-left"><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><CheckCircle2 size={15}/></span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{task.title}</span><span className="mt-1 block text-[9px] text-black/36">{task.due} · {task.category}</span></span><Badge tone={task.priority === "Wysoki" ? "bad" : task.priority === "Średni" ? "warn" : "neutral"}>{task.priority}</Badge></button>)}</div></section>
      </div>
      <section className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"><article className={`${cardClass} p-4`}><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Aktywni klienci</p><p className="mt-3 text-2xl font-black">{clients.filter((client) => client.status === "Aktywny").length}</p></article><article className={`${cardClass} p-4`}><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Treningi dziś</p><p className="mt-3 text-2xl font-black">{today.length}</p></article><article className={`${cardClass} p-4`}><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Otwarte zadania</p><p className="mt-3 text-2xl font-black">{tasks.filter((task) => !task.done).length}</p></article><article className={`${cardClass} p-4`}><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Bez planu</p><p className="mt-3 text-2xl font-black">{clientsWithoutPlan.length}</p></article></section>
    </>
  );
}

function ClientsView({ clients, query, onClient, onAdd }: { clients: Client[]; query: string; onClient: (id: string) => void; onAdd: () => void }) {
  const filtered = clients.filter((client) => `${client.name} ${client.goal} ${client.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeader title="Podopieczni" subtitle={`${clients.filter((c) => c.status === "Aktywny").length} aktywnych · ${clients.length} wszystkich profili`} action="Dodaj podopiecznego" onAction={onAdd} secondary={<button className="h-11 rounded-full border border-black/10 bg-white px-4 text-xs font-bold"><Filter size={14} className="mr-2 inline" />Filtry</button>} /><div className={`${cardClass} overflow-hidden`}><div className="hidden grid-cols-[1.25fr_1.25fr_.8fr_.6fr_32px] gap-4 border-b border-black/[0.06] px-6 py-3 text-[9px] font-black uppercase tracking-[0.12em] text-black/32 md:grid"><span>Podopieczny</span><span>Cel i plan</span><span>Następny trening</span><span>Realizacja</span><span /></div>{filtered.map((client) => <button key={client.id} onClick={() => onClient(client.id)} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 border-b border-black/[0.055] px-4 py-4 text-left last:border-0 hover:bg-black/[0.015] md:grid-cols-[1.25fr_1.25fr_.8fr_.6fr_32px] md:px-6"><div className="flex min-w-0 items-center gap-3"><Avatar initials={client.initials} dark={client.status === "Aktywny"} /><div className="min-w-0"><p className="truncate text-sm font-bold">{client.name}</p><div className="mt-1"><Badge tone={client.status === "Aktywny" ? "good" : client.status === "Do kontaktu" ? "warn" : "neutral"}>{client.status}</Badge></div></div></div><div className="hidden min-w-0 md:block"><p className="truncate text-xs font-bold">{client.goal}</p><p className="truncate text-[10px] text-black/36">{client.plan}</p></div><div className="hidden md:block"><p className="text-xs font-bold">{client.nextSession}</p></div><div className="hidden md:block"><p className="mb-2 text-xs font-black">{client.progress}%</p><ProgressBar value={client.progress} /></div><ChevronRight size={16} className="text-black/28" /></button>)}</div></>;
}


function ClientProfile({ client, invitation, onBack, onAction, onOpenCalendar, onOpenPlan, onStartWorkout, onNewInvitation, onCopy, notify }: { client: Client; invitation?: ClientInvitation; onBack: () => void; onAction: (type: ModalType) => void; onOpenCalendar: () => void; onOpenPlan: () => void; onStartWorkout: () => void; onNewInvitation: () => void; onCopy: (value: string, label: string) => void; notify: (text: string) => void }) {
  const [tab, setTab] = useState<"overview" | "plan" | "history" | "progress" | "notes">("overview");
  const [note, setNote] = useState("");
  const profileTabs = [
    ["overview", "Przegląd"],
    ["plan", "Plan"],
    ["history", "Historia"],
    ["progress", "Postępy"],
    ["notes", "Notatki"],
  ] as const;

  return <>
    <button onClick={onBack} className="mb-5 flex min-h-11 items-center gap-2 text-xs font-black text-black/44 hover:text-black"><ChevronLeft size={15}/>Wróć do podopiecznych</button>
    <header className="mb-5 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div className="flex min-w-0 items-center gap-4"><Avatar initials={client.initials} size="lg" dark/><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h1 className="truncate text-3xl font-black tracking-[-0.05em] sm:text-4xl">{client.name}</h1><Badge tone="good">{client.status}</Badge></div><p className="mt-1 truncate text-sm text-black/40">{client.goal} · {client.email}</p></div></div><div className="flex flex-wrap gap-2"><button onClick={() => notify("Rozmowa z podopiecznym została otwarta")} className="h-11 rounded-full border border-black/10 bg-white px-4 text-[10px] font-black uppercase"><MessageCircle size={14} className="mr-2 inline"/>Wiadomość</button><button onClick={onOpenCalendar} className="h-11 rounded-full border border-black/10 bg-white px-4 text-[10px] font-black uppercase"><CalendarPlus size={14} className="mr-2 inline"/>Umów</button><button onClick={onStartWorkout} className="h-11 rounded-full bg-black px-5 text-[10px] font-black uppercase text-white"><Dumbbell size={14} className="mr-2 inline"/>Rozpocznij trening</button></div></header>

    <nav className="mb-5 flex gap-1 overflow-x-auto rounded-2xl bg-[#eeeeec] p-1 [scrollbar-width:none]" aria-label="Sekcje profilu podopiecznego">{profileTabs.map(([id, label]) => <button key={id} onClick={() => setTab(id)} className={`min-h-11 whitespace-nowrap rounded-xl px-4 text-[9px] font-black uppercase tracking-wider ${tab === id ? "fb-selected" : "text-black/42"}`}>{label}</button>)}</nav>

    {tab === "overview" ? <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><div className="space-y-4"><section className="fb-dark-surface rounded-[26px] bg-[#0b0b0d] p-6 text-white sm:p-7"><div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/35">Aktywny plan</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{client.plan}</h2><p className="mt-2 text-xs text-white/42">Cel: {client.goal}</p></div><div className="flex gap-2"><button onClick={onOpenPlan} className="h-11 rounded-full border border-white/15 px-5 text-[9px] font-black uppercase">Otwórz plan</button><button onClick={onStartWorkout} className="h-11 rounded-full bg-[#ffc400] px-5 text-[9px] font-black uppercase text-[#050505]">Start</button></div></div><div className="mt-6"><div className="mb-2 flex justify-between text-[9px]"><span className="text-white/38">Realizacja programu</span><strong>{client.progress}%</strong></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-[#ffc400]" style={{ width: `${client.progress}%` }}/></div></div></section><section className={`${cardClass} p-5 sm:p-6`}><div className="flex items-center justify-between"><div><h2 className="font-black">Najważniejsze dane</h2><p className="text-[10px] text-black/36">Jedno źródło informacji o współpracy</p></div><button onClick={() => onAction("measurement")} className="h-10 rounded-full border border-black/10 px-4 text-[9px] font-black uppercase">Dodaj pomiar</button></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Następny trening", client.nextSession], ["Masa", client.weight], ["Tkanka tłuszczowa", client.bodyFat], ["Frekwencja", client.attendance]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase tracking-wider text-black/30">{label}</p><p className="mt-2 text-sm font-black">{value}</p></div>)}</div></section></div><aside className="space-y-4"><section className={`${cardClass} p-5`}><h2 className="font-black">Profil współpracy</h2><dl className="mt-4 space-y-4">{[["Cel", client.goal], ["Dołączył", client.joined], ["Ostatni check-in", client.lastCheckin], ["Telefon", client.phone || "Brak"]].map(([label, value]) => <div key={label}><dt className="text-[8px] font-black uppercase tracking-wider text-black/30">{label}</dt><dd className="mt-1 text-xs font-bold">{value}</dd></div>)}</dl><div className="mt-5 flex flex-wrap gap-1.5">{client.tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div></section><InvitationCard invitation={invitation} clientName={client.name} onNew={onNewInvitation} onCopy={onCopy}/></aside></div> : null}

    {tab === "plan" ? <section className={`${cardClass} p-5 sm:p-7`}><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-black uppercase tracking-wider text-black/30">Aktualny program</p><h2 className="mt-2 text-2xl font-black">{client.plan}</h2><p className="mt-1 text-xs text-black/40">{client.goal} · realizacja {client.progress}%</p></div><div className="flex gap-2"><button onClick={onOpenPlan} className="h-11 rounded-full border border-black/10 px-5 text-[9px] font-black uppercase">Edytuj plan</button><button onClick={onStartWorkout} className="h-11 rounded-full bg-black px-5 text-[9px] font-black uppercase text-white">Rozpocznij trening</button></div></div><div className="mt-6"><ProgressBar value={client.progress}/></div></section> : null}

    {tab === "history" ? <section className={`${cardClass} overflow-hidden`}><div className="border-b border-black/[0.06] p-5"><h2 className="font-black">Historia treningów</h2><p className="text-[10px] text-black/36">Ostatnie zapisane aktywności podopiecznego</p></div>{["Ostatni trening", "Tydzień temu", "Dwa tygodnie temu"].map((date, index) => <div key={date} className="flex min-h-16 items-center gap-3 border-b border-black/[0.055] px-5 py-3 last:border-0"><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><CheckCircle2 size={15}/></span><span className="min-w-0 flex-1"><span className="block text-xs font-black">{client.plan}</span><span className="block text-[9px] text-black/36">{date} · {index === 0 ? "Trening zapisany" : "Zrealizowany"}</span></span><ChevronRight size={14}/></div>)}</section> : null}

    {tab === "progress" ? <section className={`${cardClass} p-5 sm:p-7`}><div className="flex items-center justify-between"><div><h2 className="font-black">Postępy klienta</h2><p className="text-[10px] text-black/36">Pomiary i realizacja planu</p></div><button onClick={() => onAction("measurement")} className="h-10 rounded-full bg-black px-4 text-[9px] font-black uppercase text-white">Dodaj pomiar</button></div><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Realizacja", `${client.progress}%`], ["Masa", client.weight], ["Tkanka tłuszczowa", client.bodyFat], ["Frekwencja", client.attendance]].map(([label, value]) => <div key={label} className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">{label}</p><p className="mt-2 text-xl font-black">{value}</p></div>)}</div><div className="mt-7 flex h-40 items-end gap-2 border-b border-black/10">{[42, 48, 54, 61, 67, 72, 78, Math.max(client.progress, 30)].map((value, index) => <div key={index} className="ui-bar flex-1 rounded-t-lg" style={{ height: `${value}%`, opacity: .3 + index * .08 }}/>)}</div></section> : null}

    {tab === "notes" ? <section className={`${cardClass} p-5 sm:p-7`}><h2 className="font-black">Notatki trenera</h2><p className="mt-1 text-[10px] text-black/36">Prywatne informacje dotyczące współpracy i kolejnych kroków.</p><textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-5 min-h-40 w-full rounded-2xl bg-[#f3f3f1] p-4 text-sm outline-none" placeholder="Dodaj obserwacje, ustalenia lub plan działania…"/><button onClick={() => notify("Notatka podopiecznego została zapisana")} disabled={!note.trim()} className="mt-4 h-11 rounded-full bg-black px-5 text-[9px] font-black uppercase text-white disabled:opacity-35">Zapisz notatkę</button></section> : null}
  </>;
}

function InvitationCard({ invitation, clientName, onNew, onCopy }: { invitation?: ClientInvitation; clientName: string; onNew: () => void; onCopy: (value: string, label: string) => void }) {
  const origin = typeof window === "undefined" ? "https://app.futurebody.pl" : window.location.origin;
  const link = invitation ? `${origin}/join/${invitation.code}` : "";
  return <section className={`${cardClass} p-5`}><div className="flex items-start justify-between gap-3"><div><p className="text-[9px] font-black uppercase tracking-[0.12em] text-black/32">Dostęp podopiecznego</p><h3 className="mt-1 font-black">Kod aktywacyjny</h3></div>{invitation ? <Badge tone="good">Aktywny</Badge> : <Badge>Brak kodu</Badge>}</div>{invitation ? <><p className="mt-5 font-mono text-lg font-black tracking-[0.16em]">{invitation.code}</p><p className="mt-1 text-[9px] text-black/32">Ważny do {invitation.expiresAt}</p><div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => onCopy(invitation.code, "Kod")} className="rounded-full border border-black/10 py-2.5 text-[9px] font-black uppercase tracking-wider">Kopiuj kod</button><button onClick={() => onCopy(link, "Link")} className="rounded-full border border-black/10 py-2.5 text-[9px] font-black uppercase tracking-wider">Kopiuj link</button></div><button onClick={onNew} className="mt-3 w-full text-[9px] font-black uppercase tracking-wider text-black/42 hover:text-black">Wygeneruj nowy kod</button></> : <><p className="mt-4 text-[10px] leading-5 text-black/38">Wygeneruj jednorazowy kod, aby {clientName.split(" ")[0]} mógł utworzyć konto.</p><button onClick={onNew} className="mt-4 w-full rounded-full bg-black py-3 text-[9px] font-black uppercase tracking-wider text-white">Wygeneruj kod</button></>}</section>;
}


type CalendarMode = "day" | "week" | "month";

function CalendarView({ clients, appointments, onSchedule, onOpenClient, onStartWorkout, onCancel, onDelete, autoSchedule = false }: { clients: Client[]; appointments: CalendarAppointment[]; onSchedule: (input: { id?: string; date: string; hour: number; clientId: string }) => void; onOpenClient: (id: string) => void; onStartWorkout: (id: string) => void; onCancel: (id: string) => void; onDelete: (id: string) => void; autoSchedule?: boolean }) {
  const today = dateKey(new Date());
  const hours = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  const [mode, setMode] = useState<CalendarMode>("day");
  const [selectedDate, setSelectedDate] = useState(today);
  // Wejście z pulpitu otwiera od razu wybór terminu na najbliższej wolnej godzinie dziś.
  const [slot, setSlot] = useState<{ date: string; hour: number; appointmentId?: string } | null>(() => {
    if (!autoSchedule) return null;
    const nowHour = new Date().getHours();
    const taken = new Set(appointments.filter((item) => item.date === today && item.status !== "Anulowany").map((item) => item.hour));
    const free = hours.find((hour) => hour >= nowHour && !taken.has(hour)) ?? hours.find((hour) => !taken.has(hour)) ?? hours[0];
    return { date: today, hour: free };
  });
  const [previewId, setPreviewId] = useState<string | null>(null);
  const selected = dateFromKey(selectedDate);
  const weekStart = startOfWeek(selected);
  const weekDays = Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
  const monthStart = new Date(selected.getFullYear(), selected.getMonth(), 1, 12);
  const monthGridStart = startOfWeek(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, index) => addDays(monthGridStart, index));
  const preview = previewId ? appointments.find((appointment) => appointment.id === previewId) ?? null : null;
  const slotMap = useMemo(() => new Map(appointments.map((appointment) => [`${appointment.date}-${appointment.hour}`, appointment])), [appointments]);
  const clientMap = useMemo(() => new Map(clients.map((client) => [client.id, client])), [clients]);
  const history = appointments.filter((appointment) => appointment.date < today).sort((a, b) => b.date.localeCompare(a.date) || b.hour - a.hour);

  function changePeriod(direction: -1 | 1) {
    const next = new Date(selected);
    if (mode === "month") next.setMonth(next.getMonth() + direction);
    else next.setDate(next.getDate() + direction * (mode === "week" ? 7 : 1));
    setSelectedDate(dateKey(next));
  }

  function openDay(value: string) {
    setSelectedDate(value);
    setMode("day");
  }

  const periodLabel = mode === "month"
    ? new Intl.DateTimeFormat("pl-PL", { month: "long", year: "numeric" }).format(selected)
    : mode === "week"
      ? `${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short" }).format(weekDays[0])} – ${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "short", year: "numeric" }).format(weekDays[6])}`
      : formatCalendarDate(selectedDate);

  return <>
    <PageHeader title="Kalendarz" subtitle="Dzień jest widokiem głównym. Kliknij wolną godzinę, aby szybko dodać trening." secondary={<div className="flex flex-wrap items-center justify-end gap-2"><label className="flex h-11 items-center gap-2 rounded-full border border-black/10 bg-white px-4"><CalendarDays size={14}/><input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="bg-transparent text-[10px] font-black outline-none" aria-label="Wybierz dzień"/></label><button onClick={() => setSelectedDate(today)} className="h-11 rounded-full border border-black/10 bg-white px-4 text-[9px] font-black uppercase">Dzisiaj</button></div>}/>

    <section className={`${cardClass} overflow-hidden`}>
      <header className="flex flex-col gap-3 border-b border-black/[0.06] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex items-center gap-2"><button onClick={() => changePeriod(-1)} className="grid h-11 w-11 place-items-center rounded-full border border-black/10" aria-label="Poprzedni okres"><ChevronLeft size={16}/></button><div className="min-w-0 px-2"><p className="text-[9px] font-black uppercase tracking-wider text-black/32">{mode === "day" ? "Widok dnia" : mode === "week" ? "Widok tygodnia" : "Widok miesiąca"}</p><h2 className="truncate text-sm font-black capitalize">{periodLabel}</h2></div><button onClick={() => changePeriod(1)} className="grid h-11 w-11 place-items-center rounded-full border border-black/10" aria-label="Następny okres"><ChevronRight size={16}/></button></div>
        <div className="grid grid-cols-3 rounded-full bg-[#f2f2f0] p-1">{(["day", "week", "month"] as CalendarMode[]).map((item) => <button key={item} onClick={() => setMode(item)} className={`h-9 rounded-full px-4 text-[9px] font-black uppercase ${mode === item ? "fb-selected" : "text-black/42"}`}>{item === "day" ? "Dzień" : item === "week" ? "Tydzień" : "Miesiąc"}</button>)}</div>
      </header>

      {mode === "day" ? <div className="max-h-[680px] overflow-y-auto">{hours.map((hour) => {
        const appointment = slotMap.get(`${selectedDate}-${hour}`);
        const client = appointment ? clientMap.get(appointment.clientId) : null;
        return <div key={`${selectedDate}-${hour}`} className="grid min-h-[78px] grid-cols-[58px_1fr] border-b border-black/[0.055] p-2.5 last:border-0 sm:grid-cols-[74px_1fr] sm:px-5"><div className="pt-3"><p className="text-xs font-black">{String(hour).padStart(2, "0")}:00</p><p className="text-[8px] text-black/30">pełna godzina</p></div>{appointment ? <button onClick={() => setPreviewId(appointment.id)} className={`fb-dark-surface flex min-w-0 items-center gap-3 rounded-2xl bg-[#0b0b0d] px-4 py-3 text-left text-white ${appointment.status === "Anulowany" ? "opacity-45" : ""}`}><Avatar initials={client?.initials ?? "?"} size="sm"/><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{client?.name ?? "Usunięty podopieczny"}</span><span className="mt-1 block truncate text-[9px] text-white/42">{appointment.kind ?? "Trening personalny"} · 60 min · {appointment.status ?? "Zaplanowany"}</span></span><ChevronRight size={15}/></button> : <button onClick={() => setSlot({ date: selectedDate, hour })} className="flex min-h-14 items-center justify-between rounded-2xl border border-dashed border-black/10 px-4 text-left text-[10px] font-bold text-black/34 hover:border-black/30"><span>Wolny termin</span><span className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><Plus size={15}/></span></button>}</div>;
      })}</div> : null}

      {mode === "week" ? <div className="overflow-x-auto"><div className="min-w-[780px]"><div className="grid grid-cols-[58px_repeat(7,minmax(100px,1fr))] border-b border-black/[0.06]"><div/>{weekDays.map((day) => { const key = dateKey(day); return <button key={key} onClick={() => openDay(key)} className={`border-l border-black/[0.055] px-2 py-3 text-center text-[9px] font-black uppercase ${key === selectedDate ? "fb-selected" : key === today ? "bg-black/[0.04]" : ""}`}>{new Intl.DateTimeFormat("pl-PL", { weekday: "short", day: "numeric" }).format(day)}</button>; })}</div><div className="max-h-[620px] overflow-y-auto">{hours.map((hour) => <div key={hour} className="grid grid-cols-[58px_repeat(7,minmax(100px,1fr))]"><div className="h-[68px] border-b border-black/[0.045] pr-2 pt-2 text-right text-[9px] text-black/30">{String(hour).padStart(2, "0")}:00</div>{weekDays.map((day) => { const key = dateKey(day); const appointment = slotMap.get(`${key}-${hour}`); const client = appointment ? clientMap.get(appointment.clientId) : null; return <button key={`${key}-${hour}`} onClick={() => appointment ? setPreviewId(appointment.id) : setSlot({ date: key, hour })} aria-label={appointment ? `${client?.name ?? "Usunięty podopieczny"}, ${key}, ${hour}:00` : `Wolny termin, ${key}, ${hour}:00`} className="h-[68px] border-b border-l border-black/[0.045] p-1.5 text-left hover:bg-black/[0.025]">{appointment ? <span className={`block h-full rounded-xl bg-black p-2 text-white ${appointment.status === "Anulowany" ? "opacity-40" : ""}`}><span className="block truncate text-[9px] font-black">{client?.name ?? "Usunięty podopieczny"}</span><span className="mt-1 block truncate text-[7px] text-white/42">{appointment.status ?? "Zaplanowany"}</span></span> : <span className="grid h-full place-items-center text-black/20"><Plus size={14}/></span>}</button>; })}</div>)}</div></div></div> : null}

      {mode === "month" ? <div><div className="grid grid-cols-7 border-b border-black/[0.06]">{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"].map((label) => <div key={label} className="py-2 text-center text-[8px] font-black uppercase text-black/30">{label}</div>)}</div><div className="grid grid-cols-7">{monthDays.map((day) => { const key = dateKey(day); const dayAppointments = appointments.filter((appointment) => appointment.date === key && appointment.status !== "Anulowany"); const inMonth = day.getMonth() === selected.getMonth(); return <button key={key} onClick={() => openDay(key)} className={`min-h-[68px] border-b border-r border-black/[0.05] p-2 text-left sm:min-h-[92px] ${inMonth ? "" : "opacity-28"} ${key === today ? "bg-black/[0.04]" : ""}`}><span className={`grid h-7 w-7 place-items-center rounded-full text-[9px] font-black ${key === today ? "bg-black text-white" : ""}`}>{day.getDate()}</span>{dayAppointments.length ? <span className="mt-2 block rounded-full bg-[#ffc400] px-2 py-1 text-center text-[8px] font-black text-[#050505]">{dayAppointments.length} {dayAppointments.length === 1 ? "trening" : "treningi"}</span> : null}</button>; })}</div></div> : null}
    </section>

    <section className={`${cardClass} mt-4 overflow-hidden`}><div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-4"><div><h2 className="font-black">Ostatnie terminy</h2><p className="text-[10px] text-black/36">Anulowane terminy pozostają w historii</p></div><Badge tone="dark">Historia</Badge></div>{history.length ? <div className="grid gap-px bg-black/[0.05] md:grid-cols-2 xl:grid-cols-3">{history.slice(0, 6).map((appointment) => { const client = clientMap.get(appointment.clientId); return <button key={appointment.id} onClick={() => setPreviewId(appointment.id)} className="flex min-h-16 items-center gap-3 bg-white p-4 text-left"><span className="grid h-10 w-10 place-items-center rounded-full bg-black text-[8px] font-black text-white">{String(appointment.hour).padStart(2, "0")}:00</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{client?.name ?? "Usunięty podopieczny"}</span><span className="block truncate text-[9px] text-black/36">{formatCalendarDate(appointment.date)} · {appointment.status ?? "Zaplanowany"}</span></span><ChevronRight size={14}/></button>; })}</div> : <div className="p-6 text-xs text-black/40">Historia pojawi się po pierwszych zakończonych terminach.</div>}</section>

    {slot ? <ScheduleDialog slot={slot} clients={clients} currentClientId={appointments.find((appointment) => appointment.id === slot.appointmentId)?.clientId} onClose={() => setSlot(null)} onSelect={(clientId) => { onSchedule({ id: slot.appointmentId, date: slot.date, hour: slot.hour, clientId }); setSlot(null); }}/> : null}
    {preview ? <AppointmentDetails appointment={preview} client={clientMap.get(preview.clientId)} onClose={() => setPreviewId(null)} onEdit={() => { setPreviewId(null); setSlot({ date: preview.date, hour: preview.hour, appointmentId: preview.id }); }} onOpenClient={() => { setPreviewId(null); onOpenClient(preview.clientId); }} onStartWorkout={() => { setPreviewId(null); onStartWorkout(preview.clientId); }} onCancel={() => { onCancel(preview.id); setPreviewId(null); }} onDelete={() => { onDelete(preview.id); setPreviewId(null); }}/> : null}
  </>;
}

function AppointmentDetails({ appointment, client, onClose, onEdit, onOpenClient, onStartWorkout, onCancel, onDelete }: { appointment: CalendarAppointment; client?: Client; onClose: () => void; onEdit: () => void; onOpenClient: () => void; onStartWorkout: () => void; onCancel: () => void; onDelete: () => void }) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  return <div className="fixed inset-0 z-[86] grid place-items-end bg-black/55 backdrop-blur-sm sm:place-items-center sm:p-4"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij podgląd terminu"/><section role="dialog" aria-modal="true" aria-labelledby="appointment-title" className="relative w-full rounded-t-[28px] bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-lg sm:rounded-[28px]"><button onClick={onClose} className="absolute right-5 top-5 grid h-10 w-10 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij"><X size={16}/></button><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">Szczegóły terminu</p><h2 id="appointment-title" className="mt-2 pr-12 text-2xl font-black tracking-[-0.04em]">{client?.name ?? "Usunięty podopieczny"}</h2><p className="mt-1 text-xs text-black/40">{formatCalendarDate(appointment.date)} · {String(appointment.hour).padStart(2, "0")}:00–{String(appointment.hour + 1).padStart(2, "0")}:00</p><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">Typ</p><p className="mt-2 text-xs font-black">{appointment.kind ?? "Trening personalny"}</p></div><div className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">Status</p><p className="mt-2 text-xs font-black">{appointment.status ?? "Zaplanowany"}</p></div></div><div className="mt-5 grid gap-2 sm:grid-cols-2"><button onClick={onStartWorkout} disabled={!client || appointment.status === "Anulowany"} className="h-12 rounded-full bg-black px-5 text-[10px] font-black uppercase text-white disabled:opacity-35">Otwórz trening</button><button onClick={onOpenClient} disabled={!client} className="h-12 rounded-full border border-black/10 px-5 text-[10px] font-black uppercase disabled:opacity-35">Otwórz klienta</button><button onClick={onEdit} className="h-12 rounded-full border border-black/10 px-5 text-[10px] font-black uppercase">Edytuj termin</button><button onClick={onCancel} disabled={appointment.status === "Anulowany"} className="h-12 rounded-full border border-black/10 px-5 text-[10px] font-black uppercase disabled:opacity-35">Anuluj termin</button></div><button onClick={() => confirmDelete ? onDelete() : setConfirmDelete(true)} className={`mt-4 h-11 w-full rounded-full text-[9px] font-black uppercase ${confirmDelete ? "bg-red-50 text-red-700" : "text-black/38"}`}>{confirmDelete ? "Potwierdź usunięcie terminu" : "Usuń termin"}</button></section></div>;
}

function ScheduleDialog({ slot, clients, currentClientId, onClose, onSelect }: { slot: { date: string; hour: number; appointmentId?: string }; clients: Client[]; currentClientId?: string; onClose: () => void; onSelect: (clientId: string) => void }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const availableClients = clients.filter((client) => {
    if (client.status === "Wstrzymany") return false;
    const searchable = `${client.name} ${client.goal}`.toLocaleLowerCase("pl-PL").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return searchable.includes(normalizedQuery);
  });

  return <div className="fixed inset-0 z-[85] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><section className="relative w-full max-w-md rounded-[28px] bg-white p-6 shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[#f1f1ef]" aria-label="Zamknij wybór podopiecznego"><X size={15}/></button><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">{slot.appointmentId ? "Edycja terminu" : "Szybkie umawianie"}</p><h2 className="mt-2 pr-10 text-2xl font-black tracking-[-0.04em]">{formatCalendarDate(slot.date)} · {String(slot.hour).padStart(2, "0")}:00</h2><p className="mt-1 text-xs text-black/38">{slot.appointmentId ? "Wybierz inną osobę, aby zaktualizować ten termin bez tworzenia duplikatu." : "Wybierz podopiecznego. Termin zapisze się w kalendarzu i historii."}</p><label className="mt-5 flex h-12 items-center gap-3 rounded-2xl border border-black/[0.08] bg-[#f2f2f0] px-4"><Search size={16} className="text-black/32"/><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Szukaj imienia lub nazwiska…" className="min-w-0 flex-1 bg-transparent text-sm outline-none"/><span className="text-[9px] font-bold text-black/28">{availableClients.length}</span></label><div className="mt-3 max-h-[360px] space-y-2 overflow-auto">{availableClients.map((client) => <button key={client.id} onClick={() => onSelect(client.id)} className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition hover:border-black ${currentClientId === client.id ? "fb-selected" : "border-black/[0.07] bg-[#f5f5f3]"}`}><Avatar initials={client.initials} dark={currentClientId === client.id}/><div className="min-w-0 flex-1"><p className="whitespace-normal break-words text-xs font-black leading-4">{client.name}</p><p className={`mt-0.5 line-clamp-2 text-[9px] ${currentClientId === client.id ? "text-black/55" : "text-black/36"}`}>{client.goal}</p></div>{currentClientId === client.id ? <Check size={16} className="shrink-0"/> : <ChevronRight size={15} className="shrink-0"/>}</button>)}{availableClients.length === 0 ? <div className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center"><Search size={20} className="mx-auto text-black/25"/><p className="mt-3 text-xs font-black">Nie znaleziono podopiecznego</p><p className="mt-1 text-[9px] text-black/36">Sprawdź pisownię imienia lub nazwiska.</p></div> : null}</div></section></div>;
}

function PlansView({ clients, workoutPlans, initialPlanId, onOpenDetail, onCloseDetail, onSavePlan, onUpdatePlan, notify }: { clients: Client[]; workoutPlans: TrainingProgram[]; initialPlanId: string | null; onOpenDetail: (planId: string) => void; onCloseDetail: () => void; onSavePlan: (plan: TrainingProgram, clientId: string) => void; onUpdatePlan: (plan: TrainingProgram) => void; notify: (text: string) => void }) {
  const [wizardMode, setWizardMode] = useState<"personal" | "template" | null>(null);
  const [editingPlan, setEditingPlan] = useState<TrainingProgram | null>(() => initialPlanId ? workoutPlans.find((plan) => plan.id === initialPlanId) ?? null : null);

  if (editingPlan) {
    const assignedClient = clients.find((client) => client.id === editingPlan.clientId);
    return <PlanEditor plan={editingPlan} clientName={assignedClient?.name} goal={assignedClient?.goal} onClose={() => { setEditingPlan(null); onCloseDetail(); }} onSave={(plan) => { onUpdatePlan(plan); setEditingPlan(null); onCloseDetail(); }}/>;
  }

  return <>
    <PageHeader
      title="Plany treningowe"
      subtitle="Programy podopiecznych w jednym miejscu — bez duplikatów i zbędnych ekranów."
      action="Nowy plan"
      onAction={() => setWizardMode("personal")}
      secondary={<button onClick={() => setWizardMode("template")} className="h-11 rounded-full border border-black/10 bg-white px-4 text-[10px] font-black uppercase tracking-wider"><Library size={14} className="mr-2 inline"/>Użyj szablonu</button>}
    />

    <section className={`${cardClass} mb-4 grid gap-px overflow-hidden bg-black/[0.055] sm:grid-cols-3`}>
      <div className="bg-white p-4 sm:p-5"><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Aktywne plany</p><p className="mt-2 text-2xl font-black">{workoutPlans.length}</p></div>
      <div className="bg-white p-4 sm:p-5"><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Przypisani klienci</p><p className="mt-2 text-2xl font-black">{new Set(workoutPlans.map((plan) => plan.clientId).filter(Boolean)).size}</p></div>
      <div className="bg-white p-4 sm:p-5"><p className="text-[9px] font-black uppercase tracking-wider text-black/34">Baza ćwiczeń</p><p className="mt-2 text-2xl font-black">{exerciseLibrary.length}</p></div>
    </section>

    <div className="mb-4 flex items-center justify-between"><div><h2 className="text-lg font-black">Programy klientów</h2><p className="text-[10px] text-black/36">Kliknij plan, aby zobaczyć dni i ćwiczenia.</p></div></div>

    {workoutPlans.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{workoutPlans.map((plan) => {
      const client = clients.find((candidate) => candidate.id === plan.clientId);
      return <article key={plan.id} className={`${cardClass} overflow-hidden`}>
        <button onClick={() => onOpenDetail(plan.id)} className="block w-full p-5 text-left">
          <div className="flex items-start justify-between gap-3"><Badge tone="dark">{plan.category}</Badge><Badge tone="good">Aktywny</Badge></div>
          <h3 className="mt-5 text-xl font-black tracking-[-0.035em]">{plan.name}</h3>
          <p className="mt-1 text-[10px] text-black/38">{plan.days} dni · {plan.duration} · {plan.exercises} ćwiczeń</p>
          <div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#f3f3f1] p-3"><Avatar initials={client?.initials ?? "—"} size="sm" dark/><span className="min-w-0 flex-1"><span className="block truncate text-xs font-black">{client?.name ?? "Plan bez przypisanego podopiecznego"}</span><span className="mt-0.5 block truncate text-[9px] text-black/36">{client?.goal ?? "Przypisz podopiecznego w edytorze"}</span></span><ChevronRight size={15}/></div>
          <div className="mt-5"><div className="mb-2 flex justify-between text-[9px]"><span className="text-black/36">Realizacja planu</span><strong>{plan.completion}%</strong></div><ProgressBar value={plan.completion}/></div>
        </button>
        <div className="flex items-center justify-between border-t border-black/[0.055] px-5 py-3"><span className="text-[9px] text-black/34">Aktualizacja: {plan.updated}</span><button onClick={() => { onOpenDetail(plan.id); notify(`Otwierasz plan: ${plan.name}`); }} className="h-10 rounded-full bg-black px-4 text-[9px] font-black uppercase text-white">Otwórz plan</button></div>
      </article>;
    })}</div> : <section className={cardClass}><EmptyState icon={Dumbbell} title="Nie masz jeszcze planów" text="Utwórz pierwszy plan i przypisz go do podopiecznego."/></section>}

    {wizardMode ? <PlanWizard mode={wizardMode} clients={clients} onClose={() => setWizardMode(null)} onSave={(plan, clientId) => { onSavePlan(plan, clientId); setWizardMode(null); }}/> : null}
    {editingPlan ? <PlanEditor plan={editingPlan} onClose={() => setEditingPlan(null)} onSave={(plan) => { onUpdatePlan(plan); setEditingPlan(null); }}/> : null}
  </>;
}

function PlanWizard({ mode,clients,onClose,onSave }: { mode: "personal"|"template"; clients: Client[]; onClose: () => void; onSave: (plan: TrainingProgram,clientId: string) => void; }) {
  const [step,setStep]=useState(0);
  const [clientId,setClientId]=useState(clients[0]?.id??"");
  const [survey,setSurvey]=useState({ goal: mode==="template"? "Sprawność ogólna":"Redukcja tkanki tłuszczowej",level: "Początkujący",days: "3",duration: "60",equipment: "Pełna siłownia",limitations: "",preference: "Trening siłowy",recovery: "Dobra" });
  const [search,setSearch]=useState("");
  const suggested=useMemo(() => suggestExercises(survey.goal,18),[survey.goal]);
  const [selectedIds,setSelectedIds]=useState<string[]>(() => suggestExercises(survey.goal,8).map((item) => item.id));
  const catalog=useMemo(() => searchExercises(search,{ limit: 12 }),[search]);
  const visibleExercises=search? catalog:suggested;
  const selectedClient=clients.find((client) => client.id===clientId);
  function setField(key: keyof typeof survey,value: string) { setSurvey((current) => ({ ...current,[key]: value })); }
  function toggleExercise(id: string) { setSelectedIds((current) => current.includes(id)? current.filter((item) => item!==id):[...current,id]); }
  function finish() { if(!selectedClient) return; const plan=createTrainingProgram({ name: `${selectedClient.name.split(" ")[0]} · ${survey.goal}`,category: survey.goal,dayCount: Number(survey.days),clientId: selectedClient.id,exerciseIds: selectedIds,duration: "8 tyg." }); onSave(plan,selectedClient.id); }
  return <div className="fixed inset-0 z-[88] overflow-y-auto bg-black/65 p-3 backdrop-blur-sm sm:p-6"><div className="mx-auto min-h-full max-w-5xl rounded-[30px] bg-[#f4f4f2] shadow-2xl"><header className="sticky top-0 z-10 flex items-center border-b border-black/[0.07] bg-[#f4f4f2]/95 px-5 py-4 backdrop-blur-xl sm:px-7"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">Kreator planu · krok {step+1} z 4</p><h2 className="mt-1 text-xl font-black">{mode==="personal"? "Plan personalizowany od początku":"Gotowa baza z dopasowaniem"}</h2></div><button onClick={onClose} className="ml-auto grid h-9 w-9 place-items-center rounded-full bg-white"><X size={16} /></button></header><div className="grid gap-2 px-5 pt-5 sm:grid-cols-4 sm:px-7">{["Podopieczny","Ankieta","Ćwiczenia","Podsumowanie"].map((label,index) => <div key={label} className={`rounded-full px-3 py-2 text-center text-[9px] font-black uppercase tracking-wider ${step===index? "bg-black text-white":index<step? "bg-emerald-100 text-emerald-800":"bg-white text-black/30"}`}>{index<step? "✓ ":""}{label}</div>)}</div><main className="px-5 py-7 sm:px-7">{step===0? <div><h3 className="text-2xl font-black tracking-[-0.04em]">Dla kogo tworzysz plan?</h3><p className="mt-2 text-sm text-black/40">Cel i profil podopiecznego połączą się automatycznie z nowym planem.</p><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{clients.filter((client) => client.status!=="Wstrzymany").map((client) => <button key={client.id} onClick={() => setClientId(client.id)} className={`flex items-center gap-3 rounded-2xl border p-4 text-left ${clientId===client.id? "border-black bg-black text-white":"border-black/[0.07] bg-white"}`}><Avatar initials={client.initials} dark={clientId===client.id} /><div className="min-w-0"><p className="truncate text-xs font-black">{client.name}</p><p className={`truncate text-[9px] ${clientId===client.id? "text-white/40":"text-black/36"}`}>{client.goal}</p></div></button>)}</div></div>:step===1? <div><h3 className="text-2xl font-black tracking-[-0.04em]">Ankieta i założenia</h3><p className="mt-2 text-sm text-black/40">Odpowiedzi sterują rekomendacjami i doborem ćwiczeń.</p><div className="mt-6 grid gap-4 sm:grid-cols-2">{[["goal","Główny cel",["Redukcja tkanki tłuszczowej","Budowa siły","Masa mięśniowa","Sprawność ogólna","Mobilność i powrót do ruchu"]],["level","Doświadczenie",["Początkujący","Średniozaawansowany","Zaawansowany"]],["days","Dni treningowe w tygodniu",["2","3","4","5"]],["duration","Czas jednej sesji",["30","45","60","75"]],["equipment","Dostępny sprzęt",["Pełna siłownia","Hantle i ławka","Masa ciała","Domowa siłownia"]],["preference","Preferowany styl",["Trening siłowy","Trening funkcjonalny","Obwody","Spokojne tempo techniczne"]],["recovery","Sen i regeneracja",["Słaba","Przeciętna","Dobra","Bardzo dobra"]]].map(([key,label,options]) => <label key={key as string}><span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-black/32">{label as string}</span><select value={survey[key as keyof typeof survey]} onChange={(event) => setField(key as keyof typeof survey,event.target.value)} className="h-12 w-full rounded-xl border-0 bg-white px-3 text-xs font-bold outline-none">{(options as string[]).map((option) => <option key={option}>{option}</option>)}</select></label>)}<label className="sm:col-span-2"><span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-black/32">Kontuzje, ograniczenia i zalecenia specjalisty</span><textarea value={survey.limitations} onChange={(event) => setField("limitations",event.target.value)} className="min-h-24 w-full rounded-xl border-0 bg-white p-3 text-xs outline-none" placeholder="Np. ograniczenie zgięcia kolana, zalecenie fizjoterapeuty…" /></label></div></div>:step===2? <div><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h3 className="text-2xl font-black tracking-[-0.04em]">Dobierz ćwiczenia</h3><p className="mt-2 text-sm text-black/40">{selectedIds.length} wybranych · katalog {exerciseLibrary.length} pozycji</p></div><div className="flex h-11 items-center rounded-full bg-white px-4"><Search size={15} className="mr-2 text-black/28" /><input value={search} onChange={(event) => setSearch(event.target.value)} className="w-56 bg-transparent text-xs outline-none" placeholder="Szukaj w całej bazie…" /></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{visibleExercises.map((exercise) => <button key={exercise.id} onClick={() => toggleExercise(exercise.id)} className={`overflow-hidden rounded-2xl border text-left ${selectedIds.includes(exercise.id)? "border-black bg-black text-white":"border-black/[0.07] bg-white"}`}><ExerciseMotion pattern={exercise.pattern} compact /><div className="p-4"><div className="flex items-start gap-2"><div className="min-w-0 flex-1"><p className="truncate text-xs font-black">{exercise.name}</p><p className={`mt-1 text-[9px] ${selectedIds.includes(exercise.id)? "text-white/40":"text-black/35"}`}>{exercise.muscle} · {exercise.equipment}</p></div><span className={`grid h-6 w-6 place-items-center rounded-full ${selectedIds.includes(exercise.id)? "bg-white text-black":"bg-black/[0.06]"}`}>{selectedIds.includes(exercise.id)? <Check size={13} />:<Plus size={13} />}</span></div></div></button>)}</div></div>:<div><h3 className="text-2xl font-black tracking-[-0.04em]">Plan gotowy do przypisania</h3><p className="mt-2 text-sm text-black/40">Wszystkie elementy będą widoczne także w portalu podopiecznego.</p><div className="mt-6 grid gap-4 lg:grid-cols-[1fr_.75fr]"><section className={`${cardClass} p-6`}><p className="text-[9px] font-black uppercase tracking-wider text-black/30">Nowy plan</p><h4 className="mt-2 text-2xl font-black">{selectedClient?.name.split(" ")[0]} · {survey.goal}</h4><div className="mt-6 grid grid-cols-3 gap-3">{[["Dni",`${survey.days} / tydz.`],["Sesja",`${survey.duration} min`],["Ćwiczenia",String(selectedIds.length)]].map(([label,value]) => <div key={label} className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[8px] font-black uppercase text-black/30">{label}</p><p className="mt-2 text-sm font-black">{value}</p></div>)}</div><dl className="mt-6 space-y-3">{[["Poziom",survey.level],["Sprzęt",survey.equipment],["Styl",survey.preference],["Regeneracja",survey.recovery],["Ograniczenia",survey.limitations||"Brak zgłoszonych"]].map(([label,value]) => <div key={label} className="flex justify-between gap-4 border-b border-black/[0.06] pb-3 text-xs"><dt className="text-black/38">{label}</dt><dd className="text-right font-bold">{value}</dd></div>)}</dl></section><section className="rounded-[24px] bg-black p-6 text-white"><Sparkles size={21} /><h4 className="mt-5 text-xl font-black">Połączone automatycznie</h4><ul className="mt-5 space-y-3 text-xs text-white/50">{["Profil i cel podopiecznego","Ankieta startowa i ograniczenia","Wybrane ćwiczenia oraz animacje","Portal podopiecznego i postępy"].map((item) => <li key={item} className="flex gap-2"><Check size={14} className="shrink-0 text-white" />{item}</li>)}</ul></section></div></div>}</main><footer className="sticky bottom-0 flex items-center justify-between border-t border-black/[0.07] bg-[#f4f4f2]/95 px-5 py-4 backdrop-blur-xl sm:px-7"><button disabled={step===0} onClick={() => setStep((current) => Math.max(0,current-1))} className="h-11 rounded-full border border-black/10 px-5 text-[10px] font-black uppercase disabled:opacity-30">Wstecz</button>{step<3? <button disabled={step===0&&!clientId} onClick={() => setStep((current) => Math.min(3,current+1))} className="h-11 rounded-full bg-black px-6 text-[10px] font-black uppercase text-white">Dalej</button>:<button disabled={!selectedIds.length} onClick={finish} className="h-11 rounded-full bg-black px-6 text-[10px] font-black uppercase text-white disabled:opacity-30">Przypisz plan</button>}</footer></div></div>;
}

function ExercisesView() {
  return <ExerciseLibraryPanel />;
}


function ProgressView({ clients, workoutHistory, onMeasurement }: { clients: Client[]; workoutHistory: WorkoutCompletion[]; onMeasurement: () => void }) {
  if (!clients.length) return <><PageHeader title="Postępy" subtitle="Wyniki i pomiary podopiecznych." action="Dodaj pomiar" onAction={onMeasurement}/><section className={cardClass}><EmptyState icon={TrendingUp} title="Brak danych o postępach" text="Wyniki pojawią się po dodaniu podopiecznych i pierwszych pomiarów."/></section></>;

  // Wszystkie wartości pochodzą z zapisanych treningów. Nic nie jest tu szacowane ani uzupełniane.
  const currentWeekStart = startOfWeek(new Date());
  const weeks = Array.from({ length: 8 }, (_, index) => {
    const from = addDays(currentWeekStart, (index - 7) * 7);
    const to = addDays(from, 7);
    const fromKey = dateKey(from);
    const toKey = dateKey(to);
    return { fromKey, count: workoutHistory.filter((entry) => { const day = entry.completedAt.slice(0, 10); return day >= fromKey && day < toKey; }).length };
  });
  const peakWeek = Math.max(...weeks.map((week) => week.count));
  const monthPrefix = dateKey(new Date()).slice(0, 7);
  const monthCompleted = workoutHistory.filter((entry) => entry.completedAt.slice(0, 7) === monthPrefix).length;
  const activeClients = new Set(workoutHistory.map((entry) => entry.clientId));
  const ranking = clients
    .map((client) => ({ client, completed: workoutHistory.filter((entry) => entry.clientId === client.id).length }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 4);

  return <><PageHeader title="Postępy" subtitle="Wyniki i regularność wyliczone z zapisanych treningów." action="Dodaj pomiar" onAction={onMeasurement} /><div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
    <section className={`${cardClass} p-6`}>
      <div className="flex items-center justify-between"><div><h2 className="font-black">Zapisane treningi</h2><p className="text-[11px] text-black/36">Ostatnie 8 tygodni</p></div><Badge tone={workoutHistory.length ? "good" : "neutral"}>{workoutHistory.length} łącznie</Badge></div>
      {peakWeek === 0
        ? <div className="mt-6"><EmptyState icon={TrendingUp} title="Brak zapisanych treningów" text="Wykres regularności wypełni się po zapisaniu pierwszego treningu."/></div>
        : <div className="mt-8 flex h-56 items-end gap-3">{weeks.map((week, index) => <div key={week.fromKey} className="flex flex-1 flex-col items-center gap-2"><div className="relative h-full w-full rounded-t-xl bg-black/[0.055]"><div className="ui-bar absolute inset-x-0 bottom-0 rounded-t-xl bg-black" style={{ height: `${Math.round((week.count / peakWeek) * 100)}%` }} /></div><span className="text-[9px] text-black/28">{index === 7 ? "Teraz" : `T${index + 1}`}</span><span className="text-[9px] font-black text-black/45">{week.count}</span></div>)}</div>}
    </section>
    <section className="rounded-[24px] bg-black p-6 text-white">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/38">Bieżący miesiąc</p>
      <h2 className="mt-3 text-4xl font-black tracking-[-0.06em]">{monthCompleted}</h2>
      <p className="text-xs text-white/40">{monthCompleted === 1 ? "zapisany trening" : "zapisanych treningów"}</p>
      <dl className="mt-8 space-y-4">
        {[["Podopieczni z zapisanym treningiem", `${activeClients.size} z ${clients.length}`], ["Treningi łącznie", String(workoutHistory.length)], ["Ostatni zapis", workoutHistory.length ? new Intl.DateTimeFormat("pl-PL").format(new Date(workoutHistory[0].completedAt)) : "Brak"]].map(([label, value]) => <div key={label} className="flex items-baseline justify-between gap-4 border-b border-white/[0.09] pb-3"><dt className="text-[10px] text-white/42">{label}</dt><dd className="text-sm font-black">{value}</dd></div>)}
      </dl>
    </section>
  </div>
  <section className={`${cardClass} mt-4 p-5 sm:p-6`}>
    <h2 className="font-black">Regularność podopiecznych</h2>
    {workoutHistory.length
      ? <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">{ranking.map(({ client, completed }) => <div key={client.id} className="rounded-2xl bg-[#f3f3f1] p-4"><div className="flex items-center gap-3"><Avatar initials={client.initials} dark={completed > 0} /><div className="min-w-0"><p className="truncate text-xs font-black">{client.name}</p><p className="truncate text-[9px] text-black/34">{client.goal}</p></div></div><div className="mt-5 flex items-baseline justify-between"><span className="text-2xl font-black">{completed}</span><span className="text-[9px] font-bold text-black/35">{completed === 1 ? "trening" : "treningów"}</span></div></div>)}</div>
      : <div className="mt-4"><EmptyState icon={Users} title="Brak zapisanych treningów" text="Po zapisaniu treningów zobaczysz tutaj, kto ćwiczy regularnie."/></div>}
  </section></>;
}
function CheckinsView({ notify }: { notify: (text: string) => void }) {
  if (!checkins.length) return <><PageHeader title="Check-iny" subtitle="Odpowiedzi podopiecznych i formularze kontrolne." action="Nowy formularz"/><section className={cardClass}><EmptyState icon={CheckSquare} title="Brak check-inów" text="Pierwsze odpowiedzi pojawią się tutaj po wysłaniu formularza podopiecznym."/></section></>;
  return <><PageHeader title="Check-iny" subtitle="2 nowe raporty czekają na sprawdzenie." action="Nowy formularz" /><div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><section className={`${cardClass} overflow-hidden`}><div className="border-b border-black/[0.06] px-6 py-4"><h2 className="font-black">Ostatnie odpowiedzi</h2></div>{checkins.map((item) => <button onClick={() => notify(`Otworzono check-in: ${item.client}`)} key={item.client} className="grid w-full grid-cols-[1fr_auto] gap-4 border-b border-black/[0.055] px-5 py-4 text-left last:border-0 sm:grid-cols-[1fr_180px_auto] sm:px-6"><div className="flex min-w-0 gap-3"><Avatar initials={item.initials} dark={item.status === "Nowy"} /><div className="min-w-0"><div className="flex items-center gap-2"><p className="truncate text-sm font-black">{item.client}</p><Badge tone={item.status === "Nowy" ? "dark" : "neutral"}>{item.status}</Badge></div><p className="mt-1 truncate text-[11px] text-black/38">{item.note}</p><p className="mt-1 text-[9px] text-black/28">{item.date}</p></div></div><div className="hidden grid-cols-3 gap-2 sm:grid">{[["Energia",item.energy], ["Sen",item.sleep], ["Stres",item.stress]].map(([label,value]) => <div key={String(label)} className="rounded-xl bg-[#f3f3f1] p-2 text-center"><p className="text-sm font-black">{value as number}/10</p><p className="text-[8px] uppercase text-black/30">{label as string}</p></div>)}</div><ChevronRight size={16} className="self-center text-black/28" /></button>)}</section><aside className="space-y-4"><section className="rounded-[24px] bg-black p-6 text-white"><Flame size={22} /><p className="mt-7 text-4xl font-black">82%</p><p className="text-xs text-white/42">terminowość check-inów</p><div className="mt-5"><ProgressBar value={82} dark /></div></section><section className={`${cardClass} p-5`}><h3 className="font-black">Wymaga uwagi</h3><div className="mt-4 space-y-3"><div className="rounded-2xl bg-red-50 p-3"><p className="text-xs font-black text-red-800">Wysoki stres · Piotr</p><p className="mt-1 text-[10px] text-red-700/65">7/10 przez drugi tydzień</p></div><div className="rounded-2xl bg-amber-50 p-3"><p className="text-xs font-black text-amber-800">Brak odpowiedzi · Karolina</p><p className="mt-1 text-[10px] text-amber-700/65">Termin minął wczoraj</p></div></div></section></aside></div></>;
}

function MessagesView({ selected, onSelect, messages, setMessages, message, setMessage }: { selected: string; onSelect: (id:string)=>void; messages:string[]; setMessages:React.Dispatch<React.SetStateAction<string[]>>; message:string; setMessage:(value:string)=>void }) {
  if (!conversations.length) return <><PageHeader title="Wiadomości" subtitle="Rozmowy z podopiecznymi." action="Nowa wiadomość"/><section className={cardClass}><EmptyState icon={MessageCircle} title="Brak rozmów" text="Rozmowy pojawią się po dodaniu i aktywowaniu pierwszego podopiecznego."/></section></>;
  const current = conversations.find((c) => c.id === selected) ?? conversations[0];
  function send() { if (!message.trim()) return; setMessages((m) => [...m, message.trim()]); setMessage(""); }
  return <><PageHeader title="Wiadomości" subtitle="3 nieprzeczytane wiadomości od podopiecznych." action="Nowa wiadomość" /><div className={`${cardClass} grid min-h-[620px] overflow-hidden md:grid-cols-[310px_1fr]`}><aside className="border-r border-black/[0.06]"><div className="border-b border-black/[0.06] p-4"><div className="flex items-center gap-2 rounded-full bg-[#f1f1ef] px-3 py-2"><Search size={14} className="text-black/30" /><input className="min-w-0 flex-1 bg-transparent text-xs outline-none" placeholder="Szukaj rozmowy" /></div></div>{conversations.map((chat) => <button key={chat.id} onClick={() => onSelect(chat.id)} className={`flex w-full gap-3 border-b border-black/[0.05] p-4 text-left ${selected === chat.id ? "bg-black text-white" : "hover:bg-black/[0.02]"}`}><div className="relative"><Avatar initials={chat.initials} dark={selected !== chat.id} /><span className={`absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 ${selected === chat.id ? "border-black" : "border-white"} ${chat.online ? "bg-emerald-400" : "bg-black/20"}`} /></div><div className="min-w-0 flex-1"><div className="flex justify-between gap-2"><p className="truncate text-xs font-black">{chat.name}</p><span className={`text-[8px] ${selected === chat.id ? "text-white/35" : "text-black/28"}`}>{chat.time}</span></div><p className={`mt-1 truncate text-[10px] ${selected === chat.id ? "text-white/42" : "text-black/38"}`}>{chat.preview}</p></div>{chat.unread ? <span className={`grid h-5 min-w-5 place-items-center rounded-full text-[8px] font-black ${selected === chat.id ? "bg-white text-black" : "bg-black text-white"}`}>{chat.unread}</span> : null}</button>)}</aside><section className="flex min-h-[520px] flex-col"><div className="flex items-center gap-3 border-b border-black/[0.06] px-5 py-4"><Avatar initials={current.initials} dark /><div><p className="text-sm font-black">{current.name}</p><p className="text-[9px] text-black/34">{current.online ? "Aktywny teraz" : "Ostatnio aktywny wczoraj"}</p></div><button className="ml-auto"><MoreHorizontal size={19} /></button></div><div className="flex-1 space-y-4 overflow-auto bg-[#fafaf8] p-5">{messages.map((text,i) => <div key={`${text}${i}`} className={`max-w-[78%] rounded-2xl px-4 py-3 text-xs leading-5 ${i % 2 === 0 ? "bg-white shadow-sm" : "ml-auto bg-black text-white"}`}>{text}</div>)}</div><div className="flex gap-2 border-t border-black/[0.06] p-4"><input value={message} onChange={(e)=>setMessage(e.target.value)} onKeyDown={(e)=>{if(e.key==="Enter")send();}} className="h-11 min-w-0 flex-1 rounded-full bg-[#f1f1ef] px-4 text-xs outline-none" placeholder="Napisz wiadomość…" /><button onClick={send} className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Send size={16} /></button></div></section></div></>;
}

function TasksView({ tasks, setTasks }: { tasks: typeof initialTasks; setTasks: React.Dispatch<React.SetStateAction<typeof initialTasks>> }) {
  if (!tasks.length) return <><PageHeader title="Zadania" subtitle="Lista spraw wymagających uwagi trenera." action="Dodaj zadanie"/><section className={cardClass}><EmptyState icon={CheckSquare} title="Brak zadań" text="Nowe zadania i przypomnienia pojawią się w tym miejscu."/></section></>;
  return <><PageHeader title="Zadania" subtitle={`${tasks.filter((t)=>!t.done).length} zadań pozostało do wykonania.`} action="Dodaj zadanie" /><div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]"><section className={`${cardClass} overflow-hidden`}><div className="border-b border-black/[0.06] px-6 py-4"><h2 className="font-black">Dzisiaj i najbliższe dni</h2></div>{tasks.map((task)=><button key={task.id} onClick={()=>setTasks((all)=>all.map((item)=>item.id===task.id?{...item,done:!item.done}:item))} className="flex w-full items-center gap-4 border-b border-black/[0.055] px-5 py-4 text-left last:border-0 sm:px-6">{task.done?<CheckCircle2 size={21} className="shrink-0" />:<Circle size={21} className="shrink-0 text-black/25" />}<div className="min-w-0 flex-1"><p className={`truncate text-sm font-black ${task.done?"text-black/28 line-through":""}`}>{task.title}</p><p className="mt-1 text-[10px] text-black/34">{task.due} · {task.category}</p></div><Badge tone={task.priority==="Wysoki"?"bad":task.priority==="Średni"?"warn":"neutral"}>{task.priority}</Badge></button>)}</section><aside className="space-y-4"><section className="rounded-[24px] bg-black p-6 text-white"><p className="text-[10px] font-black uppercase tracking-wider text-white/38">Skuteczność tygodnia</p><p className="mt-4 text-4xl font-black">76%</p><p className="text-xs text-white/40">19 z 25 zadań</p><div className="mt-5"><ProgressBar value={76} dark /></div></section><section className={`${cardClass} p-5`}><h3 className="font-black">Według kategorii</h3><div className="mt-4 space-y-3">{[["Podopieczni",5], ["Plany",3], ["Administracja",2]].map(([label,count])=><div key={String(label)} className="flex items-center justify-between"><span className="text-xs text-black/48">{label}</span><strong className="text-xs">{count}</strong></div>)}</div></section></aside></div></>;
}

function AutomationsView({ notify }: { notify: (text:string)=>void }) {
  const [active, setActive] = useState(automations.map((item)=>item.active));
  if (!automations.length) return <><PageHeader title="Automatyzacje" subtitle="Reguły działające w tle." action="Nowa automatyzacja"/><section className={cardClass}><EmptyState icon={Zap} title="Brak automatyzacji" text="Utworzone reguły i przypomnienia pojawią się w tym miejscu."/></section></>;
  return <><PageHeader title="Automatyzacje" subtitle="Oszczędzaj czas dzięki regułom działającym w tle." action="Nowa automatyzacja" /><div className="grid gap-4 xl:grid-cols-[1.3fr_.7fr]"><section className={`${cardClass} overflow-hidden`}>{automations.map((item,i)=><div key={item.name} className="flex items-center gap-4 border-b border-black/[0.055] px-5 py-4 last:border-0 sm:px-6"><div className={`grid h-10 w-10 place-items-center rounded-full ${active[i]?"bg-black text-white":"bg-[#ededeb] text-black/32"}`}><Zap size={16} /></div><div className="min-w-0 flex-1"><p className="truncate text-sm font-black">{item.name}</p><p className="mt-1 truncate text-[10px] text-black/35">{item.trigger} → {item.action}</p></div><div className="hidden text-right sm:block"><p className="text-xs font-black">{item.runs}</p><p className="text-[8px] uppercase text-black/28">wykonań</p></div><button onClick={()=>{setActive((all)=>all.map((value,index)=>index===i?!value:value));notify(active[i]?"Automatyzacja wyłączona":"Automatyzacja włączona");}} className={`relative h-7 w-12 rounded-full transition ${active[i]?"bg-black":"bg-black/12"}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${active[i]?"left-6":"left-1"}`} /></button></div>)}</section><aside className="rounded-[24px] bg-black p-6 text-white"><Sparkles size={22} /><h2 className="mt-8 text-2xl font-black tracking-[-0.045em]">8,4 godz.</h2><p className="mt-1 text-xs text-white/42">zaoszczędzone w sierpniu</p><div className="mt-7 space-y-4 border-t border-white/10 pt-5">{[["Wysłane przypomnienia","86"], ["Utworzone zadania","22"], ["Wiadomości automatyczne","47"]].map(([label,value])=><div key={label} className="flex justify-between text-xs"><span className="text-white/42">{label}</span><strong>{value}</strong></div>)}</div></aside></div></>;
}

function MaterialsView({ notify }: { notify:(text:string)=>void }) {
  if (!materials.length) return <><PageHeader title="Materiały" subtitle="Pliki, poradniki i filmy dla podopiecznych." action="Dodaj materiał"/><section className={cardClass}><EmptyState icon={FolderOpen} title="Brak materiałów" text="Dodane pliki i materiały edukacyjne pojawią się tutaj."/></section></>;
  return <><PageHeader title="Materiały" subtitle="Udostępniaj podopiecznym pliki, poradniki i filmy." action="Dodaj materiał" secondary={<button className="h-11 rounded-full border border-black/10 bg-white px-4 text-xs font-bold"><Upload size={14} className="mr-2 inline" />Prześlij plik</button>} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{materials.map((item,i)=><button onClick={()=>notify(`Otworzono: ${item.title}`)} key={item.title} className={`${cardClass} overflow-hidden text-left`}><div className={`grid h-36 place-items-center ${i%3===0?"bg-black text-white":"bg-[#e9e9e7] text-black"}`}>{item.type==="Wideo"?<Activity size={34}/>:item.type==="PDF"?<FileText size={34}/>:<BookOpen size={34}/>}</div><div className="p-5"><div className="flex justify-between gap-3"><Badge tone={i%3===0?"dark":"neutral"}>{item.type}</Badge><span className="text-[9px] text-black/30">{item.size}</span></div><h2 className="mt-4 font-black">{item.title}</h2><p className="mt-1 text-[10px] text-black/36">{item.category} · udostępniono {item.shared} klientom</p></div></button>)}</div></>;
}

function ReportsView({ clients, appointments, workoutHistory, onExport }: { clients: Client[]; appointments: CalendarAppointment[]; workoutHistory: WorkoutCompletion[]; onExport: (weekLabel?: string) => void }) {
  const [weekOffset, setWeekOffset] = useState(0);
  if (!clients.length && !appointments.length && !workoutHistory.length) return <><PageHeader title="Raport tygodniowy" subtitle="Regularność, frekwencja i praca z podopiecznymi."/><section className={cardClass}><EmptyState icon={BarChart3} title="Brak danych do raportu" text="Raport będzie dostępny po zapisaniu pierwszych treningów i podopiecznych."/></section></>;
  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const weekEnd = addDays(weekStart, 6);
  const weekLabel = `${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long" }).format(weekStart)} - ${new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" }).format(weekEnd)}`;
  const weekAppointments = appointments.filter((item) => item.date >= dateKey(weekStart) && item.date <= dateKey(weekEnd));
  const weeklyCompleted = workoutHistory.filter((item) => {
    const completedDate = item.completedAt.slice(0, 10);
    return completedDate >= dateKey(weekStart) && completedDate <= dateKey(weekEnd);
  });
  const dailySessions = Array.from({ length: 7 }, (_, index) => weekAppointments.filter((item) => item.date === dateKey(addDays(weekStart, index))).length);
  const maxSessions = Math.max(...dailySessions, 1);

  return <>
    <PageHeader title="Raport tygodniowy" subtitle="Regularność, frekwencja i praca z podopiecznymi w wybranym tygodniu." secondary={<div className="flex flex-wrap items-center gap-2"><div className="flex h-11 items-center rounded-full border border-black/10 bg-white"><button onClick={() => setWeekOffset((current) => current - 1)} className="grid h-full w-10 place-items-center" aria-label="Poprzedni tydzień"><ChevronLeft size={14}/></button><button onClick={() => setWeekOffset(0)} className="h-full border-x border-black/8 px-4 text-[9px] font-black uppercase">Bieżący tydzień</button><button onClick={() => setWeekOffset((current) => current + 1)} className="grid h-full w-10 place-items-center" aria-label="Następny tydzień"><ChevronRight size={14}/></button></div><button onClick={() => onExport(weekLabel)} className="h-11 rounded-full bg-black px-5 text-xs font-black text-white"><Download size={14} className="mr-2 inline"/>Pobierz PDF</button></div>}/>
    <div className="mb-4 flex items-center justify-between rounded-2xl bg-black px-5 py-4 text-white"><div><p className="text-[8px] font-black uppercase tracking-wider text-white/35">Zakres raportu</p><p className="mt-1 text-sm font-black">{weekLabel}</p></div><Badge>{weekOffset === 0 ? "Aktualny" : weekOffset < 0 ? "Historia" : "Plan"}</Badge></div>
    <div className="grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <section className={`${cardClass} p-6`}><div className="flex items-center justify-between"><div><h2 className="font-black">Treningi w kalendarzu</h2><p className="text-[10px] text-black/34">{weekAppointments.length} zaplanowanych spotkań</p></div><Badge tone="good">{weeklyCompleted.length} wykonanych</Badge></div><div className="mt-8 flex h-64 items-end gap-3">{dailySessions.map((value, index) => <div key={index} className="flex flex-1 flex-col items-center gap-2"><div className="relative h-full w-full rounded-t-lg bg-black/[0.05]"><div className="ui-bar absolute inset-x-0 bottom-0 rounded-t-lg bg-black" style={{ height: `${Math.max(5, value / maxSessions * 100)}%`, opacity: .35 + index * .08 }}/></div><span className="text-[8px] text-black/28">{["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"][index]}</span><strong className="text-[9px]">{value}</strong></div>)}</div></section>
      <section className="space-y-4"><div className="grid grid-cols-2 gap-3">{[["Regularność", "91%", TrendingUp], ["Frekwencja", "92%", CheckCircle2], ["Aktywni", String(clients.filter((client) => client.status === "Aktywny").length), Users], ["Zapisane wyniki", String(weeklyCompleted.length), Dumbbell]].map(([label, value, Icon]) => <div key={String(label)} className={`${cardClass} p-4`}><Icon size={17}/><p className="mt-5 text-2xl font-black tracking-[-0.05em]">{value as string}</p><p className="mt-1 text-[9px] uppercase tracking-wider text-black/32">{label as string}</p></div>)}</div><div className="rounded-[24px] bg-black p-5 text-white"><p className="text-[9px] uppercase tracking-wider text-white/35">Wniosek tygodnia</p><h3 className="mt-2 text-xl font-black">Regularność rośnie</h3><p className="mt-1 text-[10px] leading-5 text-white/42">Najlepszy wynik utrzymuje grupa realizująca trzy jednostki tygodniowo.</p></div></section>
    </div>
    <section className={`${cardClass} mt-4 overflow-hidden`}><div className="border-b border-black/[0.06] px-5 py-4"><h2 className="font-black">Podopieczni w raporcie</h2><p className="text-[10px] text-black/35">Szybki przegląd realizacji i kolejnych działań</p></div><div className="grid gap-px bg-black/[0.05] md:grid-cols-2 xl:grid-cols-3">{clients.slice(0, 6).map((client) => <div key={client.id} className="bg-white p-4"><div className="flex items-center gap-3"><Avatar initials={client.initials} dark/><div className="min-w-0"><p className="truncate text-xs font-black">{client.name}</p><p className="truncate text-[9px] text-black/36">{client.plan}</p></div><strong className="ml-auto text-sm">{client.progress}%</strong></div><div className="mt-4"><ProgressBar value={client.progress}/></div></div>)}</div></section>
  </>;
}

function SettingsView({ notify, onExport, onEnablePhoneNotifications, themePreference, onThemeChange }: { notify: (text: string) => void; onExport: () => void; onEnablePhoneNotifications: () => Promise<boolean>; themePreference: ThemePreference; onThemeChange: (theme: ThemePreference) => void }) {
  const [toggles, setToggles] = useState([true, true, true, true]);
  const [securityOpen, setSecurityOpen] = useState(false);
  const [phoneStatus, setPhoneStatus] = useState<"unknown" | "active" | "unavailable">("unknown");

  useEffect(() => {
    const saved = window.localStorage.getItem("movendo_notification_settings");
    if (saved) {
      try { const parsed = JSON.parse(saved) as boolean[]; window.setTimeout(() => setToggles(parsed), 0); } catch { window.localStorage.removeItem("movendo_notification_settings"); }
    }
    window.setTimeout(() => setPhoneStatus("Notification" in window && Notification.permission === "granted" ? "active" : "unknown"), 0);
  }, []);

  async function toggleNotification(index: number) {
    const nextValue = !toggles[index];
    if (index === 0 && nextValue) {
      const enabled = await onEnablePhoneNotifications();
      setPhoneStatus(enabled ? "active" : "unavailable");
    }
    setToggles((current) => {
      const next = current.map((value, itemIndex) => itemIndex === index ? nextValue : value);
      window.localStorage.setItem("movendo_notification_settings", JSON.stringify(next));
      return next;
    });
    notify(nextValue ? "Powiadomienie włączone" : "Powiadomienie wyłączone");
  }

  return <>
    <PageHeader title="Ustawienia" subtitle="Dopasuj konto, powiadomienia i bezpieczeństwo."/>
    <div className="grid gap-4 xl:grid-cols-[1fr_.65fr]">
      <section className={`${cardClass} overflow-hidden`}>
        <div className="border-b border-black/[0.06] p-6"><h2 className="font-black">Profil i marka</h2><div className="mt-5 flex items-center gap-4"><img src="/futurebody-logo.png" alt="FutureBody" className="h-16 w-16 rounded-2xl object-cover"/><div><p className="font-black">FutureBody Trainer</p><p className="text-[10px] text-black/36">Logo organizacji</p><button onClick={() => notify("Wybór nowego logo zostanie otwarty")} className="mt-2 text-[10px] font-black uppercase tracking-wider">Zmień logo</button></div></div><div className="mt-6 grid gap-4 sm:grid-cols-2"><label><span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-black/32">Imię i nazwisko</span><input placeholder="Uzupełnij dane profilu" className="h-11 w-full rounded-xl bg-[#f2f2f0] px-3 text-xs outline-none"/></label><label><span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-black/32">E-mail</span><input type="email" placeholder="Adres konta" className="h-11 w-full rounded-xl bg-[#f2f2f0] px-3 text-xs outline-none"/></label></div><button onClick={() => notify("Ustawienia profilu zapisane")} className="mt-5 rounded-full bg-black px-5 py-3 text-[10px] font-black uppercase tracking-wider text-white">Zapisz zmiany</button></div>
        <div className="p-6"><div className="flex items-start justify-between gap-4"><div><h2 className="font-black">Powiadomienia</h2><p className="mt-1 text-[10px] text-black/36">Ustawienia zapisują się na tym urządzeniu.</p></div><Badge tone={phoneStatus === "active" ? "good" : phoneStatus === "unavailable" ? "warn" : "neutral"}>{phoneStatus === "active" ? "Telefon aktywny" : phoneStatus === "unavailable" ? "Wymaga HTTPS" : "Do aktywacji"}</Badge></div><div className="mt-4 divide-y divide-black/[0.055]">{[["Przypomnienia o treningach", "Powiadomienie push na telefon i ekran blokady"], ["Nowe check-iny", "Alert po przesłaniu formularza"], ["Raport tygodniowy", "Podsumowanie w każdy poniedziałek"], ["Zmiany w planach", "Nowy plan i aktualizacja ćwiczeń"]].map(([title, text], index) => <div key={title} className="flex items-center gap-4 py-4"><div className="flex-1"><p className="text-xs font-black">{title}</p><p className="text-[9px] text-black/34">{text}</p></div><button onClick={() => toggleNotification(index)} className={`relative h-7 w-12 rounded-full ${toggles[index] ? "bg-black" : "bg-black/12"}`} aria-label={`${toggles[index] ? "Wyłącz" : "Włącz"} ${title}`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${toggles[index] ? "left-6" : "left-1"}`}/></button></div>)}</div></div>
      </section>
      <aside className="space-y-4">
        <section className={`${cardClass} p-5`}><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/32">Wygląd</p><h2 className="mt-1 font-black">Motyw aplikacji</h2></div>{themePreference === "dark" ? <Moon size={20}/> : themePreference === "light" ? <Sun size={20}/> : <Monitor size={20}/>}</div><p className="mt-2 text-[10px] leading-5 text-black/38">Wybór zapisuje się na tym urządzeniu. Tryb systemowy reaguje automatycznie na ustawienia telefonu lub komputera.</p><div className="mt-4 grid grid-cols-3 gap-2">{([{ id: "dark", label: "Ciemny", icon: Moon }, { id: "light", label: "Jasny", icon: Sun }, { id: "system", label: "System", icon: Monitor }] as const).map((item) => { const Icon = item.icon; const active = themePreference === item.id; return <button key={item.id} onClick={() => { onThemeChange(item.id); notify(`Motyw: ${item.label}`); }} aria-pressed={active} className={`flex min-h-[76px] flex-col items-center justify-center gap-2 rounded-2xl border px-2 text-[9px] font-black uppercase tracking-wider ${active ? "border-black bg-black text-white" : "border-black/[0.08] bg-[#f2f2f0] text-black/48"}`}><Icon size={17}/>{item.label}</button>; })}</div></section>
        <section className={`${cardClass} p-5`}><ShieldCheck size={21}/><h2 className="mt-5 font-black">Bezpieczeństwo</h2><div className="mt-4 space-y-3">{[["Logowanie dwuetapowe", "Gotowe do włączenia"], ["Ostatnie logowanie", "Bieżąca sesja"], ["Aktywne sesje", "1 urządzenie"]].map(([label, value]) => <div key={label} className="flex justify-between gap-3 text-[10px]"><span className="text-black/38">{label}</span><strong>{value}</strong></div>)}</div><button onClick={() => setSecurityOpen(true)} className="mt-5 w-full rounded-full border border-black/10 py-2.5 text-[10px] font-black uppercase tracking-wider">Zarządzaj ochroną</button></section>
        <section className={`${cardClass} p-5`}><Download size={21}/><h2 className="mt-5 font-black">Dane i eksport</h2><p className="mt-2 text-[10px] leading-5 text-black/38">Utwórz czytelny PDF z podopiecznymi, planami i historią kalendarza.</p><button onClick={onExport} className="mt-4 rounded-full bg-black px-4 py-3 text-[9px] font-black uppercase tracking-wider text-white"><Download size={13} className="mr-2 inline"/>Pobierz eksport PDF</button></section>
      </aside>
    </div>
    {securityOpen ? <SecurityDialog onClose={() => setSecurityOpen(false)} notify={notify}/> : null}
  </>;
}

function SecurityDialog({ onClose, notify }: { onClose: () => void; notify: (text: string) => void }) {
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessions, setSessions] = useState([{ id: "current", name: "To urządzenie", detail: "Aktywna sesja" }]);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  function changePassword() {
    if (currentPassword.length < 4 || newPassword.length < 8) {
      notify("Nowe hasło musi mieć minimum 8 znaków");
      return;
    }
    setCurrentPassword("");
    setNewPassword("");
    notify("Hasło zostało zmienione");
  }

  return <div className="fixed inset-0 z-[95] overflow-y-auto bg-black/60 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><section className="relative mx-auto my-6 w-full max-w-2xl rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"><button onClick={onClose} className="absolute right-5 top-5 grid h-9 w-9 place-items-center rounded-full bg-[#f1f1ef]"><X size={15}/></button><p className="text-[9px] font-black uppercase tracking-[0.14em] text-black/30">Ochrona konta</p><h2 className="mt-2 text-3xl font-black tracking-[-0.05em]">Bezpieczeństwo</h2><div className="mt-7 grid gap-4 md:grid-cols-2"><section className="rounded-2xl bg-black p-5 text-white"><ShieldCheck size={20}/><h3 className="mt-5 font-black">Logowanie dwuetapowe</h3><p className="mt-2 text-[10px] leading-5 text-white/42">Dodatkowy kod podczas logowania chroni dostęp do danych podopiecznych.</p><button onClick={() => { setTwoFactor((current) => !current); notify(twoFactor ? "Logowanie dwuetapowe wyłączone" : "Logowanie dwuetapowe włączone"); }} className="mt-5 w-full rounded-full bg-white py-3 text-[9px] font-black uppercase text-black">{twoFactor ? "Wyłącz 2FA" : "Włącz 2FA"}</button></section><section className="rounded-2xl bg-[#f3f3f1] p-5"><h3 className="font-black">Zmień hasło</h3><div className="mt-4 space-y-2"><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} placeholder="Obecne hasło" className="h-11 w-full rounded-xl bg-white px-3 text-xs outline-none"/><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="Nowe hasło (min. 8 znaków)" className="h-11 w-full rounded-xl bg-white px-3 text-xs outline-none"/></div><button onClick={changePassword} className="mt-3 rounded-full bg-black px-4 py-3 text-[9px] font-black uppercase text-white">Zapisz nowe hasło</button></section></div><section className="mt-4 rounded-2xl border border-black/[0.07] p-5"><h3 className="font-black">Aktywne sesje</h3><div className="mt-3 divide-y divide-black/[0.06]">{sessions.map((session) => <div key={session.id} className="flex items-center gap-3 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-black text-white"><LockKeyhole size={14}/></div><div className="flex-1"><p className="text-xs font-black">{session.name}</p><p className="text-[9px] text-black/36">{session.detail}</p></div>{session.id !== "current" ? <button onClick={() => { setSessions((current) => current.filter((item) => item.id !== session.id)); notify("Sesja na telefonie została zakończona"); }} className="text-[8px] font-black uppercase tracking-wider text-red-700">Wyloguj</button> : <Badge tone="good">Obecna</Badge>}</div>)}</div></section></section></div>;
}

function ClientPortal({
  client,
  program,
  completedWorkouts,
  onComplete,
  onLogout,
  notify,
  previewMode = false,
}: {
  client: Client;
  program?: TrainingProgram;
  completedWorkouts: number;
  onComplete: (completion: WorkoutCompletion) => void;
  onLogout: () => void;
  notify: (text: string) => void;
  previewMode?: boolean;
}) {
  const [tab, setTab] = useState<"today" | "plan" | "progress" | "messages" | "profile">("today");
  const [activeWorkoutDayId, setActiveWorkoutDayId] = useState<string | null>(null);
  const tabs: { id: typeof tab; label: string; icon: LucideIcon }[] = [
    { id: "today", label: "Dzisiaj", icon: LayoutDashboard },
    { id: "plan", label: "Plan", icon: Dumbbell },
    { id: "progress", label: "Postępy", icon: TrendingUp },
    { id: "messages", label: "Wiadomości", icon: MessageCircle },
    { id: "profile", label: "Profil", icon: Users },
  ];
  if (!program) {
    return <div className="futurebody-app futurebody-app-enter min-h-[100svh] bg-[#050505] text-[#f7f7f7]"><header className="fb-dark-surface flex h-[72px] items-center border-b border-white/[0.07] px-4 text-white"><img src="/futurebody-logo.png" alt="FutureBody" className="h-10 w-10 rounded-[13px] object-cover"/><div className="ml-3"><p className="text-[11px] font-black tracking-[0.16em]">FUTUREBODY</p><p className="text-[8px] uppercase tracking-[0.28em] text-white/32">{previewMode ? "Tryb podglądu" : "Panel podopiecznego"}</p></div><button onClick={onLogout} className="ml-auto grid h-10 w-10 place-items-center rounded-full border border-white/10" aria-label="Wyloguj"><LogOut size={15}/></button></header><main className="grid min-h-[calc(100svh-72px)] place-items-center px-5 py-10"><section className={`${cardClass} w-full max-w-lg p-7 text-center sm:p-10`}><span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-black text-white"><Dumbbell size={22}/></span><h1 className="mt-6 text-2xl font-black tracking-[-0.04em]">Plan jest w przygotowaniu</h1><p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/42">Twój trener nie przypisał jeszcze aktywnego programu. Gdy plan będzie gotowy, pojawi się tutaj automatycznie.</p><button onClick={() => notify("Wiadomość do trenera została przygotowana")} className="mt-6 h-11 rounded-full bg-black px-6 text-[10px] font-black uppercase text-white">Napisz do trenera</button></section></main></div>;
  }
  const activeWorkoutDay = program.trainingDays.find((day) => day.id === activeWorkoutDayId);
  const todayDay = program.trainingDays[0];

  function openWorkout(dayId: string) {
    setActiveWorkoutDayId(dayId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="futurebody-app futurebody-app-enter min-h-[100svh] bg-[#050505] text-[#f7f7f7]">
      <header className="fb-dark-surface sticky top-0 z-30 border-b border-white/[0.07] bg-[#050505]/92 pt-[env(safe-area-inset-top)] text-white backdrop-blur-xl">
        <div className="mx-auto flex h-[70px] max-w-6xl items-center px-4 sm:px-7">
          <img src="/futurebody-logo.png" alt="FutureBody" className="h-10 w-10 rounded-[13px] object-cover" />
          <div className="ml-3"><p className="text-[11px] font-black tracking-[0.16em]">FUTUREBODY</p><p className="text-[8px] uppercase tracking-[0.28em] text-white/32">Panel podopiecznego</p></div>
          <nav className="mx-auto hidden items-center gap-1 md:flex">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => { setTab(item.id); setActiveWorkoutDayId(null); }} className={`flex items-center gap-2 rounded-full px-4 py-2 text-[10px] font-black ${tab === item.id ? "bg-[#ffc400] text-[#050505]" : "text-white/48 hover:text-white"}`}><Icon size={14} />{item.label}</button>; })}</nav>
          <button onClick={onLogout} className="ml-auto grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white" aria-label="Wyloguj"><LogOut size={15} /></button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-8 sm:px-7">
        {activeWorkoutDay ? (
          <ClientWorkout clientId={client.id} clientName={client.name} plan={program} day={activeWorkoutDay} onBack={() => setActiveWorkoutDayId(null)} onComplete={(completion) => { onComplete(completion); setActiveWorkoutDayId(null); setTab("progress"); }} />
        ) : tab === "today" ? (
          <>
            <div className="mb-7"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-black/34">Twój dzień z FutureBody</p><h1 className="mt-2 text-4xl font-black tracking-[-0.055em]">Cześć, {client.name.split(" ")[0]}.</h1><p className="mt-2 text-sm text-black/40">Plan, trening i postępy masz zawsze w jednym miejscu.</p></div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
              <section className="rounded-[26px] bg-black p-6 text-white sm:p-8">
                <div className="flex items-start justify-between"><div><p className="text-[9px] font-black uppercase tracking-[0.14em] text-white/38">Najbliższy trening</p><h2 className="mt-3 text-3xl font-black tracking-[-0.05em]">{todayDay?.name ?? "Plan w przygotowaniu"}</h2><p className="mt-2 text-xs text-white/42">{todayDay ? `${todayDay.focus} · ${todayDay.items.length} ćwiczeń` : "Trener przygotowuje Twój program"}</p></div><Dumbbell size={24} /></div>
                <div className="mt-10 space-y-3">{todayDay?.items.slice(0, 3).map((item, index) => { const exercise = exerciseLibrary.find((candidate) => candidate.id === item.exerciseId) ?? exerciseLibrary[0]; return <div key={item.id} className="flex items-center gap-3 border-t border-white/10 pt-3"><span className="grid h-7 w-7 place-items-center rounded-full bg-white text-[9px] font-black text-black">{index + 1}</span><span className="flex-1 text-xs font-bold">{exercise.name}</span><span className="text-[10px] text-white/42">{item.sets} × {item.reps}</span></div>; })}</div>
                <button disabled={!todayDay} onClick={() => todayDay && openWorkout(todayDay.id)} className="mt-8 h-12 w-full rounded-[16px] bg-[#ffc400] text-[10px] font-black uppercase tracking-[0.1em] text-[#050505] disabled:opacity-35">Rozpocznij trening</button>
              </section>
              <div className="space-y-4">
                <section className={`${cardClass} p-5`}><div className="flex items-center justify-between"><div><p className="text-[9px] font-black uppercase tracking-wider text-black/32">Najbliższe spotkanie</p><h3 className="mt-1 font-black">{client.nextSession}</h3></div><CalendarDays size={20} /></div><p className="mt-4 text-xs text-black/42">Termin jest zsynchronizowany z kalendarzem trenera.</p></section>
                <section className={`${cardClass} p-5`}><div className="flex justify-between"><div><p className="text-[9px] font-black uppercase tracking-wider text-black/32">Ukończone treningi</p><p className="mt-2 text-2xl font-black">{completedWorkouts}</p></div><CheckCircle2 size={20} /></div><p className="mt-3 text-[10px] text-black/38">Każdy zapisany trening aktualizuje Twoją historię.</p></section>
                <section className={`${cardClass} p-5`}><p className="text-[9px] font-black uppercase tracking-wider text-black/32">Tygodniowy check-in</p><h3 className="mt-2 font-black">Jak się dzisiaj czujesz?</h3><button onClick={() => notify("Formularz check-in otwarty")} className="mt-4 text-[10px] font-black uppercase tracking-wider">Uzupełnij formularz <ChevronRight size={13} className="inline" /></button></section>
              </div>
            </div>
          </>
        ) : tab === "plan" ? (
          <PortalSection title="Twój plan treningowy" subtitle={`${program.name} · ${program.duration}`} icon={Dumbbell}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{program.trainingDays.map((day, index) => <button key={day.id} onClick={() => openWorkout(day.id)} className="group rounded-2xl bg-[#f3f3f1] p-5 text-left transition hover:bg-black hover:text-white"><div className="flex items-start justify-between"><span className="text-[9px] font-black opacity-30">{String(index + 1).padStart(2, "0")}</span><ChevronRight size={15} className="opacity-30 transition group-hover:translate-x-1" /></div><h3 className="mt-7 font-black">{day.name}</h3><p className="mt-1 text-[10px] opacity-40">{day.focus}</p><p className="mt-4 text-[9px] font-black uppercase tracking-wider opacity-35">{day.items.length} ćwiczeń · rozpocznij</p></button>)}</div>
          </PortalSection>
        ) : tab === "progress" ? (
          <PortalSection title="Twoje postępy" subtitle="Historia realizacji programu" icon={TrendingUp}>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Ukończone treningi", String(completedWorkouts), "zapisane w aplikacji"], ["Masa", client.weight, "aktualny pomiar"], ["Tkanka tłuszczowa", client.bodyFat, "aktualny pomiar"], ["Frekwencja", client.attendance, "regularność spotkań"]].map(([label, value, change]) => <div key={label} className="rounded-2xl bg-[#f3f3f1] p-4"><p className="text-[9px] font-black uppercase text-black/30">{label}</p><p className="mt-3 text-xl font-black">{value}</p><p className="mt-1 text-[9px] text-black/38">{change}</p></div>)}</div>
            <div className="mt-8 flex h-44 items-end gap-2 border-b border-black/8">{[42, 48, 53, 58, 64, 70, 78, Math.max(32, Math.min(96, client.progress))].map((value, index) => <div key={index} className="ui-bar flex-1 rounded-t-md bg-black" style={{ height: `${value}%`, opacity: .28 + index * .09 }} />)}</div>
          </PortalSection>
        ) : tab === "messages" ? (
          <PortalSection title="Wiadomości" subtitle="Rozmowa z trenerem" icon={MessageCircle}><div className="space-y-3"><div className="max-w-[75%] rounded-2xl bg-[#f3f3f1] px-4 py-3 text-xs">Cześć! Twój plan jest gotowy i dostępny w zakładce Plan.</div><div className="ml-auto max-w-[75%] rounded-2xl bg-black px-4 py-3 text-xs text-white">Super, zaczynam dzisiaj.</div></div><div className="mt-6 flex gap-2"><input className="h-11 flex-1 rounded-full bg-[#f3f3f1] px-4 text-xs outline-none" placeholder="Napisz wiadomość…" /><button onClick={() => notify("Wiadomość wysłana")} className="grid h-11 w-11 place-items-center rounded-full bg-black text-white"><Send size={15} /></button></div></PortalSection>
        ) : (
          <PortalSection title="Twój profil" subtitle="Dane konta i współpracy" icon={Users}><div className="grid gap-4 sm:grid-cols-2">{[["Imię i nazwisko", client.name], ["Adres e-mail", client.email || "Brak"], ["Trener", "Trener prowadzący"], ["Główny cel", client.goal], ["Aktywny program", program.name], ["Dni treningowe", String(program.trainingDays.length)]].map(([label, value]) => <div key={label}><p className="text-[9px] font-black uppercase tracking-wider text-black/30">{label}</p><p className="mt-2 text-sm font-bold">{value}</p></div>)}</div></PortalSection>
        )}
      </main>

      {!activeWorkoutDay ? <nav className="fb-dark-surface fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-30 flex justify-around rounded-[22px] border border-white/[0.08] bg-[#0b0b0d]/95 p-2 text-white shadow-2xl backdrop-blur-xl md:hidden">{tabs.map((item) => { const Icon = item.icon; return <button key={item.id} onClick={() => setTab(item.id)} className={`flex min-h-12 min-w-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 py-1.5 text-[8px] font-bold ${tab === item.id ? "bg-[#ffc400] text-[#050505]" : "text-white/45"}`}><Icon size={16} />{item.label}</button>; })}</nav> : null}
    </div>
  );
}

function PortalSection({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: LucideIcon; children: ReactNode }) {
  return <section className={`${cardClass} p-5 sm:p-7`}><div className="mb-7 flex items-start justify-between"><div><h1 className="text-3xl font-black tracking-[-0.05em]">{title}</h1><p className="mt-1 text-sm text-black/38">{subtitle}</p></div><div className="grid h-10 w-10 place-items-center rounded-full bg-black text-white"><Icon size={17}/></div></div>{children}</section>;
}

function InvitationDialog({ invitation, onClose, onCopy }: { invitation: ClientInvitation; onClose: () => void; onCopy: (value: string, label: string) => void }) {
  const origin = typeof window === "undefined" ? "https://app.futurebody.pl" : window.location.origin;
  const link = `${origin}/join/${invitation.code}`;
  return <div className="fixed inset-0 z-[90] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><section className="relative w-full max-w-md rounded-[28px] bg-white p-7 text-center shadow-2xl"><button onClick={onClose} className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full bg-[#f1f1ef]"><X size={15}/></button><div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-black text-white"><UserPlus size={18}/></div><p className="mt-5 text-[9px] font-black uppercase tracking-[0.14em] text-black/32">Zaproszenie podopiecznego</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{invitation.clientName}</h2><p className="mt-5 font-mono text-2xl font-black tracking-[0.18em]">{invitation.code}</p><p className="mt-2 text-[10px] text-black/36">Jednorazowy kod · ważny do {invitation.expiresAt}</p><div className="mt-6 grid grid-cols-2 gap-2"><button onClick={()=>onCopy(invitation.code,"Kod")} className="h-11 rounded-full bg-black text-[9px] font-black uppercase tracking-wider text-white">Kopiuj kod</button><button onClick={()=>onCopy(link,"Link")} className="h-11 rounded-full border border-black/10 text-[9px] font-black uppercase tracking-wider">Kopiuj link</button></div><p className="mt-5 text-[9px] leading-4 text-black/30">Po utworzeniu konta kod zostanie oznaczony jako wykorzystany i nie zadziała ponownie.</p></section></div>;
}

function ActionModal({ type, onClose, onSave }: { type: Exclude<ModalType,null>; onClose:()=>void; onSave:(data:Record<string,string>)=>void }) {
  const labels: Record<Exclude<ModalType,null>,[string,string]> = { client:["Nowy podopieczny","Dodaj podstawowe dane i od razu wygeneruj kod dostępu."], measurement:["Nowy pomiar","Zapisz aktualne wyniki podopiecznego."] };
  const [form,setForm]=useState<Record<string,string>>({});
  const fields = type==="client"?[["name","Imię i nazwisko"],["email","Adres e-mail"],["phone","Telefon"],["goal","Główny cel"]]:[["client","Podopieczny"],["weight","Masa ciała"],["bodyfat","Tkanka tłuszczowa"],["note","Notatka"]];
  return <div className="fixed inset-0 z-[80] grid place-items-center bg-black/55 p-4 backdrop-blur-sm"><button className="absolute inset-0" onClick={onClose} aria-label="Zamknij"/><form onSubmit={(e)=>{e.preventDefault();onSave(form);}} className="relative w-full max-w-lg rounded-[28px] bg-white p-6 shadow-2xl sm:p-8"><div className="flex items-start justify-between"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-black/34">FutureBody Trainer</p><h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">{labels[type][0]}</h2><p className="mt-1 text-xs text-black/38">{labels[type][1]}</p></div><button type="button" onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full bg-[#f0f0ee]"><X size={16}/></button></div><div className="mt-7 grid gap-4 sm:grid-cols-2">{fields.map(([key,label])=><label key={key} className={key==="goal"||key==="note"?"sm:col-span-2":""}><span className="mb-2 block text-[9px] font-black uppercase tracking-wider text-black/32">{label}</span><input required={key==="name"||key==="client"} value={form[key]||""} onChange={(e)=>setForm({...form,[key]:e.target.value})} className="h-12 w-full rounded-xl bg-[#f1f1ef] px-3 text-xs outline-none ring-black focus:ring-1" placeholder={label}/></label>)}</div><div className="mt-7 flex justify-end gap-2"><button type="button" onClick={onClose} className="h-11 rounded-full border border-black/10 px-5 text-[10px] font-black uppercase tracking-wider">Anuluj</button><button type="submit" className="h-11 rounded-full bg-black px-6 text-[10px] font-black uppercase tracking-wider text-white">Zapisz</button></div></form></div>;
}
