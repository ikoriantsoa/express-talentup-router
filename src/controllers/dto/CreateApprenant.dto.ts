import {
  IsString,
  IsOptional,
  IsISO8601,
  IsArray,
  IsNotEmpty,
} from "class-validator";

export class CreateApprenantDto {
  @IsString()
  @IsNotEmpty()
  nom!: string;

  @IsString()
  @IsNotEmpty()
  prenom!: string;

  @IsISO8601()
  @IsNotEmpty()
  date_naissance!: string;

  @IsString()
  @IsNotEmpty()
  telephone!: string;

  @IsString()
  @IsNotEmpty()
  ville!: string;

  @IsString()
  @IsNotEmpty()
  niveau_etude!: string;

  @IsString()
  @IsNotEmpty()
  specialite!: string;

  @IsString()
  @IsNotEmpty()
  presentation!: string;

  @IsOptional()
  @IsString()
  linkedin?: string;

  @IsOptional()
  @IsString()
  portfolio?: string;

//   @IsArray()
//   @IsString({ each: true })
//   @IsNotEmpty()
//   objectives!: string[];
}
