import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { View, Text, Pressable, Modal } from "react-native";
import { C, F, R, SH } from "@/lib/theme";

export interface SheetAction { label: string; onPress?: () => void; style?: "default" | "destructive" | "cancel" }
export interface SheetOpts { title?: string; message?: string; reactions?: { emoji: string; onPress: () => void }[]; actions: SheetAction[] }

const Ctx = createContext<(opts: SheetOpts) => void>(() => {});
/** Branded replacement for Alert.alert action menus. `const sheet = useActionSheet()` then
 *  `sheet({ title, message, actions: [{ label, onPress, style }] })`. */
export const useActionSheet = () => useContext(Ctx);

export function ActionSheetProvider({ children }: { children: ReactNode }) {
  const [opts, setOpts] = useState<SheetOpts | null>(null);
  const show = useCallback((o: SheetOpts) => setOpts(o), []);
  const close = useCallback(() => setOpts(null), []);
  const cancel = opts?.actions.find((a) => a.style === "cancel");
  const rows = (opts?.actions ?? []).filter((a) => a.style !== "cancel");

  return (
    <Ctx.Provider value={show}>
      {children}
      <Modal visible={!!opts} transparent animationType="fade" onRequestClose={close} statusBarTranslucent>
        <Pressable onPress={close} style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.8)", justifyContent: "flex-end" }}>
          <Pressable onPress={() => {}} style={{ backgroundColor: C.surface, borderWidth: 1, borderColor: C.glassBorder, borderTopLeftRadius: R.xl, borderTopRightRadius: R.xl, padding: 16, paddingBottom: 36, ...SH.float }}>
            <View style={{ width: 36, height: 4, borderRadius: 12, backgroundColor: C.line, alignSelf: "center", marginBottom: 14 }} />
            {opts?.title ? <Text style={{ color: C.ivory, fontSize: 17, fontFamily: F.head, textAlign: "center" }}>{opts.title}</Text> : null}
            {opts?.message ? <Text style={{ color: C.muted, fontSize: 13, fontFamily: F.body, textAlign: "center", marginTop: 6, lineHeight: 19 }}>{opts.message}</Text> : null}

            {opts?.reactions && opts.reactions.length > 0 && (
              <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginTop: 16 }}>
                {opts.reactions.map((r, i) => (
                  <Pressable key={i} onPress={() => { close(); r.onPress(); }} style={{ width: 56, height: 56, borderRadius: 28, borderWidth: 1, borderColor: C.line, backgroundColor: C.surface2, alignItems: "center", justifyContent: "center" }}>
                    <Text style={{ fontSize: 26 }}>{r.emoji}</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <View style={{ marginTop: 16, gap: 8 }}>
              {rows.map((a, i) => (
                <Pressable key={i} onPress={() => { close(); a.onPress?.(); }} style={{ borderWidth: 1, borderColor: a.style === "destructive" ? "rgba(192,58,58,0.5)" : C.line, backgroundColor: C.surface2, paddingVertical: 15, alignItems: "center", borderRadius: 12 }}>
                  <Text style={{ color: a.style === "destructive" ? C.red : C.ivory, fontSize: 15, fontFamily: F.bodyMid }}>{a.label}</Text>
                </Pressable>
              ))}
              <Pressable onPress={close} style={{ borderWidth: 1, borderColor: C.gold, paddingVertical: 15, alignItems: "center", borderRadius: 12, marginTop: 4 }}>
                <Text style={{ color: C.gold, fontSize: 14, fontFamily: F.headMid, letterSpacing: 1 }}>{cancel?.label?.toUpperCase() ?? "CANCEL"}</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </Ctx.Provider>
  );
}
