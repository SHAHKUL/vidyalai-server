const mongoose = require("mongoose");
const Schema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  file: {
    type: String,
    required: true,
  },

  created: {
    type: String,
    required: true,
  },
});

const PDF = mongoose.model("datas", Schema);
module.exports = PDF;
