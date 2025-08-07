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
exports.CompanyBarterCashDetail = void 0;
const typeorm_1 = require("typeorm");
const CompanyBarterAgreementItem_1 = require("./CompanyBarterAgreementItem");
const User_1 = require("./User");
const Company_1 = require("./Company");
const CompanyFinance_1 = require("./CompanyFinance");
let CompanyBarterCashDetail = class CompanyBarterCashDetail {
};
exports.CompanyBarterCashDetail = CompanyBarterCashDetail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyBarterCashDetail.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBarterAgreementItem_1.CompanyBarterAgreementItem, (item) => item.cashDetails),
    (0, typeorm_1.JoinColumn)({ name: "barteritemid" }),
    __metadata("design:type", CompanyBarterAgreementItem_1.CompanyBarterAgreementItem)
], CompanyBarterCashDetail.prototype, "barterItem", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: ["PENDING", "PAID", "COLLECTED"],
        default: "PENDING",
    }),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyFinance_1.CompanyFinanceTransaction, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "financetransactionid" }),
    __metadata("design:type", Object)
], CompanyBarterCashDetail.prototype, "financeTransaction", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], CompanyBarterCashDetail.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)("uuid", { name: "fromaccountid" }),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "fromAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "enum", enum: ["CASH", "BANK"], name: "accounttype" }),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], CompanyBarterCashDetail.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterCashDetail.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterCashDetail.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterCashDetail.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterCashDetail.prototype, "updatedatetime", void 0);
exports.CompanyBarterCashDetail = CompanyBarterCashDetail = __decorate([
    (0, typeorm_1.Entity)("companybartercashdetails")
], CompanyBarterCashDetail);
