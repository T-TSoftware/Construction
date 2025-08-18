"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
const validate = (schema) => {
    return (req, res, next) => {
        try {
            // parse edilirken dönüştürmeler (trim/transform) uygulanır
            const parsed = schema.parse(req.body);
            req.body = parsed;
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const msg = err.errors[0]?.message ?? "Geçersiz veri";
                res.status(400).json({ errorMessage: msg });
                return; // <-- void döner
            }
            next(err); // diğer hataları error handler'a ilet
        }
    };
};
exports.validate = validate;
