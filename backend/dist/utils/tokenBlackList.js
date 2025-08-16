"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blacklistJti = blacklistJti;
exports.isBlacklisted = isBlacklisted;
const redis_1 = require("./redis");
/** jti’yi exp süresi sonuna kadar blacklist’e koy */
async function blacklistJti(jti, expUnix) {
    const now = Math.floor(Date.now() / 1000);
    const ttl = Math.max(expUnix - now, 1); // saniye
    // Key: bl:<jti>  Value: "1"
    await redis_1.redis.setex(`bl:${jti}`, ttl, "1");
}
/** jti blacklist’te mi? Redis hatasında fail-open (false) döndürüyoruz */
async function isBlacklisted(jti) {
    try {
        const val = await redis_1.redis.get(`bl:${jti}`);
        return val === "1";
    }
    catch (e) {
        console.error("[redis] blacklist check failed:", e);
        // Prod’da “fail-closed” isteyebilirsin; şimdilik dev için fail-open.
        return false;
    }
}
