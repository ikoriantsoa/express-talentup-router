import { Router } from "express";
import KeycloakMiddleware from "../middlewares/KeycloakMiddleware";
import { AlternantController } from "../controllers/AlternantController";


const AlternantRouter = Router();

//controller
const alternantController= new AlternantController()

//midlleware
const keycloakMiddleware = new KeycloakMiddleware();

// **********create alternant  ***********
AlternantRouter.post(
  "/createAlternant/:keycloakId",
  keycloakMiddleware.tokenAuthentification,
  keycloakMiddleware.checkRole(["admin"]), //un role admin
  alternantController.createAlternant
);



export default AlternantRouter