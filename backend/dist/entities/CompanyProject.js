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
exports.CompanyProject = void 0;
const typeorm_1 = require("typeorm");
const User_1 = require("./User");
const Company_1 = require("./Company");
const ProjectEstimatedCost_1 = require("./ProjectEstimatedCost");
const ProjectSupplier_1 = require("./ProjectSupplier");
const ProjectSubcontractor_1 = require("./ProjectSubcontractor");
const ProjectQuantity_1 = require("./ProjectQuantity");
const ProjectCurrent_1 = require("./ProjectCurrent");
const CompanyFinance_1 = require("./CompanyFinance");
const CompanyCheck_1 = require("./CompanyCheck");
const CompanyLoan_1 = require("./CompanyLoan");
const CompanyEmployeeProject_1 = require("./CompanyEmployeeProject");
let CompanyProject = class CompanyProject {
};
exports.CompanyProject = CompanyProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], CompanyProject.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyProject.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyProject.prototype, "site", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "active" }),
    __metadata("design:type", String)
], CompanyProject.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", name: "estimatedstartdate" }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "estimatedStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", name: "actualstartdate" }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "actualStartDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", name: "estimatedenddate" }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "estimatedEndDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "date", name: "actualenddate" }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "actualEndDate", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyProject.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyProject.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyProject.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, (company) => company.projects),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyProject.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectEstimatedCost_1.ProjectEstimatedCost, (estimatedcost) => estimatedcost.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "estimatedCosts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectSupplier_1.ProjectSupplier, (supplier) => supplier.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "suppliers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectSubcontractor_1.ProjectSubcontractor, (subcontractor) => subcontractor.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "subcontractors", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectQuantity_1.ProjectQuantity, (quantity) => quantity.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "quantities", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => ProjectCurrent_1.ProjectCurrent, (current) => current.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "currents", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.project),
    __metadata("design:type", Array)
], CompanyProject.prototype, "financeTransactions", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyCheck_1.CompanyCheck, (check) => check.project),
    __metadata("design:type", CompanyCheck_1.CompanyCheck)
], CompanyProject.prototype, "checks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyLoan_1.CompanyLoan, (loan) => loan.project),
    __metadata("design:type", CompanyLoan_1.CompanyLoan)
], CompanyProject.prototype, "loans", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyEmployeeProject_1.CompanyEmployeeProject, (employee) => employee.project, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CompanyProject.prototype, "projectEmployees", void 0);
exports.CompanyProject = CompanyProject = __decorate([
    (0, typeorm_1.Entity)({ name: "companyprojects" })
], CompanyProject);
