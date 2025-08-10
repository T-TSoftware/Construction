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
exports.CompanyBarterAgreement = void 0;
const typeorm_1 = require("typeorm");
const Company_1 = require("./Company");
const CompanyProject_1 = require("./CompanyProject");
const User_1 = require("./User");
const CompanyBarterAgreementItem_1 = require("./CompanyBarterAgreementItem");
let CompanyBarterAgreement = class CompanyBarterAgreement {
};
exports.CompanyBarterAgreement = CompanyBarterAgreement;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyBarterAgreement.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], CompanyBarterAgreement.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "counterpartytype" }),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "counterpartyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "counterpartyid", type: "uuid", nullable: true }),
    __metadata("design:type", Object)
], CompanyBarterAgreement.prototype, "counterpartyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "counterpartyname" }),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "counterpartyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "agreementdate", type: "timestamp", nullable: false }),
    __metadata("design:type", Date)
], CompanyBarterAgreement.prototype, "agreementDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "ACTIVE" }),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], CompanyBarterAgreement.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totalourvalue", type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CompanyBarterAgreement.prototype, "totalOurValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totaltheirvalue", type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], CompanyBarterAgreement.prototype, "totalTheirValue", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyBarterAgreementItem_1.CompanyBarterAgreementItem, (item) => item.barterAgreement),
    __metadata("design:type", Array)
], CompanyBarterAgreement.prototype, "items", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterAgreement.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyBarterAgreement.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterAgreement.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyBarterAgreement.prototype, "updatedatetime", void 0);
exports.CompanyBarterAgreement = CompanyBarterAgreement = __decorate([
    (0, typeorm_1.Entity)({ name: "companybarteragreements" })
], CompanyBarterAgreement);
