import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ClipboardList,
  HardHat,
  Map,
  Radio,
  Search,
  Users,
} from "lucide-react";
import {
  actaAmount,
  money,
  partidaTotal,
  partidas,
  sites,
  useErp,
  weekBars,
  type View,
} from "@/lib/erp-store";

const nav: { id: View; label: string; icon: typeof Map }[] = [
  { id: "home", label: "Multiobra", icon: Map },
  { id: "asistencia", label: "Asistencia", icon: Users },
  { id: "actas", label: "Actas", icon: ClipboardList },
  { id: "epp", label: "Inventario EPP", icon: HardHat },
];

export function DesktopApp({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (view: View) => void;
}) {
  return (
    <div className="hidden min-h-screen bg-navy text-snow md:flex">
      <aside className="flex w-60 shrink-0 flex-col border-r border-edge bg-panel px-4 py-6">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="grid size-10 place-items-center rounded-lg bg-amber text-ink">
            <HardHat className="size-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xs font-bold tracking-wide">CONSTRUCTORA EDER TORRES</p>
            <p className="text-xs uppercase tracking-widest text-mist">Suite industrial</p>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onNavigate(item.id)}
                className={
                  "flex h-11 items-center gap-3 rounded-lg px-3 text-left text-sm font-medium " +
                  (active ? "bg-navy text-amber" : "text-mist hover:bg-navy/60 hover:text-snow")
                }
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <p className="flex items-center gap-2 px-3 text-xs text-emerald">
          <Radio className="size-3.5" aria-hidden="true" />
          Sistema en línea
        </p>
      </aside>
      <main className="min-w-0 flex-1 px-8 py-7">
        {view === "home" ? <GeocercaView /> : null}
        {view === "asistencia" ? <AsistenciaView /> : null}
        {view === "actas" ? <ActaView /> : null}
        {view === "epp" ? <EppView /> : null}
      </main>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "amber" | "danger" | "ok";
}) {
  const color =
    tone === "amber" ? "text-amber" : tone === "danger" ? "text-crimson" : tone === "ok" ? "text-emerald" : "text-snow";
  return (
    <article className="rounded-2xl border border-edge bg-panel p-5">
      <p className="text-xs font-medium uppercase tracking-wider text-mist">{label}</p>
      <p className={`mt-2 text-3xl font-black tracking-tight tabular-nums ${color}`}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-mist">{hint}</p> : null}
    </article>
  );
}

function GeocercaView() {
  const checks = useErp((s) => s.checks);
  const [site, setSite] = useState<(typeof sites)[number]>("Obra Norte-01");
  const outside = checks.filter((row) => !row.inside).length;
  const onSite = checks.filter((row) => row.site === site && row.kind === "entrada").length;

  return (
    <section>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-mist">Gestión multiobra</p>
        <h1 className="text-2xl font-bold tracking-tight">Gestión multiobra y geocerca</h1>
      </header>
      <div className="mb-6 grid grid-cols-3 gap-4">
        <Kpi label="Obras activas" value="12" />
        <Kpi label="Personal en campo" value={String(142 + Math.max(0, checks.length - 3))} />
        <Kpi label="Alertas geocerca" value={String(3 + outside).padStart(2, "0")} tone="amber" />
      </div>
      <div className="overflow-hidden rounded-2xl border border-edge bg-panel">
        <div className="relative h-80">
          <img
            src="/erp/obra-aerea.jpg"
            alt="Vista aérea de obras activas con grúas y losas de concreto"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/20 to-transparent" />
          <div className="absolute right-4 top-4 rounded-full bg-navy/80 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald">
            Geocerca activa
          </div>
          <p className="absolute bottom-4 left-4 text-sm font-medium">
            Monitoreo activo: {site}
            <span className="ml-3 text-mist">{onSite} marcas de esta sesión en la obra</span>
          </p>
        </div>
        <div className="flex gap-2 p-4">
          {sites.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => setSite(name)}
              className={
                "h-11 rounded-lg px-4 text-sm font-medium " +
                (site === name ? "bg-amber text-ink" : "bg-navy text-mist")
              }
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function AsistenciaView() {
  const checks = useErp((s) => s.checks);
  const late = checks.filter((row) => !row.onTime).length;
  const onTime = checks.filter((row) => row.onTime).length;
  const punctuality = Math.round((onTime / checks.length) * 100);

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-mist">Recursos humanos / control</p>
          <h1 className="text-2xl font-bold tracking-tight">Consolidado de asistencia</h1>
        </div>
        <p className="text-right text-xs text-mist">
          Semana actual
          <span className="mt-1 block text-sm font-medium text-snow">22 – 28 oct</span>
        </p>
      </header>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Kpi label="Total empleados" value="248" hint="+4.2% vs semana previa" tone="ok" />
        <Kpi label="Puntualidad" value={`${punctuality}%`} />
        <Kpi label="Llegadas tarde" value={String(late).padStart(2, "0")} tone="danger" />
        <Kpi label="Horas extras" value="142h" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        <article className="col-span-2 rounded-2xl border border-edge bg-panel p-5">
          <h2 className="mb-4 text-sm font-medium">Asistencia semanal</h2>
          <WeekChart />
        </article>
        <article className="rounded-2xl border border-edge bg-panel p-5">
          <h2 className="mb-4 text-sm font-medium">Últimos registros</h2>
          <ul className="flex flex-col gap-4">
            {checks.slice(0, 6).map((row) => (
              <li key={row.id} className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium">{row.name}</p>
                  <p className="text-xs text-mist">
                    {row.site} · {row.kind}
                  </p>
                </div>
                <p className={`text-sm font-medium tabular-nums ${row.onTime ? "text-emerald" : "text-crimson"}`}>
                  {row.time}
                </p>
              </li>
            ))}
          </ul>
        </article>
      </div>
    </section>
  );
}

function WeekChart() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const measure = () => setWidth(node.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="h-56">
      {width > 0 ? (
        <BarChart width={width} height={224} data={weekBars} barCategoryGap="28%">
          <CartesianGrid stroke="var(--color-edge)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "var(--color-mist)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis hide />
          <Tooltip
            cursor={{ fill: "transparent" }}
            contentStyle={{
              background: "var(--color-navy)",
              border: "1px solid var(--color-edge)",
              borderRadius: 12,
              color: "var(--color-snow)",
            }}
          />
          <Bar dataKey="base" stackId="a" fill="var(--color-edge)" name="En tiempo" />
          <Bar dataKey="extra" stackId="a" fill="var(--color-amber)" radius={[4, 4, 0, 0]} name="Extras" />
        </BarChart>
      ) : null}
    </div>
  );
}

function ActaView() {
  const approved = useErp((s) => s.actaApproved);
  const approve = useErp((s) => s.approveActa);
  const [query, setQuery] = useState("");
  const [byTotal, setByTotal] = useState(false);
  const rows = useMemo(() => {
    const filtered = partidas.filter((row) =>
      `${row.code} ${row.desc}`.toLowerCase().includes(query.trim().toLowerCase()),
    );
    return byTotal ? [...filtered].sort((a, b) => partidaTotal(b) - partidaTotal(a)) : filtered;
  }, [query, byTotal]);

  return (
    <section>
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-mist">Finanzas y proyectos / actas</p>
          <h1 className="text-2xl font-bold tracking-tight">Acta semanal de obra</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-right text-xs text-mist">
            Folio de acta
            <span className="mt-1 block text-sm font-medium text-snow">A5-2024-042</span>
          </p>
          <button
            type="button"
            disabled={approved}
            onClick={approve}
            className="h-11 rounded-lg bg-amber px-5 text-sm font-bold text-ink disabled:opacity-60"
          >
            {approved ? "Acta aprobada" : "Aprobar acta"}
          </button>
        </div>
      </header>
      <div className="mb-6 grid max-w-3xl grid-cols-2 gap-4">
        <Kpi label="Monto de liquidación" value={money(actaAmount())} hint={approved ? "Aprobada" : "Conforme"} tone="ok" />
        <Kpi label="Porcentaje de avance" value="84.2%" hint="+2.1% esta semana" tone="ok" />
      </div>
      <article className="overflow-hidden rounded-2xl border border-edge bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-4">
          <h2 className="text-sm font-medium">Partidas ejecutadas</h2>
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Filtrar partida"
              className="h-10 w-56 rounded-lg border border-edge bg-navy pl-9 pr-3 text-sm text-snow"
            />
          </label>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-medium uppercase tracking-wider text-mist">
            <tr>
              <th className="px-5 py-3 font-medium">Código</th>
              <th className="px-5 py-3 font-medium">Descripción</th>
              <th className="px-5 py-3 text-right font-medium">Cantidad</th>
              <th className="px-5 py-3 font-medium">U.M.</th>
              <th className="px-5 py-3 text-right font-medium">P. unitario</th>
              <th className="px-5 py-3 text-right font-medium">
                <button type="button" onClick={() => setByTotal((value) => !value)} className="uppercase tracking-wider">
                  Total {byTotal ? "↓" : ""}
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className="border-t border-edge">
                <td className="px-5 py-3 font-medium tabular-nums">{row.code}</td>
                <td className="px-5 py-3">{row.desc}</td>
                <td className="px-5 py-3 text-right tabular-nums">{row.qty.toFixed(2)}</td>
                <td className="px-5 py-3 text-mist">{row.unit}</td>
                <td className="px-5 py-3 text-right tabular-nums">{money(row.price)}</td>
                <td className="px-5 py-3 text-right font-medium tabular-nums">{money(partidaTotal(row))}</td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-mist">
                  Ninguna partida coincide con el filtro.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </article>
    </section>
  );
}

function EppView() {
  const items = useErp((s) => s.epp);
  const deliveries = useErp((s) => s.deliveriesToday);
  const [query, setQuery] = useState("");
  const critical = items.filter((item) => item.stock < item.min).length;
  const rows = items.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <section>
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-mist">Seguridad y salud / inventarios</p>
        <h1 className="text-2xl font-bold tracking-tight">Control de EPP e incidencias</h1>
      </header>
      <div className="mb-6 grid grid-cols-4 gap-4">
        <Kpi label="Stock crítico" value={String(critical).padStart(2, "0")} hint="Artículos bajo mínimo" tone="danger" />
        <Kpi label="Incidencias (30d)" value="12" hint="-15% vs mes anterior" tone="ok" />
        <Kpi label="Entregas hoy" value={String(deliveries)} hint="Órdenes de reposición" />
        <Kpi label="Inversión EPP" value="$12,400" hint="Presupuesto previsto" />
      </div>
      <article className="overflow-hidden rounded-2xl border border-edge bg-panel">
        <div className="flex items-center justify-between gap-3 border-b border-edge px-5 py-4">
          <h2 className="text-sm font-medium">Inventario de seguridad activo</h2>
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar EPP"
              className="h-10 w-56 rounded-lg border border-edge bg-navy pl-9 pr-3 text-sm text-snow"
            />
          </label>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-xs font-medium uppercase tracking-wider text-mist">
            <tr>
              <th className="px-5 py-3 font-medium">Equipo</th>
              <th className="px-5 py-3 font-medium">Categoría</th>
              <th className="px-5 py-3 text-right font-medium">En stock</th>
              <th className="px-5 py-3 font-medium">Estado</th>
              <th className="px-5 py-3 font-medium">Últ. reposición</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => {
              const ok = item.stock >= item.min;
              return (
                <tr key={item.id} className="border-t border-edge">
                  <td className="px-5 py-3 font-medium">{item.name}</td>
                  <td className="px-5 py-3 text-mist">{item.category}</td>
                  <td className={`px-5 py-3 text-right tabular-nums ${ok ? "" : "font-bold text-crimson"}`}>{item.stock}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-medium uppercase tracking-wider ${ok ? "text-emerald" : "text-crimson"}`}>
                      {ok ? "Óptimo" : "Crítico"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-mist">{item.last}</td>
                </tr>
              );
            })}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-mist">
                  Ningún equipo coincide con la búsqueda.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </article>
    </section>
  );
}
