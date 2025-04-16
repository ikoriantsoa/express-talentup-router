import { IsNotEmpty, Length, Matches } from "class-validator";

export class IsValideSireneDto {
  @IsNotEmpty({ message: "Le numéro SIRENE est requis" })
  @Length(9, 9, { message: "Le numéro SIRENE doit contenir exactement 9 chiffres" })
  @Matches(/^\d+$/, { message: "Le numéro SIRENE doit contenir uniquement des chiffres" })
  sirene_entreprise!: string;
}
