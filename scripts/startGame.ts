import { getAllGames, turnOnGameMode } from "../src/games.js";
import { open } from "openurl";
import { promisify } from "node:util";
import { setTimeout } from "node:timers/promises";

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

await promisify(open)(`steam://rungameid/${game.runGameId}`);
