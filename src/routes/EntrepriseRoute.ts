  import { Router } from "express";
import { EntrepriseController } from "../controllers/EntrepriseController";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";

const router = Router();

//controller
const entrepriseController = new EntrepriseController();

//midlleware
const keycloakMiddleware = new KeycloakMiddleware();

// **********create entreprise ***********
router.post(
  "/createEntreprise",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["anonyme"]), //un role anonyme peut cree un compte
  entrepriseController.createEntreprise
);

// **********************voir les entreprise , seulement l'admin
router.get(
  "/AllEntreprise",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin peut voir
  entrepriseController.getAllEntreprises
);

// ****************voir un entrepriseController, seulement l'admin
router.get(
  "/entreprise/:keycloakId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin peut voir
  entrepriseController.getEntrepriseById
);

// ****************voir un entrepriseController, seulement l'admin
router.put(
  "/entreprise/:keycloakId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin peut voir
  entrepriseController.updateEntreprise
);

export default router;
