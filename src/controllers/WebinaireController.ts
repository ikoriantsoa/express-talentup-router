import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";
import axios, { AxiosResponse } from "axios";

export class WebinaireController {
  public async createWebinaire(req: Request, res: Response) {
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
      const username: string = keycloak.extractUsername(token);
      const keycloakId: string = keycloak.extractIdToken(token);

      const { titre, categorie, type, niveau, auteur } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.image || !files.source) {
        res
          .status(400)
          .json({ error: 'Les champs "image" et "source" sont requis.' });
        return;
      }

      const imagePath = files.image[0].path;
      const sourcePath = files.source[0].path;

      const dataWebinaire = {
        keycloakId: keycloakId,
        titre: titre,
        categorie: categorie,
        type: type,
        niveau: niveau,
        auteur: username,
        image: imagePath,
        source: sourcePath,
      };

      const response: AxiosResponse<any, any> = await axios.post(
        `${process.env.APPRENANT}/createWebinaire`,
        { dataWebinaire }
      );

      res.status(200).json(response.data);
      return;
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "Une erreur est survenue lors de la création du webinaire",
      });
      return;
    }
  }

  public async getWebinaireById(req: Request, res: Response) {
    try {
        const apprenantUrl: string = process.env.APPRENANT!;
        const {keycloakId, webinaireId} = req.params;
        const response: AxiosResponse<any, any> = await axios.get(`${apprenantUrl}/getWebinaire/${keycloakId}/${webinaireId}`);
        res.status(200).json(response.data);
        return;        
    } catch (error) {
        res.status(500).json({
            message: `API - Erreur lors de la récupération d'un webinaire: ${error}`,
          });
          return;
    }
  }
}
