import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { NextFunction, Request, Response } from "express";

const validateDto = (dtoClass: any) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        const dtoObject = plainToInstance(dtoClass, req.body);
        const errors = await validate(dtoObject);

        if (errors.length > 0) {
            res.status(400).json({
                message: 'Validation DTO échouée',
                errors: errors.map(err => ({
                    property: err.property,
                    constraints: err.constraints,
                })),
            });
            return;
        }
        req.body = dtoObject;
        next();
    }
};

export default validateDto;
