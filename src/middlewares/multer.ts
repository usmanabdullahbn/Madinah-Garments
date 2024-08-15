import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { bucket } from '../utils/firebase.js';


const storage = multer.memoryStorage();
const upload = multer({ storage });

interface MulterFile extends Express.Multer.File {
  firebaseUrl?: string;
}

const uploadToFirebase = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    return next(); // Proceed to the next middleware or controller
  }

  const file = req.file as MulterFile;
  const fileName = `${uuid()}.${file.originalname.split('.').pop()}`;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err: Error) => {
    next(err);
  });

  blobStream.on('finish', async () => {
    // Get the file's public URL with a token
    const [metadata] = await blob.getMetadata();
    const token = metadata.metadata?.token; // Get the token from metadata or set it appropriately
    const firebaseUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media&token=${token}`;

    file.firebaseUrl = firebaseUrl;
    next();
  });

  blobStream.end(file.buffer);
};


export const singleUpload = [upload.single('photo'), uploadToFirebase];
