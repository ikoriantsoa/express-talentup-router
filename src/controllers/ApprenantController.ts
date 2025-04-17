import * as dotenv from "dotenv";
dotenv.config();

import axios, { AxiosResponse } from "axios";
import { Request, Response } from "express";
import Keycloak from "../utils/Keycloak";
import { CreateApprenantDto } from "./dto/CreateApprenant.dto";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { MulterConfig } from "../utils/Multer";

class ApprenantController {
  private multerConfig: MulterConfig;

  constructor() {
    this.multerConfig = new MulterConfig();
  }

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
      return;
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
      return;
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
      const {
        nom,
        prenom,
        date_naissance,
        telephone,
        ville,
        niveau_etude,
        specialite,
        presentation,
        linkedin,
        portfolio,
        //objectives,
      } = req.body;

      // if (
      //   !Array.isArray(objectives) ||
      //   !objectives.every((obj) => typeof obj === "string")
      // ) {
      //   res
      //     .status(400)
      //     .json({
      //       error:
      //         '"objectives" doit être un tableau de chaînes de caractères.',
      //     });
      //   return;
      // }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!files || !files.cv || !files.photo) {
        res
          .status(400)
          .json({ message: `Les champs "cv" et "photo" sont requis.` });
        return;
      }

      const cvFile = files.cv[0];
      const photoFile = files.photo[0];

      // Vérification de la taille du cv (<= 2 Mo)
      const cvSizeInMB = cvFile.size / (1024 * 1024);
      if (cvSizeInMB > 2) {
        res.status(400).json({ error: "Le cv ne doit pas dépasser 2 Mo." });
        return;
      }

      // Vérification su le cv est un fichier PDF
      const cvMimeType = cvFile.mimetype;
      if (cvMimeType !== "application/pdf") {
        res.status(400).json({ error: "Le cv doit être un fichier PDF." });
        return;
      }

      const imageMime = ["image/jpg", "image/jpeg", "image/png", "image/gif"];

      // Vérification su le cv est un fichier PDF
      const photoMimeType = photoFile.mimetype;
      if (!imageMime.includes(photoMimeType)) {
        res.status(400).json({ error: "La photo doit être un fichier image." });
        return;
      }

      // Vérification de la taille de la photo  (<= 2 Mo)
      const photoSizeInMB = photoFile.size / (1024 * 1024);
      if (photoSizeInMB > 2) {
        res.status(400).json({ error: "La photo ne doit pas dépasser 2 Mo." });
        return;
      }

      // ***extraire le token et recuperer le body
      const keycloak: Keycloak = new Keycloak();
      const keycloakId = keycloak.extractIdToken(token);

      // Conversion des données en instance de DTO
      const createApprenantDto: CreateApprenantDto = plainToInstance(
        CreateApprenantDto,
        req.body
      );

      // Validation des données
      const errors = await validate(createApprenantDto);
      if (errors.length > 0) {
        res.status(400).json({ message: `Données invalides ${errors}` });
      }

      //extraire les info
      const apprenant = {
        keycloakId: keycloakId,
        nom: nom,
        prenom: prenom,
        date_naissance: date_naissance,
        telephone: telephone,
        ville: ville,
        niveau_etude: niveau_etude,
        specialite: specialite,
        presentation: presentation,
        linkedin: linkedin,
        portfolio: portfolio,
        //objectives: objectives,
        cv: cvFile.path,
        photo: photoFile.path,
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
