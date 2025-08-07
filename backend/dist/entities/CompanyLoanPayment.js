"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyLoanPayment = void 0;
const typeorm_1 = require("typeorm");
const CompanyLoan_1 = require("./CompanyLoan");
const CompanyFinance_1 = require("./CompanyFinance");
const User_1 = require("./User");
const Company_1 = require("./Company");
let CompanyLoanPayment = class CompanyLoanPayment {
};
exports.CompanyLoanPayment = CompanyLoanPayment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyLoanPayment.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyLoan_1.CompanyLoan, (loan) => loan.payments),
    (0, typeorm_1.JoinColumn)({ name: "loanid" }),
    __metadata("design:type", CompanyLoan_1.CompanyLoan)
], CompanyLoanPayment.prototype, "loan", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyLoanPayment.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "code", type: "varchar", length: 100, unique: true }),
    __metadata("design:type", String)
], CompanyLoanPayment.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "installmentnumber", type: "int" }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "installmentNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "duedate", type: "date" }),
    __metadata("design:type", Date)
], CompanyLoanPayment.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totalamount", type: "numeric" }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "interestamount", type: "numeric" }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "interestAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "principalamount", type: "numeric" }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "principalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paymentamount", type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "paymentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "remainingamount" }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "status", type: "varchar", length: 20, default: "PENDING" }),
    __metadata("design:type", String)
], CompanyLoanPayment.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paymentdate", type: "date", nullable: true }),
    __metadata("design:type", Date)
], CompanyLoanPayment.prototype, "paymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "penaltyamount",
        type: "numeric",
        nullable: true,
        default: 0,
    }),
    __metadata("design:type", Number)
], CompanyLoanPayment.prototype, "penaltyAmount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.loanPayment),
    __metadata("design:type", Array)
], CompanyLoanPayment.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyLoanPayment.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyLoanPayment.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyLoanPayment.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyLoanPayment.prototype, "updatedatetime", void 0);
exports.CompanyLoanPayment = CompanyLoanPayment = __decorate([
    (0, typeorm_1.Entity)({ name: "companyloanpayment" })
], CompanyLoanPayment);
