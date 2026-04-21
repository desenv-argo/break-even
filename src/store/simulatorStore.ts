import { create } from "zustand";
import type { FixedCost, Product, RampConfig, SimulatorState } from "../types";

type SimulatorActions = {
  setField: <K extends keyof SimulatorState>(field: K, value: SimulatorState[K]) => void;
  updateRampa: (patch: Partial<RampConfig>) => void;
  updateProduct: (id: string, patch: Partial<Product>) => void;
  addProduct: () => void;
  removeProduct: (id: string) => void;
  updateFixedCost: (id: string, patch: Partial<FixedCost>) => void;
  addFixedCost: () => void;
  removeFixedCost: (id: string) => void;
  reset: () => void;
};

const STORAGE_KEY = "saas-financial-dashboard-v1";

const baseState: SimulatorState = {
  mensalidade: 369,
  clientes: 22,
  consultoria: 1500,
  produtos: [],
  custosFixos: [
    { id: "contabilidade", name: "Contabilidade", value: 200 },
    { id: "ia", name: "IA", value: 400 },
    { id: "github", name: "GitHub", value: 20 },
  ],
  custoNuvem: {
    base: 500,
    incremento: 400,
    clientesPorBloco: 10,
  },
  imposto: 15,
  proLabore: {
    socio1: 3000,
    socio2: 3000,
  },
  faixaClientesMaxima: 100,
  rampa: {
    horizonteMeses: 12,
    modo: "mensal",
    cnpjsPorMes: 2,
    cnpjsPorBloco: 3,
    mesesPorBloco: 2,
  },
};

const generateId = (): string => crypto.randomUUID();

const loadInitialState = (): SimulatorState => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return baseState;
  try {
    const parsed = JSON.parse(raw) as Partial<SimulatorState>;
    return {
      ...baseState,
      ...parsed,
      custoNuvem: { ...baseState.custoNuvem, ...parsed.custoNuvem },
      proLabore: { ...baseState.proLabore, ...parsed.proLabore },
      custosFixos: parsed.custosFixos ?? baseState.custosFixos,
      produtos: parsed.produtos ?? baseState.produtos,
      rampa: { ...baseState.rampa, ...parsed.rampa },
    };
  } catch {
    return baseState;
  }
};

export const useSimulatorStore = create<SimulatorState & SimulatorActions>((set) => ({
  ...loadInitialState(),
  setField: (field, value) => set(() => ({ [field]: value })),
  updateRampa: (patch) =>
    set((state) => ({
      rampa: { ...state.rampa, ...patch },
    })),
  updateProduct: (id, patch) =>
    set((state) => ({
      produtos: state.produtos.map((product) =>
        product.id === id ? { ...product, ...patch } : product,
      ),
    })),
  addProduct: () =>
    set((state) => ({
      produtos: [
        ...state.produtos,
        { id: generateId(), name: `Produto ${state.produtos.length + 1}`, price: 99, clients: 10 },
      ],
    })),
  removeProduct: (id) =>
    set((state) => ({
      produtos: state.produtos.filter((product) => product.id !== id),
    })),
  updateFixedCost: (id, patch) =>
    set((state) => ({
      custosFixos: state.custosFixos.map((cost) => (cost.id === id ? { ...cost, ...patch } : cost)),
    })),
  addFixedCost: () =>
    set((state) => ({
      custosFixos: [
        ...state.custosFixos,
        { id: generateId(), name: `Custo ${state.custosFixos.length + 1}`, value: 0 },
      ],
    })),
  removeFixedCost: (id) =>
    set((state) => ({
      custosFixos: state.custosFixos.filter((cost) => cost.id !== id),
    })),
  reset: () => set(baseState),
}));

useSimulatorStore.subscribe((state) => {
  const {
    setField: _,
    updateRampa: _r,
    updateProduct: __,
    addProduct: ___,
    removeProduct: ____,
    updateFixedCost: _____,
    addFixedCost: ______,
    removeFixedCost: _______,
    reset: ________,
    ...persistable
  } = state;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
});

export const exportStateJson = (): string => {
  const {
    setField: _setField,
    updateRampa: _updateRampa,
    updateProduct: _updateProduct,
    addProduct: _addProduct,
    removeProduct: _removeProduct,
    updateFixedCost: _updateFixedCost,
    addFixedCost: _addFixedCost,
    removeFixedCost: _removeFixedCost,
    reset: _reset,
    ...currentState
  } = useSimulatorStore.getState();
  return JSON.stringify(currentState, null, 2);
};

export const importStateJson = (json: string): boolean => {
  try {
    const parsed = JSON.parse(json) as SimulatorState;
    useSimulatorStore.setState({
      ...baseState,
      ...parsed,
      custoNuvem: { ...baseState.custoNuvem, ...parsed.custoNuvem },
      proLabore: { ...baseState.proLabore, ...parsed.proLabore },
      custosFixos: parsed.custosFixos ?? baseState.custosFixos,
      produtos: parsed.produtos ?? baseState.produtos,
      rampa: { ...baseState.rampa, ...parsed.rampa },
    });
    return true;
  } catch {
    return false;
  }
};
