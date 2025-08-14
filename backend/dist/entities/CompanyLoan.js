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
exports.CompanyLoan = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Company_1 = require("./Company");
const CompanyLoanPayment_1 = require("./CompanyLoanPayment");
const CompanyBalance_1 = require("./CompanyBalance");
const CompanyProject_1 = require("./CompanyProject");
let CompanyLoan = class CompanyLoan {
};
exports.CompanyLoan = CompanyLoan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyLoan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyLoan.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "code", type: "varchar", length: 100 }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "name", type: "varchar", length: 100, unique: true }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "accountno", type: "varchar" }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "accountNo", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBalance_1.CompanyBalance, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "bankid" }),
    __metadata("design:type", CompanyBalance_1.CompanyBalance)
], CompanyLoan.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", Object)
], CompanyLoan.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totalloanamount", type: "numeric", precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "remainingprincipal", type: "numeric" }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "remainingPrincipal", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "remaininginstallmentamount",
        type: "numeric",
        precision: 15,
        scale: 2,
    }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "remainingInstallmentAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "currency", type: "varchar", length: 3, default: "TRY" }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "interestrate", type: "numeric", precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totalinstallmentcount", type: "int" }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "totalInstallmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "remaininginstallmentcount", type: "int" }),
    __metadata("design:type", Number)
], CompanyLoan.prototype, "remainingInstallmentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "loandate", type: "date" }),
    __metadata("design:type", Date)
], CompanyLoan.prototype, "loanDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "purpose", type: "varchar", length: 100, nullable: true }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "loantype", type: "varchar", length: 50, nullable: true }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "loanType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: "status",
        type: "varchar",
        length: 20,
        default: "ACTIVE",
    }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "description", type: "text", nullable: true }),
    __metadata("design:type", String)
], CompanyLoan.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyLoanPayment_1.CompanyLoanPayment, (payment) => payment.loan),
    __metadata("design:type", Array)
], CompanyLoan.prototype, "payments", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyLoan.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }) // camelCase → fix
    ,
    __metadata("design:type", User_1.User)
], CompanyLoan.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyLoan.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyLoan.prototype, "updatedatetime", void 0);
exports.CompanyLoan = CompanyLoan = __decorate([
    (0, typeorm_1.Entity)({ name: "companyloan" })
], CompanyLoan);
