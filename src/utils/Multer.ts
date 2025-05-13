import { NextFunction } from 'express';
import multer from 'multer';
import path from 'path';

export class MulterConfig {
  public storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, '/home/mgit/mgit-workspace/mgit-talentup/serveur-fichier/assets');
    },
    filename: (req, file, cb) => {
      const fieldname = file.fieldname;
      const ext = path.extname(file.originalname);
      cb(null, `${fieldname}-${Date.now()}${ext}`);
    },
  });

  public upload = multer({ storage: this.storage });

}
