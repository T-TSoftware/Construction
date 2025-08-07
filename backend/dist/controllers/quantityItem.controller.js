"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQuantityItemsHandler = exports.postQuantityItemHandler = void 0;
const quantityItem_service_1 = require("../services/quantityItem.service");
const postQuantityItemHandler = async (req, res) => {
    if (req.user?.role !== "superadmin") {
        res.status(403).json({ error: "Yalnızca superadmin işlem yapabilir." });
        return;
    }
    try {
        const { code, name, description } = req.body;
        if (!code || !name) {
            res.status(400).json({ error: "Code ve name alanları zorunludur." });
            return;
        }
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const newItem = await (0, quantityItem_service_1.createQuantityItem)({ code, name, description }, {
            userId,
            companyId,
        });
        res.status(201).json(newItem);
    }
    catch (error) {
        console.error("❌ POST quantity item error:", error);
        res
            .status(500)
            .json({ error: error.message || "Metraj kalemi oluşturulamadı." });
        return;
    }
};
exports.postQuantityItemHandler = postQuantityItemHandler;
// export const postBulkQuantityItemsHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const items = req.body;
//     if (!Array.isArray(items) || items.length === 0) {
//       res.status(400).json({ error: "Geçerli bir veri dizisi gönderin." });
//       return;
//     }
//     const user = req.user!;
//     const results = [];
//     for (const item of items) {
//       if (!item.code || !item.name) {
//         results.push({ code: item.code ?? "?", status: "❌ Eksik alan" });
//         continue;
//       }
//       try {
//         const result = await createQuantityItem(item, {
//           userId: user.userId.toString(),
//           role: user.role,
//         });
//         results.push({ code: item.code, status: "✅ Eklendi", id: result.id });
//       } catch (err: any) {
//         results.push({
//           code: item.code,
//           status: "⚠️ Hata",
//           message: err.message,
//         });
//       }
//     }
//     res.status(207).json(results); // 207 = Çoklu Durum
//     return;
//   } catch (error: any) {
//     console.error("❌ Bulk quantity item error:", error);
//     res.status(500).json({ error: "Toplu işlem başarısız oldu." });
//     return;
//   }
// };
const getQuantityItemsHandler = async (req, res) => {
    try {
        const userId = req.user.userId.toString();
        const companyId = req.user.companyId;
        const items = await (0, quantityItem_service_1.getQuantityItems)({ userId, companyId });
        res.status(200).json(items);
        return;
    }
    catch (error) {
        console.error("❌ GET quantity items error:", error);
        res.status(500).json({ error: "Metraj kalemleri alınamadı." });
        return;
    }
};
exports.getQuantityItemsHandler = getQuantityItemsHandler;
