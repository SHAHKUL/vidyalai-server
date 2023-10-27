require("dotenv").config();

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const bcryptjs = require("bcryptjs");

const jwt = require("jsonwebtoken");
const User = require("./model/user");
const PDF = require("./model/PDF");

app.use(express.json());
app.use(cors());

mongoose.connect(process.env.URL);

function authentication(req, res, next) {
  if (req.headers.auth) {
    let decode = jwt.verify(req.headers.auth, process.env.key);
    if (decode) {
      req.val = decode.id;
      next();
    } else {
      res.status(404).json({ message: "it is not crt token" });
    }
  } else {
    res.status(404).json({ message: "UNUAUTHORIZED" });
  }
}

app.get("/register", async (req, res) => {
  try {
    const data = await User.find();
    res.json(data);
  } catch (error) {
    res.json({ message: "could't not get data" });
  }
});

app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const salt = bcryptjs.genSaltSync(1);
    const hash = bcryptjs.hashSync(password, salt);

    const data = await User.create({ name, email, password: hash });
    res.status(201).json(data);
  } catch (error) {
    res.json({ message: "could't not register data" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user) {
      const compare = bcryptjs.compareSync(password, user.password);
      if (compare) {
        var sign = jwt.sign(
          { id: user._id, name: user.name },
          process.env.key,
          {
            expiresIn: "24h",
          }
        );

        res.json({ token: sign });
      } else {
        res.json({ message: "the password is not matched" });
      }
    } else {
      res.json({ message: "there is no registered data" });
    }
  } catch (error) {}
});

///////////////////////////////////////////data////////////////////////////
const multer = require("multer");
const Extract = require("./model/extract");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  limits: { fieldSize: 25 * 1024 * 1024 },
});

app.get("/get", authentication, upload.single("file"), async (req, res) => {
  try {
    const data = await PDF.find({ created: req.val });
    res.send(data);
  } catch (error) {}
});

app.get("/get/:id", authentication, async (req, res) => {
  const { id } = req.params;

  try {
    const data = await PDF.findById({ _id: id });
    res.json(data);
  } catch (error) {}
});

app.post("/create", authentication, upload.single("file"), async (req, res) => {
  const name = req.body.name;
  const file = req.body.files;

  try {
    const data = await PDF.create({ name, file, created: req.val });
    res.json(data);
  } catch (error) {}
});

app.delete("/delete/:id", authentication, async (req, res) => {
  const { id } = req.params;
  try {
    const data = await PDF.findByIdAndDelete({ _id: id });
    res.json(data);
  } catch (error) {}
});

//////////////////////////////////extract////////////////////////

app.get("/extract", authentication, upload.single("file"), async (req, res) => {
  try {
    const data = await Extract.find({ created: req.val });
    res.json(data);
  } catch (error) {
    res.json({ message: "coul'd get the data" });
  }
});
app.get(
  "/extract/:id",
  authentication,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Extract.find({ _id: id });
      res.json(data);
    } catch (error) {
      res.json({ message: "coul'd get the data" });
    }
  }
);

app.post(
  "/extract",
  authentication,
  upload.single("file"),
  async (req, res) => {
    const { name, file } = req.body;
    try {
      const data = await Extract.create({ name, file, created: req.val });
      res.json(data);
    } catch (error) {
      res.json({ message: "coul'd get the data" });
    }
  }
);

app.delete(
  "/extract/delete/:id",
  authentication,
  upload.single("file"),
  async (req, res) => {
    const { id } = req.params;
    try {
      const data = await Extract.findByIdAndDelete({ _id: id });
      res.json(data);
    } catch (error) {
      res.json({ message: "coul'd get the data" });
    }
  }
);

app.listen(process.env.PORT, () => {
  console.log("server connected");
});
