import { create } from "zustand";

export const views = ["home", "asistencia", "actas", "epp"] as const;
export type View = (typeof views)[number];

export function parseView(value: unknown): View {
  return views.includes(value as View) ? (value as View) : "home";
}

export type CheckIn = {
  id: string;
  name: string;
  site: string;
  time: string;
  kind: "entrada" | "salida";
  inside: boolean;
  onTime: boolean;
  note: string;
};

export type EppSku = {
  id: string;
  name: string;
  category: string;
  stock: number;
  min: number;
  last: string;
};

export type Partida = {
  code: string;
  desc: string;
  qty: number;
  unit: string;
  price: number;
};

export const partidas: Partida[] = [
  { code: "01.02.04", desc: "Excavación masiva con maquinaria", qty: 420, unit: "m³", price: 45 },
  { code: "02.01.01", desc: "Concreto premezclado Fc=210 kg/cm²", qty: 85.5, unit: "m³", price: 620 },
  { code: "03.04.02", desc: "Acero de refuerzo fy=4200 kg/cm²", qty: 14, unit: "ton", price: 2100 },
  { code: "04.01.08", desc: "Encofrado de losa Nivel 04", qty: 678.5, unit: "m²", price: 40 },
];

export const weekBars = [
  { day: "Lun", base: 228, extra: 16 },
  { day: "Mar", base: 236, extra: 18 },
  { day: "Mié", base: 214, extra: 12 },
  { day: "Jue", base: 230, extra: 20 },
  { day: "Vie", base: 198, extra: 14 },
  { day: "Sáb", base: 118, extra: 9 },
];

export const sites = ["Obra Norte-01", "Obra Central", "Torre Pacífico"] as const;

const seedChecks: CheckIn[] = [
  { id: "c1", name: "R. Martínez", site: "Obra Central", time: "07:48", kind: "entrada", inside: true, onTime: true, note: "" },
  { id: "c2", name: "J. Casado", site: "Obra Norte-01", time: "08:02", kind: "entrada", inside: true, onTime: true, note: "" },
  { id: "c3", name: "L. Soto", site: "Obra Central", time: "08:41", kind: "entrada", inside: true, onTime: false, note: "Corte de vía en Calle 14" },
];

const seedEpp: EppSku[] = [
  { id: "casco", name: "Casco Tipo II (MSA)", category: "Protección craneal", stock: 142, min: 40, last: "12 Oct 2024" },
  { id: "chaleco", name: "Chaleco reflectivo alta visibilidad", category: "Vestuario", stock: 12, min: 24, last: "05 Sep 2024" },
  { id: "lentes", name: "Lentes de seguridad", category: "Protección visual", stock: 86, min: 30, last: "18 Oct 2024" },
  { id: "guantes", name: "Guantes de badana", category: "Protección de manos", stock: 40, min: 16, last: "02 Oct 2024" },
  { id: "respirador", name: "Respirador 3M N95", category: "Protección respiratoria", stock: 18, min: 12, last: "09 Oct 2024" },
];

type ErpState = {
  checks: CheckIn[];
  epp: EppSku[];
  deliveriesToday: number;
  actaApproved: boolean;
  evidenceSent: boolean;
  delaySent: boolean;
  delayReason: string;
  register: (entry: Omit<CheckIn, "id">) => void;
  deliver: (lines: { id: string; qty: number }[]) => void;
  approveActa: () => void;
  sendEvidence: () => void;
  sendDelay: (reason: string) => void;
};

export const useErp = create<ErpState>((set) => ({
  checks: seedChecks,
  epp: seedEpp,
  deliveriesToday: 34,
  actaApproved: false,
  evidenceSent: false,
  delaySent: false,
  delayReason: "Corte de vía por obras municipales en Calle 14.",
  register: (entry) =>
    set((state) => ({
      checks: [{ ...entry, id: `new-${state.checks.length + 1}` }, ...state.checks],
    })),
  deliver: (lines) =>
    set((state) => ({
      deliveriesToday: state.deliveriesToday + 1,
      epp: state.epp.map((item) => {
        const line = lines.find((row) => row.id === item.id && row.qty > 0);
        if (!line) return item;
        return { ...item, stock: Math.max(0, item.stock - line.qty), last: "Hoy" };
      }),
    })),
  approveActa: () => set({ actaApproved: true }),
  sendEvidence: () => set({ evidenceSent: true }),
  sendDelay: (reason) => set({ delaySent: true, delayReason: reason }),
}));

export function money(value: number) {
  return value.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export function partidaTotal(row: Partida) {
  return row.qty * row.price;
}

export function actaAmount() {
  return partidas.reduce((sum, row) => sum + partidaTotal(row), 0);
}
