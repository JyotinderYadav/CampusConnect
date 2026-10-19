import { prisma } from "../lib/prisma";
import { afterAll } from "vitest";

process.env.JWT_SECRET = "test-secret-key-min-32-characters-long-ok";
process.env.JWT_EXPIRES_IN = "1h";
process.env.COOKIE_SECRET = "test-cookie-secret";
process.env.NODE_ENV = "test";

afterAll(async () => {
  await prisma.$disconnect();
});
