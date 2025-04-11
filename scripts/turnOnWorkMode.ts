import { openUrl } from "../src/utils.js";
import { switchToMonitor } from "../src/games.js";

await switchToMonitor();

await openUrl("steam://close/bigpicture");
