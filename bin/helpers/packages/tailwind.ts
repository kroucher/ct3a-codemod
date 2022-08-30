import { glob } from "glob";
import { Project } from "ts-morph";

export default function addTailwind({ project }: { project: Project }) {
  console.log("Adding Tailwind");
  // regex to find tailwind.config.js
  // check if tailwind config is already present
  const existing = glob.sync("**/tailwind.config.*", {
    ignore: ["**/node_modules/**"],
    nodir: true,
    absolute: true,
  });

  project.addSourceFilesAtPaths(glob.sync("./**/*.ts"));
  project.resolveSourceFileDependencies();
  const fs = project.getFileSystem();
  const packageJson = fs.readFileSync("package.json");
  const packageJsonParsed = JSON.parse(packageJson);
  if (
    packageJsonParsed.devDependencies["tailwindcss"] ||
    packageJsonParsed.dependencies["tailwindcss"]
  ) {
    console.log("Tailwind has already been added to package.json");
  } else {
    console.log("Adding Tailwind to package.json...");
    packageJsonParsed.devDependencies["tailwindcss"] = "^3.1.8";
    const newPackageJson = JSON.stringify(packageJsonParsed, null, 2);
    fs.writeFileSync("package.json", newPackageJson);
  }
  if (existing.length === 0) {
    console.log("Creating tailwind.config.mjs...");

    const tailwind = project.createSourceFile(
      "tailwind.config.mjs",
      `module.exports = {
          purge: [],
          darkMode: false, // or 'media' or 'class'
          theme: {
              extend: {},
          },
          variants: {
              extend: {},
          },
          plugins: [],
      }`
    );
    tailwind.saveSync();
  } else {
    console.log("Tailwind config already exists, located at:", existing[0]);
  }
}
