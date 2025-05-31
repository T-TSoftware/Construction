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
exports.Company = void 0;
const typeorm_1 = require("typeorm");
const CompanyBalance_1 = require("./CompanyBalance");
const CompanyProject_1 = require("./CompanyProject");
const CompanyStock_1 = require("./CompanyStock");
const CompanyFinance_1 = require("./CompanyFinance");
const CompanyCheck_1 = require("./CompanyCheck");
let Company = class Company {
};
exports.Company = Company;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], Company.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Company.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "taxnumber", nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "taxNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Company.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Company.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], Company.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyBalance_1.CompanyBalance, (balance) => balance.company),
    __metadata("design:type", Array)
], Company.prototype, "balances", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyProject_1.CompanyProject, (project) => project.company),
    __metadata("design:type", Array)
], Company.prototype, "projects", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyStock_1.CompanyStock, (stock) => stock.company),
    __metadata("design:type", Array)
], Company.prototype, "stocks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.company),
    __metadata("design:type", Array)
], Company.prototype, "financeTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyCheck_1.CompanyCheck, (check) => check.company),
    __metadata("design:type", CompanyCheck_1.CompanyCheck)
], Company.prototype, "checks", void 0);
exports.Company = Company = __decorate([
    (0, typeorm_1.Entity)({ name: "company" })
], Company);
