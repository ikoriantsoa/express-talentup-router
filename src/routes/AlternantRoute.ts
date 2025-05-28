import { Router } from "express";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";
import { AlternantController } from "../controllers/alternants/AlternantController";
import { CategorieAlternantController } from "../controllers/alternants/CategorieAlternantController";
import { TechnologieAlternantController } from "../controllers/alternants/TechnologieAlternantController";

const AlternantRouter = Router();

//controller
const alternantController = new AlternantController();

//midlleware
const keycloakMiddleware = new KeycloakMiddleware();

// **********create alternant  ***********

// *********************create alternants with ids

AlternantRouter.put(
  "/admin/createAlternant/keycloakIDs",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin
  alternantController.createAlternant
);

AlternantRouter.get(
  "/admin/AllAlternant",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin
  alternantController.getAllAlternant
);

//admin voir un alternant
AlternantRouter.get(
  "/admin/alternant/:keycloakId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin
  alternantController.getOneAlternant
);

//voir les info d'un alternant info personnelle ,
AlternantRouter.get(
  "/alternant/:keycloakId",
  keycloakMiddleware.validateKeycloakIdFromToken,
  alternantController.getOneAlternant
);

// *********************************     C    A    T    E    G   O   R   I   E  S  *******
const categorieController = new CategorieAlternantController();
// **********************************create categories ***************************
AlternantRouter.post(
  "/admin/alternant/categories",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]),
  categorieController.createCategorie
);

AlternantRouter.get("/categories", categorieController.getAllCategorie);

AlternantRouter.get("/categories/:id", categorieController.getOneCategorie);

// *****************************************  T  E  C  H  N  O  L  O  G  I  E  S  ***************
const technologieController = new TechnologieAlternantController();

AlternantRouter.post(
  "/admin/alternant/technologies",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]),
  technologieController.createTechnologie
);

AlternantRouter.get("/technologies", technologieController.getAllTechnologie);

AlternantRouter.get(
  "/technologies/:id",
  technologieController.getOneTechnologie
);

export default AlternantRouter;
