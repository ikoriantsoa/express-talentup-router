import { Router } from "express";
import ApprenantController from "../controllers/ApprenantController";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";

const router: Router = Router();

const apprenantController: ApprenantController = new ApprenantController();

const keycloakMiddleware: KeycloakMiddleware = new KeycloakMiddleware();

router.get(
  "/allApprenant",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["apprenant"]),
  apprenantController.getAllApprenants
);

router.get(
  "/oneApprenant/:keycloakId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["apprenant"]),
  apprenantController.getApprenantById
);

router.post(
  "/createApprenant",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["anonyme"]),
  apprenantController.createApprenant
);

export default router;
