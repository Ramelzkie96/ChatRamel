import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

export const UPLOAD_ROOT = path.resolve("uploads");
const COVERS_DIR = path.join(UPLOAD_ROOT, "covers");
const MESSAGES_DIR = path.join(UPLOAD_ROOT, "messages");
const FILES_DIR = path.join(UPLOAD_ROOT, "files");
const AVATARS_DIR = path.join(UPLOAD_ROOT, "avatars");

[COVERS_DIR, MESSAGES_DIR, FILES_DIR, AVATARS_DIR].forEach((dir) =>
  fs.mkdirSync(dir, { recursive: true })
);

/* ---------- images ---------- */

// SVG is left out on purpose: an SVG file can carry scripts
const IMAGE_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

/* ---------- documents ---------- */

const DOC_EXTENSIONS = new Set([
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv", ".zip",
]);

const DOC_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "application/csv",
  "application/zip",
  "application/x-zip-compressed",
]);

const docExtension = (file) => path.extname(file.originalname || "").toLowerCase();

// both the extension AND the reported type must be on the list
const isAllowedDoc = (file) => DOC_EXTENSIONS.has(docExtension(file)) && DOC_MIMES.has(file.mimetype);

/* ---------- builder ---------- */

// builds a middleware that accepts one file in `field` and saves it to `dir`
const makeUploader = ({ dir, field, maxBytes, sizeMessage, isAllowed, rejectMessage, extensionFor }) => {
  const upload = multer({
    storage: multer.diskStorage({
      destination: (req, file, cb) => cb(null, dir),
      // random name, so nobody can overwrite or guess another file
      filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${extensionFor(file)}`),
    }),
    fileFilter: (req, file, cb) => (isAllowed(file) ? cb(null, true) : cb(new Error(rejectMessage))),
    limits: { fileSize: maxBytes, files: 1 },
  }).single(field);

  // multer errors go through our JSON error handler as 400s
  return (req, res, next) => {
    upload(req, res, (err) => {
      if (!err) return next();

      res.status(400);
      if (err.code === "LIMIT_FILE_SIZE") return next(new Error(sizeMessage));
      next(err);
    });
  };
};

const imageRules = {
  isAllowed: (file) => Boolean(IMAGE_EXT[file.mimetype]),
  rejectMessage: "Only JPG, PNG, WEBP or GIF images are allowed.",
  extensionFor: (file) => IMAGE_EXT[file.mimetype],
};

export const uploadCover = makeUploader({
  ...imageRules,
  dir: COVERS_DIR,
  field: "cover",
  maxBytes: 2 * 1024 * 1024,
  sizeMessage: "Image is too large (2 MB max).",
});

export const uploadAvatar = makeUploader({
  ...imageRules,
  dir: AVATARS_DIR,
  field: "avatar",
  maxBytes: 2 * 1024 * 1024,
  sizeMessage: "Image is too large (2 MB max).",
});

export const uploadMessageImage = makeUploader({
  ...imageRules,
  dir: MESSAGES_DIR,
  field: "image",
  maxBytes: 5 * 1024 * 1024,
  sizeMessage: "Image is too large (5 MB max).",
});

export const uploadMessageFile = makeUploader({
  dir: FILES_DIR,
  field: "file",
  maxBytes: 10 * 1024 * 1024,
  sizeMessage: "File is too large (10 MB max).",
  isAllowed: isAllowedDoc,
  rejectMessage: "Only PDF, Word, Excel, PowerPoint, TXT, CSV or ZIP files are allowed.",
  extensionFor: docExtension,
});