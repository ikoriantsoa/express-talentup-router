import e, { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";
import axios, { AxiosResponse } from "axios";
import { plainToClass } from "class-transformer";
import { validate } from "class-validator";
import { IsValideSireneDto } from "../dto/entreprises/isValideSirene.dto";
import { CreateEntrepriseDto } from "../dto/entreprises/CreateEntrepriseDto";

export class EntrepriseController {
  // ***************create entreprise l'bojectif c'ets de prendre dans le token les info  ****************

  //sirene valide
  public async isEntrepriseSireneValide(req: Request, res: Response) {
    // console.log(req.params)
    try {
      //recuperation du numero sirene
      const { sirene_entreprise } = req.params;

      // On crée un objet à valider (important pour class-validator)
      const sireneDto = plainToClass(IsValideSireneDto, { sirene_entreprise });

      // Validation du DTO
      const errors = await validate(sireneDto);

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

      //envoyer vers la micro-service
      const entrepriseUrl = process.env.ENTREPRISE!;

      const response: AxiosResponse<any, any> = await axios.post(
        `${entrepriseUrl}/sirene/${sireneDto.sirene_entreprise}`,
        {}
      );

      //affichage des info
      res.status(200).json(response.data);

      //recuperation des datas
    } catch (error: any) {
      if (error.status == 404) {
        res.status(404).json({ error: "sirene non trouvé" });
      } else {
        res
          .status(500)
          .json({ error: "erreur interne lors de la vérification SIRENE" });
      }

      return;
    }
  }

  //create Entreprise
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

      const info_verifie = plainToClass(CreateEntrepriseDto, {
        linkedin: req.body.linkedin,
        site_web: req.body.site_web,
        telephone: req.body.telephone,
        nom_contact: req.body.nom_contact,
        fonction_contact: req.body.fonction_contact,
      });

      // 2)-  verification des errers dto
      const errors = await validate(info_verifie);

      //3- il y a des errurs ?
      if (errors.length > 0) {
        // Personnalise l'err
        const formattedErrors = errors.flatMap((error) =>
          Object.entries(error.constraints || {}).map(
            ([property, message]) => ({
              [error.property]: message,
            })
          )
        );

        res.status(400).json(formattedErrors);

        return;
      }

      //reformatage des data avant d'envoyer

      let entreprise = {
        keycloakId: keycloakId,
        email: keycloak.extractEmail(token),
        linkedin: info_verifie.linkedin,
        site_web: info_verifie.site_web,
        telephone: info_verifie.telephone,
        nom_contact: info_verifie.nom_contact,
        fonction_contact: info_verifie.fonction_contact,

        nom_entreprise: req.body.nom_entreprise,
        adresse_entreprise: req.body.adresse_entreprise,
        sirene_entreprise: req.body.sirene_entreprise,

        siret_entreprise: req.body.siret_entreprise,
        nic_entreprise: req.body.nic_entreprise,

        forme_juridique: req.body.forme_juridique,
        activite_entreprise: req.body.activite_entreprise,
        taille_entreprise: req.body.taille_entreprise,
        effectifs_entreprise: req.body.effectifs_entreprise,
        date_creation_entreprise: req.body.date_creation_entreprise,

        etat_administratif_entreprise: req.body.etat_administratif_entreprise,
      };

      if (entreprise.linkedin == undefined || entreprise.linkedin == null) {
        entreprise.linkedin = "non definie";
      }
      if (entreprise.site_web == undefined || entreprise.site_web == null) {
        entreprise.site_web = "non definie";
      }

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
      //si le micor_service envoye des err et des messages d'err autre que 500
      if (error.response) {
        res.status(error.response.status).json(error.response.data);
      } else {
        res
          .status(500)
          .json({
            error: "une erreur interne , lors de la creation d'une entreprise ",
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
        `${entrepriseUrl}/entreprise/${keycloakId}`,
        {}
      );

      res.status(204).json(response);
    } catch (error: any) {
      if (error.status == 404) {
        res.status(404).json({
          error: "utilisateur non trouvé dans keycloak avec ce keycloakId",
        });
      } else {
        res.status(500).json({
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
    } catch (error: any) {
      if (error.status == 404) {
        res.status(404);
        res.json({ error: "entreprise non trouvé" });
      } else {
        res.status(500);
        res.json({ error: "error interne du server" });
      }
    }
  }
}
