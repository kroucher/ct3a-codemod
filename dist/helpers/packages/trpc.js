"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
function addtRPC({ project, prisma, }) {
    console.log("Adding tRPC");
    project.addSourceFilesAtPaths(glob_1.glob.sync("./**/*.ts"));
    project.resolveSourceFileDependencies();
    const fs = project.getFileSystem();
    const packageJson = fs.readFileSync("package.json");
    const packageJsonParsed = JSON.parse(packageJson);
    if (packageJsonParsed.devDependencies["zod"] ||
        packageJsonParsed.dependencies["zod"]) {
        console.log("  Zod has already been added to package.json");
    }
    else {
        console.log("Adding Zod to package.json...");
        packageJsonParsed.devDependencies["zod"] = "^3.17.3";
    }
    if (packageJsonParsed.devDependencies["@trpc/server"] ||
        packageJsonParsed.dependencies["@trpc/server"] ||
        packageJsonParsed.devDependencies["@trpc/react"] ||
        packageJsonParsed.dependencies["@trpc/react"] ||
        packageJsonParsed.devDependencies["@trpc/next"] ||
        packageJsonParsed.dependencies["@trpc/next"] ||
        packageJsonParsed.devDependencies["@trpc/client"] ||
        packageJsonParsed.dependencies["@trpc/client"]) {
        console.log("  tRPC has already been added to package.json");
    }
    else {
        console.log("Adding tRPC to package.json...");
        packageJsonParsed.dependencies["@trpc/server"] = "^9.25.3";
        packageJsonParsed.dependencies["@trpc/react"] = "^9.25.3";
        packageJsonParsed.dependencies["@trpc/next"] = "^9.25.3";
        packageJsonParsed.dependencies["@trpc/client"] = "^9.25.3";
        const newPackageJson = JSON.stringify(packageJsonParsed, null, 2);
        fs.writeFileSync("package.json", newPackageJson);
        console.log("  tRPC added to package.json");
    }
    console.log("Searching for existing tRPC directory...");
    const tRPCDir = glob_1.glob.sync("**/api/trpc/", {
        ignore: ["**/node_modules/**"],
    });
    if (tRPCDir.length === 0) {
        console.log("Creating api/trpc directory...");
        const trpc = project.createDirectory("./api/trpc");
        trpc.saveSync();
    }
    else {
        console.log("  /api/trpc directory already exists, located at:", tRPCDir[0]);
    }
    console.log("Searching for tRPC router file...");
    const tRPCFile = project.getSourceFiles().find((file) => {
        return file.getBaseName() === "[trpc].ts";
    });
    if (tRPCFile) {
        console.log("  tRPC file already exists");
    }
    else {
        console.log("Creating [trpc].ts...");
        if (prisma) {
            const tRPC = project.createSourceFile("./api/trpc/[trpc].ts", `import { createRouter, inferAsyncReturnType } from "@trpc/server";
import { NextApiRequest, NextApiResponse } from "next";
import * as "z" from "zod";
import { prisma } from "./server/utils/prisma";

export const router = createRouter()
  .query("hello", {
    input: z.object({
      name: z.string(),
    }),
    resolve({ name }) {
      return \`Hello \${name}\`;
    },
  })
  .mutation("createUser", {
    input: z.object({
      name: z.string(),
    }),
    resolve({ name }) {
      return prisma.user.create({
        data: {
          name,
        },
      });
    },
  })
  .mutation("deleteUser", {
    input: z.object({
      id: z.number(),
    }),
    resolve({ id }) {
        return prisma.user.delete({
            where: {
            id,
            },
        });
        }
    })
    .mutation("updateUser", {
        input: z.object({
            id: z.number(),
            name: z.string(),
        }),
        resolve({ id, name }) {
            return prisma.user.update({
                where: {
                    id,
                },
                data: {
                    name,
                },
            });
        },
    });

export type TRPCResponse = inferAsyncReturnType<typeof router.handle>;

export default async function trpcHandler(
  req: NextApiRequest,
  res: NextApiResponse<TRPCResponse>
) {
  try {
    const trpcResp = await router.handle({
      method: req.method as any,
      path: req.url,
      body: req.body,
      headers: req.headers,
    });
    res.status(trpcResp.status).json(trpcResp);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}
`);
        }
        else {
            const tRPC = project.createSourceFile("./api/trpc/[trpc].ts", `import { createRouter, inferAsyncReturnType } from "@trpc/server";
import { NextApiRequest, NextApiResponse } from "next";
import * as "z" from "zod";

export const router = createRouter()
  .query("hello", {
    input: z.object({
      name: z.string(),
    }),
    resolve({ name }) {
      return \`Hello \${name}\`;
    },
  });

export type TRPCResponse = inferAsyncReturnType<typeof router.handle>;

export default async function trpcHandler(
  req: NextApiRequest,
  res: NextApiResponse<TRPCResponse>
) {
  try {
    const trpcResp = await router.handle({
      method: req.method as any,
      path: req.url,
      body: req.body,
      headers: req.headers,
    });
    res.status(trpcResp.status).json(trpcResp);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: "Internal Server Error",
    });
  }
}
`);
            tRPC.save().then(() => {
                const tRPCFile = project.getSourceFile("./api/trpc/[trpc].ts");
                if (tRPCFile) {
                    console.log("  [trpc].ts created");
                }
                else {
                    console.log("  [trpc].ts not created");
                }
            });
        }
        console.log("Creating /server/utils/createRouter.ts...");
        const createRouter = project.createSourceFile("./server/utils/createRouter.ts", `import * as trpc from "@trpc/server";
        import { Context } from "./context";

        export function createRouter() {
            return trpc.router<Context>();
        }`);
        createRouter.save().then(() => {
            const createRouterFile = project.getSourceFile("./server/utils/createRouter.ts");
            if (createRouterFile) {
                console.log("  createRouter.ts created");
            }
            else {
                console.log("  createRouter.ts not created");
            }
        });
        console.log("Creating /server/utils/context.ts...");
        // TODO: add correct pages path
        const context = project.createSourceFile("./server/utils/context.ts", `import * as trpc from "@trpc/server";
        import * as trpcNext from "@trpc/server/adapters/next";
        import { getServerSession } from "next-auth";
        import { prisma } from "./prisma";
        import { authOptions as nextAuthOptions } from "../../api/auth/[...nextauth]";
        
        export const createContext = async (
          opts?: trpcNext.CreateNextContextOptions
        ) => {
          const req = opts?.req;
          const res = opts?.res;
        
          /**
           * Uses faster "getServerSession" in next-auth v4 that avoids a fetch request to /api/auth.
           * This function also updates the session cookie whereas getSession does not
           * Note: If no req -> SSG is being used -> no session exists (null)
           * @link https://github.com/nextauthjs/next-auth/issues/1535
           */
          const session = opts && (await getServerSession(opts, nextAuthOptions));
        
          // for API-response caching see https://trpc.io/docs/caching
          return {
            req,
            res,
            session,
            prisma,
          };
        };
        
        export type Context = trpc.inferAsyncReturnType<typeof createContext>;`);
        context.save().then(() => {
            const contextFile = project.getSourceFile("./server/utils/context.ts");
            if (contextFile) {
                console.log("  context.ts created");
            }
            else {
                console.log("  context.ts not created");
            }
        });
    }
}
exports.default = addtRPC;
