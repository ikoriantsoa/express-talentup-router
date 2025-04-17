import { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv"; // Charge les variables d'environnement
import Keycloak from "../utils/Keycloak"; // Importe l'instance Keycloak
import { TokenExpiredError } from "jsonwebtoken";

dotenv.config(); // Charge les variables d'environnement à partir du fichier .env

class KeycloakMiddleware {
  private keycloak: Keycloak; // Déclare une instance de Keycloak

  //constructor
  constructor() {
    this.keycloak = new Keycloak(); // Initialise Keycloak

    // Lie les méthodes à l'instance actuelle pour éviter les erreurs de contexte
    this.tokenAuthentification = this.tokenAuthentification.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  // Rafrachir le token
  private async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.headers["x-refresh-token"]; // Récupère le refresh token des headers

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token manquant" });
      return;
    }

    try {
      // Demande un nouveau token avec le refresh token
      const { access_token, refresh_token: newRefreshToken } =
        await this.keycloak.refreshToken(refreshToken as string);

      // Ajoute les nouveaux tokens dans les headers de la réponse
      res.setHeader("X-New-Access-Token", access_token);
      res.setHeader("X-New-Refresh-Token", newRefreshToken);

      // Met à jour le token d'accès dans les headers de la requête
      req.headers["authorization"] = `Bearer ${access_token}`;
      next(); // Passe à la prochaine étape du middleware
    } catch (err) {
      console.error(err);
      res.status(403).json({ message: "Refresh token invalide" });
      return;
    }
  }

  // Méthode publique pour authentifier l'utilisateur avec son token
  public async tokenAuthentification(
    req: Request, //req
    res: Response, //response
    next: NextFunction
  ) {
    //recuperation du Header dans le REq
    const authHeader: string | undefined = req.headers.authorization;

    //Recuperation du token
    const token: string | undefined = authHeader && authHeader.split(" ")[1]; // Extrait le token

    // Verification si le token existe
    if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
      res.status(401).json({ message: `Token manquant ou invalide` });
      return;
    }

    try {
      // DEcodage du token avec l'utilisation de Keycloak.verifyToken() qui se trouve dans utilis/Keycloak
      const decoded = this.keycloak.verifyToken(token);

      // On met dans la response : res.locals.user le token decoder
      res.locals.user = decoded;

      //voir le token decodé
      console.log(res.locals.user);
      // Passe à l'étape suivante
      next();
    } catch (error) {
      // Si le token est expiré, tente de le rafraîchir
      if (error instanceof TokenExpiredError) {
        return this.refreshToken(req, res, next);
      }
      console.error(error);
      res.status(403).json({ message: "Accès refusé" }); // Accès interdit si erreur
      return;
    }
  }

  //Verification de Role de l'user , une sorte d'authentification , prend en parm roles
  public checkRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      //recuperer le roles de l'user dans res.local.user, qui stocke le token decodé
      const userRoles: string[] = res.locals.user?.realm_access?.roles || [];

      // Verifier maintenant si l'user a le role en question en param
      const hasRole = roles.some((role) => userRoles.includes(role));

      if (hasRole) {
        //si ok , alors on passe au next
        next();
      } else {
        //else on lui retourne un message
        res.status(403).json({ message: `Non autorisé: Rôle insuffisant` }); // Accès refusé
        return;
      }
    };
  }
}

export default KeycloakMiddleware; // Exporte la classe pour l'utiliser ailleurs
