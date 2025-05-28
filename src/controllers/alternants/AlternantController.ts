import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";

import { plainToClass } from "class-transformer";
import KeycloakIDsDto from "../../dto/entreprises/keycloakIDsDto";
import { isUUID, validate } from "class-validator";
import Keycloak from "../../utils/Keycloak";

export class AlternantController {
  //create
  public async createAlternant(req: Request, res: Response): Promise<void> {
    try {
      const keycloakIdsValidate = plainToClass(KeycloakIDsDto, req.body);

      // Validation du DTO
      const errors = await validate(keycloakIdsValidate);

      if (errors.length > 0) {
        // Formatage lisible des erreurs
        const formattedErrors = errors.flatMap((error) =>
          Object.entries(error.constraints || {}).map(([, message]) => ({
            [error.property]: message,
          }))
        );
        res.status(400).json(formattedErrors);
        return;
      }

      // recuperation des id
      const { keycloakIDs } = keycloakIdsValidate;

      //parcouri
      const keycloak = new Keycloak();

      //PARCOURIR CHAQUE ELEMENTS DANS LE TABLEAUX
      for (const keycloakId of keycloakIDs) {
        //verification si l'user n'existe pas dans keycloak
        const isUserExisteInKeycloak = await keycloak.isUserExiste(keycloakId);

        if (!isUserExisteInKeycloak) {
          res.status(404).json({
            error: `l'user ${keycloakId} n'existe pas dans keycloak `,
          });
          return;
        }

        //verification si l'user n'est pas encore enregistré dans l'apprenant
        const apprenantUrl = process.env.APPRENANT!;
        const apprenant = await axios.get(
          `${apprenantUrl}/apprenant/${keycloakId}`
        );

        if (apprenant.status !== 200) {
          res.status(404).json({
            error: `l'user ${keycloakId} n'existe pas dans apprenants `,
          });
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

        if (deleteApprenantResponse.status !== 204) {
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
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'alternant :", error);
      res.status(500).json({
        error: "Erreur interne du serveur.",
        details: error instanceof Error ? error.message : error,
      });
    }
  }

  //getAll
  public async getAllAlternant(req: Request, res: Response) {
    try {
      //on utilise le url apprenat, ca va etre http://192.168.17:3002
      const alternantUrl = process.env.ALTERNANT!;

      //envoyer un axios a cet url
      const response: AxiosResponse<any, any> = await axios.get(
        `${alternantUrl}/allAlternant`
      );

      //response
      res.status(200).json(response.data);
      return;
    } catch (error) {
      res.status(404).json({
        message: `Erreur lors de la récupération de la liste de tous les stagiaires alternants : ${error}`,
      });
    }
  }

  //getONe,
  public async getOneAlternant(req: Request, res: Response) {
    try {
      //on utilise le url apprenat, ca va etre http://192.168.17:3002

      const { keycloakId } = req.params;

      const alternantUrl = process.env.ALTERNANT!;

      //ON VERIFIER DEJA QUE C'EST UN UUID
      if (isUUID(keycloakId)) {
        const response: AxiosResponse<any, any> = await axios.get(
          `${alternantUrl}/alternant/${keycloakId}`
        );

        res.status(200).json(response.data);
        return;
      } else {
        res
          .status(400)
          .json({ message: "L'ID fourni n'est pas un UUID valide." });
      }
      //envoyer un axios a cet url
    } catch (error: any) {
      //404 NON TROUVÉ , CAR C'EST DU AXIOS, ALORS error.response.data //error
      if (error.status == 404) {
        res.status(404).json({ error: error.response.data });
      } else {
        res.status(500).json({ error: "une erreur interne est survernu" });
      }
    }
  }
}
