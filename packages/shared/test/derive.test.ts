import { describe, expect, it } from "vitest";
import {
  RANK_LEVELS,
  XP_PER_LEVEL,
  deriveRank,
  demoState,
  levelFromXp,
  rankIdxFromLevel,
  xpAtLevel,
} from "../src/game/index";

const TODAY = "2026-06-05";

describe("levelFromXp", () => {
  it("starts at level 1 with no xp", () => {
    expect(levelFromXp(0)).toBe(1);
  });
  it("crosses to level 2 at exactly XP_PER_LEVEL", () => {
    expect(levelFromXp(XP_PER_LEVEL - 1)).toBe(1);
    expect(levelFromXp(XP_PER_LEVEL)).toBe(2);
  });
  it("matches the prototype demo value (xp 6750 => level 14)", () => {
    expect(levelFromXp(6750)).toBe(14);
  });
});

describe("rankIdxFromLevel", () => {
  it("maps each RANK_LEVELS boundary to its index", () => {
    RANK_LEVELS.forEach((lvl, i) => {
      expect(rankIdxFromLevel(lvl)).toBe(i);
    });
  });
  it("level just below a boundary stays in the lower rank", () => {
    expect(rankIdxFromLevel(11)).toBe(1); // Initiate (Tempered begins at 12)
    expect(rankIdxFromLevel(12)).toBe(2); // Tempered
  });
});

describe("xpAtLevel", () => {
  it("level 1 needs 0 xp", () => {
    expect(xpAtLevel(1)).toBe(0);
  });
  it("scales linearly", () => {
    expect(xpAtLevel(6)).toBe(5 * XP_PER_LEVEL);
  });
});

describe("deriveRank", () => {
  it("derives Tempered at the prototype demo xp", () => {
    const d = deriveRank(demoState(TODAY));
    expect(d.level).toBe(14);
    expect(d.rankName).toBe("Tempered");
    expect(d.nextRank).toBe("Forged");
    expect(d.maxed).toBe(false);
    expect(d.rankProgress).toBeGreaterThan(0);
    expect(d.rankProgress).toBeLessThan(1);
  });
  it("clamps progress to 1 and flags maxed at the top rank", () => {
    const s = { ...demoState(TODAY), xp: xpAtLevel(99) };
    const d = deriveRank(s);
    expect(d.maxed).toBe(true);
    expect(d.rankProgress).toBe(1);
    expect(d.rankName).toBe("Supersonic Fit");
  });
});
