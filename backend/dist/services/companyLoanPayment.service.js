"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCompanyLoanPaymentsToPdf = exports.exportCompanyLoanPaymentsToCsv = exports.updateLoanPaymentStatusNew = exports.updateCompanyLoanPayment = exports.getCompanyLoanPaymentsByLoanId = exports.getCompanyLoanPaymentById = exports.getCompanyLoanPayments = exports.createCompanyLoanPayment = void 0;
const data_source_1 = require("../config/data-source");
const CompanyLoanPayment_1 = require("../entities/CompanyLoanPayment");
const CompanyLoan_1 = require("../entities/CompanyLoan");
const json2csv_1 = require("json2csv");
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = __importDefault(require("path"));
const sanitize_1 = require("../utils/sanitize");
const sanitizeRules_1 = require("../utils/sanitizeRules");
const persist_1 = require("../utils/persist");
const generateCode_1 = require("../utils/generateCode");
const createCompanyLoanPayment = async (loanId, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const loan = await loanRepo.findOneOrFail({
        where: {
            id: loanId,
            company: { id: currentUser.companyId }, // ✅ Şirket kontrolü burada yapılmış
        },
        relations: ["bank", "project"],
    });
    //const code = `${loan.code}-TAKSIT:${data.installmentNumber}`,
    const code = await (0, generateCode_1.generateEntityCode)(manager, currentUser.companyId, "CompanyLoanPayment");
    // 🧾 LoanPayment oluşturuluyor
    const payment = paymentRepo.create({
        loan: { id: loan.id },
        code,
        installmentNumber: data.installmentNumber,
        dueDate: data.dueDate,
        totalAmount: data.principalAmount + data.interestAmount, //data.totalAmount,
        interestAmount: data.interestAmount,
        principalAmount: data.principalAmount,
        paymentAmount: 0,
        penaltyAmount: data.penaltyAmount,
        remainingAmount: data.totalAmount,
        status: data.status ?? "PENDING",
        paymentDate: data.paymentDate,
        description: data.description,
        company: { id: currentUser.companyId }, // ✅ Şirkete ait olarak kaydediliyor
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    // ⬇️ Tek satırda: unique handle + refetch with relations + sanitize
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyLoanPayment",
        save: () => paymentRepo.save(payment),
        refetch: () => paymentRepo.findOneOrFail({
            where: { id: payment.id, company: { id: currentUser.companyId } },
            relations: [
                "loan",
                "loan.bank",
                "loan.project",
                "loan.company",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Taksit kaydı oluşturulamadı.",
    });
};
exports.createCompanyLoanPayment = createCompanyLoanPayment;
const getCompanyLoanPayments = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const loanPayments = await repo.find({
        where: {
            company: { id: currentUser.companyId }, // ✅ doğrudan companyId ile filtreleme
        },
        relations: [
            "loan", // ✔ sadece gerekli ilişkiler kaldı
            "loan.project",
            "loan.bank",
            "createdBy",
            "updatedBy",
        ],
        order: { installmentNumber: "ASC" },
    });
    //return loanPayments;
    return (0, sanitize_1.sanitizeEntity)(loanPayments, "CompanyLoanPayment", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyLoanPayments = getCompanyLoanPayments;
const getCompanyLoanPaymentById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payment = await repo.findOne({
        where: {
            id,
            company: { id: currentUser.companyId },
        },
        relations: ["loan", "loan.project", "loan.bank", "createdBy", "updatedBy"],
    });
    if (!payment) {
        throw new Error("İlgili kredi taksiti bulunamadı.");
    }
    return (0, sanitize_1.sanitizeEntity)(payment, "CompanyLoanPayment", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyLoanPaymentById = getCompanyLoanPaymentById;
const getCompanyLoanPaymentsByLoanId = async (loanId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payments = await repo.find({
        where: {
            company: { id: currentUser.companyId },
            loan: { id: loanId },
        },
        relations: ["loan", "loan.project", "loan.bank", "createdBy", "updatedBy"],
        order: { installmentNumber: "ASC" },
    });
    return (0, sanitize_1.sanitizeEntity)(payments, "CompanyLoanPayment", sanitizeRules_1.sanitizeRules);
};
exports.getCompanyLoanPaymentsByLoanId = getCompanyLoanPaymentsByLoanId;
const updateCompanyLoanPayment = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const payment = await paymentRepo.findOneOrFail({
        where: { id },
        relations: ["loan", "loan.bank", "loan.project", "company"],
    });
    const loan = await loanRepo.findOneOrFail({
        where: { id: payment.loan.id, company: { id: currentUser.companyId } },
        relations: ["bank", "project"],
    });
    if (data.installmentNumber !== undefined)
        payment.installmentNumber = data.installmentNumber;
    if (data.dueDate !== undefined)
        payment.dueDate = data.dueDate;
    if (data.totalAmount !== undefined)
        payment.totalAmount = data.totalAmount;
    if (data.interestAmount !== undefined)
        payment.interestAmount = data.interestAmount;
    if (data.principalAmount !== undefined)
        payment.principalAmount = data.principalAmount;
    if (data.paymentAmount !== undefined)
        payment.paymentAmount = data.paymentAmount;
    if (data.status !== undefined)
        payment.status = data.status;
    //if (data.paymentDate !== undefined) payment.paymentDate = data.paymentDate;
    if (data.penaltyAmount !== undefined)
        payment.penaltyAmount = data.penaltyAmount;
    if (data.description !== undefined)
        payment.description = data.description;
    payment.updatedBy = { id: currentUser.userId };
    // const code = payment.code; ❌ bunu tamamen sil
    return await (0, persist_1.saveRefetchSanitize)({
        entityName: "CompanyLoanPayment",
        save: () => paymentRepo.save(payment),
        refetch: () => paymentRepo.findOneOrFail({
            where: { id: payment.id, company: { id: currentUser.companyId } },
            relations: [
                "loan",
                "loan.bank",
                "loan.project",
                "loan.company",
                "createdBy",
                "updatedBy",
            ],
        }),
        rules: sanitizeRules_1.sanitizeRules,
        defaultError: "Taksit kaydı oluşturulamadı.",
    });
};
exports.updateCompanyLoanPayment = updateCompanyLoanPayment;
const updateLoanPaymentStatusNew = async (paymentCode, amount, currentUser, manager, isReverse = false) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const payment = await paymentRepo.findOneOrFail({
        where: { code: paymentCode, company: { id: currentUser.companyId } },
        relations: ["loan"],
    });
    const totalExpected = Number(payment.totalAmount ?? 0);
    const oldPaid = Number(payment.paymentAmount ?? 0);
    const wasPaid = oldPaid >= totalExpected;
    const signed = isReverse ? -Math.abs(amount) : Math.abs(amount);
    const newPaidRaw = oldPaid + signed;
    const newPaid = newPaidRaw < 0 ? 0 : newPaidRaw; // negatif olmasın
    const deltaPaid = newPaid - oldPaid; // gerçek değişim
    // Payment alanlarını güncelle
    payment.paymentAmount = newPaid;
    const rawRemaining = totalExpected - newPaid;
    payment.remainingAmount = rawRemaining > 0 ? rawRemaining : 0;
    payment.penaltyAmount = newPaid > totalExpected ? newPaid - totalExpected : 0;
    const isNowPaid = newPaid >= totalExpected;
    payment.status = (isNowPaid ? "PAID" : "PARTIAL");
    payment.updatedBy = { id: currentUser.userId };
    payment.updatedatetime = new Date();
    await paymentRepo.save(payment);
    // ---- Loan agregatları DELTA ile güncelle ----
    const loanId = payment.loan.id;
    // 1) Kalan taksit tutarı (toplam) kısmi ödemelerde bile değişir
    if (deltaPaid !== 0) {
        await loanRepo.increment({ id: loanId }, "remainingInstallmentAmount", -deltaPaid);
    }
    // 2) Taksidin tamamen ödenme durumuna göre principal & count
    if (!wasPaid && isNowPaid) {
        // PARTIAL/UNPAID -> PAID
        await loanRepo.increment({ id: loanId }, "remainingPrincipal", -Number(payment.principalAmount ?? 0));
        await loanRepo.increment({ id: loanId }, "remainingInstallmentCount", -1);
    }
    else if (wasPaid && !isNowPaid) {
        // PAID -> PARTIAL (geri alma)
        await loanRepo.increment({ id: loanId }, "remainingPrincipal", +Number(payment.principalAmount ?? 0));
        await loanRepo.increment({ id: loanId }, "remainingInstallmentCount", +1);
    }
    // 3) Status yeniden değerlendir (count’a bakarak)
    const loan = await loanRepo.findOneByOrFail({ id: loanId });
    const newStatus = loan.remainingInstallmentCount <= 0 ? "CLOSED" : "ACTIVE";
    if (loan.status !== newStatus) {
        await loanRepo.update({ id: loanId }, {
            status: newStatus,
            updatedBy: { id: currentUser.userId },
            updatedatetime: new Date(),
        });
    }
    return { payment };
};
exports.updateLoanPaymentStatusNew = updateLoanPaymentStatusNew;
/*---------------------------------------------------------------------------------------------------*/
const exportCompanyLoanPaymentsToCsv = async (payments) => {
    const fields = [
        { label: "Kod", value: "code" },
        { label: "Taksit No", value: "installmentNumber" },
        { label: "Vade Tarihi", value: "dueDate" },
        { label: "Tutar", value: "totalAmount" },
        { label: "Durum", value: "status" },
        { label: "Ödeme Tarihi", value: "paymentDate" },
    ];
    return (0, json2csv_1.parse)(payments, { fields });
};
exports.exportCompanyLoanPaymentsToCsv = exportCompanyLoanPaymentsToCsv;
const fonts = {
    Roboto: {
        normal: path_1.default.resolve(__dirname, "../fonts/Roboto-VariableFont_wdth,wght.ttf"),
        italics: path_1.default.resolve(__dirname, "../fonts/Roboto-Italic-VariableFont_wdth,wght.ttf"),
        bold: path_1.default.resolve(__dirname, "../fonts/Roboto-VariableFont_wdth,wght.ttf"),
        bolditalics: path_1.default.resolve(__dirname, "../fonts/Roboto-Italic-VariableFont_wdth,wght.ttf"),
    },
};
const printer = new pdfmake_1.default(fonts);
const exportCompanyLoanPaymentsToPdf = async (payments) => {
    const tableBody = [
        ["Kod", "Taksit No", "Vade Tarihi", "Tutar", "Durum", "Ödeme Tarihi"],
        ...payments.map((p) => [
            p.code,
            p.installmentNumber?.toString() ?? "",
            p.dueDate ? new Date(p.dueDate).toISOString().split("T")[0] : "",
            p.totalAmount,
            p.status ?? "",
            p.paymentDate ? new Date(p.paymentDate).toISOString().split("T")[0] : "",
        ]),
    ];
    const docDefinition = {
        pageSize: "A4",
        pageMargins: [40, 60, 40, 60], // [left, top, right, bottom]
        content: [
            { text: "Kredi Ödeme Listesi", style: "header" },
            {
                table: {
                    headerRows: 1,
                    widths: ["auto", "auto", "auto", "auto", "auto", "auto"], // sabit genişlik yerine orantılı da verebilirsin: ['*', '*', '*', '*', '*', '*']
                    body: [
                        [
                            "Kod",
                            "Taksit No",
                            "Vade Tarihi",
                            "Tutar",
                            "Durum",
                            "Ödeme Tarihi",
                        ],
                        ...payments.map((p) => [
                            p.code,
                            p.installmentNumber,
                            p.dueDate ? new Date(p.dueDate).toISOString().slice(0, 10) : "",
                            p.totalAmount,
                            p.status,
                            p.paymentDate
                                ? new Date(p.paymentDate).toISOString().slice(0, 10)
                                : "",
                        ]),
                    ],
                },
                layout: {
                    fillColor: (rowIndex) => (rowIndex === 0 ? "#eeeeee" : null),
                    hLineWidth: () => 0.5,
                    vLineWidth: () => 0.5,
                    paddingLeft: () => 5,
                    paddingRight: () => 5,
                    paddingTop: () => 4,
                    paddingBottom: () => 4,
                },
            },
        ],
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                margin: [0, 0, 0, 10],
            },
        },
    };
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks = [];
    return new Promise((resolve, reject) => {
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", reject);
        pdfDoc.end();
    });
};
exports.exportCompanyLoanPaymentsToPdf = exportCompanyLoanPaymentsToPdf;
