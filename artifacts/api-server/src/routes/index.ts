import { Router, type IRouter } from "express";
import healthRouter from "./health";
import stationsRouter from "./stations";
import railRoutesRouter from "./rail-routes";

const router: IRouter = Router();

router.use(healthRouter);
router.use(stationsRouter);
router.use(railRoutesRouter);

export default router;
