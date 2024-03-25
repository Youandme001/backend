const express = require("express");
const app = express();
const mysql = require("mysql2");
const router = express.Router();
const cors = require('cors');
const bodyParser = require('body-parser'); 
const logger = require("morgan"); 
require('dotenv').config(); // Load environment variables from .env file
app.use(bodyParser.urlencoded({ extended: true })); 
const errors = require("./middlewares/errors.js");
const multer = require('multer');
const path = require('path');
app.use(cors());

router.use(cors());
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use(logger());
app.use("/produit", require("./routes/produit.routes"));
app.use("/user", require("./routes/user.routes"));
app.use("/commande", require("./routes/commande.routes"));
app.use("/admin", require("./routes/admin.routes"));

app.use(errors.errorHandler);

app.listen(process.env.PORT || 4000, function () {
  console.log("Ready to Go!");
});
