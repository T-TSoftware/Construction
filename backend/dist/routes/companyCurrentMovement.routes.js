"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const companyCurrentMovement_controller_1 = require("../controllers/companyCurrentMovement.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.get("/", companyCurrentMovement_controller_1.getCurrentMovementsHandler);
exports.default = router;
