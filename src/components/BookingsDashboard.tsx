import { useState, useEffect } from "react";
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

interface ProgramDates {
  [program: string]: string[];
}

type View = "overview" | "bookings" | "schedule";

// ─── Constants ────────────────────────────────────────────────────────────────

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
  { id: "overview" as View, label: "Overview",  Icon: LayoutDashboard },
  { id: "bookings" as View, label: "Bookings",  Icon: Users },
  { id: "schedule" as View, label: "Schedule",  Icon: CalendarDays },
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

function emptyForm() {
  return { name: "", phone: "", program: "", status: "Pending", enrollmentDate: new Date().toISOString().split("T")[0], sessionDate: "", sessionTime: "", notes: "" };
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function BookingsDashboard() {
  const [view, setView] = useState<View>("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [programDates, setProgramDates] = useState<ProgramDates>({});
  const [selected, setSelected] = useState<Booking | null>(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [tempNotes, setTempNotes] = useState("");
  const [dateInputs, setDateInputs] = useState<Record<string, string>>({});
  const [form, setForm] = useState(emptyForm());

  useEffect(() => {
    const b = localStorage.getItem("cohata_bookings");
    if (b) setBookings(JSON.parse(b));
    const d = localStorage.getItem("cohata_program_dates");
    if (d) setProgramDates(JSON.parse(d));
  }, []);

  const persist = (b: Booking[]) => {
    setBookings(b);
    localStorage.setItem("cohata_bookings", JSON.stringify(b));
  };

  const persistDates = (d: ProgramDates) => {
    setProgramDates(d);
    localStorage.setItem("cohata_program_dates", JSON.stringify(d));
  };

  const updateStatus = (id: string, status: string) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, status } : b));
    persist(updated);
    setSelected((prev) => (prev?.id === id ? { ...prev, status } : prev));
  };

  const saveNotes = (id: string) => {
    const updated = bookings.map((b) => (b.id === id ? { ...b, notes: tempNotes } : b));
    persist(updated);
    setSelected((prev) => (prev?.id === id ? { ...prev, notes: tempNotes } : prev));
    setEditingNotes(false);
  };

  const deleteBooking = (id: string) => {
    if (!confirm("Delete this booking? This cannot be undone.")) return;
    persist(bookings.filter((b) => b.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const addBooking = () => {
    if (!form.name || !form.phone || !form.program) {
      alert("Name, phone, and program are required.");
      return;
    }
    const nb: Booking = { id: Date.now().toString(), createdAt: new Date().toISOString(), ...form };
    persist([nb, ...bookings]);
    setIsAddOpen(false);
    setForm(emptyForm());
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

  // ── Overview ─────────────────────────────────────────────────────────────────

  function OverviewContent() {
    return (
      <div className="space-y-6">
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

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <h2 className="font-semibold text-foreground">Recent Bookings</h2>
            <button onClick={() => setView("bookings")} className="text-xs text-primary flex items-center gap-1 hover:gap-2 transition-all">
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
                  <th className="px-4 py-3.5" />
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
                        <button onClick={() => removeProgramDate(prog, d)} className="ml-0.5 text-primary/60 hover:text-red-500 transition-colors">
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
          <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
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
          <button onClick={() => deleteBooking(b.id)} className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:bg-red-50 py-2 rounded-xl transition-colors border border-transparent hover:border-red-100">
            <Trash2 size={13} /> Delete booking
          </button>
        </div>
      </aside>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--background)", fontFamily: "var(--font-sans)" }}>

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
              <button className="lg:hidden text-muted-foreground hover:text-foreground" onClick={() => setSidebarOpen(!sidebarOpen)}>
                <Menu size={20} />
              </button>
              <div>
                <h1 className="text-base font-semibold text-foreground">
                  {view === "overview" ? "Overview" : view === "bookings" ? "Bookings & Enrollments" : "Program Schedule"}
                </h1>
                <p className="text-xs text-muted-foreground">{stats.total} total · {stats.pending} pending</p>
              </div>
            </div>
            <Button onClick={() => setIsAddOpen(true)} size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus size={14} className="mr-1.5" /> New Booking
            </Button>
          </header>

          {/* Page content */}
          <main className="flex-1 overflow-auto p-6">
            {view === "overview" && <OverviewContent />}
            {view === "bookings" && <BookingsContent />}
            {view === "schedule" && <ScheduleContent />}
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
    </div>
  );
}
