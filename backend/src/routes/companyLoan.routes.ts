import { Router } from "express";
import { validateBody } from "../middlewares/requestMiddleware";
import { authMiddleware } from "../middlewares/authMiddleware";
import { validate } from "../middlewares/requestValidation";
import { loanCreateSchema } from "../validations/companyLoan.validation";
import {
  postCompanyLoanHandler,
  getCompanyLoansHandler,
  getCompanyLoanByIdHandler,
} from "../controllers/companyLoan.controller";
import { getCompanyLoans } from "../services/companyLoan.service";

const router = Router();

router.use(authMiddleware);

router.post("/", validate(loanCreateSchema), postCompanyLoanHandler);

router.get("/", getCompanyLoansHandler);

router.get("/:id", getCompanyLoanByIdHandler);

export default router;
