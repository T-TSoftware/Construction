import { Router } from "express";
import { validateBody } from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import {
  postCompanyLoanHandler,
  getCompanyLoansHandler,
  getCompanyLoanByIdHandler,
} from "../controllers/companyLoan.controller";
import { getCompanyLoans } from "../services/companyLoan.service";

const router = Router();

router.use(authMiddleware);

router.post("/", /*validateBody,*/ postCompanyLoanHandler);

router.get("/", getCompanyLoansHandler);

router.get("/:id", getCompanyLoanByIdHandler);

export default router;
