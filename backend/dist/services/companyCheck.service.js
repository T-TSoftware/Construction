"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateCheckPaymentStatusNew = exports.updateCheckPaymentStatus = exports.getCompanyCheckById = exports.getCompanyChecks = exports.updateCompanyCheck = exports.createCompanyCheck = void 0;
const data_source_1 = require("../config/data-source");
const CompanyCheck_1 = require("../entities/CompanyCheck");
const CompanyBalance_1 = require("../entities/CompanyBalance");
const CompanyProject_1 = require("../entities/CompanyProject");
const createCompanyCheck = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const balanceRepo = manager.getRepository(CompanyBalance_1.CompanyBalance);
    const bank = await balanceRepo.findOneByOrFail({
        id: data.bankId,
    });
    // 🔄 Duruma göre otomatik transaction oluştur
    let transaction = null;
    /*if (data.status === "PAID" || data.status === "COLLECTED") {
      transaction = await createCheckTransactionFromCheckData(
        {
          checkNo: data.checkNo,
          transactionDate: data.transactionDate,
          amount: data.amount,
          bankId: bank.id,
          firm: data.firm,
          projectId: data.projectId,
          description: data.description,
          type: data.type,
        },
        currentUser,
        manager
      );
    }*/
    // 🧾 Check oluşturuluyor
    const check = repo.create({
        code: data.checkNo,
        checkNo: data.checkNo,
        checkDate: data.checkDate,
        transactionDate: data.dueDate, //data.transactionDate,
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
    const savedCheck = await repo.save(check);
    return await repo.findOneOrFail({
        where: { id: savedCheck.id },
        relations: {
            project: true,
            bank: true,
            createdBy: true,
            updatedBy: true,
        },
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
    return await repo.save(existing);
};
exports.updateCompanyCheck = updateCompanyCheck;
const getCompanyChecks = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const checks = await repo.find({
        where: {
            company: { id: currentUser.companyId },
        },
        relations: ["bank", "project", "transaction", "createdBy", "updatedBy"],
        order: { transactionDate: "DESC" },
    });
    return checks;
};
exports.getCompanyChecks = getCompanyChecks;
const getCompanyCheckById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const check = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["bank", "project", "transaction", "createdBy", "updatedBy"],
    });
    if (!check) {
        throw new Error("İlgili çek bulunamadı.");
    }
    return check;
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
const updateCheckPaymentStatusNew = async (checkCode, amount, currentUser, manager, isReverse = false) => {
    const checkRepo = manager.getRepository(CompanyCheck_1.CompanyCheck);
    const check = await checkRepo.findOneOrFail({
        where: { code: checkCode },
    });
    const factor = isReverse ? 1 : -1;
    // ✅ increment/decrement remainingAmount
    await checkRepo.increment({ id: check.id }, "remainingAmount", factor * amount);
    // Güncel check'i yeniden al
    const updatedCheck = await checkRepo.findOneOrFail({
        where: { id: check.id },
    });
    // ✅ Status hesapla
    const isPaidOff = Number(updatedCheck.remainingAmount) <= 0;
    const statusMap = {
        PAYMENT: isPaidOff ? "PAID" : "PARTIAL",
        COLLECTION: isPaidOff ? "COLLECTED" : "PARTIAL",
    };
    updatedCheck.status = statusMap[updatedCheck.type];
    updatedCheck.updatedBy = { id: currentUser.userId };
    updatedCheck.updatedatetime = new Date();
    // Kaydet
    return await checkRepo.save(updatedCheck);
};
exports.updateCheckPaymentStatusNew = updateCheckPaymentStatusNew;
