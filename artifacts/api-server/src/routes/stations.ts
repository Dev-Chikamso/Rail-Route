import { Router } from "express";
import { STATIONS } from "../data/stations";

const router = Router();

router.get("/stations", (req, res) => {
  req.log.info("Listing stations");
  res.json(STATIONS);
});

export default router;
