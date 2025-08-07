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
exports.ProjectEstimatedCost = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const CompanyProject_1 = require("./CompanyProject");
const Company_1 = require("./Company");
let ProjectEstimatedCost = class ProjectEstimatedCost {
};
exports.ProjectEstimatedCost = ProjectEstimatedCost;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "unitprice", type: "numeric" }),
    __metadata("design:type", Number)
], ProjectEstimatedCost.prototype, "unitPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], ProjectEstimatedCost.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "totalcost", type: "numeric" }),
    __metadata("design:type", Number)
], ProjectEstimatedCost.prototype, "totalCost", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "sourcetype", type: "varchar", default: "manual" }),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "sourceType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "referencecode", nullable: true }),
    __metadata("design:type", String)
], ProjectEstimatedCost.prototype, "referenceCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], ProjectEstimatedCost.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, (project) => project.estimatedCosts),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], ProjectEstimatedCost.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], ProjectEstimatedCost.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], ProjectEstimatedCost.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectEstimatedCost.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectEstimatedCost.prototype, "updatedatetime", void 0);
exports.ProjectEstimatedCost = ProjectEstimatedCost = __decorate([
    (0, typeorm_1.Entity)({ name: "projectestimatedcosts" })
], ProjectEstimatedCost);
