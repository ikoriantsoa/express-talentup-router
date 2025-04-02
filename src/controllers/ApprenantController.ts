import * as dotenv from "dotenv";
dotenv.config();

import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";

class ApprenantController {
  // *********recuperation tout les apprenant **
  public async getAllApprenants(req: Request, res: Response): Promise<void> {
    try {
      //on utilise le url apprenat, ca va etre http://192.168.17:3002
      const apprenantUrl: string = process.env.APPRENANT!;

      //envoyer un axios a cet url
      const response: AxiosResponse<any, any> = await axios.get(
        `${apprenantUrl}/allApprenant`
      );

      //response
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste de tous les apprenants : ${error}`,
      });
    }
  }

  // ***********appreanant by id **
  public async getApprenantById(req: Request, res: Response) {
    try {
      const apprenantUrl: string = process.env.APPRENANT!;
      const { keycloakId } = req.params;
      const response: AxiosResponse<any, any> = await axios.get(
        `${apprenantUrl}/apprenant/${keycloakId}`
      );
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération d'un apprenant: ${error}`,
      });
    }
  }

  // ****create un apprenant **********
  public async createApprenant(req: Request, res: Response) {
    // **recuperation du header et token  *******
    const authHeader: string = req.headers.authorization!;
    const token: string = authHeader.split(" ")[1];

    // **tokenn n'existe pas
    if (!token) {
      res
        .status(401)
        .json({ message: `Le token n'existe pas ou n'est pas valide` });
      return;
    }

    // **il existe
    try {
      // ***extraire le token et recuperer le body
      const keycloak: Keycloak = new Keycloak();
      const keycloakId = keycloak.extractIdToken(token);

      //body
      const { lastname, firstname, adresse } = req.body;

      //extraire les info
      const apprenant = {
        keycloakId: keycloakId,
        email: keycloak.extractEmail(token),
        username: keycloak.extractUsername(token),
        lastname: lastname,
        firstname: firstname,
        adresse: adresse,
      };

      //envoyer vers la micro-service a l'aide d'un api procees.ev.appreant = port 3002
      const apprenantUrl: string = process.env.APPRENANT!;
      const response: AxiosResponse<any, any> = await axios.post(
        `${apprenantUrl}/createApprenant`,
        { apprenant }
      );

      // Mise à jour du rôle en apprenant
      keycloak.updateUserRoles(keycloakId, "apprenant");

      res.status(201).json(response.data);
      console.log(response.data);

      return;
    } catch (error) {
      res.status(500).json({
        message: `API - Erreur lors de la création d'un apprenant: ${error}`,
      });
      return;
    }
  }

  // ************updtae
  public async updateApprenant(req: Request, res: Response) {
    const authHeader: string = req.headers.authorization!;
    const token: string = authHeader.split(" ")[1];

    if (!token) {
      res
        .status(401)
        .json({ message: `Le token n'existe pas ou n'est pas valide` });
      return;
    }

    try {
      const keycloak: Keycloak = new Keycloak();
      const keycloakId: string = keycloak.extractIdToken(token);
      const { lastname, firstname, adresse } = req.body;

      const apprenant = {
        lastname: lastname,
        firstname: firstname,
        adresse: adresse,
      };

      const apprenantUrl: string = process.env.APPRENANT!;
      const response: AxiosResponse<any, any> = await axios.put(
        `${apprenantUrl}/apprenant/${keycloakId}`,
        apprenant
      );
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(500).json({
        message: `Erreur lors de la mise à jour d'un apprenant: ${error}`,
      });
      return;
    }
  }
}

export default ApprenantController;
