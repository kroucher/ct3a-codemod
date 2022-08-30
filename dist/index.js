"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const helpers_1 = __importDefault(require("./helpers"));
const program = new commander_1.Command()
    .arguments("<packages...>")
    .option("-i, --install", "install package")
    .action((packages, options, command) => {
    if (options.install) {
        (0, helpers_1.default)(packages);
    }
})
    .parse(process.argv);
