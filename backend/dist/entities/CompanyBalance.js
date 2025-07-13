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
exports.CompanyBalance = void 0;
const typeorm_1 = require("typeorm");
const Company_1 = require("./Company");
const CompanyFinance_1 = require("./CompanyFinance");
const CompanyCheck_1 = require("./CompanyCheck");
const CompanyLoan_1 = require("./CompanyLoan");
let CompanyBalance = class CompanyBalance {
};
exports.CompanyBalance = CompanyBalance;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyBalance.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyBalance.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, (company) => company.balances, {
        onDelete: "CASCADE",
    }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyBalance.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyBalance.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], CompanyBalance.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyBalance.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "createdby" }),
    __metadata("design:type", String)
], CompanyBalance.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "updatedby" }),
    __metadata("design:type", String)
], CompanyBalance.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBalance.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBalance.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.fromAccount),
    __metadata("design:type", Array)
], CompanyBalance.prototype, "outgoingFinanceTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.toAccount),
    __metadata("design:type", Array)
], CompanyBalance.prototype, "incomingFinanceTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyCheck_1.CompanyCheck, (check) => check.bank),
    __metadata("design:type", CompanyCheck_1.CompanyCheck)
], CompanyBalance.prototype, "checks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyLoan_1.CompanyLoan, (loan) => loan.bank),
    __metadata("design:type", CompanyLoan_1.CompanyLoan)
], CompanyBalance.prototype, "loans", void 0);
exports.CompanyBalance = CompanyBalance = __decorate([
    (0, typeorm_1.Entity)({ name: "companybalances" })
], CompanyBalance);
