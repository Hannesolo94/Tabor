// Scripture text-to-voice. Uses expo-speech (the device's native voice engine):
// free, offline, no API key, and bundled in Expo Go. On iOS it will use Apple's
// Enhanced/Premium voices if the user has downloaded one (Settings > Accessibility
// > Spoken Content > Voices). Reads a chapter verse by verse, tracking the verse
// being spoken so the screen can highlight + scroll to it, and optionally rolls on
// into the next chapter.
import { useCallback, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Speech from "expo-speech";

const RATE_KEY = "tabor.tts.rate";
const VOICE_KEY = "tabor.tts.voice";

export interface TtsVoice { id: string; name: string; quality: string; language: string }
export interface VerseLike { verse: number; text: string }

export function useScriptureAudio(opts: {
  verses: VerseLike[];
  autoAdvance: boolean;
  hasNext: boolean;
  onAdvance: () => void; // ask the screen to move to the next chapter
}) {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [current, setCurrent] = useState<number | null>(null); // verse number being read
  const [rate, setRateState] = useState(1);
  const [voice, setVoiceState] = useState<string | null>(null);
  const [voices, setVoices] = useState<TtsVoice[]>([]);

  // refs so the speak chain never reads stale state
  const versesRef = useRef(opts.verses); versesRef.current = opts.verses;
  const rateRef = useRef(1);
  const voiceRef = useRef<string | null>(null);
  const idx = useRef(0);            // index into verses
  const stopped = useRef(true);     // true = nothing should be chaining
  const continueOnLoad = useRef(false); // resume on the next chapter once it loads
  const autoRef = useRef(opts.autoAdvance); autoRef.current = opts.autoAdvance;
  const hasNextRef = useRef(opts.hasNext); hasNextRef.current = opts.hasNext;
  const onAdvanceRef = useRef(opts.onAdvance); onAdvanceRef.current = opts.onAdvance;

  // load saved prefs + available English voices once
  useEffect(() => {
    AsyncStorage.getItem(RATE_KEY).then((r) => { if (r) { const n = parseFloat(r); if (!isNaN(n)) { setRateState(n); rateRef.current = n; } } });
    AsyncStorage.getItem(VOICE_KEY).then((v) => { if (v) { setVoiceState(v); voiceRef.current = v; } });
    Speech.getAvailableVoicesAsync().then((vs) => {
      const en = vs.filter((v) => (v.language || "").toLowerCase().startsWith("en"))
        .map((v) => ({ id: v.identifier, name: v.name || v.identifier, quality: String(v.quality ?? ""), language: v.language || "en" }));
      setVoices(en);
    }).catch(() => {});
  }, []);

  const speakIndex = useCallback((i: number) => {
    if (stopped.current) return;
    const vs = versesRef.current;
    if (i >= vs.length) {
      setCurrent(null);
      if (autoRef.current && hasNextRef.current) {
        continueOnLoad.current = true; // the [verses] effect restarts us on the new chapter
        onAdvanceRef.current();
        return;
      }
      stopped.current = true; setSpeaking(false); setPaused(false);
      return;
    }
    idx.current = i;
    const v = vs[i];
    setCurrent(v.verse);
    Speech.speak(v.text, {
      voice: voiceRef.current ?? undefined,
      rate: rateRef.current,
      onDone: () => { if (!stopped.current) speakIndex(i + 1); },
      onError: () => { if (!stopped.current) speakIndex(i + 1); },
    });
  }, []);

  const start = useCallback((fromVerse?: number) => {
    Speech.stop();
    stopped.current = false;
    setSpeaking(true); setPaused(false);
    const vs = versesRef.current;
    let i = 0;
    if (fromVerse != null) { const f = vs.findIndex((x) => x.verse === fromVerse); if (f >= 0) i = f; }
    speakIndex(i);
  }, [speakIndex]);

  const pause = useCallback(() => {
    stopped.current = true; // block the onDone chain
    Speech.stop();
    setPaused(true);
  }, []);

  const resume = useCallback(() => {
    stopped.current = false;
    setPaused(false);
    speakIndex(idx.current);
  }, [speakIndex]);

  const stop = useCallback(() => {
    stopped.current = true;
    continueOnLoad.current = false;
    Speech.stop();
    setSpeaking(false); setPaused(false); setCurrent(null);
    idx.current = 0;
  }, []);

  // chapter changed: continue into it if we auto-advanced, otherwise (a manual
  // chapter change mid-listen) stop cleanly.
  useEffect(() => {
    if (continueOnLoad.current && opts.verses.length) { continueOnLoad.current = false; start(); }
    else if (!stopped.current) { stop(); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.verses]);

  // stop speech if the screen unmounts
  useEffect(() => () => { stopped.current = true; Speech.stop(); }, []);

  const setRate = useCallback((n: number) => { rateRef.current = n; setRateState(n); AsyncStorage.setItem(RATE_KEY, String(n)); }, []);
  const setVoice = useCallback((id: string | null) => { voiceRef.current = id; setVoiceState(id); AsyncStorage.setItem(VOICE_KEY, id ?? ""); }, []);

  return { speaking, paused, current, rate, voice, voices, start, pause, resume, stop, setRate, setVoice };
}
