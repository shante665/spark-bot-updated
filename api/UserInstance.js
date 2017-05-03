var UserModel = require("./models").User;
var apiFactory = require("./api");
var sparkAPI = apiFactory.SparkAPIFactory();
var singleInstanceFactory = require("./SingleSheetInstance").singleSheetFactory;
var Share = require("./ShareInstance");

class User {
  constructor(email) {
    this.email = email;
    this.access_token = "";
    this.sheet = null;
    this.rooms = [];
    this.sheets = [];
    this.share = Share({ email }, { sparkAPI: this.sparkAPI });
  }

  getAllSheetSharedAndInitialize() {
    //this function get all the sheets that has been
    //shared to a user and initializes them.
    this.sheets = [];
    return this.share.getSheets().then(sheets => {
      var resolved = sheets.map(sheet => {
        var instnce = singleInstanceFactory(sheet, {});
        var owner = UserFactory(instnce.user, {
          sparkAPI: this.sparkAPI,
          smartSheetAPI: this.smartSheetAPI
        });
        return owner._populateFromDb(false).then(() => {
          const { smartSheetAPI, sparkAPI } = owner._createSheetAPIFactory();
          instnce.smartSheetAPI = smartSheetAPI;
          console.log(instnce)
          // instnce.sparkAPI = sparkAPI;
          return instnce.initializeSheet().then(() => {
            this.sheets.push(instnce);
            return instnce;
          });
        });
      });
      return Promise.all(resolved);
    });
  }

  getUncompletedSheet() {
    return this.sheets.filter(x => x.completed === false);
  }
  populateRowsInSheet(sheetIndex) {
    return this.sheets[sheetIndex];
  }
  completeSheetFilling(sheetIndex) {
    var sheet = this.sheets[sheetIndex];
    return sheet.completedSheet(this.email);
  }
  completedAllSheetFilling() {
    var promise = this.sheets.map((sheet, index) =>
      sheet.completedSheet(this.email));
    return Promise.all(promise);
  }
  inputAccessToken(access_token) {
    return new Promise((resolve, reject) => {
      UserModel.findOrCreate(
        {
          _id: this.email
        },
        (err, instance) => {
          if (err) reject(err);
          instance.access_token = access_token;
          instance.save(err => {
            if (err) reject(err);
            this.access_token = access_token;
            this._getSheetInstance();
            resolve(instance);
          });
        }
      );
    });
  }
  verifyAccessToken() {}
  _populateFromDb(getSheet = true) {
    return new Promise((resolve, reject) => {
      UserModel.findOrCreate({ _id: this.email }, (err, instance) => {
        if (err) reject(err);
        this.access_token = instance.access_token.trim() || "";
        console.log(this.access_token)
        if (getSheet) {
          this._getSheetInstance();
        }
        resolve();
      });
    });
  }
  _getSheetInstance(sheet = {}) {
    console.log(this.sheet)
    if (this.sheet) return this.sheet;
    this.sheet = singleInstanceFactory(sheet, {});
    this.updateCredentials();
    console.log(this.sheet.smartSheetAPI)
    return this.sheet;
  }
  updateCredentials() {
    this.sheet.smartSheetAPI = this.smartSheetAPI;
    this.sheet.sparkAPI = this.sparkAPI;
    if (!!this.sheet.smartSheetAPI === false) {
      this.sheet.smartSheetAPI = apiFactory.SheetAPIFactory(this.access_token);
    }
  }
  createSheet() {
    //Must have populated the name of the sheet and the
    //columns before calling this method
    this.updateCredentials();
    return this.sheet.createSheet();
  }
  _createSheetAPIFactory() {
    return {
      smartSheetAPI: this.smartSheetAPI ||
        apiFactory.SheetAPIFactory(this.access_token),
      sparkAPI: this.sparkAPI
    };
  }
  getRooms() {
    return this.sparkAPI.getRooms().then(rooms => {
      this.rooms = rooms;
      return rooms;
    });
  }
  getMembersInRoom(roomIndex) {
    //Check to ensure the users inputs the right index
    var selectedRoom = this.rooms[roomIndex];
    return this.sparkAPI.getMembership(roomIndex.id);
  }
  getRoomMembers(roomId) {
    return this.sparkAPI.getMembership(roomId).then(x => {
      console.log(x);
      return x;
    });
  }
  getUserDetails() {
    return this.sparkAPI.getSparkUser(this.email);
  }
  notifyShares(
    usersToBeNotified,
    bot_email,
    markdown = "**hello world**",
    condition
  ) {
    //usersToBeNotified is the result from getMembersInRoom
    return this.sheet
      .notifyShares(usersToBeNotified, bot_email, markdown, condition)
      .then(data => this.sheet.addToDatabase(data, this.email));
  }
  shareSheetToRoom(roomId, bot_email, markdown, condition) {
    return this.getRoomMembers(roomId).then(members =>
      this.notifyShares(members, bot_email, markdown, condition));
  }
}
function UserFactory(email, factory) {
  var new_factory = factory;
  if (!!factory === false) {
    new_factory = { sparkAPI };
  }
  var instance = new User(email);
  instance.sparkAPI = new_factory.sparkAPI;
  instance.smartSheetAPI = new_factory.smartSheetAPI;
  return instance;
}
//this factory is useful for testing purposes.
module.exports = UserFactory;
