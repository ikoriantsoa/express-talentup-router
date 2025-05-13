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
      const keycloakId: string = keycloak.extractIdToken(token);

      const { titre, categorie, description } = req.body;

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.image || !files.source) {
        res
          .status(400)
          .json({ error: 'Les champs "image" et "source" sont requis.' });
        return;
      }

      const imagePath = files.image[0].filename;
      const sourcePath = files.source[0].filename;

      const dataWebinaire = {
        keycloakId: keycloakId,
        titre: titre,
        categorie: categorie,
        description: description,
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
      const { keycloakId, webinaireId } = req.params;

      const response: AxiosResponse<any> = await axios.get(
        `${apprenantUrl}/getWebinaire/${keycloakId}/${webinaireId}`
      );

      // Si tout va bien, retourne les données du webinaire
      res.status(200).json(response.data.data);
      return;
    } catch (error) {
      // Si c’est une erreur Axios (ex: 403 du service apprenant)
      if (axios.isAxiosError(error)) {
        const status = error.response?.status || 500;
        const message = error.response?.data?.message || "Erreur inconnue";

        res.status(status).json({
          message: `${message}`,
        });
        return;
      }

      // Autres types d'erreurs
      res.status(500).json({
        message: `API Gateway - Erreur interne: ${error}`,
      });
      return;
    }
  }

  public async getAllWebinaire(req: Request, res: Response) {
    try {
      const apprenantUrl: string = process.env.APPRENANT!;

      const response = await axios.get(`${apprenantUrl}/allWebinaire`);

      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste de tous les webinaires : ${error}`,
      });
      return;
    }
  }

  public async getRecentWebinaire(req: Request, res: Response) {
    try {
      const apprenantUrl: string = process.env.APPRENANT!;

      const response = await axios.get(`${apprenantUrl}/recentWebinaire`);

      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste des webinaires ls plus récents : ${error}`,
      });
      return;
    }
  }

}
