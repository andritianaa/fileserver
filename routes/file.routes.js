const { Router } = require("express");
const multer = require("multer");
const sharp = require("sharp");

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
    console.log("here");
    if (!req.files || req.files.length === 0) throw new Error("Vous n'avez pas envoyé d'image");
    const uploadedFiles = [];
    for (const file of req.files) {
      const { path } = file;
      await sharp(path)
        .resize({ width: 600 })
        .toFile(`public/trtn${file.filename}.png`);
      uploadedFiles.push(`trtn${file.filename}.png`);
    }
    res.send(uploadedFiles);
  } catch (err) {
    new Error("Impossible de télécharger vos images, nous y travaillons");
  }
});

module.exports = { FileRouter };
