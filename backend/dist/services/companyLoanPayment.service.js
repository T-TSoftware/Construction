"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCompanyLoanPaymentsToPdf = exports.exportCompanyLoanPaymentsToCsv = exports.updateLoanPaymentStatusNew = exports.updateLoanPaymentStatus = exports.updateCompanyLoanPayment = exports.getCompanyLoanPaymentsByLoanId = exports.getCompanyLoanPaymentById = exports.getCompanyLoanPayments = exports.createCompanyLoanPayment = void 0;
const data_source_1 = require("../config/data-source");
const CompanyLoanPayment_1 = require("../entities/CompanyLoanPayment");
const CompanyLoan_1 = require("../entities/CompanyLoan");
const CompanyFinance_1 = require("../entities/CompanyFinance");
const companyLoan_service_1 = require("./companyLoan.service");
const json2csv_1 = require("json2csv");
const pdfmake_1 = __importDefault(require("pdfmake"));
const path_1 = __importDefault(require("path"));
const errorHandler_1 = require("../utils/errorHandler");
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
    // 🧾 LoanPayment oluşturuluyor
    const payment = paymentRepo.create({
        loan: { id: loan.id },
        code: `${loan.code}-TAKSIT:${data.installmentNumber}`,
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
        company: { id: currentUser.companyId }, // ✅ Şirkete ait olarak kaydediliyor
        createdBy: { id: currentUser.userId },
        updatedBy: { id: currentUser.userId },
    });
    /*try {
      return await paymentRepo.save(payment);
    } catch (error: any) {
      if (error.code === "23505") {
        throw new Error("Bu Taksit Numarası zaten mevcut. Lütfen farklı bir taksit numarası seçin.");
      }
      throw new Error("Taksit kaydı sırasında bir hata oluştu.");
    }*/
    /*return await handleSaveWithUniqueConstraint(
      () => paymentRepo.save(payment),
      "Taksit kaydı oluşturulamadı."
    );*/
    return await (0, errorHandler_1.handleSaveWithUniqueConstraint)(() => paymentRepo.save(payment), "CompanyLoanPayment");
};
exports.createCompanyLoanPayment = createCompanyLoanPayment;
const getCompanyLoanPayments = async (currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const transactions = await repo.find({
        where: {
            company: { id: currentUser.companyId }, // ✅ doğrudan companyId ile filtreleme
        },
        relations: [
            "loan", // ✔ sadece gerekli ilişkiler kaldı
            "loan.project",
            "loan.bank",
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
            company: { id: currentUser.companyId },
        },
        relations: ["loan", "loan.project", "loan.bank"],
    });
    if (!payment) {
        throw new Error("İlgili kredi taksiti bulunamadı.");
    }
    return payment;
};
exports.getCompanyLoanPaymentById = getCompanyLoanPaymentById;
const getCompanyLoanPaymentsByLoanId = async (loanId, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const repo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payments = await repo.find({
        where: {
            company: { id: currentUser.companyId },
            loan: { id: loanId },
        },
        relations: ["loan", "loan.project", "loan.bank"],
        order: { installmentNumber: "ASC" },
    });
    return payments;
};
exports.getCompanyLoanPaymentsByLoanId = getCompanyLoanPaymentsByLoanId;
const updateCompanyLoanPayment = async (id, data, currentUser, manager = data_source_1.AppDataSource.manager) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const transactionRepo = manager.getRepository(CompanyFinance_1.CompanyFinanceTransaction);
    const loanRepo = manager.getRepository(CompanyLoan_1.CompanyLoan);
    const payment = await paymentRepo.findOneOrFail({
        where: { id },
        relations: [
            "loan",
            "loan.bank",
            "loan.project",
            "financeTransaction",
            "company",
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
    /* 🔁 1. Eğer eski status PAID ama yeni değilse → geri al + transaction sil
    if (oldStatus === "PAID" && newStatus !== "PAID") {
      await updateCompanyLoanPaymentChange(
        payment.loan.id,
        newPaymentAmount ?? payment.paymentAmount,
        currentUser.userId,
        manager,
        true // reverse
      );
    }
  */
    /* 🔁 2. Eğer yeni status PAID ama eski değeri PAID değilse → apply et
    if (oldStatus !== "PAID" && newStatus === "PAID") {
      await updateCompanyLoanPaymentChange(
        payment.loan.id,
        newPaymentAmount ?? payment.paymentAmount,
        currentUser.userId,
        manager
      );
    }
    */
    /* 🔁 3. Hem eski hem yeni PAID → amount veya tarih değiştiyse transaction güncelle
    if (oldStatus === "PAID" && newStatus === "PAID") {
      const transactionCode = payment.financeTransaction?.code;
  
      if (!transactionCode) {
        throw new Error("Bu ödeme kaydına ait bir finansal işlem bulunamadı.");
      }
      const amountChanged =
        data.paymentAmount !== undefined &&
        data.paymentAmount !== payment.paymentAmount;
  
      const interestChanged =
        data.interestAmount !== undefined &&
        data.interestAmount !== payment.interestAmount;
  
      const principalChanged =
        data.principalAmount !== undefined &&
        data.principalAmount !== payment.principalAmount;
  
      const penaltyChanged =
        data.penaltyAmount !== undefined &&
        data.penaltyAmount !== payment.penaltyAmount;
  
      if (
        amountChanged ||
        interestChanged ||
        principalChanged ||
        penaltyChanged ||
        data.paymentDate
      ) {
        await updateCompanyLoanPaymentChange(
          payment.loan.id,
          oldAmount,
          currentUser.userId,
          manager,
          true // reverse
        );
  
        // 2. Loan yeniden güncelle (yeni değerle)
        await updateCompanyLoanPaymentChange(
          payment.loan.id,
          newPaymentAmount,
          currentUser.userId,
          manager
        );
      
      }
    }
    */
    // 🧾 Son olarak payment kaydını güncelle
    await paymentRepo.update({ id }, {
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
const updateLoanPaymentStatus = async (paymentCode, amountPaid, transactionDate, currentUser, manager) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payment = await paymentRepo.findOneOrFail({
        where: {
            code: paymentCode,
            company: { id: currentUser.companyId },
        },
        relations: ["loan"],
    });
    const totalPaid = Number(payment.paymentAmount ?? 0) + amountPaid;
    const totalExpected = Number(payment.totalAmount ?? 0);
    const rawRemaining = totalExpected - totalPaid;
    const remainingAmount = rawRemaining < 0 ? 0 : rawRemaining;
    const penaltyAmount = totalPaid > totalExpected ? totalPaid - totalExpected : 0;
    const status = totalPaid >= totalExpected ? "PAID" : "PARTIAL";
    // 🔁 Güncelle
    payment.paymentAmount = totalPaid;
    payment.penaltyAmount = penaltyAmount;
    payment.remainingAmount = remainingAmount;
    payment.status = status;
    payment.paymentDate = transactionDate;
    payment.updatedBy = { id: currentUser.userId };
    await paymentRepo.save(payment);
    // 🔄 Loan üzerindeki tutarları güncelle
    await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(payment.loan.id, payment.principalAmount ?? 0, payment.interestAmount ?? 0, totalExpected, currentUser.userId, manager);
    return { payment };
};
exports.updateLoanPaymentStatus = updateLoanPaymentStatus;
const updateLoanPaymentStatusNew = async (paymentCode, amount, 
//transactionDate: Date,
currentUser, manager, isReverse = false) => {
    const paymentRepo = manager.getRepository(CompanyLoanPayment_1.CompanyLoanPayment);
    const payment = await paymentRepo.findOneOrFail({
        where: {
            code: paymentCode,
            company: { id: currentUser.companyId },
        },
        relations: ["loan"],
    });
    const factor = isReverse ? -1 : 1;
    // ✅ paymentAmount güncelle (increment/decrement)
    await paymentRepo.increment({ id: payment.id }, "paymentAmount", factor * amount);
    // Güncellenmiş payment tekrar çek
    const updatedPayment = await paymentRepo.findOneOrFail({
        where: { id: payment.id },
        relations: ["loan"],
    });
    // ✅ Durum, kalan ve ceza hesapla
    const totalExpected = Number(updatedPayment.totalAmount ?? 0);
    const totalPaid = Number(updatedPayment.paymentAmount ?? 0);
    const rawRemaining = totalExpected - totalPaid;
    const remainingAmount = rawRemaining < 0 ? 0 : rawRemaining;
    const penaltyAmount = totalPaid > totalExpected ? totalPaid - totalExpected : 0;
    const status = totalPaid >= totalExpected ? "PAID" : "PARTIAL";
    updatedPayment.remainingAmount = remainingAmount;
    updatedPayment.penaltyAmount = penaltyAmount;
    updatedPayment.status = status;
    //updatedPayment.paymentDate = transactionDate;
    updatedPayment.updatedBy = { id: currentUser.userId };
    updatedPayment.updatedatetime = new Date();
    await paymentRepo.save(updatedPayment);
    // 🔄 Loan üzerindeki kalan borçları güncelle
    await (0, companyLoan_service_1.updateCompanyLoanPaymentChange)(updatedPayment.loan.id, updatedPayment.principalAmount ?? 0, updatedPayment.interestAmount ?? 0, totalExpected, currentUser.userId, manager);
    return { payment: updatedPayment };
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
