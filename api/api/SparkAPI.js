var axios = require("axios");
var cisco = require("ciscospark");
var smartsheet = require("smartsheet");
var { SmartSheetAPI, SparkAPI } = require("./SparkAndSmartSheetAPI");

class API {
  constructor(token) {
    this.token = token.trim();
    this.client = smartsheet.createClient({
      accessToken: token.trim()
    });
  }
  shareSheet(options) {
    return this.client.sheets.share(options);
  }
  createSheet(options) {
    return this.client.sheets.createSheet(options);
  }
  getSheet(options) {
    return this.client.sheets.getSheet(options);
  }
  getColumns(options) {
    return this.client.sheets.getColumns(options);
  }
  addRows(options) {
    return this.client.sheets.addRows(options);
  }
}

class SparkAPICall {
  constructor(token) {
    this.token = token;
    this.ciscoInstance = axios.create({
      baseURL: "https://api.ciscospark.com/v1",
      headers: {
        Authorization: "Bearer " + token
      }
    });
  }
  getSparkUser(email) {
    return this.ciscoInstance.get("/people?email=" + email).then(data => {
      return data.data;
    });
  }
  getRooms(type="group") {
    return this.ciscoInstance.get(`/rooms?type=${type}`).then(data => data.data);
  }
  getMembership(roomId) {
    console.log(roomId);
    return this.ciscoInstance
      .get("/memberships?roomId=" + roomId)
      .then(data => {
        return data.data;
      });
  }
  createRoom(title) {
    return cisco.rooms.create({ title });
  }
  createMembershipToRoom(roomId, personEmail) {
    return cisco.memberships.create({ roomId, personEmail });
  }
  sendMessageToRoom(roomId, markdown) {
    return cisco.messages.create({ markdown, roomId });
  }
}

module.exports = {
  API,
  SparkAPICall
};
