import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postStockItemHandler,
  getStockItemsHandler,
  patchStockItemHandler,
} from "../controllers/stockItem.controller";
import { validateBody } from "../middlewares/requestMiddleware";
import {
  stockItemSchema,
  stockItemPatchSchema,
} from "../validations/validations";

const router = Router();

router.use(authMiddleware);

router.post("/", validateBody(stockItemSchema), postStockItemHandler);
router.get("/", getStockItemsHandler);
router.patch("/:id", validateBody(stockItemPatchSchema), patchStockItemHandler);
//router.post("/bulk", authMiddleware, postBulkQuantityItemsHandler);

export default router;
