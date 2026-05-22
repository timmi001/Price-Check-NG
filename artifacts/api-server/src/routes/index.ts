import { Router, type IRouter } from "express";
import healthRouter from "./health";
import categoriesRouter from "./categories";
import productsRouter from "./products";
import vendorsRouter from "./vendors";
import pricesRouter from "./prices";
import dealsRouter from "./deals";
import alertsRouter from "./alerts";

const router: IRouter = Router();

router.use(healthRouter);
router.use(categoriesRouter);
router.use(productsRouter);
router.use(vendorsRouter);
router.use(pricesRouter);
router.use(dealsRouter);
router.use(alertsRouter);

export default router;
