import { Router } from "express";
import multer from "multer";
import { orderController } from "../controllers/OrderController";
import { authenticate } from "../middleware/auth";
import { validate, validateQuery } from "../middleware/validate";
import { createOrderSchema, updateOrderSchema, orderQuerySchema } from "../validations/orderValidation";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.use(authenticate);

router.get("/", validateQuery(orderQuerySchema), orderController.getAllOrders);
router.get("/dashboard", orderController.getDashboardStats);
router.get("/export", orderController.exportOrders);
router.post("/import", upload.single("file"), orderController.importOrders);
router.get("/:id", orderController.getOrderById);
router.post("/", validate(createOrderSchema), orderController.createOrder);
router.put("/:id", validate(updateOrderSchema), orderController.updateOrder);
router.delete("/:id", orderController.deleteOrder);

export default router;