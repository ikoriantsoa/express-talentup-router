import * as dotenv from "dotenv";
dotenv.config();

import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";

class ApprenantController {
  public async getAllApprenants(req: Request, res: Response): Promise<void> {
    try {
      const apprenantUrl: string = process.env.APPRENANT!;
      const response: AxiosResponse<any, any> = await axios.get(
        `${apprenantUrl}/allApprenant`
      );

      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste de tous les apprenants : ${error}`,
      });
    }
  }

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

  public async createApprenant(req: Request, res: Response) {
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
      const keycloakId = keycloak.extractIdToken(token);
      const { lastname, firstname, adresse } = req.body;
      const apprenant = {
        keycloakId: keycloakId,
        email: keycloak.extractEmail(token),
        username: keycloak.extractUsername(token),
        lastname: lastname,
        firstname: firstname,
        adresse: adresse,
      };


      const apprenantUrl: string = process.env.APPRENANT!;
      const response: AxiosResponse<any, any> = await axios.post(
        `${apprenantUrl}/createApprenant`,
        { apprenant }
      );


      // Mise à jour du rôle en apprenant
      keycloak.updateUserRoles(keycloakId, "apprenant");

      res.status(201).json(response.data);
      console.log((response.data));
      
      return;
    } catch (error) {
      res.status(500).json({
        message: `API - Erreur lors de la création d'un apprenant: ${error}`,
      });
      return;
    }
  }

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
