import { getAllGames, turnOnGameMode } from "../src/games.js";
import { setTimeout } from "node:timers/promises";
import { openUrl } from "../src/utils.js";

const gameName = process.argv.at(2);

if (!gameName) {
  throw new Error("Provide game name");
}

const games = await getAllGames();
const game = games.find((game) => game.name === gameName);

if (!game) {
  throw new Error(`Not game named ${JSON.stringify(gameName)} found`);
}

await turnOnGameMode();

await setTimeout(3000);

await openUrl(`steam://rungameid/${game.runGameId}`);
