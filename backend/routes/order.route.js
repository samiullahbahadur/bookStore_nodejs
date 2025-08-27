import express from "express";

import {
  createOrder,
  getOrder,
  updateOrderStatus,
} from "../controller/order.controller.js";
import authenticate from "../middleware/auth.js";
const router = express.Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getOrder);
router.put("/:orderId/status", authenticate, updateOrderStatus);

export default router;
