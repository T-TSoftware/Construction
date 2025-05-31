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
exports.CompanyBalanceView = void 0;
const typeorm_1 = require("typeorm");
let CompanyBalanceView = class CompanyBalanceView {
};
exports.CompanyBalanceView = CompanyBalanceView;
__decorate([
    (0, typeorm_1.ViewColumn)(),
    __metadata("design:type", Number)
], CompanyBalanceView.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.ViewColumn)(),
    __metadata("design:type", String)
], CompanyBalanceView.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.ViewColumn)(),
    __metadata("design:type", String)
], CompanyBalanceView.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.ViewColumn)(),
    __metadata("design:type", Number)
], CompanyBalanceView.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.ViewColumn)(),
    __metadata("design:type", String)
], CompanyBalanceView.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.ViewColumn)({ name: "companyid" }),
    __metadata("design:type", String)
], CompanyBalanceView.prototype, "companyId", void 0);
exports.CompanyBalanceView = CompanyBalanceView = __decorate([
    (0, typeorm_1.ViewEntity)({
        name: "vw_companybalances",
        schema: "artikonsept",
        expression: `SELECT id, name, amount, currency, "companyId" FROM artikonsept.companybalances`,
    })
], CompanyBalanceView);
