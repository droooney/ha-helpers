import { exec } from "teen_process";
import { openUrl } from "../src/utils.js";

await exec("DisplaySwitch.exe", ["/internal"]);

await openUrl("steam://close/bigpicture");
