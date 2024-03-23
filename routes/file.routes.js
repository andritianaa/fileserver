const { Router } = require("express");
const { Request, Response } = require("express");
const multer = require("multer");
const sharp = require("sharp");
const { ErrorHandler } = require("../utils/error");

const FileRouter = Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, "public/") },
  filename: function (req, file, cb) {
    const timestamp = new Date().getTime();
    cb(null, `${timestamp}-${Math.floor(Math.random() * (1000 - 20000000)) + 1000}`);
  },
});

const fileUpload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype == "image/png" ||
      file.mimetype == "image/jpg" ||
      file.mimetype == "image/jpeg"
    ) {
      cb(null, true);
    } else {
      cb(null, false);
      return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
    }
  },
});

FileRouter.post("/", fileUpload.array("images", 30), async function (req, res) {
  try {
    if (!req.files || req.files.length === 0) throw new ErrorHandler("Vous n'avez pas envoyé d'image", 400, new Error('No image to upload'));
    const uploadedFiles = [];
    for (const file of req.files) {
      const { path } = file;
      await sharp(path)
        .resize({ width: 600 })
        .toFile(`public/trtn${file.filename}`);
      uploadedFiles.push(`trtn${file.filename}`);
    }
    res.send(uploadedFiles);
  } catch (err) {
    if (err instanceof ErrorHandler) throw err;
    else throw new ErrorHandler("Impossible de télécharger vos images, nous y travaillons", 500, err);
  }
});

module.exports = { FileRouter };
