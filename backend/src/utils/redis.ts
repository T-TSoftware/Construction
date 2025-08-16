import Redis from "ioredis";

export const redis = new Redis(process.env.REDIS_URL!);

// İsteğe bağlı: bağlantı logları
redis.on("connect", () => console.log("[redis] connected"));
redis.on("error", (err) => console.error("[redis] error", err));