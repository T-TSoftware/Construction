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
exports.ProjectCurrent = void 0;
// src/entities/ProjectCurrent.ts
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("./CompanyProject");
const CompanyBalance_1 = require("./CompanyBalance");
const User_1 = require("./User");
let ProjectCurrent = class ProjectCurrent {
};
exports.ProjectCurrent = ProjectCurrent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectCurrent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], ProjectCurrent.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyBalance_1.CompanyBalance),
    (0, typeorm_1.JoinColumn)({ name: "balanceid" }),
    __metadata("design:type", CompanyBalance_1.CompanyBalance)
], ProjectCurrent.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectCurrent.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { precision: 15, scale: 2 }),
    __metadata("design:type", Number)
], ProjectCurrent.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectCurrent.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: false }),
    __metadata("design:type", String)
], ProjectCurrent.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "transactiondate", type: "timestamp", nullable: false }),
    __metadata("design:type", Date)
], ProjectCurrent.prototype, "transactionDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], ProjectCurrent.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], ProjectCurrent.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectCurrent.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectCurrent.prototype, "updatedatetime", void 0);
exports.ProjectCurrent = ProjectCurrent = __decorate([
    (0, typeorm_1.Entity)({ name: "projectcurrents" })
], ProjectCurrent);
