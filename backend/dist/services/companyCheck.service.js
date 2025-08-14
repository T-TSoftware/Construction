"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCheckPaymentStatusNew = exports.updateCheckPaymentStatus = exports.getCompanyCheckById = exports.getCompanyChecks = exports.updateCompanyCheck = exports.createCompanyCheck = void 0;
const data_source_1 = require("../config/data-source");
const CompanyCheck_1 = require("../entities/CompanyCheck");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const persist_1 = require("../utils/persist");
const sanitize_1 = require("../utils/sanitize");
const createCompanyCheck = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const bank = await balanceRepo.findOneByOrFail({
        id: data.bankId,
    });
    // 🔄 Duruma göre otomatik transaction oluştur
    let transaction = null;
    // 🧾 Check oluşturuluyor
    const check = repo.create({
        code: `CEK-${data.checkNo}`,
        checkNo: data.checkNo,
        checkDate: data.checkDate,
        //transactionDate: data.dueDate, //data.transactionDate,
        firm: data.firm,
        amount: data.amount,
        bank: { id: bank.id },
        type: data.type,
        project: data.projectId ? { id: data.projectId } : null,
        description: data.description,
        status: "PENDING", //data.status,
        dueDate: data.dueDate,
        remainingAmount: data.amount,
        company: { id: currentUser.companyId },
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    /*const savedCheck = await repo.save(check);
  
    return await repo.findOneOrFail({
      where: { id: savedCheck.id },
      relations: {
        project: true,
        bank: true,
        createdBy: true,
        updatedBy: true,
      },
    });*/
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyCheck",
        save: () => repo.save(check),
        refetch: () => repo.findOneOrFail({
            where: { id: check.id, company: { id: currentUser.companyId } },
            relations: [
                "project",
                "company",
                "bank",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Çek kaydı oluşturulamadı.",
    });
};
exports.createCompanyCheck = createCompanyCheck;
const updateCompanyCheck = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const projectRepo = manager.getRepository(CompanyProject_1.CompanyProject);
    // 🎯 Mevcut check kaydını getir
    const existing = await repo.findOne({
        where: { id, company: { id: currentUser.companyId } },
        relations: ["bank", "project", "createdBy", "updatedBy"],
    });
    if (!existing)
        throw new Error("Check kaydı bulunamadı.");
    // 🔄 Yeni banka atanacak mı?
    const newBank = data.bankCode && data.bankCode !== existing.bank?.code
        ? await balanceRepo.findOneByOrFail({ code: data.bankCode })
        : existing.bank;
    // 🔄 Yeni proje atanacak mı?
    const newProject = data.projectId && data.projectId !== existing.project?.id
        ? await projectRepo.findOneByOrFail({ id: data.projectId })
        : existing.project;
    const newStatus = data.status ?? existing.status;
    // ✏️ Diğer alanlar güncelleniyor
    existing.checkNo = data.checkNo ?? existing.checkNo;
    existing.code = data.checkNo ?? existing.checkNo;
    existing.checkDate = data.checkDate ?? existing.checkDate;
    existing.transactionDate = data.transactionDate ?? existing.transactionDate;
    existing.firm = data.firm ?? existing.firm;
    existing.amount = data.amount ?? existing.amount;
    existing.bank = newBank;
    existing.type = data.type ?? existing.type;
    existing.project = newProject;
    existing.description = data.description ?? existing.description;
    existing.status = newStatus;
    existing.updatedBy = { id: currentUser.userId };
    existing.updatedatetime = new Date();
    // 💾 Kaydet ve dön
    //return await repo.save(existing);
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyCheck",
        save: () => repo.save(existing),
        refetch: () => repo.findOneOrFail({
            where: { id: existing.id, company: { id: currentUser.companyId } },
            relations: [
                "project",
                "company",
                "bank",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Çek kaydı oluşturulamadı.",
    });
};
exports.updateCompanyCheck = updateCompanyCheck;
const getCompanyChecks = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const checks = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["bank", "project", "createdBy", "updatedBy"],
        order: { transactionDate: "DESC" },
    });
    //return checks;
    return (0, sanitize_1.sanitizeEntity)(checks, "CompanyCheck", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyChecks = getCompanyChecks;
const getCompanyCheckById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const check = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["bank", "project", "createdBy", "updatedBy"],
    });
    if (!check) {
        throw new Error("İlgili çek bulunamadı.");
    }
    //return check;
    return (0, sanitize_1.sanitizeEntity)(check, "CompanyCheck", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyCheckById = getCompanyCheckById;
const updateCheckPaymentStatus = async (checkCode, amountPaid, currentUser, manager) => {
    const checkRepo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const check = await checkRepo.findOneByOrFail({ code: checkCode });
    const remainingAmount = Number(check.remainingAmount) - Number(amountPaid);
    let status;
    if (remainingAmount <= 0) {
        status = check.type === "PAYMENT" ? "PAID" : "COLLECTED";
    }
    else {
        status = check.type === "PAYMENT" ? "PARTIAL" : "PARTIAL";
    }
    check.status = status;
    check.remainingAmount = remainingAmount;
    check.updatedBy = { id: currentUser.userId };
    return await checkRepo.save(check);
};
exports.updateCheckPaymentStatus = updateCheckPaymentStatus;
const updateCheckPaymentStatusNew = async (checkCode, amount, transactionDate, currentUser, manager, isReverse = false) => {
    const checkRepo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const check = await checkRepo.findOneOrFail({
        where: { code: checkCode },
    });
    const factor = isReverse ? -1 : 1;
    // ✅ processedAmount güncelle (increment/decrement)
    await checkRepo.increment({ id: check.id }, "processedAmount", factor * amount);
    // Güncellenmiş veriyi tekrar al
    const updatedItem = await checkRepo.findOneOrFail({
        where: { id: check.id },
    });
    // ✅ remainingAmount hesapla
    const remainingAmount = Number(updatedItem.amount ?? 0) - Number(updatedItem.processedAmount);
    // ✅ status belirle
    let status;
    if (remainingAmount <= 0) {
        status = updatedItem.type === "PAYMENT" ? "PAID" : "COLLECTED";
    }
    else {
        status = "PARTIAL";
    }
    updatedItem.remainingAmount = remainingAmount;
    updatedItem.status = status;
    updatedItem.updatedBy = { id: currentUser.userId };
    updatedItem.updatedatetime = new Date();
    updatedItem.transactionDate = transactionDate;
    return await checkRepo.save(updatedItem);
};
exports.updateCheckPaymentStatusNew = updateCheckPaymentStatusNew;
