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
exports.CompanyEmployeeProject = void 0;
// CompanyEmployeeProject.ts
const typeorm_1 = require("typeorm");
const CompanyEmployee_1 = require("./CompanyEmployee");
const CompanyProject_1 = require("./CompanyProject");
const User_1 = require("./User");
const Company_1 = require("./Company");
let CompanyEmployeeProject = class CompanyEmployeeProject {
};
exports.CompanyEmployeeProject = CompanyEmployeeProject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyEmployeeProject.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyEmployee_1.CompanyEmployee, (employee) => employee.employeeProjects),
    (0, typeorm_1.JoinColumn)({ name: "employeeid" }),
    __metadata("design:type", CompanyEmployee_1.CompanyEmployee)
], CompanyEmployeeProject.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyEmployeeProject.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, (project) => project.projectEmployees),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], CompanyEmployeeProject.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyEmployeeProject.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true, type: "text" }),
    __metadata("design:type", String)
], CompanyEmployeeProject.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployeeProject.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployeeProject.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployeeProject.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployeeProject.prototype, "updatedatetime", void 0);
exports.CompanyEmployeeProject = CompanyEmployeeProject = __decorate([
    (0, typeorm_1.Entity)({ name: "companyemployeeprojects" })
], CompanyEmployeeProject);
