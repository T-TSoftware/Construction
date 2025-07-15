"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCompanyLoanPaymentsToPdf = exports.exportCompanyLoanPaymentsToCsv = exports.updateCompanyLoanPayment = exports.getCompanyLoanPaymentById = exports.getCompanyLoanPayments = exports.createCompanyLoanPayment = void 0;
const data_source_1 = require("../config/data-source");
const CompanyLoanPayment_1 = require("../entities/CompanyLoanPayment");
const CompanyLoan_1 = require("../entities/CompanyLoan");
const CompanyFinance_1 = require("../entities/CompanyFinance");
const companyFinance_service_1 = require("./companyFinance.service");
const companyLoan_service_1 = require("./companyLoan.service");
const json2csv_1 = require("json2csv");
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = __importDefault(require("path"));
const createCompanyLoanPayment = async (data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const loan = await loanRepo.findOneOrFail({
        where: { code: data.loanCode, company: { id: currentUser.companyId } },
        relations: ["bank", "project"],
    });
    // 💸 Duruma göre otomatik finansal işlem oluştur
    let transaction = null;
    if (data.status === "PAID") {
        transaction = await (0, companyFinance_service_1.createLoanTransactionFromPaymentData)({
            paymentCode: `${data.loanCode}-TAKSIT:${data.installmentNumber}`,
            amount: data.paymentAmount ?? data.totalAmount,
            transactionDate: data.paymentDate ?? new Date(),
            bankId: loan.bank.id,
            loanName: loan.name,
            installmentNumber: data.installmentNumber,
            projectId: loan.project?.id,
            description: data.description,
        }, currentUser, manager);
        await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(loan.id, data.principalAmount, data.interestAmount, data.interestAmount + data.principalAmount + data.penaltyAmount, currentUser.userId, manager);
    }
    // 🧾 LoanPayment oluşturuluyor
    const payment = paymentRepo.create({
        loan: { id: loan.id },
        code: `${data.loanCode}-TAKSIT:${data.installmentNumber}`,
        installmentNumber: data.installmentNumber,
        dueDate: data.dueDate,
        totalAmount: data.totalAmount,
        interestAmount: data.interestAmount,
        principalAmount: data.principalAmount,
        paymentAmount: data.paymentAmount,
        penaltyAmount: data.penaltyAmount,
        status: data.status ?? "PENDING",
        paymentDate: data.paymentDate,
        financeTransaction: transaction ?? undefined,
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    return await paymentRepo.save(payment);
};
exports.createCompanyLoanPayment = createCompanyLoanPayment;
const getCompanyLoanPayments = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const transactions = await repo.find({
        where: {
            loan: { company: { id: currentUser.companyId } },
        },
        relations: [
            "loan",
            "loan.company",
            "loan.project",
            "loan.bank",
            "financeTransaction",
        ],
        order: { installmentNumber: "ASC" },
    });
    return transactions;
};
exports.getCompanyLoanPayments = getCompanyLoanPayments;
const getCompanyLoanPaymentById = async (id, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payment = await repo.findOne({
        where: {
            id,
            loan: { company: { id: currentUser.companyId } },
        },
        relations: [
            "loan",
            "loan.company",
            "loan.project",
            "loan.bank",
            "financeTransaction",
        ],
    });
    if (!payment) {
        throw new Error("İlgili kredi taksiti bulunamadı.");
    }
    return payment;
};
exports.getCompanyLoanPaymentById = getCompanyLoanPaymentById;
const updateCompanyLoanPayment = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const payment = await paymentRepo.findOneOrFail({
        where: { id },
        relations: [
            "loan",
            "loan.company",
            "loan.bank",
            "loan.project",
            "financeTransaction",
        ],
    });
    const loan = await loanRepo.findOneOrFail({
        where: { id: payment.loan.id, company: { id: currentUser.companyId } },
        relations: ["bank", "project"],
    });
    if (payment.loan.company.id !== currentUser.companyId) {
        throw new Error("Bu ödeme kaydına erişim yetkiniz yok.");
    }
    const oldStatus = payment.status;
    const newStatus = data.status ?? oldStatus;
    const oldAmount = payment.paymentAmount ??
        payment.interestAmount + payment.penaltyAmount + payment.principalAmount;
    const newAmount = data.paymentAmount ?? data.totalAmount ?? oldAmount;
    const principal = data.principalAmount ?? payment.principalAmount ?? 0;
    const interest = data.interestAmount ?? payment.interestAmount ?? 0;
    const penalty = data.penaltyAmount ?? payment.penaltyAmount ?? 0;
    const newPaymentAmount = principal + interest + penalty;
    console.log(newPaymentAmount, "    !!!");
    const code = payment.code;
    // const code = payment.code; ❌ bunu tamamen sil
    // 🔁 1. Eğer eski status PAID ama yeni değilse → geri al + transaction sil
    if (oldStatus === "PAID" && newStatus !== "PAID") {
        await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(payment.loan.id, payment.principalAmount, payment.interestAmount, newPaymentAmount ?? payment.paymentAmount, currentUser.userId, manager, true // reverse
        );
        if (payment.financeTransaction) {
            await (0, companyFinance_service_1.deleteCompanyFinanceTransactionById)(payment.financeTransaction.id, currentUser, manager);
        }
    }
    // 🔁 2. Eğer yeni status PAID ama eski değeri PAID değilse → apply et
    if (oldStatus !== "PAID" && newStatus === "PAID") {
        let transaction = null;
        transaction = await (0, companyFinance_service_1.createLoanTransactionFromPaymentData)({
            paymentCode: `${payment.code}-TAKSIT:${data.installmentNumber}`,
            amount: newPaymentAmount ?? payment.paymentAmount,
            transactionDate: data.paymentDate ?? new Date(),
            bankId: loan.bank.id,
            loanName: loan.name,
            installmentNumber: payment.installmentNumber,
            projectId: loan.project?.id,
            description: data.description,
        }, currentUser, manager);
        await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(payment.loan.id, data.principalAmount ?? payment.principalAmount, data.interestAmount ?? payment.interestAmount, newPaymentAmount ?? payment.paymentAmount, currentUser.userId, manager);
    }
    // 🔁 3. Hem eski hem yeni PAID → amount veya tarih değiştiyse transaction güncelle
    if (oldStatus === "PAID" && newStatus === "PAID") {
        const transactionCode = payment.financeTransaction?.code;
        if (!transactionCode) {
            throw new Error("Bu ödeme kaydına ait bir finansal işlem bulunamadı.");
        }
        const amountChanged = data.paymentAmount !== undefined &&
            data.paymentAmount !== payment.paymentAmount;
        const interestChanged = data.interestAmount !== undefined &&
            data.interestAmount !== payment.interestAmount;
        const principalChanged = data.principalAmount !== undefined &&
            data.principalAmount !== payment.principalAmount;
        const penaltyChanged = data.penaltyAmount !== undefined &&
            data.penaltyAmount !== payment.penaltyAmount;
        if (amountChanged ||
            interestChanged ||
            principalChanged ||
            penaltyChanged ||
            data.paymentDate) {
            await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(payment.loan.id, payment.principalAmount, payment.interestAmount, oldAmount, currentUser.userId, manager, true // reverse
            );
            // 2. Loan yeniden güncelle (yeni değerle)
            await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(payment.loan.id, data.principalAmount ?? payment.principalAmount, data.interestAmount ?? payment.interestAmount, newPaymentAmount, currentUser.userId, manager);
            await (0, companyFinance_service_1.updateCompanyFinanceTransaction)(transactionCode, {
                amount: newAmount,
                //description: data.description ?? payment.description,
                transactionDate: data.paymentDate ?? payment.paymentDate,
            }, currentUser, manager);
        }
    }
    // 🧾 Son olarak payment kaydını güncelle
    await paymentRepo.update({ id }, {
        installmentNumber: data.installmentNumber,
        dueDate: data.dueDate,
        totalAmount: data.totalAmount,
        interestAmount: data.interestAmount,
        principalAmount: data.principalAmount,
        paymentAmount: data.paymentAmount,
        status: data.status,
        paymentDate: data.paymentDate,
        penaltyAmount: data.penaltyAmount,
        //description: data.description, // Burada hata oluyorsa entity'de name kontrolü yap
        updatedBy: { id: currentUser.userId },
        updatedatetime: new Date(),
    });
};
exports.updateCompanyLoanPayment = updateCompanyLoanPayment;
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
