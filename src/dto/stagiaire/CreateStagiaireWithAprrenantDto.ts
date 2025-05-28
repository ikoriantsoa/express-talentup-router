import {
  IsUUID,
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
} from "class-validator";

export class CreateTalentAlternantDto {
  @IsUUID()
  @IsNotEmpty()
  keycloakId!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "champ nom obligatoire" })
  nom!: string;

  @IsString()
  @IsNotEmpty({ message: "champ prenom obligatoire" })
  prenom!: string;

  @IsString()
  @IsOptional()
  adresse?: string;

  @IsString()
  @IsNotEmpty({ message: "champ date de naissance obligatoire" })
  date_naissance!: string;

  @IsString()
  @IsNotEmpty({ message: "champ niveau d'etude obligatoire" })
  niveau_etude!: string;

  @IsString()
  @IsOptional()
  specialite?: string;

  @IsString()
  @IsOptional()
  presentation?: string;

  @IsString()
  @IsOptional()
  photo?: string;

  @IsString()
  @IsOptional()
  cv?: string;
}
