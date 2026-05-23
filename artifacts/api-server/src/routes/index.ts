import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import vendorsRouter from "./vendors";
import pricesRouter from "./prices";
import dealsRouter from "./deals";
import alertsRouter from "./alerts";
import reviewsRouter from "./reviews";
import ordersRouter from "./orders";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(vendorsRouter);
router.use(pricesRouter);
router.use(dealsRouter);
router.use(alertsRouter);
router.use(reviewsRouter);
router.use(ordersRouter);

export default router;
