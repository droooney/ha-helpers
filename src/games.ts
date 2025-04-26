import fs from "node:fs/promises";
import path from "node:path";
import { readVdf as parseBinaryVdf } from "steam-binary-vdf";
import { parse as parseVdf } from "@node-steam/vdf";
import {
  convertObjectToArray,
  openUrl,
  parseBigint,
  parseInt,
  silent,
} from "./utils.js";
import { z } from "zod";
import sortBy from "lodash/sortBy.js";
import { exec } from "teen_process";
import { setTimeout } from "node:timers/promises";

export type Game = {
  name: string;
  runGameId: number | bigint;
};

export const STEAM_ROOT = path.resolve(
  process.env["ProgramFiles(x86)"] ?? "",
  "Steam",
);
export const STEAM_APPS_ROOT = path.resolve(STEAM_ROOT, "steamapps");
export const STEAM_USER_DATA_ROOT = path.resolve(STEAM_ROOT, "userdata");

export async function switchToMonitor(): Promise<void> {
  await exec("DisplaySwitch.exe", ["/internal"]);
}

export async function setTvSettings(): Promise<void> {
  await exec("nircmd", [
    "nircmd",
    "setdisplay",
    'monitor:"HAIER TV"',
    "3840",
    "2160",
    "24",
    "120",
  ]);
}

export async function switchToTv(): Promise<void> {
  await exec("DisplaySwitch.exe", ["/external"]);

  await setTvSettings();

  await setTimeout(3000);

  await setTvSettings();
}

export async function turnOnGameMode(): Promise<void> {
  await Promise.all([
    silent(exec("nircmd", ["closeprocess", "chrome"])),
    silent(exec("nircmd", ["closeprocess", "webstorm64"])),
    silent(exec("nircmd", ["closeprocess", "phpstorm64"])),
  ]);

  // close again because start window could have popped up
  await Promise.all([
    silent(exec("nircmd", ["closeprocess", "webstorm64"])),
    silent(exec("nircmd", ["closeprocess", "phpstorm64"])),
  ]);

  await silent(exec("wsl", ["--shutdown"]));

  await switchToTv();

  await openUrl("steam://open/gamepadui");
}

export async function getAllGames(): Promise<Game[]> {
  const [steamGames, localGames] = await Promise.all([
    getSteamGames(),
    getLocalGames(),
  ]);

  return sortBy([...steamGames, ...localGames], ({ name }) => name);
}

async function getSteamGames(): Promise<Game[]> {
  const games: Game[] = [];

  const contents = await fs.readdir(STEAM_APPS_ROOT);

  await Promise.all(
    contents
      .filter((filename) => /^appmanifest.*\.acf/.test(filename))
      .map(async (filename) => {
        const content = await fs.readFile(
          path.resolve(STEAM_APPS_ROOT, filename),
          "utf8",
        );

        const appState = z
          .object({
            AppState: z.object({
              appid: z.number(),
              name: z.string(),
              DownloadType: z.number(),
            }),
          })
          .safeParse(parseVdf(content)).data?.AppState;

        if (!appState || appState.DownloadType === 0) {
          return;
        }

        games.push({
          name: appState.name,
          runGameId: appState.appid,
        });
      }),
  );

  return games;
}

async function getLocalGames(): Promise<Game[]> {
  const games: Game[] = [];

  const contents = await fs.readdir(STEAM_USER_DATA_ROOT);

  await Promise.all(
    contents
      .filter((folderName) => !Number.isNaN(parseInt(folderName)))
      .map(async (folderName) => {
        const content = await fs.readFile(
          path.resolve(
            STEAM_USER_DATA_ROOT,
            folderName,
            "config",
            "shortcuts.vdf",
          ),
        );

        const shortcuts = z
          .object({
            shortcuts: z.record(z.unknown()),
          })
          .safeParse(parseBinaryVdf(content)).data?.shortcuts;

        if (!shortcuts) {
          return;
        }

        for (const unparsedGame of convertObjectToArray(shortcuts)) {
          const game = z
            .object({
              appid: z.number(),
              AppName: z.string(),
            })
            .passthrough()
            .safeParse(unparsedGame).data;

          if (!game) {
            continue;
          }

          const appId = parseBigint(game.appid);

          if (!appId) {
            return;
          }

          games.push({
            name: game.AppName,
            runGameId: ((appId << 8n) + 2n) << 24n,
          });
        }
      }),
  );

  return games;
}
