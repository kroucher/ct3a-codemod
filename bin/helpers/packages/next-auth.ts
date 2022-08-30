import { glob } from "glob";
import { Project } from "ts-morph";

export default function addNextAuth({ project }: { project: Project }) {
  project.addSourceFilesAtPaths(glob.sync("./**/*.ts"));
  project.resolveSourceFileDependencies();
  const fs = project.getFileSystem();
  const packageJson = fs.readFileSync("package.json");
  const packageJsonParsed = JSON.parse(packageJson);
  if (
    packageJsonParsed.devDependencies["next-auth"] ||
    packageJsonParsed.dependencies["next-auth"]
  ) {
    console.log("  NextAuth has already been added to package.json");
  } else {
    console.log("Adding NextAuth to package.json...");
    packageJsonParsed.devDependencies["next-auth"] = "^4.5.0";
    const newPackageJson = JSON.stringify(packageJsonParsed, null, 2);
    fs.writeFileSync("package.json", newPackageJson);
    console.log("  NextAuth added to package.json");
  }

  // recursively search for a directory named api

  const nextAuthDir = glob.sync("**/api/auth/", {
    ignore: ["**/node_modules/**"],
  });
  if (nextAuthDir.length === 0) {
    console.log("Creating api/auth directory...");
  } else {
    console.log(
      "api/auth directory already exists, located at:",
      nextAuthDir[0]
    );
  }

  const nextAuthFile = project.getSourceFiles().find((file) => {
    return file.getBaseName() === "[...nextauth].ts";
  });
  if (nextAuthFile) {
    console.log("NextAuth file already exists");
  } else {
    console.log("Creating [...nextauth].ts...");
    const nextAuth = project.createSourceFile(
      "[...nextauth].ts",
      `import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export default NextAuth({
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
      id: "google",
      name: "Google",
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // ...add more providers here
  ],

  // A database is optional, but required to persist accounts in a database
  // database: process.env.DATABASE_URL,
});`
    );
    nextAuth.save().then(() => {
      const newNextAuthFile = project.getSourceFiles().find((file) => {
        return file.getBaseName() === "[...nextauth].ts";
      });
      if (newNextAuthFile) {
        console.log("NextAuth file created successfully");
        const nextAuthDir = glob.sync("**/api/auth/", {
          ignore: ["**/node_modules/**"],
        });
        if (nextAuthDir.length === 0) {
          console.log("Creating api/auth directory...");
          fs.mkdirSync("api/auth");
          newNextAuthFile.move(`api/auth/[...nextauth].ts`);
        } else {
          console.log(
            "api/auth directory already exists, located at:",
            nextAuthDir[0]
          );
          newNextAuthFile.moveImmediatelySync(
            `${nextAuthDir[0]}[...nextauth].ts`
          );
        }
      } else {
        console.log("NextAuth file creation failed");
      }
    });
  }
}
