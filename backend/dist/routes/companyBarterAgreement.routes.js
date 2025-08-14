"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const companyBarterAgreement_controller_1 = require("../controllers/companyBarterAgreement.controller");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authMiddleware);
router.post("/", /*validateBody,*/ companyBarterAgreement_controller_1.postCompanyBarterAgreementHandler);
router.post("/projects/:projectId", 
/*validateArrayBody(baterSchema),*/
companyBarterAgreement_controller_1.postCompanyBarterAgreementFromProjectHandler);
router.patch("/:id", companyBarterAgreement_controller_1.patchCompanyBarterAgreementHandler);
router.get("/:id", companyBarterAgreement_controller_1.getCompanyBarterAgreementByIdHandler);
router.get("/", companyBarterAgreement_controller_1.getAllCompanyBarterAgreementsHandler);
router.get("/project/:projectId", companyBarterAgreement_controller_1.getAllCompanyBarterAgreementsByProjectIdHandler);
exports.default = router;
