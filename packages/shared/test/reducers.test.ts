import { describe, expect, it } from "vitest";
import {
  completeQuest,
  demoState,
  newPlayer,
  reconcile,
  useFreeze,
} from "../src/game/index";

const TODAY = "2026-06-05";

describe("completeQuest", () => {
  it("adds xp and 60% of xp to the governing stat", () => {
    const s = newPlayer(TODAY); // xp 0, stats 0
    const { state } = completeQuest(s, "scout", TODAY); // WIS, xp 120
    expect(state.xp).toBe(120);
    expect(state.stats.WIS).toBe(Math.round(120 * 0.6)); // 72
  });

  it("is idempotent for an already-done quest", () => {
    const once = completeQuest(newPlayer(TODAY), "iron", TODAY).state;
    const twice = completeQuest(once, "iron", TODAY).state;
    expect(twice).toBe(once); // same reference, no change
  });

  it("unlocks first-blood on the very first quest", () => {
    const { state } = completeQuest(newPlayer(TODAY), "line", TODAY);
    expect(state.achievements).toContain("first-blood");
  });

  it("does not seal the day until all three quests are done", () => {
    let s = newPlayer(TODAY);
    let r = completeQuest(s, "scout", TODAY);
    expect(r.daySealed).toBe(false);
    r = completeQuest(r.state, "iron", TODAY);
    expect(r.daySealed).toBe(false);
    r = completeQuest(r.state, "line", TODAY);
    expect(r.daySealed).toBe(true);
    expect(r.state.streak).toBe(1);
    expect(r.state.bestStreak).toBe(1);
    expect(r.state.history[TODAY]).toBe("sealed");
  });

  it("reports rankedUp when xp crosses a rank boundary", () => {
    // Forged begins at level 20 => xp 9500. Sit just below, then complete.
    const s = { ...newPlayer(TODAY), xp: 9400 };
    const { rankedUp, state } = completeQuest(s, "iron", TODAY); // +140 -> 9540
    expect(state.xp).toBe(9540);
    expect(rankedUp).toBe(true);
  });
});

describe("useFreeze", () => {
  it("spends a freeze and marks today frozen", () => {
    const s = { ...newPlayer(TODAY), freezes: 1 };
    const out = useFreeze(s, TODAY);
    expect(out.freezes).toBe(0);
    expect(out.history[TODAY]).toBe("frozen");
  });
  it("is a no-op with no freezes", () => {
    const s = newPlayer(TODAY); // freezes 0
    expect(useFreeze(s, TODAY)).toBe(s);
  });
});

describe("reconcile (day rollover)", () => {
  it("returns the same state if already reconciled to today", () => {
    const s = { ...demoState(TODAY), lastActive: TODAY };
    expect(reconcile(s, TODAY)).toBe(s);
  });

  it("breaks the streak on a missed day with no freezes", () => {
    // lastActive two days ago, the gap day is unsealed and no freezes.
    const s = {
      ...newPlayer("2026-06-03"),
      streak: 10,
      freezes: 0,
      lastActive: "2026-06-03",
    };
    const out = reconcile(s, TODAY); // gap: 2026-06-04 unsealed
    expect(out.streak).toBe(0);
    expect(out.history["2026-06-04"]).toBe("missed");
    expect(out.lastActive).toBe(TODAY);
  });

  it("spends a freeze to protect the streak across a gap", () => {
    const s = {
      ...newPlayer("2026-06-03"),
      streak: 10,
      freezes: 1,
      lastActive: "2026-06-03",
    };
    const out = reconcile(s, TODAY);
    expect(out.streak).toBe(10); // survived
    expect(out.freezes).toBe(0);
    expect(out.history["2026-06-04"]).toBe("frozen");
  });

  it("resets today's quests to not-done", () => {
    let s = completeQuest(newPlayer("2026-06-04"), "scout", "2026-06-04").state;
    s = { ...s, lastActive: "2026-06-04" };
    const out = reconcile(s, TODAY);
    expect(out.quests.every((q) => !q.done)).toBe(true);
  });
});
