import { IsNotEmpty, IsString } from "class-validator";

export class CategorieOrTechDto {
  @IsString()
  @IsNotEmpty({ message: "le nom ne doit pas etre null" })
  nom!: string;
}
