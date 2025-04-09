import axios, { AxiosResponse } from "axios";
import jwt from "jsonwebtoken";

class Keycloak {
  //recuperation du token admin
  private async getAdminAccesToken(): Promise<any> {
    try {
      //on a besoin du clientId et clientSecret
      const clientId = process.env.CLIENT_ID!;
      const clientSecret = process.env.CLIENT_SECRET!;

      //elle retourne le token
      const response: AxiosResponse<any, any> = await axios.post(
        `${process.env.BASE_URL}/realms/${process.env.REALM}/protocol/openid-connect/token`,
        new URLSearchParams({
          grant_type: "client_credentials",
          client_id: clientId,
          client_secret: clientSecret,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      console.log(response.data.access_token); //voir le token admin
      return response.data.access_token;
    } catch (error) {
      console.error(error);
      throw new Error(`Impossible de récupérer le token admin`);
    }
  }

  //axios client
  private async getAxiosClient() {
    //getAdminAccesToken , elle a le token
    const accessToken = await this.getAdminAccesToken();
    return axios.create({
      baseURL: `${process.env.BASE_URL}/admin/realms/${process.env.REALM}`,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });
  }

  //verification du token a l'aide du cle public
  public verifyToken(token: string) {
    try {
      const publicKey: string = `${process.env.PUBLIC_KEY}`;
      const decoded = jwt.verify(token, publicKey, { algorithms: ["RS256"] });

      if (typeof decoded === "string") {
        throw new Error("Invalid token format: expected a payload object");
      }

      return decoded;
    } catch (error) {
      console.error(error);
      throw new Error("Token invalide");
    }
  }

  // refresh token admin
  public async refreshToken(refreshToken: string) {
    const tokenUrl: string = `${process.env.BASE_URL}/realms/${process.env.REALM}/protocol/openid-connect/token`;

    const response = await axios.post(
      tokenUrl,
      new URLSearchParams({
        grant_type: "refresh_token",
        client_id: `${process.env.CLIENT_ID}`,
        client_secret: `${process.env.CLIENT_SECRET}`,
        refresh_token: refreshToken,
      }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    return {
      access_token: response.data.access_token,
      refresh_token: response.data.refresh_token,
    };
  }
  //updfate role user
  public async updateUserRoles(
    userId: string,
    rolename: string
  ): Promise<void> {
    try {
      const keycloakClient = await this.getAxiosClient();

      const roleResponse: any = await keycloakClient.get("/roles");
      const roleDisponible: any = roleResponse.data;

      const userRolesResponse: any = await keycloakClient.get(
        `/users/${userId}/role-mappings/realm`
      );
      const roleCourant: any = userRolesResponse.data;

      if (roleCourant && roleCourant.length > 0) {
        const rolesToDelete: any = roleCourant.map((role: any) => ({
          id: role.id,
          name: role.name,
        }));

        await keycloakClient.delete(`/users/${userId}/role-mappings/realm`, {
          data: rolesToDelete,
        });
      }

      const ajoutRole: any = roleDisponible.find(
        (role: any) => role.name === rolename
      );

      if (!ajoutRole) {
        throw new Error(`Le rôle "${rolename}" n'existe pas dans Keycloak`);
      }

      const payload = [
        {
          id: ajoutRole.id,
          name: ajoutRole.name,
        },
      ];

      await keycloakClient.post(
        `/users/${userId}/role-mappings/realm`,
        payload
      );
    } catch (error:any) {

      //gerer si l'user n'existe pas dans keycloak
      if(error.status==404){
        const err:any= new Error("cet user_id est non trouvé dans keycloak")

        error.status
        throw err
      }else{
        //err interne du server ou token manquant
        console.error("Erreur lors de la mise à jour des rôles : ", error);
      throw new Error("Token invalide ou manquant");
      }
    }
  }

  // verification d'user dans keycloak
  public async isUserExiste(userId: string): Promise<boolean> {
    try {
      const keycloakClient = await this.getAxiosClient();
  
      const response = await keycloakClient.get(`/users/${userId}`);
      
      return response.status === 200; // Si le statut est 200, l'user existe
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        return false; // L'utilisateur n'existe pas
      }
      throw new Error(`Une erreur est survenue: ${error.message}`);
    }
  }
  

  // ***************************user extract ************
  //extract idUser
  public extractIdToken(token: string) {
    try {
      const decoded: jwt.JwtPayload = jwt.decode(token) as jwt.JwtPayload;

      if (!decoded || !decoded.sub) {
        throw new Error(`L'id est manquant dans le token`);
      }

      return decoded.sub;
    } catch (error) {
      console.error(`Erreur lors de l'extraction de l'id de l'utilisateur`);
      throw new Error("Token invalide ou manquant");
    }
  }

  //username
  public extractUsername(token: string) {
    try {
      const decoded: jwt.JwtPayload = jwt.decode(token) as jwt.JwtPayload;

      if (!decoded || !decoded.preferred_username) {
        throw new Error(`L'username est manquant dans le token`);
      }

      return decoded.preferred_username;
    } catch (error) {
      console.error(`Erreur lors de l'exécution de l'username`);
      throw new Error("Token invalide ou manquant");
    }
  }

  //email
  public extractEmail(token: string) {
    try {
      const decoded: jwt.JwtPayload = jwt.decode(token) as jwt.JwtPayload;

      if (!decoded || !decoded.email) {
        throw new Error(`L'email est manquant dans le token`);
      }

      return decoded.email;
    } catch (error) {
      console.error(`Erreur lors de l'exécution de l'email`);
      throw new Error("Token invalide ou manquant");
    }
  }
}

export default Keycloak;
