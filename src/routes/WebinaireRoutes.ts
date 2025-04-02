import { Router } from "express";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";
import { WebinaireController } from "../controllers/WebinaireController";
import { MulterConfig } from "../utils/Multer";

const router: Router = Router();

const webinaireController: WebinaireController = new WebinaireController();

const keycloakMiddleware: KeycloakMiddleware = new KeycloakMiddleware();

const upload = new MulterConfig();

router.post(
  "/createWebinaire",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["apprenant"]),
  upload.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "source", maxCount: 1 },
  ]),
  webinaireController.createWebinaire
);

router.get(
  "/getWebinaire/:keycloakId/:webinaireId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["apprenant"]),
  webinaireController.getWebinaireById
);

export default router;
