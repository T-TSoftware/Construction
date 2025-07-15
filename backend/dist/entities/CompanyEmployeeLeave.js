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
exports.CompanyEmployeeLeave = exports.LeaveType = void 0;
const typeorm_1 = require("typeorm");
const CompanyEmployee_1 = require("./CompanyEmployee");
const User_1 = require("./User");
var LeaveType;
(function (LeaveType) {
    LeaveType["PAID"] = "PAID";
    LeaveType["UNPAID"] = "UNPAID";
    LeaveType["SICK"] = "SICK";
    LeaveType["ROAD"] = "ROAD";
    LeaveType["EXCUSE"] = "EXCUSE";
})(LeaveType || (exports.LeaveType = LeaveType = {}));
let CompanyEmployeeLeave = class CompanyEmployeeLeave {
};
exports.CompanyEmployeeLeave = CompanyEmployeeLeave;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyEmployeeLeave.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyEmployee_1.CompanyEmployee),
    (0, typeorm_1.JoinColumn)({ name: "employeeid" }),
    __metadata("design:type", CompanyEmployee_1.CompanyEmployee)
], CompanyEmployeeLeave.prototype, "employee", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "startdate", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], CompanyEmployeeLeave.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "enddate", type: "timestamp", nullable: true }),
    __metadata("design:type", Date)
], CompanyEmployeeLeave.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric", name: "leavedaycount" }),
    __metadata("design:type", Number)
], CompanyEmployeeLeave.prototype, "leaveDayCount", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: "enum",
        enum: LeaveType,
        name: "type",
    }),
    __metadata("design:type", String)
], CompanyEmployeeLeave.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyEmployeeLeave.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployeeLeave.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyEmployeeLeave.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployeeLeave.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyEmployeeLeave.prototype, "updatedatetime", void 0);
exports.CompanyEmployeeLeave = CompanyEmployeeLeave = __decorate([
    (0, typeorm_1.Entity)({ name: "companyemployeeleave" })
], CompanyEmployeeLeave);
