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
exports.CompanyEmployee = void 0;
const typeorm_1 = require("typeorm");
const Company_1 = require("./Company");
const User_1 = require("./User");
const CompanyEmployeeLeave_1 = require("./CompanyEmployeeLeave");
const CompanyEmployeeProject_1 = require("./CompanyEmployeeProject");
let CompanyEmployee = class CompanyEmployee {
};
exports.CompanyEmployee = CompanyEmployee;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "firstname" }),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "lastname" }),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "int", name: "age" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "age", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "startdate", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], CompanyEmployee.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", name: "netsalary" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "netSalary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", name: "grosssalary" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "grossSalary", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "position", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyEmployee.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: 14, name: "paidleaveamount" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "paidLeaveAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: 40, name: "unpaidleaveamount" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "unpaidLeaveAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: 40, name: "sickleaveamount" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "sickLeaveAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: 4, name: "roadleaveamount" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "roadLeaveAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", default: 7, name: "excuseleaveamount" }),
    __metadata("design:type", Number)
], CompanyEmployee.prototype, "excuseLeaveAmount", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyEmployeeLeave_1.CompanyEmployeeLeave, (leave) => leave.employee),
    __metadata("design:type", Array)
], CompanyEmployee.prototype, "leaves", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyEmployee.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyEmployeeProject_1.CompanyEmployeeProject, (project) => project.employee, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CompanyEmployee.prototype, "employeeProjects", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployee.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployee.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployee.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployee.prototype, "updatedatetime", void 0);
exports.CompanyEmployee = CompanyEmployee = __decorate([
    (0, typeorm_1.Entity)({ name: "companyemployee" })
], CompanyEmployee);
