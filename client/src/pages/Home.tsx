// CuidaMar Privacidad · Archivo de Marea
// This page deliberately contains no personal, clinical, patient, payroll, or free-text fields.
import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArrowUpRight,
  Ban,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardCheck,
  Clock3,
  CloudOff,
  EyeOff,
  FileLock2,
  Flag,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  MoreHorizontal,
  PauseCircle,
  Plus,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  SunMedium,
  Trash2,
  UserRoundX,
  Waves,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { getOrCreateInstallationKey } from "@/lib/installationKey";

const initialTasks = [
  { id: 1, label: "Revisar prioridades del bloque de mañana", time: "07:00", type: "P1", tone: "rose", done: false },
  { id: 2, label: "Preparar material genérico de confort", time: "07:20", type: "P2", tone: "teal", done: false },
  { id: 3, label: "Comprobar disponibilidad de apoyo", time: "08:10", type: "P2", tone: "teal", done: true },
  { id: 4, label: "Cerrar pendientes y preparar relevo", time: "13:30", type: "P3", tone: "sand", done: false },
];

const templateByTitle = { "Ronda de inicio": "ronda_inicio", "Confort y material": "material_generico", "Cierre de turno": "cierre_turno" } as const;
const titleByTemplate = { ronda_inicio: "Ronda de inicio", material_generico: "Confort y material", cierre_turno: "Cierre de turno", prioridades: "Prioridades", pausa_segura: "Pausa segura", comprobacion_apoyo: "Comprobación de apoyo", bloque_profundo: "Bloque de enfoque", relevo_generico: "Relevo genérico", recuperacion: "Recuperación", revision_limites: "Revisión de límites", orden_entorno: "Orden del entorno", fin_bloque: "Fin de bloque" } as const;
const machineModes = [
  { key: "inicio", label: "Inicio", note: "4 operaciones de arranque" },
  { key: "flujo", label: "Flujo", note: "4 operaciones de continuidad" },
  { key: "cierre", label: "Cierre", note: "4 operaciones de cierre" },
] as const;

const safeTemplates = [
  { title: "Ronda de inicio", description: "Revisión general y prioridades", icon: Flag },
  { title: "Confort y material", description: "Lista genérica de preparación", icon: ClipboardCheck },
  { title: "Cierre de turno", description: "Pendientes para el siguiente bloque", icon: Archive },
];

const navItems = [
  { label: "Resumen", icon: LayoutDashboard, target: "resumen" },
  { label: "Turno genérico", icon: Clock3, target: "turno" },
  { label: "Privacidad", icon: ShieldCheck, target: "privacidad" },
];

export default function Home() {
  const [installationKey] = useState(getOrCreateInstallationKey);
  const forcedState = new URLSearchParams(window.location.search).get("state");
  const forceLoading = forcedState === "loading";
  const forceError = forcedState === "error";
  const forceEmpty = forcedState === "empty";
  const dbStatus = trpc.genericTasks.status.useQuery(undefined, { retry: false });
  const taskQuery = trpc.genericTasks.list.useQuery({ installationKey }, { enabled: Boolean(dbStatus.data?.available), retry: false });
  const machineCapacityQuery = trpc.machine.capacity.useQuery({ installationKey }, { enabled: Boolean(dbStatus.data?.available), retry: false });
  const preferenceMutation = trpc.genericPreferences.save.useMutation();
  const taskUtils = trpc.useUtils();
  const seedMutation = trpc.genericTasks.seed.useMutation({
    onSuccess: async (result) => { await taskUtils.genericTasks.list.invalidate(); toast.success(result.available ? "Demo guardada en la base portable" : "Modo local activo", { description: result.available ? "Solo se han guardado claves sintéticas." : "Configura DATABASE_URL para activar persistencia." }); },
    onError: () => toast.error("No se pudo conectar", { description: "La demo sigue funcionando localmente y no se ha enviado información personal." }),
  });
  const createMutation = trpc.genericTasks.create.useMutation({ onSuccess: () => taskUtils.genericTasks.list.invalidate(), onError: () => toast.error("No se pudo guardar la plantilla", { description: "La demo local continúa disponible." }) });
  const statusMutation = trpc.genericTasks.setStatus.useMutation({ onSuccess: () => taskUtils.genericTasks.list.invalidate(), onError: () => toast.error("No se pudo actualizar la tarea", { description: "El cambio se mantiene solo en esta demo." }) });
  const clearMutation = trpc.genericTasks.clear.useMutation({ onSuccess: () => taskUtils.genericTasks.list.invalidate(), onError: () => toast.error("No se pudo limpiar la base portable") });
  const batchMutation = trpc.machine.runBatch.useMutation({
    onSuccess: async (result) => { await Promise.all([taskUtils.genericTasks.list.invalidate(), taskUtils.machine.capacity.invalidate()]); toast.success(`Lote aplicado: ${result.inserted} operaciones genéricas`, { description: "La máquina nunca recibe texto libre ni datos de personas." }); },
    onError: () => toast.error("Límite de capacidad alcanzado", { description: "Limpia la demo o completa operaciones antes de añadir otro lote." }),
  });
  const [activeNav, setActiveNav] = useState("Resumen");
  const [tasks, setTasks] = useState(initialTasks);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [privacyLocked, setPrivacyLocked] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [machineQueue, setMachineQueue] = useState<(typeof machineModes)[number]["key"][]>([]);

  useEffect(() => {
    if (!taskQuery.data) return;
    setTasks(taskQuery.data.map((task) => ({ id: task.id, label: titleByTemplate[task.templateKey as keyof typeof titleByTemplate] ?? "Plantilla genérica", time: "Flexible", type: "P3", tone: "sand", done: task.status === "done" })));
  }, [taskQuery.data]);

  const completed = useMemo(() => tasks.filter((task) => task.done).length, [tasks]);
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const navigateTo = (target: string, label: string) => {
    setActiveNav(label);
    document.getElementById(target)?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  const toggleTask = (id: number) => {
    setTasks((current) => current.map((task) => {
      if (task.id !== id) return task;
      const nextDone = !task.done;
      if (dbStatus.data?.available) statusMutation.mutate({ installationKey, id, status: nextDone ? "done" : "todo" });
      return { ...task, done: nextDone };
    }));
  };

  const addTemplate = (title: string) => {
    const nextId = tasks.reduce((maxId, task) => Math.max(maxId, task.id), 0) + 1;
    setTasks((current) => [...current, { id: nextId, label: title, time: "Flexible", type: "P3", tone: "sand", done: false }]);
    const templateKey = templateByTitle[title as keyof typeof templateByTitle];
    if (dbStatus.data?.available && templateKey) createMutation.mutate({ installationKey, templateKey, sortOrder: nextId });
    toast.success("Plantilla genérica añadida", { description: "No se ha guardado ningún dato personal." });
  };

  const lockSensitive = () => {
    setPrivacyLocked(true);
    preferenceMutation.mutate({ installationKey, reducedMotion: false, privacyLock: true });
    setShowPrivacy(true);
    toast("Perímetro de privacidad activo", { description: "La aplicación no permite información identificable." });
  };

  const resetDemo = () => {
    setMachineQueue([]);
    if (dbStatus.data?.available) {
      clearMutation.mutate({ installationKey }, {
        onSuccess: () => {
          setTasks([]);
          toast.success("Plantillas guardadas eliminadas", { description: "La base portable queda sin tareas genéricas." });
        },
      });
      return;
    }
    setTasks(initialTasks);
    toast.success("Demo local restablecida", { description: "Solo se han restaurado datos sintéticos en memoria." });
  };

  const enqueueMachineBatch = (batch: (typeof machineModes)[number]["key"]) => {
    if (machineQueue.length >= 3) return toast.error("Cola de máquina llena", { description: "Ejecuta o recupera antes de preparar más lotes." });
    setMachineQueue(current => [...current, batch]);
    toast.success(`Lote ${batch} preparado`, { description: "Queda en cola local hasta su ejecución." });
  };

  const executeMachineQueue = () => {
    const next = machineQueue[0];
    if (!next) return;
    batchMutation.mutate({ installationKey, batch: next }, { onSuccess: () => setMachineQueue(current => current.slice(1)) });
  };

  const blockedInputDemo = () => {
    setPrivacyLocked(true);
    preferenceMutation.mutate({ installationKey, reducedMotion: false, privacyLock: true });
    toast("Entrada bloqueada antes de guardar", { description: "CuidaMar no permite nombres, pacientes, ubicaciones ni texto identificable." });
  };

  return (
    <div className="min-h-screen bg-[#f3f0e8] text-[#152d3d]" data-privacy-mode="local-synthetic">
      <div className="mx-auto flex min-h-screen max-w-[1500px]">
        <aside className="hidden w-[260px] shrink-0 flex-col border-r border-[#d9d7cd] bg-[#eeeae0] px-6 py-7 lg:flex">
          <div className="flex items-center gap-3">
            <div className="brand-mark"><Waves size={21} strokeWidth={2.2} /></div>
            <div>
              <p className="font-display text-[21px] leading-none tracking-[-0.03em]">CuidaMar</p>
              <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#64807f]">privacidad</p>
            </div>
          </div>
          <div className="my-8 h-px bg-[#d9d7cd]" />
          <p className="eyebrow mb-3">Espacio local</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const selected = activeNav === item.label;
              return (
                <button key={item.label} onClick={() => navigateTo(item.target, item.label)} className={`nav-item ${selected ? "nav-item-active" : ""}`}>
                  <Icon size={17} strokeWidth={1.8} />
                  <span>{item.label}</span>
                  {selected && <ChevronRight className="ml-auto" size={15} />}
                </button>
              );
            })}
          </nav>
          <div className="mt-auto rounded-2xl border border-[#cad9d5] bg-[#e2efeb] p-4">
            <div className="mb-3 flex items-center justify-between"><ShieldCheck size={19} className="text-[#2b8c87]" /><Badge className="badge-safe">Activo</Badge></div>
            <p className="text-sm font-semibold text-[#244d4b]">Límites de datos</p>
            <p className="mt-1 text-xs leading-5 text-[#547170]">Sin cuentas ni datos identificables.</p>
          </div>
        </aside>

        <main className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-[#dedbd2] px-5 py-5 sm:px-9">
            <div className="flex items-center gap-3 lg:hidden"><Button variant="ghost" size="icon" aria-label="Abrir navegación" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></Button><div className="brand-mark small"><Waves size={17} /></div><span className="font-display text-lg">CuidaMar</span></div>
            <div className="hidden items-center gap-2 text-sm text-[#6e7b7b] lg:flex"><span className="h-2 w-2 rounded-full bg-[#2b8c87]" />Demo local · datos sintéticos</div>
            <div className="relative ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" aria-label="Ayuda" onClick={() => toast("CuidaMar no almacena información personal.", { description: "Usa únicamente plantillas genéricas." })}><CircleHelp size={19} /></Button>
              <Button variant="ghost" size="icon" aria-label="Más opciones" aria-expanded={menuOpen} aria-controls="cuidamar-options" onClick={() => setMenuOpen(!menuOpen)}><MoreHorizontal size={20} /></Button>
              {menuOpen && <div id="cuidamar-options" className="absolute right-0 top-12 z-20 w-52 rounded-xl border border-[#d9d7cd] bg-[#fffdf8] p-2 shadow-xl"><button className="menu-button" onClick={resetDemo}><RotateCcw size={15} />Restablecer demo</button><button className="menu-button" onClick={lockSensitive}><LockKeyhole size={15} />Bloquear datos sensibles</button></div>}
            </div>
          </header>

          <div className="px-5 py-8 sm:px-9 lg:px-12 lg:py-11">
            <section id="resumen" className="hero-panel relative overflow-hidden rounded-[28px] px-6 py-8 sm:px-9 sm:py-10"><div className="archive-ruler"><span>CUiDAMAR / ARCHIVO 01</span><span>SIN DATOS CLÍNICOS</span></div>
              <div className="relative max-w-3xl">
                <div className="mb-5 flex flex-wrap items-center gap-2"><Badge className="badge-local"><CloudOff size={13} /> Local-first</Badge><span className="text-xs text-[#b4ccc7]">Sin cuenta; la base de datos es opcional</span></div>
                <h1 className="max-w-2xl font-display text-4xl leading-[1.02] tracking-[-0.045em] text-[#f4f2e9] sm:text-[52px]">Ordena tu jornada.<br /><em className="text-[#85d1c1]">No guardamos personas.</em></h1>
                <p className="mt-5 max-w-xl text-sm leading-6 text-[#bed0cc] sm:text-[15px]">Un organizador genérico para bloques de trabajo, pausas y pendientes. Diseñado para no pedir nombres, pacientes, documentos ni identificadores.</p>
                <div className="mt-7 flex flex-wrap gap-3"><Button className="button-teal" onClick={() => toast.success("Ritmo de trabajo activo", { description: "La demo usa únicamente tareas sintéticas." })}><Sparkles size={16} />Activar mi ritmo</Button><Button variant="outline" className="button-ghost" onClick={() => setShowPrivacy(true)}><ShieldCheck size={16} />Ver límites</Button></div>
              </div>
              <div className="hero-number">01</div>
            </section>

            <div className="wave-rule" aria-hidden="true"><span className="wave-line">∿∿∿</span><span>solo estructura genérica</span><span className="ml-auto">sin identidad</span></div><div className="mt-8 grid gap-5 xl:grid-cols-[1.4fr_0.8fr]">
              <section id="turno">
                <div className="mb-4 flex items-end justify-between"><div><p className="eyebrow">Hoy · plantilla sintética</p><h2 className="mt-1 font-display text-[27px] tracking-[-0.03em]">Tu bloque de trabajo</h2></div><span className="text-xs font-semibold text-[#748381]">{completed}/{tasks.length} cerrado</span></div>
                <div role="progressbar" aria-label="Progreso de tareas genéricas" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="mb-5 h-1.5 overflow-hidden rounded-full bg-[#dcded7]"><div className="h-full rounded-full bg-[#2b8c87] transition-all duration-300" style={{ width: `${progress}%` }} /></div>
                {(taskQuery.isLoading || forceLoading) && <div className="task-state" role="status"><span className="task-state-dot" />Cargando solo plantillas genéricas…</div>}
                {(taskQuery.error || dbStatus.error || forceError) && <div className="task-state task-state-error" role="alert"><Ban size={15} />La base portable no responde. La demo local sigue disponible.</div>}
                {(forceEmpty || (!taskQuery.isLoading && tasks.length === 0)) && <div className="task-state" role="status">No hay plantillas guardadas. Elige una plantilla segura para comenzar.</div>}
                {!forceEmpty && <div className="space-y-3">{tasks.map((task) => <div key={task.id} className={`task-row ${task.done ? "task-done" : ""}`}><span className="folio-mark">{String(task.id).padStart(2, "0")}</span><button aria-label={task.done ? `Reabrir ${task.label}` : `Completar ${task.label}`} onClick={() => toggleTask(task.id)} className={`task-check ${task.done ? "task-check-done" : ""}`}>{task.done && <Check size={14} />}</button><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className={`priority priority-${task.tone}`}>{task.type}</span><span className="task-time">{task.time}</span></div><p className="mt-1 truncate text-sm font-semibold text-[#263f4d]">{task.label}</p></div></div>)}</div>}
                <div className="mt-5 flex items-center gap-3 rounded-2xl border border-dashed border-[#c4cbc2] bg-[#f7f5ee] p-4"><Plus size={18} className="text-[#2b8c87]" /><p className="text-xs leading-5 text-[#657774]">Añade una plantilla segura desde abajo. No se permite texto libre.</p></div>
              </section>

              <aside className="space-y-5">
                <Card className="soft-card"><CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><SunMedium size={17} className="text-[#c67a4a]" />Pulso del bloque</span><span className="font-display text-2xl text-[#263f4d]">{progress}%</span></CardTitle></CardHeader><CardContent><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-full border-4 border-[#cde3df] text-xs font-bold text-[#2b8c87]">{completed}/{tasks.length}</div><p className="text-xs leading-5 text-[#657774]">Avanza sin convertir la organización en una historia clínica.</p></div></CardContent></Card>
                <Card className="soft-card audit-card"><CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><LockKeyhole size={16} className="text-[#c67a4a]" />Límites de datos</span><span className="text-xs text-[#7d8a86]">Sin certificación</span></CardTitle><p className="text-xs leading-5 text-[#768580]">Plantillas cerradas sin campos personales; seguridad de despliegue no certificada. {dbStatus.data?.available ? "Base portable conectada." : "Sin base externa: la demo permanece local."}</p></CardHeader><CardContent><div className="audit-grid"><span><Check size={13} />Sin cuenta</span><span><Check size={13} />Sin campos clínicos</span><span><Check size={13} />Sin texto libre</span><span><Check size={13} />Sin pacientes</span></div><Button variant="outline" className="blocked-demo-button" onClick={blockedInputDemo}><Ban size={14} />Probar bloqueo preventivo</Button><Button variant="outline" className="portable-db-button" disabled={seedMutation.isPending || dbStatus.data?.available === false} onClick={() => seedMutation.mutate({ installationKey })}><CloudOff size={14} />{seedMutation.isPending ? "Guardando…" : dbStatus.data?.available ? "Guardar demo portable" : "Modo local"}</Button></CardContent></Card><Card className="soft-card machine-card"><CardHeader className="pb-3"><CardTitle className="flex items-center justify-between text-base"><span className="flex items-center gap-2"><Sparkles size={16} className="text-[#2b8c87]" />Máquina operativa</span><span className="audit-score">{machineCapacityQuery.data?.remaining ?? 48}</span></CardTitle><p className="text-xs leading-5 text-[#768580]">Catálogo cerrado: {machineCapacityQuery.data?.catalogSize ?? 12} operaciones; {machineCapacityQuery.data?.remaining ?? 48} espacios disponibles.</p></CardHeader><CardContent className="space-y-2">{machineModes.map((mode) => <button key={mode.key} className="template-row" disabled={batchMutation.isPending || dbStatus.data?.available === false} onClick={() => batchMutation.mutate({ installationKey, batch: mode.key })}><span className="template-icon"><Sparkles size={16} /></span><span className="min-w-0 text-left"><span className="block text-xs font-semibold text-[#2e4854]">Lote {mode.label}</span><span className="mt-0.5 block text-[11px] text-[#7d8a86]">{mode.note}</span></span><Plus className="ml-auto text-[#7d9994]" size={15} /></button>)}</CardContent></Card><Card className="soft-card"><CardHeader className="pb-3"><CardTitle className="text-base">Plantillas seguras</CardTitle><p className="text-xs leading-5 text-[#768580]">Bloques genéricos, sin nombres ni contexto identificable.</p></CardHeader><CardContent className="space-y-2">{safeTemplates.map((template) => { const Icon = template.icon; return <button key={template.title} onClick={() => addTemplate(template.title)} className="template-row"><span className="template-icon"><Icon size={16} /></span><span className="min-w-0 text-left"><span className="block text-xs font-semibold text-[#2e4854]">{template.title}</span><span className="mt-0.5 block truncate text-[11px] text-[#7d8a86]">{template.description}</span></span><Plus className="ml-auto text-[#7d9994]" size={15} /></button> })}</CardContent></Card>
              </aside>
            </div>

            <section className="mt-8 rounded-2xl border border-[#cad9d5] bg-[#eaf3ef] p-5"><div className="flex items-center justify-between gap-3"><div><p className="eyebrow">Consola de capacidad</p><h2 className="mt-1 font-display text-[24px]">Cola y recuperación</h2></div><span className="audit-score">{machineQueue.length}/3</span></div><div className="mt-4 grid gap-2 sm:grid-cols-4"><div className="task-state m-0">Usadas: {machineCapacityQuery.data?.used ?? 0}</div><div className="task-state m-0">Pendientes: {machineCapacityQuery.data?.pending ?? 0}</div><div className="task-state m-0">Cerradas: {machineCapacityQuery.data?.completed ?? 0}</div><div className="task-state m-0">Capacidad: {machineCapacityQuery.data?.remaining ?? 48}</div></div><div className="mt-3 flex flex-wrap gap-2">{machineModes.map((mode) => <Button key={mode.key} variant="outline" className="portable-db-button !mt-0 !w-auto" onClick={() => enqueueMachineBatch(mode.key)}>Preparar {mode.label}</Button>)}<Button className="button-teal" disabled={!machineQueue.length || batchMutation.isPending} onClick={executeMachineQueue}>{batchMutation.isPending ? "Ejecutando…" : `Ejecutar cola (${machineQueue.length})`}</Button><Button variant="outline" className="blocked-demo-button !w-auto" onClick={resetDemo}><RotateCcw size={14} />Recuperación controlada</Button></div></section>

            <section id="privacidad" className="mt-9 border-t border-[#d9d7cd] pt-7"><div className="mb-4 flex items-center justify-between"><div><p className="eyebrow">Reglas de protección</p><h2 className="mt-1 font-display text-[25px] tracking-[-0.03em]">Aquí está el límite</h2></div><Button variant="ghost" className="text-[#2b8c87] hover:bg-[#e3efeb]" onClick={() => setShowPrivacy(true)}>Ver detalles <ArrowUpRight size={15} /></Button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><div className="rule-card blocked-rule"><span className="rule-stamp">BLOQUEADO</span><UserRoundX size={18} /><p>No nombres ni correos</p><span>La identidad no entra en la app.</span></div><div className="rule-card blocked-rule"><span className="rule-stamp">BLOQUEADO</span><FileLock2 size={18} /><p>No documentos</p><span>Nóminas y archivos quedan fuera.</span></div><div className="rule-card blocked-rule"><span className="rule-stamp">BLOQUEADO</span><EyeOff size={18} /><p>No pacientes</p><span>Ni habitación, cama u horarios.</span></div><div className="rule-card blocked-rule"><span className="rule-stamp">BLOQUEADO</span><Ban size={18} /><p>No texto libre</p><span>Solo plantillas genéricas.</span></div></div></section>

            <footer className="mt-10 flex flex-col gap-4 border-t border-[#d9d7cd] pt-5 text-[11px] leading-5 text-[#7a8984] sm:flex-row sm:items-center sm:justify-between"><p><span className="font-semibold text-[#526b68]">CuidaMar Privacidad</span> · proyecto independiente de demostración.</p><div className="flex items-center gap-3"><button className="footer-link" onClick={lockSensitive}><KeyRound size={13} />Bloquear</button><button className="footer-link" onClick={resetDemo}><Trash2 size={13} />Limpiar demo</button></div></footer>
          </div>
        </main>
      </div>

      {mobileNavOpen && <div className="mobile-nav-backdrop" onClick={() => setMobileNavOpen(false)}><aside className="mobile-nav" onClick={(event) => event.stopPropagation()}><div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className="brand-mark small"><Waves size={17} /></div><span className="font-display text-lg">CuidaMar</span></div><button className="modal-close" aria-label="Cerrar navegación" onClick={() => setMobileNavOpen(false)}><X size={18} /></button></div><Separator className="my-6 bg-[#d9d7cd]" /><p className="eyebrow mb-3">Espacio local</p>{navItems.map((item) => { const Icon = item.icon; return <button key={item.label} className={`nav-item ${activeNav === item.label ? "nav-item-active" : ""}`} onClick={() => { navigateTo(item.target, item.label); setMobileNavOpen(false); }}><Icon size={17} />{item.label}</button>; })}<div className="mt-8 rounded-xl border border-[#e3b69d] bg-[#fff2ec] p-3 text-xs leading-5 text-[#9c6145]"><strong>Bloqueo activo.</strong> No se aceptan datos identificables.</div></aside></div>}

      {showPrivacy && <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="privacy-title" onKeyDown={(event) => { if (event.key === "Escape") setShowPrivacy(false); }}><div className="privacy-modal"><div className="flex items-start justify-between"><div><div className="brand-mark small mb-4"><ShieldCheck size={18} /></div><p className="eyebrow">Perímetro activo</p><h2 id="privacy-title" className="mt-1 font-display text-3xl tracking-[-0.04em]">La privacidad no es un ajuste.</h2></div><button className="modal-close" aria-label="Cerrar" autoFocus onClick={() => setShowPrivacy(false)}><X size={18} /></button></div><p className="mt-5 text-sm leading-6 text-[#58716f]">Es la condición de entrada. Esta demo no tiene cuentas ni campos personales. Si se configura una base de datos, las claves aleatorias y plantillas genéricas se envían a la API del mismo origen. No es una herramienta para registrar información sanitaria.</p><Separator className="my-6 bg-[#dfe4dc]" /><div className="space-y-3"><div className="modal-rule"><Check size={16} />Solo tareas y plantillas genéricas</div><div className="modal-rule"><Check size={16} />Datos sintéticos precargados</div><div className="modal-rule"><Check size={16} />Sin pacientes, nombres o documentos</div><div className="modal-rule"><Check size={16} />Limpieza local con un clic</div></div><div className="mt-7 flex justify-end gap-2"><Button variant="outline" className="border-[#cbd8d2]" onClick={() => setShowPrivacy(false)}>Volver</Button><Button className="button-teal" onClick={() => { lockSensitive(); setShowPrivacy(false); }}>Mantener bloqueado <LockKeyhole size={15} /></Button></div></div></div>}
    </div>
  );
}
