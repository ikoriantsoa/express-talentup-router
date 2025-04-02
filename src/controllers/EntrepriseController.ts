import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";
import axios, { AxiosResponse } from "axios";

export class EntrepriseController {
  // ***************create entreprise l'bojectif c'ets de prendre dans le token les info  ****************
  public async createEntreprise(req: Request, res: Response) {
    // *********recuperation du header et du token
    const authHeader = req.headers.authorization!;

    const token = authHeader.split(" ")[1];

    //token n'existe
    if (!token) {
      res
        .status(401)
        .json({ message: "le token n'existe pas ou n'est pas valide " });
    }

    try {
      //extraire le body
      const keycloak = new Keycloak();

      //recuperer le keycloakId, userId
      const keycloakId = keycloak.extractIdToken(token);

      //body
      const { nom_entreprise, secteur_activite, site_web, adresse } = req.body;

      //mettre les info dans un objet
      const entreprise = {
        keycloakId,
        email: keycloak.extractEmail(token),
        nom_entreprise,
        secteur_activite,
        site_web,
        adresse,
      };

      console.log(entreprise);

      //envoyer vers la micro-service
      const entrepriseUrl = process.env.ENTREPRISE!;

      const response: AxiosResponse<any, any> = await axios.post(
        `${entrepriseUrl}/createEntreprise`,
        { entreprise }
      );

      // Mise à jour du rôle entreprise
      keycloak.updateUserRoles(keycloakId, "entreprise");

      res.status(201).json(response.data);
      console.log("data", response.data);

      return;
    } catch (error) {
      res.status(500).json({
        message: `API- erreur lors de la creation d'une entreprise: ${error}`,
      });

      return;
    }
  }


  // *********recuperation tout les apprenant **
  public async getAllEntreprises(req: Request, res: Response): Promise<void> {
    try {
      //on utilise le url apprenat, ca va etre http://192.168.17:3002
      const entrepriseUrl: string = process.env.ENTREPRISE!;

      //envoyer un axios a cet url
      const response: AxiosResponse<any, any> = await axios.get(
        `${entrepriseUrl}/allEntreprise`
      );

      //response
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste de tous les entreprises : ${error}`,
      });
    }
  }

  // *********** entreprise by id **
  public async getEntrepriseById(req: Request, res: Response) {
    try {
      const entrepriseUrl: string = process.env.ENTREPRISE!;
      const { keycloakId } = req.params;
      const response: AxiosResponse<any, any> = await axios.get(
        `${entrepriseUrl}/entreprise/${keycloakId}`
      );
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération d'une entreprise: ${error}`,
      });
    }
  }
}
