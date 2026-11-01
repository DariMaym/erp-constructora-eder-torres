import { useEffect, useRef, useState } from "react";
import {
  ClipboardList,
  CircleCheck,
  HardHat,
  MapPin,
  Minus,
  PenLine,
  Plus,
  Timer,
  TriangleAlert,
} from "lucide-react";
import { useErp, type View } from "@/lib/erp-store";

const nav: { id: View; label: string; icon: typeof Timer }[] = [
  { id: "home", label: "Asistencia", icon: Timer },
  { id: "asistencia", label: "Reporte", icon: TriangleAlert },
  { id: "epp", label: "EPP", icon: HardHat },
  { id: "actas", label: "Actas", icon: ClipboardList },
];

export function MobileApp({
  view,
  onNavigate,
}: {
  view: View;
  onNavigate: (view: View) => void;
}) {
  const [wizard, setWizard] = useState(0);
  const hideNav = view === "home" && wizard > 0;

  return (
    <div className="min-h-screen bg-snow text-ink md:hidden">
      {view === "home" ? <AsistenciaField step={wizard} setStep={setWizard} /> : null}
      {view === "asistencia" ? <Justificacion /> : null}
      {view === "actas" ? <Evidencia /> : null}
      {view === "epp" ? <EntregaEpp /> : null}
      {hideNav ? null : (
        <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-paper px-2 pb-3 pt-2">
          <ul className="grid grid-cols-4">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = view === item.id;
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-current={active ? "page" : undefined}
                    onClick={() => {
                      setWizard(0);
                      onNavigate(item.id);
                    }}
                    className={`flex h-14 w-full flex-col items-center justify-center gap-1 text-xs font-medium ${active ? "text-amber" : "text-slate"}`}
                  >
                    <Icon className="size-5" aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}

function useClock() {
  const [label, setLabel] = useState("08:00:12");
  useEffect(() => {
    const tick = () => {
      setLabel(
        new Date().toLocaleTimeString("es-NI", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }),
      );
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);
  return label;
}

function FieldHeader({ kicker, title, detail }: { kicker: string; title: string; detail?: string }) {
  return (
    <header className="flex items-center gap-3 px-5 pb-2 pt-6">
      <div className="grid size-11 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-snow">
        MR
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate">{kicker}</p>
        <h1 className="text-xl font-bold tracking-tight">{title}</h1>
        {detail ? <p className="text-sm text-slate">{detail}</p> : null}
      </div>
    </header>
  );
}

function AsistenciaField({ step, setStep }: { step: number; setStep: (step: number) => void }) {
  const clock = useClock();
  const register = useErp((s) => s.register);
  const [outside, setOutside] = useState(false);
  const [force, setForce] = useState(false);
  const [kind, setKind] = useState<"entrada" | "salida">("entrada");
  const [note, setNote] = useState("");
  const canContinue = !outside || force;

  function confirm() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    register({
      name: "M. Rodríguez",
      site: "Obra Norte-01",
      time: now.toLocaleTimeString("es-NI", { hour: "2-digit", minute: "2-digit", hour12: false }),
      kind,
      inside: !outside,
      onTime: kind === "salida" || minutes <= 8 * 60 + 15,
      note,
    });
    setStep(3);
  }

  if (step === 0) {
    return (
      <main className="px-5 pb-28 pt-6">
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Control de asistencia</h1>
            <p className="text-sm text-slate">Módulo geocerca activa · Obra Norte-01</p>
          </div>
          <div className="grid size-11 place-items-center rounded-full bg-ink text-sm font-bold text-snow">MR</div>
        </div>
        <section className="rounded-2xl border border-line bg-paper p-6 text-center shadow-sm">
          <div className="relative mx-auto grid size-40 place-items-center">
            <span className="absolute inset-0 rounded-full border-4 border-line" />
            <span className="absolute inset-2 rounded-full border-4 border-amber" />
            <span>
              <span className="block text-3xl font-black tabular-nums tracking-tight">{clock}</span>
              <span className="mt-1 block text-xs font-medium uppercase tracking-widest text-slate">Registrar entrada</span>
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStep(1)}
            className="mt-6 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink"
          >
            Registrar ingreso
          </button>
        </section>
        <figure className="relative mt-4 h-40 overflow-hidden rounded-2xl border border-line">
          <img src="/erp/obra-aerea.jpg" alt="Obra Norte-01 dentro del radio de geocerca" className="h-full w-full object-cover" />
          <figcaption className="absolute bottom-3 left-3 rounded-full bg-emerald px-3 py-1 text-xs font-medium uppercase tracking-wider text-ink">
            Dentro de geocerca
          </figcaption>
        </figure>
      </main>
    );
  }

  if (step === 1) {
    return (
      <main className="px-5 pb-8 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate">Paso 2 de 4</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Verificación de geocerca</h1>
        <section className={`mt-5 rounded-2xl border p-5 ${outside ? "border-crimson bg-paper" : "border-emerald bg-paper"}`}>
          <div className="flex items-center gap-3">
            <MapPin className={`size-8 ${outside ? "text-crimson" : "text-emerald"}`} aria-hidden="true" />
            <div>
              <p className={`text-xs font-medium uppercase tracking-wider ${outside ? "text-crimson" : "text-emerald"}`}>
                {outside ? "Fuera de geocerca" : "Dentro de obra"}
              </p>
              <p className="text-lg font-bold">Obra Norte-01 · radio 180 m</p>
            </div>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate">
            12.1328° N, 86.2504° W · precisión ± 1.2 m
          </p>
        </section>
        <button
          type="button"
          onClick={() => {
            setOutside((value) => !value);
            setForce(false);
          }}
          className="mt-4 h-12 w-full rounded-xl border border-line bg-paper text-sm font-medium"
        >
          {outside ? "Volver a simular dentro de obra" : "Probar fuera de obra"}
        </button>
        {outside ? (
          <label className="mt-4 flex items-start gap-3 rounded-2xl border border-line bg-paper p-4 text-sm">
            <input
              type="checkbox"
              checked={force}
              onChange={(event) => setForce(event.target.checked)}
              className="mt-1 size-5 accent-amber"
            />
            Registrar fuera de geocerca. La marca queda como alerta para el supervisor.
          </label>
        ) : null}
        <button
          type="button"
          disabled={!canContinue}
          onClick={() => setStep(2)}
          className="mt-6 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink disabled:opacity-40"
        >
          Continuar
        </button>
      </main>
    );
  }

  if (step === 2) {
    return (
      <main className="px-5 pb-8 pt-6">
        <p className="text-xs font-medium uppercase tracking-wider text-slate">Paso 3 de 4</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">Confirmar asistencia</h1>
        <section className="mt-5 rounded-2xl border border-line bg-paper p-5">
          <p className="text-lg font-bold">Marcos Rodríguez</p>
          <p className="text-sm text-slate">Cuadrilla estructuras · Obra Norte-01</p>
          <p className="mt-3 text-sm tabular-nums text-slate">
            {clock} · 12.1328° N, 86.2504° W
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(["entrada", "salida"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setKind(option)}
                className={`h-12 rounded-xl text-sm font-bold capitalize ${kind === option ? "bg-ink text-snow" : "border border-line bg-snow"}`}
              >
                {option}
              </button>
            ))}
          </div>
          <label className="mt-4 block text-sm font-medium">
            Nota rápida
            <input
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Opcional"
              className="mt-2 h-12 w-full rounded-xl border border-line bg-snow px-3 text-base font-normal"
            />
          </label>
        </section>
        <button type="button" onClick={confirm} className="mt-6 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink">
          Confirmar asistencia
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col justify-center px-5 pb-10">
      <div className="rounded-2xl border border-line bg-paper p-6 text-center">
        <CircleCheck className="mx-auto size-14 text-emerald" aria-hidden="true" />
        <h1 className="mt-3 text-2xl font-bold tracking-tight">Asistencia registrada</h1>
        <p className="mt-2 text-sm leading-relaxed text-slate">
          {kind === "entrada" ? "Entrada" : "Salida"} de Marcos Rodríguez en Obra Norte-01. Quedó en el consolidado
          {outside ? " con alerta de geocerca." : "."}
        </p>
      </div>
      <button
        type="button"
        onClick={() => {
          setOutside(false);
          setForce(false);
          setNote("");
          setKind("entrada");
          setStep(0);
        }}
        className="mt-4 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink"
      >
        Registrar otro
      </button>
    </main>
  );
}

function Justificacion() {
  const sent = useErp((s) => s.delaySent);
  const stored = useErp((s) => s.delayReason);
  const send = useErp((s) => s.sendDelay);
  const [reason, setReason] = useState(stored);

  return (
    <main className="px-5 pb-28 pt-2">
      <FieldHeader kicker="Reporte diario" title="Justificación de retraso" detail="Ticket #4420-A · Obra Central" />
      <section className="mx-0 mt-4 rounded-2xl border border-amber/40 bg-amber/15 p-5">
        <p className="text-xs font-medium uppercase tracking-wider text-ink">Tiempo de retraso</p>
        <p className="text-3xl font-black tracking-tight">18 minutos</p>
      </section>
      <section className="mt-4 rounded-2xl border border-line bg-paper p-5">
        <label className="block text-xs font-medium uppercase tracking-wider text-slate">
          Motivo del retraso
          <textarea
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            rows={3}
            className="mt-2 w-full rounded-xl border border-line bg-snow p-3 text-base font-normal leading-relaxed text-ink"
          />
        </label>
        <img
          src="/erp/calle.jpg"
          alt="Corte de vía por obras municipales en Calle 14"
          className="mt-4 h-36 w-full rounded-xl object-cover"
        />
      </section>
      <section className="mt-4 rounded-2xl border border-line bg-paper p-5">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="text-xs font-medium uppercase tracking-wider text-slate">Avance obra</span>
          <span className="font-bold tabular-nums">74%</span>
        </div>
        <div className="h-2 rounded-full bg-line">
          <div className="h-2 rounded-full bg-amber" style={{ width: "74%" }} />
        </div>
      </section>
      <button
        type="button"
        disabled={sent || reason.trim().length < 8}
        onClick={() => send(reason.trim())}
        className="mt-5 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink disabled:opacity-50"
      >
        {sent ? "Justificación enviada" : "Enviar justificación"}
      </button>
    </main>
  );
}

function Evidencia() {
  const sent = useErp((s) => s.evidenceSent);
  const send = useErp((s) => s.sendEvidence);

  return (
    <main className="px-5 pb-28 pt-2">
      <FieldHeader kicker="Evidencia GPS" title="Torre Pacífico" detail="Vaciado de losa Nivel 04 · Sector B" />
      <article className="mt-4 overflow-hidden rounded-2xl border border-line bg-paper">
        <img
          src="/erp/vaciado.jpg"
          alt="Vaciado de losa en Torre Pacífico, nivel 04 sector B"
          className="h-56 w-full object-cover"
        />
        <div className="p-5">
          <p className="text-xs text-slate">24 oct 2024 · 14:22:18</p>
          <h2 className="mt-1 text-lg font-bold">Proyecto: Torre Pacífico</h2>
          <p className="text-sm text-slate">Vaciado de losa Nivel 04 - Sector B</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald/15 px-3 py-1 text-xs font-medium uppercase tracking-wider text-emerald">
              Precisión ± 1.2 m
            </span>
            <span className="rounded-full bg-snow px-3 py-1 text-xs font-medium uppercase tracking-wider text-slate">
              Encriptada
            </span>
          </div>
        </div>
      </article>
      <button
        type="button"
        disabled={sent}
        onClick={send}
        className="mt-5 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink disabled:opacity-50"
      >
        {sent ? "En el expediente" : "Subir a expediente"}
      </button>
    </main>
  );
}

function EntregaEpp() {
  const items = useErp((s) => s.epp);
  const deliver = useErp((s) => s.deliver);
  const [qty, setQty] = useState<Record<string, number>>({ guantes: 1, respirador: 2 });
  const [signed, setSigned] = useState(false);
  const [done, setDone] = useState(false);
  const picks = items.filter((item) => item.id === "guantes" || item.id === "respirador");
  const total = picks.reduce((sum, item) => sum + (qty[item.id] ?? 0), 0);

  return (
    <main className="px-5 pb-28 pt-2">
      <FieldHeader kicker="Entrega de EPP" title="Selección de reposición" />
      <section className="mt-4 rounded-2xl bg-ink p-5 text-snow">
        <p className="text-xs uppercase tracking-wider text-mist">Colaborador</p>
        <p className="text-lg font-bold">Rodríguez, Marcos</p>
        <p className="text-xs text-mist">Última entrega: hace 14 días</p>
        <span className="mt-3 inline-flex rounded-full bg-emerald px-3 py-1 text-xs font-bold uppercase tracking-wider text-ink">
          Apto
        </span>
      </section>
      <ul className="mt-4 flex flex-col gap-3">
        {picks.map((item) => (
          <li key={item.id} className="flex items-center justify-between gap-3 rounded-2xl border border-line bg-paper p-4">
            <div>
              <p className="font-medium">{item.name}</p>
              <p className="text-xs text-slate">Stock {item.stock} · mínimo {item.min}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label={`Quitar ${item.name}`}
                onClick={() => setQty((current) => ({ ...current, [item.id]: Math.max(0, (current[item.id] ?? 0) - 1) }))}
                className="grid size-12 place-items-center rounded-xl border border-line"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-lg font-bold tabular-nums">{qty[item.id] ?? 0}</span>
              <button
                type="button"
                aria-label={`Agregar ${item.name}`}
                onClick={() =>
                  setQty((current) => ({
                    ...current,
                    [item.id]: Math.min(item.stock, (current[item.id] ?? 0) + 1),
                  }))
                }
                className="grid size-12 place-items-center rounded-xl border border-line"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      <section className="mt-4 rounded-2xl border border-line bg-paper p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate">
          <PenLine className="size-4" aria-hidden="true" />
          Firma de conformidad
        </p>
        <SignaturePad onChange={setSigned} />
      </section>
      <button
        type="button"
        disabled={done || !signed || total === 0}
        onClick={() => {
          deliver(picks.map((item) => ({ id: item.id, qty: qty[item.id] ?? 0 })));
          setDone(true);
        }}
        className="mt-5 h-14 w-full rounded-xl bg-amber text-base font-bold text-ink disabled:opacity-40"
      >
        {done ? "Entrega registrada" : "Confirmar entrega"}
      </button>
    </main>
  );
}

function SignaturePad({ onChange }: { onChange: (signed: boolean) => void }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * 2));
    canvas.height = Math.max(1, Math.floor(rect.height * 2));
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#0f172a";
  }, []);

  function point(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = ref.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  function start(event: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    const { x, y } = point(event);
    ctx.beginPath();
    ctx.moveTo(x, y);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function move(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = ref.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = point(event);
    ctx.lineTo(x, y);
    ctx.stroke();
    onChange(true);
  }

  function end() {
    drawing.current = false;
  }

  function clear() {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    onChange(false);
  }

  return (
    <div>
      <canvas
        ref={ref}
        onPointerDown={start}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        className="h-28 w-full touch-none rounded-xl border border-dashed border-line bg-snow"
        aria-label="Área de firma"
      />
      <button type="button" onClick={clear} className="mt-2 h-10 text-sm font-medium text-slate">
        Borrar firma
      </button>
    </div>
  );
}
