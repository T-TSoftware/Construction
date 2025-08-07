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
exports.ProjectSupplier = void 0;
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("./CompanyProject");
const QuantityItem_1 = require("./QuantityItem");
const User_1 = require("./User");
const ProjectQuantity_1 = require("./ProjectQuantity");
const Company_1 = require("./Company");
const CompanyFinance_1 = require("./CompanyFinance");
let ProjectSupplier = class ProjectSupplier {
};
exports.ProjectSupplier = ProjectSupplier;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], ProjectSupplier.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }) // camelCase → FK
    ,
    __metadata("design:type", CompanyProject_1.CompanyProject)
], ProjectSupplier.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuantityItem_1.QuantityItem),
    (0, typeorm_1.JoinColumn)({ name: "quantityitemid" }) // camelCase → FK
    ,
    __metadata("design:type", QuantityItem_1.QuantityItem)
], ProjectSupplier.prototype, "quantityItem", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => ProjectQuantity_1.ProjectQuantity, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectquantityid" }),
    __metadata("design:type", Object)
], ProjectSupplier.prototype, "projectQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "addedfromquantityyn", type: "varchar", default: "N" }),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "addedFromQuantityYN", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "companyname", nullable: true }) // camelCase → fix
    ,
    __metadata("design:type", String)
], ProjectSupplier.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unitprice", type: "numeric", nullable: true }) // camelCase → fix
    ,
    __metadata("design:type", Number)
], ProjectSupplier.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", nullable: true }),
    __metadata("design:type", Number)
], ProjectSupplier.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "contractamount", type: "numeric", nullable: true }) // camelCase → fix
    ,
    __metadata("design:type", Number)
], ProjectSupplier.prototype, "contractAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "paidamount", type: "numeric", nullable: true }) // camelCase → fix
    ,
    __metadata("design:type", Number)
], ProjectSupplier.prototype, "paidAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "remainingamount", type: "numeric", nullable: true }) // camelCase → fix
    ,
    __metadata("design:type", Object)
], ProjectSupplier.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "pending", nullable: true }),
    __metadata("design:type", String)
], ProjectSupplier.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        name: "createdatetime",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectSupplier.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        name: "updatedatetime",
        type: "timestamp",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectSupplier.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }) // camelCase → fix
    ,
    __metadata("design:type", User_1.User)
], ProjectSupplier.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }) // camelCase → fix
    ,
    __metadata("design:type", User_1.User)
], ProjectSupplier.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.supplier),
    __metadata("design:type", Array)
], ProjectSupplier.prototype, "transactions", void 0);
exports.ProjectSupplier = ProjectSupplier = __decorate([
    (0, typeorm_1.Entity)({ name: "projectsuppliers" })
], ProjectSupplier);
