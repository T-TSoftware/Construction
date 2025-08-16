import { redis } from "./redis";

/** jti’yi exp süresi sonuna kadar blacklist’e koy */
export async function blacklistJti(jti: string, expUnix: number) {
  const now = Math.floor(Date.now() / 1000);
  const ttl = Math.max(expUnix - now, 1); // saniye
  // Key: bl:<jti>  Value: "1"
  await redis.setex(`bl:${jti}`, ttl, "1");
}

/** jti blacklist’te mi? Redis hatasında fail-open (false) döndürüyoruz */
export async function isBlacklisted(jti: string): Promise<boolean> {
  try {
    const val = await redis.get(`bl:${jti}`);
    return val === "1";
  } catch (e) {
    console.error("[redis] blacklist check failed:", e);
    // Prod’da “fail-closed” isteyebilirsin; şimdilik dev için fail-open.
    return false;
  }
}