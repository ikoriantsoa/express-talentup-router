import express, { Application } from "express";
import apprenantsRoutes from "./routes/ApprenantRoute";
import webinaireRoutes from "./routes/WebinaireRoutes";
import entrepriseRoutes from "./routes/EntrepriseRoute";

import cors from "cors";
import AlternantRouter from "./routes/AlternantRoute";
class App {
  public app: Application; // creation attribut app de type Application express

  constructor() {
    this.app = express(); //intialisation avec express
    this.apiCors(); //cors
    this.initialisationMiddlewares(); //initialisation du middleawres
    this.initialisationRoutes(); //initialisation du routes
  }

  // fonction middleawres
  private initialisationMiddlewares(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }

  //cors

  private apiCors(): void {
    this.app.use(
      cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type,Authorization",
        credentials: true,
      })
    );
  }

  //routes
  private initialisationRoutes(): void {
    this.app.use("/talentApprenant", apprenantsRoutes);
    this.app.use("/talentApprenant", webinaireRoutes);

    //tout ce qui est url /talentEntreprise on associe a entrepriseRoute
    this.app.use("/talentEntreprise", entrepriseRoutes);

    this.app.use("/talentAlternant", AlternantRouter);
  }
}

export default new App().app;
