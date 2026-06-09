import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "@/lib/api";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Phone,
  MessageCircle,
  Plus,
  X,
  Search,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Timer,
  PlayCircle,
  Check,
  Ban,
  Calendar,
  Menu,
  ChevronRight,
  TrendingUp,
  Inbox,
  Clock,
  CalendarOff,
  CalendarCheck,
  Settings2,
  BookOpen,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon,
  Eye,
  EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import logo from "@/assets/logo.png";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Booking {
  id: string;
  name: string;
  phone: string;
  program: string;
  status: string;
  enrollmentDate: string;
  sessionDate?: string;
  sessionTime?: string;
  notes?: string;
  createdAt: string;
}

export interface Program {
  id: string;
  title: string;
  tag: string;
  description: string;
  fullDescription: string;
  duration: string;
  startDate: string;
  price: string;
  imageUrl: string;
  status: "active" | "draft";
  enrollmentOpen: boolean;
  order: number;
  createdAt: string;
}

interface ProgramDates {
  [program: string]: string[];
}

export interface Availability {
  days: string[];
  startTime: string;
  endTime: string;
  slotMinutes: number;
  blockedDates: string[];
}

type View = "overview" | "bookings" | "availability" | "schedule" | "programs";

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const DAY_LABELS_SHORT: Record<string, string> = { mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun" };

const SLOT_LENGTHS = [30, 45, 60, 75, 90, 120];

const DEFAULT_AVAILABILITY: Availability = {
  days: ["mon", "tue", "wed", "thu", "fri"],
  startTime: "09:00",
  endTime: "17:00",
  slotMinutes: 60,
  blockedDates: [],
};

const PROGRAMS = [
  "Discovery Session",
  "Life / Identity Coaching",
  "Marriage Counseling",
  "Family Counseling",
  "Spiritual Development",
  "Hijama Therapy",
  "The SIRAJ Method™ Certification",
  "Project 20",
  "Strategic Woman Program",
  "Marriage, Not the Wedding",
  "The Thriving Muslim Family Blueprint",
  "Ahlul Jannah Summer Mentorship",
];

const STATUSES = [
  "Pending",
  "Approved",
  "Scheduled",
  "In Progress",
  "Completed",
  "Declined",
  "Cancelled",
];

const STATUS_CFG: Record<
  string,
  { bg: string; text: string; border: string; dot: string; Icon: any }
> = {
  Pending:        { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   dot: "bg-amber-400",   Icon: Timer },
  Approved:       { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", dot: "bg-emerald-500", Icon: CheckCircle2 },
  Scheduled:      { bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    dot: "bg-blue-500",    Icon: Calendar },
  "In Progress":  { bg: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  dot: "bg-violet-500",  Icon: PlayCircle },
  Completed:      { bg: "bg-teal-50",    text: "text-teal-700",    border: "border-teal-200",    dot: "bg-teal-500",    Icon: Check },
  Declined:       { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200",     dot: "bg-red-500",     Icon: XCircle },
  Cancelled:      { bg: "bg-gray-100",   text: "text-gray-600",    border: "border-gray-200",    dot: "bg-gray-400",    Icon: Ban },
};

const NAV = [
  { id: "overview" as View,     label: "Overview",       Icon: LayoutDashboard },
  { id: "bookings" as View,     label: "Bookings",       Icon: Users },
  { id: "availability" as View, label: "Availability",   Icon: Clock },
  { id: "schedule" as View,     label: "Program Intake", Icon: CalendarDays },
  { id: "programs" as View,     label: "Programs CMS",   Icon: BookOpen },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG["Pending"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${c.bg} ${c.text} ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${c.dot}`} />
      {status}
    </span>
  );
}

function Avatar({ name }: { name: string }) {
  const initials = name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

function fmt(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function waUrl(phone: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}`;
}

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function dayKeyOf(dateStr: string) {
  return DAY_KEYS[new Date(`${dateStr}T00:00:00`).getDay()];
}

function generateSlots(av: Availability) {
  const [sh, sm] = av.startTime.split(":").map(Number);
  const [eh, em] = av.endTime.split(":").map(Number);
  const slots: string[] = [];
  let cur = sh * 60 + sm;
  const end = eh * 60 + em;
  while (cur + av.slotMinutes <= end) {
    const hh = String(Math.floor(cur / 60)).padStart(2, "0");
    const mm = String(cur % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
    cur += av.slotMinutes;
  }
  return slots;
}

function emptyForm() {
  return { name: "", phone: "", program: "", status: "Pending", enrollmentDate: new Date().toISOString().split("T")[0], sessionDate: "", sessionTime: "", notes: "" };
}

function emptyProgramForm() {
  return { title: "", tag: "", description: "", fullDescription: "", duration: "", startDate: "", price: "", imageUrl: "", status: "active" as const, enrollmentOpen: true };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingsDashboard() {
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Bookings state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [programDates, setProgramDates] = useState<ProgramDates>({});
  const [availability, setAvailability] = useState<Availability>(DEFAULT_AVAILABILITY);
  const [blockedDateInput, setBlockedDateInput] = useState("");
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [form, setForm] = useState(emptyForm());

  // Programs CMS state
  const [programs, setPrograms] = useState<Program[]>([]);
  const [isProgramOpen, setIsProgramOpen] = useState(false);
  const [programEditId, setProgramEditId] = useState<string | null>(null);
  const [programForm, setProgramForm] = useState(emptyProgramForm());
  const [programImageTab, setProgramImageTab] = useState<"url" | "upload">("url");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    try {
      const [b, d, a, progs] = await Promise.allSettled([
        api.get<Booking[]>("/api/bookings"),
        api.get<ProgramDates>("/api/program-dates"),
        api.get<Availability>("/api/availability"),
        api.get<Program[]>("/api/programs?all=true"),
      ]);
      if (b.status === "fulfilled") setBookings(b.value);
      if (d.status === "fulfilled") setProgramDates(d.value);
      if (a.status === "fulfilled") setAvailability({ ...DEFAULT_AVAILABILITY, ...a.value });
      if (progs.status === "fulfilled") setPrograms(progs.value);
      const errors = [b, d, a, progs].filter((r) => r.status === "rejected");
      if (errors.length) console.warn("Some dashboard data failed to load:", errors.map((r) => (r as PromiseRejectedResult).reason?.message));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshAll(); }, [refreshAll]);

  // ── Availability mutations ──────────────────────────────────────────────────

  const persistAvailability = async (a: Availability) => {
    setAvailability(a);
    await api.put("/api/availability", a).catch(console.error);
  };

  const persistDates = async (d: ProgramDates) => {
    setProgramDates(d);
    await api.put("/api/program-dates", d).catch(console.error);
  };

  const toggleDay = (key: string) => {
    const days = availability.days.includes(key)
      ? availability.days.filter((d) => d !== key)
      : [...availability.days, key];
    persistAvailability({ ...availability, days });
  };

  const addBlockedDate = () => {
    if (!blockedDateInput) return;
    if (!availability.blockedDates.includes(blockedDateInput)) {
      persistAvailability({ ...availability, blockedDates: [...availability.blockedDates, blockedDateInput].sort() });
    }
    setBlockedDateInput("");
  };

  const removeBlockedDate = (date: string) => {
    persistAvailability({ ...availability, blockedDates: availability.blockedDates.filter((d) => d !== date) });
  };

  // ── Booking mutations ───────────────────────────────────────────────────────

  const updateStatus = async (id: string, status: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
    await api.patch(`/api/bookings/${id}`, { status }).catch(console.error);
  };

  const saveNotes = async (id: string) => {
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, notes: tempNotes } : b)));
    setSelected((prev) => (prev?.id === id ? { ...prev, notes: tempNotes } : prev));
    setEditingNotes(false);
    await api.patch(`/api/bookings/${id}`, { notes: tempNotes }).catch(console.error);
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    setBookings((prev) => prev.filter((b) => b.id !== id));
    if (selected?.id === id) setSelected(null);
    await api.del(`/api/bookings/${id}`).catch(console.error);
  };

  const addBooking = async () => {
    if (!form.name || !form.phone || !form.program) {
      alert("Name, phone, and program are required.");
      return;
    }
    try {
      const nb = await api.post<Booking>("/api/bookings", form);
      setBookings((prev) => [nb, ...prev]);
      setIsAddOpen(false);
      setForm(emptyForm());
    } catch {
      alert("Failed to save booking. Is the API server running?");
    }
  };

  const addProgramDate = (program: string) => {
    const d = dateInputs[program];
    if (!d) return;
    const existing = programDates[program] ?? [];
    if (!existing.includes(d)) persistDates({ ...programDates, [program]: [...existing, d].sort() });
    setDateInputs((prev) => ({ ...prev, [program]: "" }));
  };

  const removeProgramDate = (program: string, date: string) => {
    persistDates({ ...programDates, [program]: (programDates[program] ?? []).filter((d) => d !== date) });
  };

  // ── Programs CMS mutations ──────────────────────────────────────────────────

  const openAddProgram = () => {
    setProgramForm(emptyProgramForm());
    setProgramEditId(null);
    setProgramImageTab("url");
    setIsProgramOpen(true);
  };

  const openEditProgram = (p: Program) => {
    setProgramForm({
      title: p.title, tag: p.tag, description: p.description,
      fullDescription: p.fullDescription, duration: p.duration,
      startDate: p.startDate, price: p.price, imageUrl: p.imageUrl,
      status: p.status, enrollmentOpen: p.enrollmentOpen,
    });
    setProgramEditId(p.id);
    setProgramImageTab(p.imageUrl.startsWith("data:") ? "upload" : "url");
    setIsProgramOpen(true);
  };

  const saveProgram = async () => {
    if (!programForm.title.trim()) {
      alert("Title is required.");
      return;
    }
    try {
      if (programEditId) {
        const updated = await api.patch<Program>(`/api/programs/${programEditId}`, programForm);
        setPrograms((prev) => prev.map((p) => p.id === programEditId ? updated : p));
      } else {
        const created = await api.post<Program>("/api/programs", programForm);
        setPrograms((prev) => [created, ...prev]);
      }
      setIsProgramOpen(false);
      setProgramEditId(null);
      setProgramForm(emptyProgramForm());
    } catch {
      alert("Failed to save program. Is the API server running?");
    }
  };

  const deleteProgram = async (id: string) => {
    if (!confirm("Delete this program? This cannot be undone.")) return;
    setPrograms((prev) => prev.filter((p) => p.id !== id));
    await api.del(`/api/programs/${id}`).catch(console.error);
  };

  const toggleProgramStatus = async (p: Program) => {
    const newStatus = p.status === "active" ? "draft" : "active";
    setPrograms((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus } : x));
    await api.patch(`/api/programs/${p.id}`, { status: newStatus }).catch(console.error);
  };

  const handleProgramImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) {
      alert("Image must be under 3 MB. Try compressing it first.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setProgramForm((f) => ({ ...f, imageUrl: ev.target?.result as string }));
    };
    reader.readAsDataURL(file);
  };

  // ── Derived state ───────────────────────────────────────────────────────────

  const filtered = bookings.filter((b) => {
    const matchStatus = filterStatus === "All" || b.status === filterStatus;
    const q = search.toLowerCase();
    const matchSearch = !search || b.name.toLowerCase().includes(q) || b.phone.includes(q) || b.program.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "Pending").length,
    active: bookings.filter((b) => ["Approved", "Scheduled", "In Progress"].includes(b.status)).length,
    completed: bookings.filter((b) => b.status === "Completed").length,
  };

  const recent = [...bookings].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);

  const today = new Date().toISOString().split("T")[0];
  const upcoming = [...bookings]
    .filter((b) => b.sessionDate && b.sessionDate >= today && ["Approved", "Scheduled"].includes(b.status))
    .sort((a, b) => `${a.sessionDate}T${a.sessionTime ?? ""}`.localeCompare(`${b.sessionDate}T${b.sessionTime ?? ""}`))
    .slice(0, 6);

  // ── Overview ─────────────────────────────────────────────────────────────────

  function OverviewContent() {
    const slotsPerDay = generateSlots(availability).length;
    return (
      <div className="space-y-6">
        <div className="bg-primary text-primary-foreground rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(circle_at_85%_20%,white,transparent_45%)]" />
          <div className="relative">
            <p className="text-xs uppercase tracking-[0.2em] text-gold">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h2 className="font-display text-2xl mt-1">Welcome back, Coach Halima</h2>
            <p className="text-sm text-primary-foreground/70 mt-1 flex items-center gap-2">
              <Clock size={13} />
              Available {availability.days.map((d) => DAY_LABELS_SHORT[d]).join(" · ")} · {availability.startTime}–{availability.endTime} · {slotsPerDay} session{slotsPerDay !== 1 ? "s" : ""}/day
            </p>
          </div>
          <button type="button" onClick={() => setView("availability")} className="relative inline-flex items-center gap-2 text-sm font-medium px-5 py-2.5 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/15 transition-colors border border-primary-foreground/15 w-fit">
            <Settings2 size={14} /> Manage availability
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Bookings", value: stats.total, Icon: Inbox, color: "text-foreground", bg: "bg-card" },
            { label: "Pending Review", value: stats.pending, Icon: Timer, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Active / Enrolled", value: stats.active, Icon: TrendingUp, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Completed", value: stats.completed, Icon: CheckCircle2, color: "text-teal-600", bg: "bg-teal-50" },
          ].map(({ label, value, Icon, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl border border-border p-5 flex flex-col gap-3`}>
              <div className="w-9 h-9 rounded-xl bg-white/60 flex items-center justify-center">
                <Icon size={18} className={color} />
              </div>
              <div>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground">Recent Bookings</h2>
              <button type="button" onClick={() => setView("bookings")} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
                View all <ChevronRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {recent.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No bookings yet. Click "New Booking" to add one.</div>
              ) : (
                recent.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => { setSelected(b); setView("bookings"); }}>
                    <Avatar name={b.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.program}</p>
                    </div>
                    <StatusBadge status={b.status} />
                    <p className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">{fmt(b.enrollmentDate)}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><CalendarCheck size={16} className="text-primary" /> Upcoming Sessions</h2>
              <button type="button" onClick={() => setView("availability")} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
                Availability <ChevronRight size={13} />
              </button>
            </div>
            <div className="divide-y divide-border">
              {upcoming.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-sm">No approved sessions scheduled yet.</div>
              ) : (
                upcoming.map((b) => (
                  <div key={b.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-muted/40 cursor-pointer transition-colors" onClick={() => { setSelected(b); setView("bookings"); }}>
                    <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex flex-col items-center justify-center flex-shrink-0 leading-none">
                      <span className="text-[10px] uppercase font-medium">{b.sessionDate ? new Date(b.sessionDate).toLocaleDateString("en-GB", { month: "short" }) : "—"}</span>
                      <span className="text-sm font-bold">{b.sessionDate ? new Date(b.sessionDate).getDate() : "–"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{b.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{b.program}</p>
                    </div>
                    <p className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1"><Clock size={11} className="text-muted-foreground" />{b.sessionTime ?? "—"}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Bookings ──────────────────────────────────────────────────────────────────

  function BookingsContent() {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name, phone, program…" className="pl-9 bg-card" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-44 bg-card">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All statuses</SelectItem>
              {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-6 py-3.5 font-medium text-muted-foreground">Person</th>
                  <th className="text-left px-4 py-3.5 font-medium text-muted-foreground hidden md:table-cell">Program</th>
                  <th className="text-left px-4 py-3.5 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3.5 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                  <th className="px-4 py-3.5" scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-muted-foreground">
                      {bookings.length === 0 ? "No bookings yet." : "No results match your filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => (
                    <tr key={b.id} className={`hover:bg-muted/30 cursor-pointer transition-colors ${selected?.id === b.id ? "bg-primary/5" : ""}`} onClick={() => { setSelected(b); setEditingNotes(false); }}>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={b.name} />
                          <div>
                            <p className="font-medium text-foreground">{b.name}</p>
                            <a href={`tel:${b.phone}`} className="text-xs text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}>{b.phone}</a>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 hidden md:table-cell">
                        <span className="text-foreground/80 truncate max-w-[200px] block">{b.program}</span>
                      </td>
                      <td className="px-4 py-3.5"><StatusBadge status={b.status} /></td>
                      <td className="px-4 py-3.5 text-muted-foreground hidden lg:table-cell">{fmt(b.enrollmentDate)}</td>
                      <td className="px-4 py-3.5 text-right">
                        <ChevronRight size={14} className={`inline text-muted-foreground transition-transform ${selected?.id === b.id ? "rotate-90 text-primary" : ""}`} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-border text-xs text-muted-foreground">
              {filtered.length} of {bookings.length} booking{bookings.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Availability ──────────────────────────────────────────────────────────────

  function AvailabilityContent() {
    const previewSlots = generateSlots(availability);

    return (
      <div className="space-y-4">
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6 space-y-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <CalendarCheck size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Working Days</h3>
                <p className="text-xs text-muted-foreground">Choose the days clients can book sessions with you.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DAYS.map(({ key, label }) => {
                const active = availability.days.includes(key);
                return (
                  <button key={key} type="button" onClick={() => toggleDay(key)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${active ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30"}`}>
                    {label}
                  </button>
                );
              })}
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Clock size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Working Hours & Session Length</h3>
                <p className="text-xs text-muted-foreground">Sessions are auto-generated as back-to-back slots within these hours.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="av-start">Start time</Label>
                <Input id="av-start" type="time" className="mt-1" value={availability.startTime} onChange={(e) => persistAvailability({ ...availability, startTime: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="av-end">End time</Label>
                <Input id="av-end" type="time" className="mt-1" value={availability.endTime} onChange={(e) => persistAvailability({ ...availability, endTime: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="av-slot">Session length</Label>
                <Select value={String(availability.slotMinutes)} onValueChange={(v) => persistAvailability({ ...availability, slotMinutes: Number(v) })}>
                  <SelectTrigger id="av-slot" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SLOT_LENGTHS.map((m) => <SelectItem key={m} value={String(m)}>{m} minutes</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="h-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
                <CalendarOff size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Days Off / Blocked Dates</h3>
                <p className="text-xs text-muted-foreground">Block specific dates — holidays, leave, or fully booked days.</p>
              </div>
            </div>
            {availability.blockedDates.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {availability.blockedDates.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1 bg-red-50 text-red-700 border border-red-200 text-xs px-2.5 py-1 rounded-lg">
                    <CalendarOff size={10} />
                    {fmt(d)}
                    <button type="button" title={`Unblock ${fmt(d)}`} onClick={() => removeBlockedDate(d)} className="ml-0.5 text-red-500/60 hover:text-red-600 transition-colors">
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <Input type="date" className="h-9 text-sm max-w-[200px]" value={blockedDateInput} onChange={(e) => setBlockedDateInput(e.target.value)} min={new Date().toISOString().split("T")[0]} />
              <Button size="sm" variant="outline" className="h-9 px-3 text-red-600 border-red-200 hover:bg-red-50" onClick={addBlockedDate}>
                <Plus size={13} className="mr-1" /> Block date
              </Button>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 space-y-4 h-fit">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Settings2 size={16} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">Daily Slot Preview</h3>
                <p className="text-xs text-muted-foreground">What clients will see on a working day</p>
              </div>
            </div>
            {previewSlots.length === 0 ? (
              <p className="text-sm text-muted-foreground">Adjust your hours — no slots fit with the current session length.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {previewSlots.map((s) => (
                  <span key={s} className="text-center text-xs font-medium px-2 py-2 rounded-lg bg-primary/8 text-primary border border-primary/15">{s}</span>
                ))}
              </div>
            )}
            <div className="text-xs text-muted-foreground bg-muted/40 rounded-xl p-3 leading-relaxed">
              <strong className="text-foreground">{previewSlots.length}</strong> session{previewSlots.length !== 1 ? "s" : ""} per working day · automatically hidden once booked, declined or cancelled bookings free the slot back up.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Schedule ──────────────────────────────────────────────────────────────────

  function ScheduleContent() {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Set available intake dates per program. These help track when enrollments open.</p>
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {PROGRAMS.map((prog) => {
            const dates = programDates[prog] ?? [];
            return (
              <div key={prog} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <h3 className="font-medium text-sm text-foreground leading-snug">{prog}</h3>
                {dates.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No dates set.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {dates.map((d) => (
                      <span key={d} className="inline-flex items-center gap-1 bg-primary/8 text-primary text-xs px-2.5 py-1 rounded-lg">
                        <Calendar size={10} />
                        {fmt(d)}
                        <button type="button" title={`Remove ${fmt(d)}`} onClick={() => removeProgramDate(prog, d)} className="ml-0.5 text-primary/60 hover:text-red-500 transition-colors">
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input type="date" className="h-8 text-xs" value={dateInputs[prog] ?? ""} onChange={(e) => setDateInputs((prev) => ({ ...prev, [prog]: e.target.value }))} min={new Date().toISOString().split("T")[0]} />
                  <Button size="sm" variant="outline" className="h-8 px-3 flex-shrink-0 text-primary border-primary/30 hover:bg-primary/5" onClick={() => addProgramDate(prog)}>
                    <Plus size={13} />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Programs CMS ─────────────────────────────────────────────────────────────

  function ProgramsContent() {
    const liveCount = programs.filter((p) => p.status === "active").length;
    const draftCount = programs.filter((p) => p.status === "draft").length;

    return (
      <div className="space-y-4">
        {programs.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {liveCount} live
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-400" />
              {draftCount} draft
            </span>
          </div>
        )}

        {programs.length === 0 ? (
          <div className="bg-card border border-dashed border-border rounded-2xl p-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center mx-auto mb-4">
              <BookOpen size={24} />
            </div>
            <h3 className="font-semibold text-foreground mb-1">No programs yet</h3>
            <p className="text-sm text-muted-foreground mb-5">Add your first program and it'll appear on the website instantly.</p>
            <Button onClick={openAddProgram} className="bg-primary text-primary-foreground">
              <Plus size={14} className="mr-1.5" /> Add Program
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {programs.map((p) => (
              <div key={p.id} className={`bg-card border rounded-2xl overflow-hidden flex flex-col group transition-shadow hover:shadow-md ${p.status === "draft" ? "border-dashed border-border/70" : "border-border"}`}>
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted">
                      <ImageIcon size={28} className="text-muted-foreground/30" />
                      <span className="text-xs text-muted-foreground/50">No image</span>
                    </div>
                  )}
                  {/* Status badges */}
                  <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${p.status === "active" ? "bg-emerald-500 text-white" : "bg-gray-500 text-white"}`}>
                      {p.status === "active" ? "Live" : "Draft"}
                    </span>
                    {p.enrollmentOpen && p.status === "active" && (
                      <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-gold text-white">Enrolling</span>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 flex flex-col flex-1">
                  {p.tag && <p className="text-[11px] uppercase tracking-widest text-gold mb-1 font-medium">{p.tag}</p>}
                  <h3 className="font-semibold text-foreground text-sm leading-snug mb-1.5">{p.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 flex-1">{p.description || <span className="italic">No description</span>}</p>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2.5 mb-3">
                    {p.duration && <span className="flex items-center gap-1"><Clock size={10} />{p.duration}</span>}
                    {p.startDate && <span className="flex items-center gap-1"><Calendar size={10} />{fmt(p.startDate)}</span>}
                    {p.price && <span className="font-medium text-foreground">{p.price}</span>}
                  </div>

                  <div className="flex gap-2 mt-auto pt-1">
                    <Button size="sm" variant="outline" className="flex-1 h-8 text-xs gap-1" onClick={() => openEditProgram(p)}>
                      <Edit3 size={11} /> Edit
                    </Button>
                    <button
                      type="button"
                      title={p.status === "active" ? "Set to Draft" : "Publish"}
                      onClick={() => toggleProgramStatus(p)}
                      className="h-8 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors"
                    >
                      {p.status === "active" ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      type="button"
                      title="Delete"
                      onClick={() => deleteProgram(p.id)}
                      className="h-8 px-2.5 rounded-md border border-border text-xs text-muted-foreground hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── Detail Panel ─────────────────────────────────────────────────────────────

  function DetailPanel() {
    if (!selected) return null;
    const b = selected;
    return (
      <aside className="w-80 xl:w-96 flex-shrink-0 border-l border-border bg-card flex flex-col overflow-y-auto">
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold flex-shrink-0">
              {b.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="font-semibold text-foreground">{b.name}</p>
              <a href={`tel:${b.phone}`} className="text-xs text-muted-foreground hover:text-primary">{b.phone}</a>
            </div>
          </div>
          <button type="button" title="Close" onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="flex gap-2 p-4 border-b border-border">
          <a href={`tel:${b.phone}`} className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl border border-border hover:bg-muted/50 transition-colors">
            <Phone size={14} /> Call
          </a>
          <a href={waUrl(b.phone)} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors">
            <MessageCircle size={14} /> WhatsApp
          </a>
        </div>

        <div className="p-4 space-y-5 flex-1">
          <div>
            <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Status</p>
            <div className="flex flex-wrap gap-1.5">
              {STATUSES.map((s) => {
                const c = STATUS_CFG[s];
                return (
                  <button key={s} onClick={() => updateStatus(b.id, s)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${b.status === s ? `${c.bg} ${c.text} ${c.border} ring-1 ring-offset-1 ring-current/30` : "bg-muted/40 text-muted-foreground border-border hover:border-primary/30"}`}>
                    <c.Icon size={11} />{s}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Program</p>
            <p className="text-sm text-foreground">{b.program}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Enrolled</p>
              <p className="text-sm text-foreground">{fmt(b.enrollmentDate)}</p>
            </div>
            {b.sessionDate && (
              <div>
                <p className="text-xs text-muted-foreground mb-1 font-medium uppercase tracking-wide">Session</p>
                <p className="text-sm text-foreground">{fmt(b.sessionDate)}{b.sessionTime && <span className="text-muted-foreground"> · {b.sessionTime}</span>}</p>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Notes</p>
              {!editingNotes && (
                <button onClick={() => { setTempNotes(b.notes ?? ""); setEditingNotes(true); }} className="text-xs text-primary flex items-center gap-1 hover:underline">
                  <Edit3 size={10} /> Edit
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea rows={4} value={tempNotes} onChange={(e) => setTempNotes(e.target.value)} className="w-full text-sm px-3 py-2 rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" placeholder="Add notes…" />
                <div className="flex gap-2">
                  <Button size="sm" className="bg-primary text-primary-foreground h-8" onClick={() => saveNotes(b.id)}>Save</Button>
                  <Button size="sm" variant="outline" className="h-8" onClick={() => setEditingNotes(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-foreground/70 whitespace-pre-wrap">{b.notes || <span className="text-muted-foreground italic">No notes.</span>}</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button type="button" onClick={() => deleteBooking(b.id)} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-xl transition-colors border border-transparent hover:border-red-100">
            <Trash2 size={13} /> Delete booking
          </button>
        </div>
      </aside>
    );
  }

  // ── Header title / action helpers ─────────────────────────────────────────────

  const headerTitle = view === "overview" ? "Overview"
    : view === "bookings" ? "Bookings & Enrollments"
    : view === "availability" ? "Availability"
    : view === "schedule" ? "Program Intake Schedule"
    : "Programs CMS";

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)", fontFamily: "var(--font-sans)" }}>
      {loading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0 fixed lg:relative z-30 w-60 h-full flex flex-col transition-transform duration-200`}
        style={{ background: "var(--primary)" }}
      >
        <div className="px-5 pt-6 pb-5 border-b border-white/10">
          <img src={logo} alt="COHATA" className="h-10 w-auto brightness-0 invert" />
          <p className="text-xs mt-2 font-semibold uppercase tracking-widest" style={{ color: "var(--gold)" }}>Admin Portal</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(({ id, label, Icon }) => (
            <button key={id} onClick={() => { setView(id); setSidebarOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${view === id ? "bg-white/15 text-white" : "text-white/55 hover:text-white hover:bg-white/8"}`}>
              <Icon size={16} />
              {label}
              {id === "bookings" && stats.pending > 0 && (
                <span className="ml-auto text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold" style={{ background: "var(--gold)", color: "var(--gold-foreground)" }}>
                  {stats.pending}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/30 text-center">COHATA Admin v1.0</p>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-20 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* Top bar */}
          <header className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b" style={{ background: "var(--card)", borderColor: "var(--border)" }}>
            <div className="flex items-center gap-3">
              <button type="button" title="Toggle menu" className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-base font-semibold text-foreground">{headerTitle}</h1>
                <p className="text-xs text-muted-foreground">
                  {view === "programs"
                    ? `${programs.length} program${programs.length !== 1 ? "s" : ""} · ${programs.filter(p => p.status === "active").length} live`
                    : `${stats.total} total · ${stats.pending} pending`}
                </p>
              </div>
            </div>
            {view === "programs" ? (
              <Button onClick={openAddProgram} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={14} className="mr-1.5" /> Add Program
              </Button>
            ) : (
              <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                <Plus size={14} className="mr-1.5" /> New Booking
              </Button>
            )}
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            {view === "overview"    && <OverviewContent />}
            {view === "bookings"    && <BookingsContent />}
            {view === "availability" && <AvailabilityContent />}
            {view === "schedule"    && <ScheduleContent />}
            {view === "programs"    && <ProgramsContent />}
          </main>
        </div>

        {selected && view === "bookings" && <DetailPanel />}
      </div>

      {/* Add Booking Modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-xl" style={{ color: "var(--primary)" }}>New Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="f-name">Full Name *</Label>
                <Input id="f-name" placeholder="e.g. Fatimah Al-Amin" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="f-phone">Phone *</Label>
                <Input id="f-phone" placeholder="+234 812 345 6789" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="f-program">Program *</Label>
                <Select value={form.program} onValueChange={(v) => setForm({ ...form, program: v })}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select a program…" /></SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="f-status">Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="f-enroll">Enrollment Date</Label>
                <Input id="f-enroll" type="date" value={form.enrollmentDate} onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="f-sdate">Session Date</Label>
                <Input id="f-sdate" type="date" value={form.sessionDate} onChange={(e) => setForm({ ...form, sessionDate: e.target.value })} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="f-stime">Session Time</Label>
                <Input id="f-stime" type="time" value={form.sessionTime} onChange={(e) => setForm({ ...form, sessionTime: e.target.value })} className="mt-1" />
              </div>
              <div className="col-span-2">
                <Label htmlFor="f-notes">Notes</Label>
                <textarea id="f-notes" rows={3} placeholder="Any notes or context…" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
              <Button onClick={addBooking} className="bg-primary text-primary-foreground hover:bg-primary/90">Create Booking</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add / Edit Program Modal */}
      <Dialog open={isProgramOpen} onOpenChange={(open) => { if (!open) { setIsProgramOpen(false); setProgramEditId(null); } }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl" style={{ color: "var(--primary)" }}>
              {programEditId ? "Edit Program" : "Add New Program"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-1">
            {/* Title & Tag */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Label htmlFor="p-title">Program Title *</Label>
                <Input id="p-title" placeholder="e.g. The SIRAJ Method™ Certification" value={programForm.title} onChange={(e) => setProgramForm((f) => ({ ...f, title: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="p-tag">Category / Tag</Label>
                <Input id="p-tag" placeholder="e.g. Signature" value={programForm.tag} onChange={(e) => setProgramForm((f) => ({ ...f, tag: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Short description (card) */}
            <div>
              <Label htmlFor="p-desc">Short Description <span className="text-muted-foreground font-normal">(shown on cards)</span></Label>
              <textarea id="p-desc" rows={2} maxLength={250} placeholder="A brief summary visible on the programs listing page…" value={programForm.description} onChange={(e) => setProgramForm((f) => ({ ...f, description: e.target.value }))} className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" />
              <p className="text-xs text-muted-foreground mt-0.5 text-right">{programForm.description.length}/250</p>
            </div>

            {/* Full description (popup) */}
            <div>
              <Label htmlFor="p-full">Full Description <span className="text-muted-foreground font-normal">(shown in popup)</span></Label>
              <textarea id="p-full" rows={5} placeholder="Detailed program overview, what's included, who it's for…" value={programForm.fullDescription} onChange={(e) => setProgramForm((f) => ({ ...f, fullDescription: e.target.value }))} className="w-full mt-1 px-3 py-2 text-sm rounded-xl border border-input bg-background focus:outline-none focus:border-primary resize-none" />
            </div>

            {/* Duration / Start Date / Price */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="p-dur">Duration</Label>
                <Input id="p-dur" placeholder="e.g. 12 weeks" value={programForm.duration} onChange={(e) => setProgramForm((f) => ({ ...f, duration: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="p-start">Start Date</Label>
                <Input id="p-start" type="date" value={programForm.startDate} onChange={(e) => setProgramForm((f) => ({ ...f, startDate: e.target.value }))} className="mt-1" />
              </div>
              <div>
                <Label htmlFor="p-price">Price</Label>
                <Input id="p-price" placeholder="e.g. ₦150,000" value={programForm.price} onChange={(e) => setProgramForm((f) => ({ ...f, price: e.target.value }))} className="mt-1" />
              </div>
            </div>

            {/* Image */}
            <div>
              <Label>Cover Image</Label>
              <div className="mt-1 border border-border rounded-xl overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b border-border">
                  <button type="button" onClick={() => setProgramImageTab("url")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${programImageTab === "url" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <LinkIcon size={12} /> Paste URL
                  </button>
                  <button type="button" onClick={() => setProgramImageTab("upload")} className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${programImageTab === "upload" ? "bg-primary/5 text-primary border-b-2 border-primary" : "text-muted-foreground hover:text-foreground"}`}>
                    <Upload size={12} /> Upload File
                  </button>
                </div>

                <div className="p-3">
                  {programImageTab === "url" ? (
                    <Input placeholder="https://…" value={programForm.imageUrl.startsWith("data:") ? "" : programForm.imageUrl} onChange={(e) => setProgramForm((f) => ({ ...f, imageUrl: e.target.value }))} className="text-sm" />
                  ) : (
                    <div>
                      <input ref={fileInputRef} type="file" accept="image/*" aria-label="Upload program cover image" className="hidden" onChange={handleProgramImageFile} />
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full flex flex-col items-center justify-center gap-2 py-6 border border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/40 hover:text-primary transition-colors text-sm">
                        <Upload size={20} />
                        <span>Click to choose image</span>
                        <span className="text-xs opacity-60">JPG, PNG, WebP · max 3 MB</span>
                      </button>
                    </div>
                  )}

                  {/* Preview */}
                  {programForm.imageUrl && (
                    <div className="mt-3 relative rounded-xl overflow-hidden aspect-video bg-muted">
                      <img src={programForm.imageUrl} alt="Preview" className="w-full h-full object-cover" onError={() => setProgramForm((f) => ({ ...f, imageUrl: "" }))} />
                      <button type="button" title="Remove image" onClick={() => setProgramForm((f) => ({ ...f, imageUrl: "" }))} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors">
                        <X size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Status & Enrollment */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="p-status">Status</Label>
                <Select value={programForm.status} onValueChange={(v: "active" | "draft") => setProgramForm((f) => ({ ...f, status: v }))}>
                  <SelectTrigger id="p-status" className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Live (visible on website)</SelectItem>
                    <SelectItem value="draft">Draft (hidden from website)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-3 cursor-pointer mt-6">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={programForm.enrollmentOpen ? "true" : "false"}
                    onClick={() => setProgramForm((f) => ({ ...f, enrollmentOpen: !f.enrollmentOpen }))}
                    className={`relative w-11 h-6 rounded-full transition-colors ${programForm.enrollmentOpen ? "bg-primary" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${programForm.enrollmentOpen ? "translate-x-5" : ""}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium text-foreground">Enrollment open</p>
                    <p className="text-xs text-muted-foreground">Shows "Enrolling" badge + Enroll button</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button variant="outline" onClick={() => setIsProgramOpen(false)}>Cancel</Button>
              <Button onClick={saveProgram} className="bg-primary text-primary-foreground hover:bg-primary/90">
                {programEditId ? "Save Changes" : "Publish Program"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
