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
exports.CompanyStock = void 0;
const typeorm_1 = require("typeorm");
const Company_1 = require("./Company");
const CompanyProject_1 = require("./CompanyProject");
const User_1 = require("./User");
const CompanyOrder_1 = require("./CompanyOrder");
let CompanyStock = class CompanyStock {
};
exports.CompanyStock = CompanyStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)("uuid"),
    __metadata("design:type", String)
], CompanyStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)()
    //@Index() // (opsiyonel) code ile hızlı arama için
    ,
    __metadata("design:type", String)
], CompanyStock.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyStock.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyStock.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], CompanyStock.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], CompanyStock.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { default: 0 }),
    __metadata("design:type", Number)
], CompanyStock.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)("numeric", { default: 0 }),
    __metadata("design:type", Number)
], CompanyStock.prototype, "minimumQuantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "location", nullable: true }),
    __metadata("design:type", String)
], CompanyStock.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: "stockdate", type: "date", nullable: true }),
    __metadata("design:type", Date)
], CompanyStock.prototype, "stockDate", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => Company_1.Company, { nullable: false }),
    (0, typeorm_1.JoinColumn)({ name: "companyid" }),
    __metadata("design:type", Company_1.Company)
], CompanyStock.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => CompanyProject_1.CompanyProject, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: "projectid" }),
    __metadata("design:type", Object)
], CompanyStock.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "createdby" }),
    __metadata("design:type", User_1.User)
], CompanyStock.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => User_1.User),
    (0, typeorm_1.JoinColumn)({ name: "updatedby" }),
    __metadata("design:type", User_1.User)
], CompanyStock.prototype, "updatedBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({
        type: "timestamp",
        name: "createdatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyStock.prototype, "createdatetime", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({
        type: "timestamp",
        name: "updatedatetime",
        default: () => "CURRENT_TIMESTAMP",
    }),
    __metadata("design:type", Date)
], CompanyStock.prototype, "updatedatetime", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => CompanyOrder_1.CompanyOrder, (order) => order.stock),
    __metadata("design:type", Array)
], CompanyStock.prototype, "orders", void 0);
exports.CompanyStock = CompanyStock = __decorate([
    (0, typeorm_1.Entity)({ name: "companystocks" }),
    (0, typeorm_1.Unique)("uq_companystocks_company_category_name", ["company", "category", "name"] // ✔ aynı şirket içinde aynı kategori+isimden sadece 1 kayıt
    )
], CompanyStock);
