class SmartSheetAPI {
  constructor(client) {
    this.client = client;
  }
  shareSheet(body, sheetId) {
    var options = {
      body,
      sheetId
    };
    return this.client.shareSheet(options);
  }
  createSheet(name, columns) {
    columns[0].primary = true;
    var sheet = { name, columns };
    var options = {
      body: sheet
    };
    return this.client.createSheet(options);
  }
  getSheet(sheetId) {
    var options = {
      id: sheetId
    };
    return this.client.getSheet(options);
  }
  getSheetShares(sheetId) {
    var options = {
      sheetId
    };

    return this.client.getSheetShares(options);
  }
  getColumns(sheetId) {
    //returns just the list of columns in the sheet
    var options = {
      sheetId
    };
    return this.client.getColumns(options).then(response => response.data);
  }
  populateRows(columns, sheetId) {
    var cells = columns.map(column => ({
      columnId: column.id,
      value: column.response
    }));
    var row = [{ toTop: true, cells }];
    var options = {
      body: row,
      sheetId
    };
    return this.client.addRows(options).then(response => response.result);
  }
}
class SparkAPI {
  constructor(instance) {
    this.ciscoInstance = instance;
  }
  getSparkUser(email) {
    return this.ciscoInstance.getSparkUser(email).then(data => {
      return data.items[0];
    });
  }
  createRoom(title) {
    return this.ciscoInstance.createRoom(title);
  }
  getRooms() {
    return this.ciscoInstance.getRooms().then(rooms => rooms.items);
  }
  getMembership(roomId) {
    return this.ciscoInstance.getMembership(roomId).then(data => data.items);
  }
  createMembershipToRoom(roomId, personEmail) {
    return this.ciscoInstance.createMembershipToRoom(roomId, personEmail);
  }
  sendMessageToRoom(roomId, markdown) {
    return this.ciscoInstance.sendMessageToRoom(roomId, markdown);
  }
}
module.exports = {
  SparkAPI,
  SmartSheetAPI
};
