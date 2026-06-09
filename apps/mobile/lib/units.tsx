// Unit system (metric default / imperial). The DB always stores METRIC (kg, cm, km) as the
// canonical form; this converts only at the UI layer. Preference is device-local.
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UnitSystem = "metric" | "imperial";
const KEY = "tabor.units";
const LB_PER_KG = 2.20462, MI_PER_KM = 0.621371, IN_PER_CM = 0.393701;

const Ctx = createContext<{ system: UnitSystem; setSystem: (s: UnitSystem) => void }>({ system: "metric", setSystem: () => {} });

export function UnitsProvider({ children }: { children: ReactNode }) {
  const [system, setSystemState] = useState<UnitSystem>("metric");
  useEffect(() => { AsyncStorage.getItem(KEY).then((v) => { if (v === "imperial" || v === "metric") setSystemState(v); }); }, []);
  const setSystem = (s: UnitSystem) => { setSystemState(s); AsyncStorage.setItem(KEY, s).catch(() => {}); };
  return <Ctx.Provider value={{ system, setSystem }}>{children}</Ctx.Provider>;
}

/** Units + converters for the current preference. Weight stored kg, distance km, height cm. */
export function useUnits() {
  const { system, setSystem } = useContext(Ctx);
  const imp = system === "imperial";
  return {
    system, setSystem, imperial: imp,
    wUnit: imp ? "lb" : "kg",
    dUnit: imp ? "mi" : "km",
    hUnit: imp ? "in" : "cm",
    // weight (kg canonical)
    kgToDisp: (kg: number) => (imp ? +(kg * LB_PER_KG).toFixed(1) : +Number(kg).toFixed(1)),
    dispToKg: (v: number) => (imp ? v / LB_PER_KG : v),
    // distance (km canonical)
    kmToDisp: (km: number) => (imp ? +(km * MI_PER_KM).toFixed(2) : +Number(km).toFixed(2)),
    dispToKm: (v: number) => (imp ? v / MI_PER_KM : v),
    // height (cm canonical)
    cmToDisp: (cm: number) => (imp ? Math.round(cm * IN_PER_CM) : Math.round(cm)),
    dispToCm: (v: number) => (imp ? v / IN_PER_CM : v),
  };
}
