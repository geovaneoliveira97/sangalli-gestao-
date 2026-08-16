import multer from 'multer';
import { AppError } from '../utils/AppError';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      callback(new AppError('Formato de imagem não suportado. Envie JPG, PNG ou WEBP.'));
      return;
    }
    callback(null, true);
  },
});
