"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ts_morph_1 = require("ts-morph");
const tailwind_1 = __importDefault(require("./packages/tailwind"));
const next_auth_1 = __importDefault(require("./packages/next-auth"));
const prisma_1 = __importDefault(require("./packages/prisma"));
const trpc_1 = __importDefault(require("./packages/trpc"));
const project = new ts_morph_1.Project({
    skipFileDependencyResolution: true,
    tsConfigFilePath: "./tsconfig.json",
});
function add(names) {
    if (names.length === 0) {
        console.log("No packages to install");
        return false;
    }
    if (names.includes("tailwind")) {
        (0, tailwind_1.default)({
            project,
        });
    }
    if (names.includes("nextauth")) {
        (0, next_auth_1.default)({
            project,
        });
    }
    if (names.includes("prisma")) {
        (0, prisma_1.default)({
            project,
        });
    }
    if (names.includes("trpc")) {
        (0, trpc_1.default)({
            project: project,
            prisma: names.includes("prisma"),
        });
    }
    if (names.includes("all")) {
        (0, tailwind_1.default)({ project });
        (0, next_auth_1.default)({ project });
        (0, prisma_1.default)({ project });
        (0, trpc_1.default)({ project, prisma: true });
    }
}
exports.default = add;
