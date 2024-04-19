import { PrismaClient } from "@prisma/client";
import { createClient } from "redis";

export const prisma = new PrismaClient();
export const redis = createClient({
  url: process.env.REDIS_URL
});
redis.connect();

export const redisPrefix = "finwise:";