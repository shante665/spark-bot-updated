var mongoose = require("mongoose");
var findOrCreate = require("./lib");

var Schema = mongoose.Schema;
var userSchema = new Schema({
  _id: String,
  access_token: String
});
var shareSchema = new Schema({
  _id: String,
  name: String,
  roomId: String
});
var sheetSchema = new Schema({
  user: { type: String, ref: "User" },
  sheetId: String,
  name: String,
  shares: [{ user: { type: String, ref: "Share" }, completed: Boolean }]
});

sheetSchema.plugin(findOrCreate);
userSchema.plugin(findOrCreate);
shareSchema.plugin(findOrCreate);
var User = mongoose.model("User", userSchema);
var Share = mongoose.model("Share", shareSchema);
var Sheet = mongoose.model("Sheet", sheetSchema);

const difference = (oldEmails, newEmails) => {
  var bigger = newEmails.length > oldEmails.length ? newEmails : oldEmails;
  var smaller = newEmails.length > oldEmails.length ? oldEmails : newEmails;
  return [...new Set([...bigger].filter(x => !new Set(smaller).has(x)))];
};
function getCompleted(sheets, email, flag) {
  return sheets.filter(sheet => {
    var i = sheet.shares.find(y => y.user === email && y.completed === flag);
    return !!i;
  });
}

module.exports = { Sheet, difference, User, Share, getCompleted };
