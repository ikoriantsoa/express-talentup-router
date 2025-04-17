import { IsNotEmpty, IsString } from "class-validator";

class CreateWebinaireDto {
    @IsNotEmpty()
    @IsString()
    titre!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsString()
    categorie!: string;
}

export default CreateWebinaireDto;
