import { Request, Response } from "express";
import { plainToClass } from "class-transformer";
import { isUUID, validate } from "class-validator";
import axios, { AxiosResponse } from "axios";
import { CategorieOrTechDto } from "../../dto/alternants/webinaires/categoriesOrTech.dto";
export class CategorieAlternantController {
  //create
  public async createCategorie(req: Request, res: Response) {
    try {
      const categorie = plainToClass(CategorieOrTechDto, req.body);

      // Validation du DTO
      const errors = await validate(categorie);

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

      const alternantUrl = process.env.ALTERNANT!;

      const response: AxiosResponse<any, any> = await axios.post(
        `${alternantUrl}/categories`,
        categorie
      );

      res.status(200).json(response.data);
    } catch (error: any) {
      console.log(error);
      if (error.response.status == 409) {
        res.status(409).json({ error: error.response.data });
      } else {
        res
          .status(500)
          .json({ error: "une erreur interne lors de la creation " });
      }
    }
  }

  //g
  public async getAllCategorie(req: Request, res: Response) {
    try {
      const alternantUrl = process.env.ALTERNANT!;

      const response: AxiosResponse<any, any> = await axios.get(
        `${alternantUrl}/categories`
      );

      res.status(200).json(response.data);
    } catch (error) {
      console.log(error);
      res
        .status(500)
        .json({ error: "une erreur interne lors de la creation " });
    }
  }

  public async getOneCategorie(req: Request, res: Response) {
    try {
      const { id, nom } = req.params;

      if (!id && !nom) {
        res.status(400).json({ error: "Veuillez fournir un id ou un nom." });
        return;
      }

      // Vérifier si id est fourni et valide
      if (id) {
        if (!isUUID(id)) {
          res.status(400).json({ error: "ID invalide." });
          return;
        }
      }

      const alternantUrl = process.env.ALTERNANT!;

      // Construire l'URL en fonction du paramètre fourni
      const url = id
        ? `${alternantUrl}/categories/${id}`
        : `${alternantUrl}/categories?nom=${encodeURIComponent(nom)}`;

      const response: AxiosResponse<any> = await axios.get(url);

      if (response.data) {
        res.status(200).json(response.data);
        return;
      }
    } catch (error: any) {
      if (error.response.status == 404) {
        res.status(404).json({ error: error.message.data });
      } else {
        res.status(500).json({ error: "Une erreur interne s'est produite." });
      }
    }
  }
}
