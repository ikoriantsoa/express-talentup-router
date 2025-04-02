import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";

export class AlternantController {
  public async createAlternant(req: Request, res: Response): Promise<void> {
    try {
      // Récupération des données depuis le corps de la requête
      const { keycloakId } = req.params;

      // Vérification de l'utilisateur dans Keycloak
      const keycloak = new Keycloak();
      const isUserExisteInKeycloak = await keycloak.isUserExiste(keycloakId);

      if (!isUserExisteInKeycloak) {
        res
          .status(404)
          .json({ error: "L'utilisateur n'existe pas dans Keycloak." });
        return;
      }

      // Vérification dans l'API Apprenant
      const apprenantUrl = process.env.APPRENANT!;
      const apprenant = await axios.get(
        `${apprenantUrl}/apprenant/${keycloakId}`
      );

      if (apprenant.status !== 200) {
        res.status(404).json({ error: "Cet apprenant n'existe pas." });
        return;
      }

      //recuperation des info response
      const newAlternant = apprenant.data;

      /// Vérification si l'utilisateur existe déjà dans l'API Alternant
      const alternantUrl = process.env.ALTERNANT!;

      /// Création de l'alternant dans l'API Alternant
      const createAlternantResponse = await axios.post(
        `${alternantUrl}/createAlternant`,
        newAlternant
      );

      if (createAlternantResponse.status !== 201) {
        res
          .status(500)
          .json({ error: "Erreur lors de la création de l'alternant." });
        return;
      }

      // // Changement de rôle dans Keycloak
      await keycloak.updateUserRoles(newAlternant.keycloakId, "alternant");

      // Suppression de l'apprenant dans l'API Apprenant
      const deleteApprenantResponse = await axios.delete(
        `${apprenantUrl}/apprenant/${newAlternant.keycloakId}`
      );

      if (deleteApprenantResponse.status !== 200) {
        res
          .status(500)
          .json({ error: "Erreur lors de la suppression de l'apprenant." });
        return;
      }

      // Réponse finale
      res.status(201).json({
        message: "Alternant créé avec succès.",
        data: createAlternantResponse.data,
      });
    } catch (error) {
      console.error("Erreur lors de la création de l'alternant :", error);
      res.status(500).json({
        error: "Erreur interne du serveur.",
        details: error instanceof Error ? error.message : error,
      });
    }
  }
}
