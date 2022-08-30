import { Command } from "commander";
import add from "./helpers";

const program = new Command()
  .arguments("<packages...>")
  .option("-i, --install", "install package")
  .action((packages, options, command) => {
    if (options.install) {
      add(packages);
    }
  })
  .parse(process.argv);
