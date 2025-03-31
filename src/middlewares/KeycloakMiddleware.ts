import { NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import Keycloak from "../utils/Keycloak";

dotenv.config();

class KeycloakMiddleware {
  private keycloak: Keycloak;

  constructor() {
    this.keycloak = new Keycloak();
    this.tokenAuthentification = this.tokenAuthentification.bind(this);
    this.refreshToken = this.refreshToken.bind(this);
  }

  private async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.headers["x-refresh-token"];

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token manquant" });
      return;
    }

    try {
      const { access_token, refresh_token: newRefreshToken } =
        await this.keycloak.refreshToken(refreshToken as string);

      res.setHeader("X-New-Access-Token", access_token);
      res.setHeader("X-New-Refresh-Token", newRefreshToken);

      req.headers["authorization"] = `Bearer ${access_token}`;
      next();
    } catch (err) {
      console.error(err);
      res.status(403).json({ message: "Refresh token invalide" });
      return;
    }
  }

  public async tokenAuthentification(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const authHeader: string | undefined = req.headers.authorization;
    const token: string | undefined = authHeader && authHeader.split(" ")[1];

    if (!authHeader || !authHeader.startsWith("Bearer ") || !token) {
      res.status(401).json({ message: `Token manquant ou invalide` });
      return;
    }

    try {
      const decoded = this.keycloak.verifyToken(token);

      res.locals.user = decoded;

      next();
    } catch (error) {
      if ((error as Error).message === "TokenExpiredError") {
        return this.refreshToken(req, res, next);
      }
      console.error(error);
      res.sendStatus(403).send("Accès refusé");
      return;
    }
  }

  public checkRole(roles: string[]) {
    return (req: Request, res: Response, next: NextFunction) => {
      const userRoles: string[] = res.locals.user?.realm_access?.roles || [];

      const hasRole = roles.some((role) => userRoles.includes(role));

      if (hasRole) {
        next();
      } else {
        res.status(403).json({ message: `Non autorisé: Rôle insuffisant` });
      }
    };
  }
}

export default KeycloakMiddleware;
