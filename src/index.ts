import * as dotenv from "dotenv";
dotenv.config();


import path from "path"; //module qui permet de gerer rapidement les chemins des file 
import app from './App';

const env: string = process.env.NODE_ENV || 'development'; //recuperation de l'env si elle n'est pas definie alors en prend le mode dev

const envPath: string = path.resolve(process.cwd(), `.env.${env}`);

dotenv.config({path: envPath});

const port: number = Number(process.env.PORT);
app.listen(port, () => {
    console.log(`talentup-router est démarrée sur le port: ${port}`);
});
