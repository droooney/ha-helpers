import { exec } from "teen_process";

const command = process.argv.at(2);

if (!command) {
  throw new Error("No command provided");
}

await exec("node", ["--run", command, "--", ...process.argv.slice(3)]);
