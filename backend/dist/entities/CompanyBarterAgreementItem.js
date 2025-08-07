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
exports.CompanyBarterAgreementItem = void 0;
const typeorm_1 = require("typeorm");
const CompanyBarterAgreement_1 = require("./CompanyBarterAgreement");
const CompanyStock_1 = require("./CompanyStock");
const ProjectSubcontractor_1 = require("./ProjectSubcontractor");
const ProjectSupplier_1 = require("./ProjectSupplier");
const Company_1 = require("./Company");
const User_1 = require("./User");
const CompanyBarterItemCashDetail_1 = require("./CompanyBarterItemCashDetail");
const CompanyFinance_1 = require("./CompanyFinance");
let CompanyBarterAgreementItem = class CompanyBarterAgreementItem {
};
exports.CompanyBarterAgreementItem = CompanyBarterAgreementItem;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }) //
    ,
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyBarterAgreementItem.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBarterAgreement_1.CompanyBarterAgreement, (agreement) => agreement.items),
    (0, typeorm_1.JoinColumn)({ name: "barteragreementid" }),
    __metadata("design:type", CompanyBarterAgreement_1.CompanyBarterAgreement)
], CompanyBarterAgreementItem.prototype, "barterAgreement", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "direction", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "itemtype" }),
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "itemType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text" }),
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "agreedvalue", type: "numeric" }),
    __metadata("design:type", Number)
], CompanyBarterAgreementItem.prototype, "agreedValue", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "processedamount", default: 0, nullable: true }),
    __metadata("design:type", Number)
], CompanyBarterAgreementItem.prototype, "processedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "remainingamount", nullable: true }),
    __metadata("design:type", Object)
], CompanyBarterAgreementItem.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "PENDING" }) // default: "PENDING"
    ,
    __metadata("design:type", String)
], CompanyBarterAgreementItem.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyStock_1.CompanyStock, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "relatedstockid" }),
    __metadata("design:type", Object)
], CompanyBarterAgreementItem.prototype, "relatedStock", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProjectSubcontractor_1.ProjectSubcontractor, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "relatedsubcontractorid" }),
    __metadata("design:type", Object)
], CompanyBarterAgreementItem.prototype, "relatedSubcontractor", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProjectSupplier_1.ProjectSupplier, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "relatedsupplierid" }),
    __metadata("design:type", Object)
], CompanyBarterAgreementItem.prototype, "relatedSupplier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "jsonb", nullable: true, name: "assetdetails" }),
    __metadata("design:type", Object)
], CompanyBarterAgreementItem.prototype, "assetDetails", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyBarterItemCashDetail_1.CompanyBarterCashDetail, (cashDetail) => cashDetail.barterItem),
    __metadata("design:type", Array)
], CompanyBarterAgreementItem.prototype, "cashDetails", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterAgreementItem.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterAgreementItem.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterAgreementItem.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterAgreementItem.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.barterItem),
    __metadata("design:type", Array)
], CompanyBarterAgreementItem.prototype, "transactions", void 0);
exports.CompanyBarterAgreementItem = CompanyBarterAgreementItem = __decorate([
    (0, typeorm_1.Entity)({ name: "companybarteragreementitems" })
], CompanyBarterAgreementItem);
