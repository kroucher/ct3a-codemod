"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const glob_1 = require("glob");
const ts_morph_1 = require("ts-morph");
function addPrisma({ project }) {
    console.log("Adding Prisma");
    project.addSourceFilesAtPaths(glob_1.glob.sync("./**/*.ts"));
    project.resolveSourceFileDependencies();
    const fs = project.getFileSystem();
    const packageJson = fs.readFileSync("package.json");
    const packageJsonParsed = JSON.parse(packageJson);
    if (packageJsonParsed.devDependencies["prisma"] ||
        packageJsonParsed.dependencies["prisma"]) {
        console.log("  Prisma has already been added to package.json");
    }
    else {
        console.log("Adding Prisma to package.json...");
        packageJsonParsed.devDependencies["prisma"] = "^2.29.1";
        if (packageJsonParsed.devDependencies["@prisma/client"] ||
            packageJsonParsed.dependencies["@prisma/client"]) {
            console.log("  @prisma/client has already been added to package.json");
        }
        else {
            console.log("Adding @prisma/client to package.json...");
            packageJsonParsed.devDependencies["@prisma/client"] = "^2.29.1";
        }
        const newPackageJson = JSON.stringify(packageJsonParsed, null, 2);
        fs.writeFileSync("package.json", newPackageJson);
    }
    // recursively search for a directory named api
    const prismaDir = glob_1.glob.sync("**/prisma/", {
        ignore: ["**/node_modules/**"],
    });
    if (prismaDir.length === 0) {
        console.log("Creating prisma directory...");
        //create prisma directory at root
        const prisma = project.createDirectory("./prisma");
        prisma.saveSync();
    }
    else {
        console.log("  Prisma directory already exists, located at:", prismaDir[0]);
    }
    console.log("Searching for prisma schema file...");
    const prismaFile = glob_1.glob.sync("./prisma/schema.prisma", {
        ignore: ["**/node_modules/**"],
    });
    if (prismaFile.length > 0) {
        console.log("  Prisma file already exists");
    }
    else {
        console.log("Existing prisma file not found, creating prisma file...");
        const prisma = project.createSourceFile("./prisma/schema.prisma", `datasource db {
    provider = "postgresql"
    url      = env("DATABASE_URL")
    }
    
    generator client {
    provider = "prisma-client-js"
    }
    
    model User {
    id        Int      @id @default(autoincrement())
    email     String   @unique
    name      String?
    image     String?
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
    }`);
        prisma.save().then(() => {
            const prismaFile = glob_1.glob.sync("./prisma/schema.prisma", {
                ignore: ["**/node_modules/**"],
            });
            if (prismaFile.length > 0) {
                console.log("  Prisma file created");
            }
            else {
                console.log("!  Prisma file not created");
            }
        });
    }
    console.log("Searching for prisma client file...");
    const existingPrismaClient = project.getSourceFiles().find((file) => {
        return file
            .getChildrenOfKind(ts_morph_1.ts.SyntaxKind.ImportDeclaration)
            .find((node) => {
            if (node.getText().includes("@prisma/client")) {
                return true;
            }
        });
    });
    if (existingPrismaClient) {
        console.log("  Prisma client already exists");
    }
    else {
        console.log("  Existing prisma client not found, creating prisma client...");
        const prismaClient = project.createSourceFile("./server/utils/prisma.ts", `import { PrismaClient } from "@prisma/client";
        declare global {
          // allow global \`var\` declarations
          // eslint-disable-next-line no-var
          var prisma: PrismaClient | undefined;
        }
        
        export const prisma =
          global.prisma ||
          new PrismaClient({
            log:
              process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
          });
        
        if (process.env.NODE_ENV !== "production") global.prisma = prisma;`);
        prismaClient.save().then(() => {
            const prismaClientFile = glob_1.glob.sync("./server/utils/prisma.ts", {
                ignore: ["**/node_modules/**"],
            });
            if (prismaClientFile.length > 0) {
                console.log(`  Prisma client file created at ${prismaClientFile[0]}`);
            }
            else {
                console.log("Prisma client file not created");
            }
        });
    }
}
exports.default = addPrisma;
