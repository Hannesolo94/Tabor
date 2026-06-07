// @tabor/shared — types, brand tokens, and the game engine.
export * as game from "./game/index";
export * as brand from "./brand/index";

// Also re-export the game engine + scripture flat for ergonomic imports.
export * from "./game/index";
export * from "./scripture/index";
