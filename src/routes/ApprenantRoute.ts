import { Router } from "express";
import ApprenantController from "../controllers/ApprenantController";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";
import { MulterConfig } from "../utils/Multer";

//Cration d'un router 
const router: Router = Router();

// controllerApprenat avec la classe ApprenantController
const apprenantController: ApprenantController = new ApprenantController();

// controller KeycloakMiddleawre 
const keycloakMiddleware: KeycloakMiddleware = new KeycloakMiddleware();

const upload = new MulterConfig();

router.get(
  "/allApprenant", //nom du route
  keycloakMiddleware.tokenAuthentification, //verification de l'existance du token, 
  keycloakMiddleware.checkRole(["admin"]), //verification si l'user a le role apprenant 
  apprenantController.getAllApprenants //on retourne dans le controller tout les apprenant 
);

router.get(
  "/oneApprenant/:keycloakId",//voir un seul apprenant 
  keycloakMiddleware.tokenAuthentification, //token 
  keycloakMiddleware.checkRole(["admin"]),//voir si il a le role apprenant 
  apprenantController.getApprenantById //retourne les appreannt 
);

router.post(
  "/createApprenant",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["anonyme"]),
  upload.upload.fields([
    {name: "cv", maxCount: 1},
    {name: "photo", maxCount: 1}

  ]),
  apprenantController.createApprenant //creation apprenant 
);

export default router;
