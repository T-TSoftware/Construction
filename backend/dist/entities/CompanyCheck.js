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
exports.CompanyCheck = void 0;
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("./CompanyProject");
const CompanyFinance_1 = require("./CompanyFinance");
const Company_1 = require("./Company");
const User_1 = require("./User");
const CompanyBalance_1 = require("./CompanyBalance");
let CompanyCheck = class CompanyCheck {
};
exports.CompanyCheck = CompanyCheck;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyCheck.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CompanyCheck.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "checkdate", type: "date" }),
    __metadata("design:type", Date)
], CompanyCheck.prototype, "checkDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "transactiondate", type: "timestamp" }),
    __metadata("design:type", Date)
], CompanyCheck.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyCheck.prototype, "firm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], CompanyCheck.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "checknumber", unique: true }),
    __metadata("design:type", String)
], CompanyCheck.prototype, "checkNo", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyCheck.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyCheck.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "varchar", nullable: false }),
    __metadata("design:type", String)
], CompanyCheck.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBalance_1.CompanyBalance),
    (0, typeorm_1.JoinColumn)({ name: "bankid" }),
    __metadata("design:type", CompanyBalance_1.CompanyBalance)
], CompanyCheck.prototype, "bank", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyFinance_1.CompanyFinanceTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "transactionid" }),
    __metadata("design:type", Object)
], CompanyCheck.prototype, "transaction", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", Object)
], CompanyCheck.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyCheck.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyCheck.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyCheck.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyCheck.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyCheck.prototype, "updatedatetime", void 0);
exports.CompanyCheck = CompanyCheck = __decorate([
    (0, typeorm_1.Entity)("companychecks", { schema: "artikonsept" })
], CompanyCheck);
