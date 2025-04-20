import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { postQuantityItemHandler,getQuantityItemsHandler } from "../controllers/quantityItem.controller";

const router = Router();

router.use(authMiddleware);

router.post("/", postQuantityItemHandler);
router.get("/", getQuantityItemsHandler);
//router.post("/bulk", authMiddleware, postBulkQuantityItemsHandler);

export default router;
