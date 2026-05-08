import { PrismaClient } from "@prisma/client";

/**
 * Reuse one PrismaClient per runtime isolate (dev HMR + Vercel serverless).
 * The stock template only caches in non-production; that creates a new client
 * on every production invocation and can contribute to connection churn.
 * Matches common Prisma + Vercel guidance and custom-sticker-designer–style stability.
 */
const globalForPrisma = globalThis;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["warn", "error"]
        : ["error"],
  });

globalForPrisma.prisma = prisma;

export default prisma;
