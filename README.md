*CT3A Codemod*

Built to install and scaffold the libraries from create-t3-app in a project that has already been started. Libraries can be installed individually, or all at once.

**Packages**

- Tailwind
- Prisma
- NextAuth
- tRPC

**Usage**

_All Packages_

`npx ct3a-codemod -i all` to install all packages. 

_Select Packages_

`npx ct3a-codemod -i tailwind` or multiple packages at once: `npx ct3a-codemod -i tailwind trpc`

**TODO**

- [] Fix relative imports based on created file location