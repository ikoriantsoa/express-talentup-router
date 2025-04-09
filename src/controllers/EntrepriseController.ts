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
      const {
        nom_entreprise,
        numero_siret,
        secteur_activite,
        collaborateurs,
        adresse,
        telephone,
        site_web,
        linkedin,
        nom_contact,
        fonction_contact,
        description_entreprise,
      } = req.body;

      //mettre les info dans un objet
      let entreprise = {
        keycloakId,
        email: keycloak.extractEmail(token),
        nom_entreprise,
        numero_siret,
        secteur_activite,
        collaborateurs,
        adresse,
        telephone,
        site_web,
        linkedin,
        nom_contact,
        fonction_contact,
        description_entreprise,
        logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-nuBzsGwqhxuMohWpYeHlzozjgdgH-rquGw&s",
      };

      if (entreprise.linkedin == "") {
        entreprise.linkedin = undefined;
      }
      if (entreprise.site_web == "") {
        entreprise.site_web = undefined;
      }

      console.log(entreprise);

      //envoyer vers la micro-service
      const entrepriseUrl = process.env.ENTREPRISE!;

      const response: AxiosResponse<any, any> = await axios.post(
        `${entrepriseUrl}/createEntreprise`,
        { entreprise }
      );

      // Mise à jour du rôle entreprise
      keycloak.updateUserRoles(keycloakId, "en_attente_entreprise");

      res.status(201).json(response.data);

      return;
    } catch (error: any) {
      //si le micro-service renvoye des errer, alors on l'affiche au frontend
      if (error.response) {
        // console.log(error.response)
        res.status(400).json(error.response.data);
      } else {
        //error non definie

        res.status(500).json({
          message: `API- erreur lors de la creation d'une entreprise: ${error}`,
        });
      }

      return;
    }
  }

  // *****************************update entreprise role
  public async updateEntreprise(req: Request, res: Response) {
    try {
      //recuperation du keycloakId
      const { keycloakId } = req.params;

      //je change le role dans keycloak
      const keycloak = new Keycloak();

      keycloak.updateUserRoles(keycloakId, "entreprise");

      //je change le role dans le bdd
      const entrepriseUrl = process.env.ENTREPRISE!;

      //change role
      const response: AxiosResponse<any, any> = await axios.put(
        `${entrepriseUrl}/entreprise/${keycloakId}`
      );

      res.status(204).json(response);
    } catch (error: any) {
      if (error.status == 404) {
        res
          .status(404)
          .json({
            error: "utilisateur non trouvé dans keycloak avec ce keycloakId",
          });
      } else {
        res
          .status(500)
          .json({
            error:
              "Erreur interne dans le serveur , lors de la mise a jour entreprise",
          });
      }
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
