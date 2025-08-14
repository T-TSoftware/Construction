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
exports.ProjectSubcontractor = void 0;
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("./CompanyProject");
const ProjectQuantity_1 = require("./ProjectQuantity");
const QuantityItem_1 = require("../entities/QuantityItem");
const User_1 = require("./User");
const Company_1 = require("./Company");
const CompanyFinance_1 = require("./CompanyFinance");
let ProjectSubcontractor = class ProjectSubcontractor {
};
exports.ProjectSubcontractor = ProjectSubcontractor;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], ProjectSubcontractor.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], ProjectSubcontractor.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProjectQuantity_1.ProjectQuantity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectquantityid" }),
    __metadata("design:type", ProjectQuantity_1.ProjectQuantity)
], ProjectSubcontractor.prototype, "projectQuantity", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuantityItem_1.QuantityItem),
    (0, typeorm_1.JoinColumn)({ name: "quantityitemid" }) // camelCase → FK
    ,
    __metadata("design:type", Object)
], ProjectSubcontractor.prototype, "quantityItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "addedfromquantityyn", type: "varchar", default: "N" }),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "addedFromQuantityYN", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], ProjectSubcontractor.prototype, "locked", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "companyname", nullable: true }),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unitprice", type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], ProjectSubcontractor.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], ProjectSubcontractor.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "contractamount", type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], ProjectSubcontractor.prototype, "contractAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paidamount", type: "numeric", nullable: true, default: 0, }),
    __metadata("design:type", Number)
], ProjectSubcontractor.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "remainingamount", type: "numeric", nullable: true }),
    __metadata("design:type", Object)
], ProjectSubcontractor.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "pending", nullable: true }),
    __metadata("design:type", String)
], ProjectSubcontractor.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectSubcontractor.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectSubcontractor.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], ProjectSubcontractor.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], ProjectSubcontractor.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.subcontractor),
    __metadata("design:type", Array)
], ProjectSubcontractor.prototype, "transactions", void 0);
exports.ProjectSubcontractor = ProjectSubcontractor = __decorate([
    (0, typeorm_1.Entity)({ name: "projectsubcontractors" }),
    (0, typeorm_1.Index)("uq_subcontractor_category_unit_once", // index adı
    ["project", "category", "unit"], // sütunlar (entity alan adları)
    { unique: true, where: "addedfromquantityyn = 'Y'" } // partial unique koşulu (DB sütun adıyla)
    )
], ProjectSubcontractor);
