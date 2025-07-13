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
exports.CompanyFinanceTransaction = void 0;
const typeorm_1 = require("typeorm");
const CompanyBalance_1 = require("./CompanyBalance");
const CompanyProject_1 = require("./CompanyProject");
const User_1 = require("./User");
const Company_1 = require("./Company");
const CompanyCheck_1 = require("./CompanyCheck");
const CompanyOrder_1 = require("./CompanyOrder");
const CompanyLoanPayment_1 = require("./CompanyLoanPayment");
let CompanyFinanceTransaction = class CompanyFinanceTransaction {
};
exports.CompanyFinanceTransaction = CompanyFinanceTransaction;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyFinanceTransaction.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], CompanyFinanceTransaction.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBalance_1.CompanyBalance),
    (0, typeorm_1.JoinColumn)({ name: "fromaccountid" }),
    __metadata("design:type", CompanyBalance_1.CompanyBalance)
], CompanyFinanceTransaction.prototype, "fromAccount", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBalance_1.CompanyBalance, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "toaccountid" }),
    __metadata("design:type", CompanyBalance_1.CompanyBalance)
], CompanyFinanceTransaction.prototype, "toAccount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "targettype", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "targetType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "source", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "targetid", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "targetname", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "targetName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "transactiondate", type: "timestamp", nullable: false }),
    __metadata("design:type", Date)
], CompanyFinanceTransaction.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "method" }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "method", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "category" }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "invoiceyn", type: "varchar", default: "N" }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "invoiceYN", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "invoicecode", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "invoiceCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "checkcode", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "checkCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "checkstatus", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "checkstatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "loancode", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "loanCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "loanstatus", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "loanStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], CompanyFinanceTransaction.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", Object)
], CompanyFinanceTransaction.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyFinanceTransaction.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }) // camelCase → fix
    ,
    __metadata("design:type", User_1.User)
], CompanyFinanceTransaction.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyFinanceTransaction.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyFinanceTransaction.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyCheck_1.CompanyCheck, (check) => check.checkNo),
    __metadata("design:type", Array)
], CompanyFinanceTransaction.prototype, "checks", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyOrder_1.CompanyOrder, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "orderid" }),
    __metadata("design:type", Object)
], CompanyFinanceTransaction.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => CompanyLoanPayment_1.CompanyLoanPayment, (payment) => payment.financeTransaction, {
        nullable: true,
    }),
    __metadata("design:type", Object)
], CompanyFinanceTransaction.prototype, "loanPayment", void 0);
exports.CompanyFinanceTransaction = CompanyFinanceTransaction = __decorate([
    (0, typeorm_1.Entity)({ name: "companyfinancetransactions" })
], CompanyFinanceTransaction);
