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
exports.ProjectQuantity = void 0;
const typeorm_1 = require("typeorm");
const CompanyProject_1 = require("./CompanyProject");
const QuantityItem_1 = require("./QuantityItem");
const User_1 = require("./User");
let ProjectQuantity = class ProjectQuantity {
};
exports.ProjectQuantity = ProjectQuantity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], ProjectQuantity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProjectQuantity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], ProjectQuantity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => QuantityItem_1.QuantityItem),
    (0, typeorm_1.JoinColumn)({ name: "quantityitemid" }),
    __metadata("design:type", QuantityItem_1.QuantityItem)
], ProjectQuantity.prototype, "quantityItem", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "numeric" }),
    __metadata("design:type", Number)
], ProjectQuantity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectQuantity.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: "text", nullable: true }),
    __metadata("design:type", String)
], ProjectQuantity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], ProjectQuantity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], ProjectQuantity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], ProjectQuantity.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectQuantity.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], ProjectQuantity.prototype, "updatedatetime", void 0);
exports.ProjectQuantity = ProjectQuantity = __decorate([
    (0, typeorm_1.Entity)({ name: "projectquantities" })
], ProjectQuantity);
