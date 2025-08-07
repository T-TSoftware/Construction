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
exports.CompanyOrder = void 0;
const typeorm_1 = require("typeorm");
const Company_1 = require("./Company");
const CompanyProject_1 = require("./CompanyProject");
const CompanyFinance_1 = require("./CompanyFinance");
const CompanyStock_1 = require("./CompanyStock");
const User_1 = require("./User");
let CompanyOrder = class CompanyOrder {
};
exports.CompanyOrder = CompanyOrder;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyOrder.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrder.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyOrder.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", Object)
], CompanyOrder.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyStock_1.CompanyStock),
    (0, typeorm_1.JoinColumn)({ name: "stockid" }),
    __metadata("design:type", CompanyProject_1.CompanyProject)
], CompanyOrder.prototype, "stock", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyOrder.prototype, "customerName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "stocktype" }),
    __metadata("design:type", String)
], CompanyOrder.prototype, "stockType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyOrder.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "totalamount" }),
    __metadata("design:type", Number)
], CompanyOrder.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "receivedamount", default: 0 }),
    __metadata("design:type", Number)
], CompanyOrder.prototype, "receivedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { name: "remainingamount", default: 0 }),
    __metadata("design:type", Number)
], CompanyOrder.prototype, "remainingAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: "UNCOLLECTED" }),
    __metadata("design:type", String)
], CompanyOrder.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyOrder.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }) // camelCase → fix
    ,
    __metadata("design:type", User_1.User)
], CompanyOrder.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyOrder.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyOrder.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyFinance_1.CompanyFinanceTransaction, (financeTransaction) => financeTransaction.order),
    __metadata("design:type", Array)
], CompanyOrder.prototype, "transactions", void 0);
exports.CompanyOrder = CompanyOrder = __decorate([
    (0, typeorm_1.Entity)({ name: "companyorders" })
], CompanyOrder);
