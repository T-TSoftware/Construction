import { EntityManager } from "typeorm";
import { AppDataSource } from "../config/data-source";
import { CompanyLoanPayment } from "../entities/CompanyLoanPayment";
import { CompanyLoan } from "../entities/CompanyLoan";
import { CompanyFinanceTransaction } from "../entities/CompanyFinance";
import {
  createLoanTransactionFromPaymentData,
  updateCompanyFinanceTransaction,
  deleteCompanyFinanceTransactionById,
} from "./companyFinance.service";
import { updateCompanyLoanPaymentChange } from "./companyLoan.service";

import { parse } from "json2csv";
import PdfPrinter from "pdfmake";
import { TDocumentDefinitions } from "pdfmake/interfaces";
import fs from "fs";
import path from "path";
import { User } from "../entities/User";

export const createCompanyLoanPayment = async (
  data: {
    loanCode: string;
    code: string;
    installmentNumber: number;
    dueDate: Date;
    totalAmount: number;
    interestAmount: number;
    principalAmount: number;
    paymentAmount?: number;
    status?: "PENDING" | "PAID" | "OVERDUE";
    paymentDate?: Date;
    penaltyAmount: number;
    remainingAmount: number;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
): Promise<CompanyLoanPayment> => {
  const loanRepo = manager.getRepository(CompanyLoan);
  const paymentRepo = manager.getRepository(CompanyLoanPayment);

  const loan = await loanRepo.findOneOrFail({
    where: {
      code: data.loanCode,
      company: { id: currentUser.companyId }, // ✅ Şirket kontrolü burada yapılmış
    },
    relations: ["bank", "project"],
  });

  // 🧾 LoanPayment oluşturuluyor
  const payment = paymentRepo.create({
    loan: { id: loan.id },
    code: `${data.loanCode}-TAKSIT:${data.installmentNumber}`,
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

  return await paymentRepo.save(payment);
};

export const getCompanyLoanPayments = async (
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoanPayment);

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

export const getCompanyLoanPaymentById = async (
  id: string,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const repo = manager.getRepository(CompanyLoanPayment);

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

export const updateCompanyLoanPayment = async (
  id: string,
  data: {
    installmentNumber?: number;
    dueDate?: Date;
    totalAmount?: number;
    interestAmount?: number;
    principalAmount?: number;
    paymentAmount?: number;
    status?: "PENDING" | "PAID" | "OVERDUE";
    paymentDate?: Date;
    penaltyAmount?: number;
    description?: string;
  },
  currentUser: { userId: string; companyId: string },
  manager: EntityManager = AppDataSource.manager
) => {
  const paymentRepo = manager.getRepository(CompanyLoanPayment);
  const transactionRepo = manager.getRepository(CompanyFinanceTransaction);
  const loanRepo = manager.getRepository(CompanyLoan);
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

  const oldAmount =
    payment.paymentAmount ??
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
  await paymentRepo.update(
    { id },
    {
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
    }
  );
};

export const updateLoanPaymentStatus = async (
  paymentCode: string,
  amountPaid: number,
  transactionDate: Date,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager
) => {
  const paymentRepo = manager.getRepository(CompanyLoanPayment);

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

  const penaltyAmount =
    totalPaid > totalExpected ? totalPaid - totalExpected : 0;
  const status = totalPaid >= totalExpected ? "PAID" : "PARTIAL";

  // 🔁 Güncelle
  payment.paymentAmount = totalPaid;
  payment.penaltyAmount = penaltyAmount;
  payment.remainingAmount = remainingAmount;
  payment.status = status as any;
  payment.paymentDate = transactionDate;
  payment.updatedBy = { id: currentUser.userId } as User;

  await paymentRepo.save(payment);

  // 🔄 Loan üzerindeki tutarları güncelle
  await updateCompanyLoanPaymentChange(
    payment.loan.id,
    payment.principalAmount ?? 0,
    payment.interestAmount ?? 0,
    totalExpected,
    currentUser.userId,
    manager
  );

  return { payment };
};

export const updateLoanPaymentStatusNew = async (
  paymentCode: string,
  amount: number,
  //transactionDate: Date,
  currentUser: { userId: string; companyId: string },
  manager: EntityManager,
  isReverse = false
) => {
  const paymentRepo = manager.getRepository(CompanyLoanPayment);

  const payment = await paymentRepo.findOneOrFail({
    where: {
      code: paymentCode,
      company: { id: currentUser.companyId },
    },
    relations: ["loan"],
  });

  const factor = isReverse ? -1 : 1;

  // ✅ paymentAmount güncelle (increment/decrement)
  await paymentRepo.increment(
    { id: payment.id },
    "paymentAmount",
    factor * amount
  );

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
  const penaltyAmount =
    totalPaid > totalExpected ? totalPaid - totalExpected : 0;
  const status = totalPaid >= totalExpected ? "PAID" : "PARTIAL";

  updatedPayment.remainingAmount = remainingAmount;
  updatedPayment.penaltyAmount = penaltyAmount;
  updatedPayment.status = status as any;
  //updatedPayment.paymentDate = transactionDate;
  updatedPayment.updatedBy = { id: currentUser.userId } as User;
  updatedPayment.updatedatetime = new Date();

  await paymentRepo.save(updatedPayment);

  // 🔄 Loan üzerindeki kalan borçları güncelle
  await updateCompanyLoanPaymentChange(
    updatedPayment.loan.id,
    updatedPayment.principalAmount ?? 0,
    updatedPayment.interestAmount ?? 0,
    totalExpected,
    currentUser.userId,
    manager
  );

  return { payment: updatedPayment };
};

/*---------------------------------------------------------------------------------------------------*/
export const exportCompanyLoanPaymentsToCsv = async (
  payments: CompanyLoanPayment[]
): Promise<string> => {
  const fields = [
    { label: "Kod", value: "code" },
    { label: "Taksit No", value: "installmentNumber" },
    { label: "Vade Tarihi", value: "dueDate" },
    { label: "Tutar", value: "totalAmount" },
    { label: "Durum", value: "status" },
    { label: "Ödeme Tarihi", value: "paymentDate" },
  ];

  return parse(payments, { fields });
};

const fonts = {
  Roboto: {
    normal: path.resolve(
      __dirname,
      "../fonts/Roboto-VariableFont_wdth,wght.ttf"
    ),
    italics: path.resolve(
      __dirname,
      "../fonts/Roboto-Italic-VariableFont_wdth,wght.ttf"
    ),
    bold: path.resolve(__dirname, "../fonts/Roboto-VariableFont_wdth,wght.ttf"),
    bolditalics: path.resolve(
      __dirname,
      "../fonts/Roboto-Italic-VariableFont_wdth,wght.ttf"
    ),
  },
};

const printer = new PdfPrinter(fonts);

export const exportCompanyLoanPaymentsToPdf = async (
  payments: CompanyLoanPayment[]
): Promise<Buffer> => {
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

  const docDefinition: TDocumentDefinitions = {
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
          fillColor: (rowIndex: number) => (rowIndex === 0 ? "#eeeeee" : null),
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
  const chunks: Buffer[] = [];

  return new Promise((resolve, reject) => {
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
};
