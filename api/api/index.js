var { SparkAPICall, API } = require("./SparkAPI");
var { SparkAPI, SmartSheetAPI } = require("./SparkAndSmartSheetAPI");

exports.SparkAPIFactory = function SparkAPIFactory(token) {
  var tk = token || process.env.access_token;
  return new SparkAPI(new SparkAPICall(tk));
};
exports.SheetAPIFactory = function SheetAPIFactory(token) {
  return new SmartSheetAPI(new API(token));
};

