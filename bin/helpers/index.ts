import { Project, ts } from "ts-morph";
import { glob } from "glob";
import addTailwind from "./packages/tailwind";
import addNextAuth from "./packages/next-auth";
import addPrisma from "./packages/prisma";
import addtRPC from "./packages/trpc";

const project = new Project({
  skipFileDependencyResolution: true,
  tsConfigFilePath: "./tsconfig.json",
});

export default function add(names: string[]) {
  if (names.length === 0) {
    console.log("No packages to install");
    return false;
  }
  if (names.includes("tailwind")) {
    addTailwind({
      project,
    });
  }
  if (names.includes("nextauth")) {
    addNextAuth({
      project,
    });
  }
  if (names.includes("prisma")) {
    addPrisma({
      project,
    });
  }
  if (names.includes("trpc")) {
    addtRPC({
      project: project,
      prisma: names.includes("prisma"),
      
    });
  }
  if (names.includes("all")) {
    addTailwind({ project });
    addNextAuth({ project });
    addPrisma({ project });
    addtRPC({ project, prisma: true });
  }
}
