import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  ValidateIf,
} from "class-validator";

export class CreateEntrepriseDto {
  @IsOptional()
  @Matches(/^https:\/\/(www\.)?linkedin\.com\/[^\s]*$/, {
    message: "L'URL LinkedIn n'est pas valide.",
  })
  linkedin!: string;

  @IsOptional()
  @Matches(/^https?:\/\/[^\s$.?#].[^\s]*$/, {
    message: "L'URL du site web n'est pas valide.",
  })
  site_web!: string;

  @IsString()
  @IsNotEmpty({ message: "Le numéro de téléphone est requis." })
  telephone!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom du contact est requis." })
  @Length(2, 200, {
    message: "Le nom du contact doit contenir entre 10 et 200 caractères ",
  })
  nom_contact!: string;

  @IsString()
  @IsNotEmpty()
  @Length(2, 200, {
    message: "La fonction  doit contenir entre 10 et 200 caractères ",
  })
  fonction_contact!: string;
}
