import { ArrayNotEmpty, IsArray, IsString } from "class-validator";

export default class KeycloakIDsDto {
  @IsArray({ message: "array string obligatoire" })
  @ArrayNotEmpty({ message: "array string obligatoire" })
  @IsString({ each: true, message: "array string obligatoire" })
  keycloakIDs!: string[];
}
