var { Sheet, getCompleted } = require("./models");
var ShareModel = require("./models").Share;
class Share {
  constructor({ email, displayName }) {
    this.email = email;
    this.name = displayName;
    this.roomId = null;
  }
  getOrCreateRoom(bot_email) {
    return this._fetchRecord().then(data => {
      if (data.roomId) {
        return new Promise((resolve, reject) => {
          this.roomId = data.roomId;
          resolve();
        });
      }
      return this._createRoom(data, bot_email);
    });
  }
  _createRoom(data, bot_email) {
    return this.sparkAPI.createRoom(this.name).then(room => {
      data.roomId = room.id;
      data.save();
      this.roomId = room.id;
      return this.sparkAPI.createMembershipToRoom(this.roomId, this.email).catch(err=>console.log(err))
      .then(
        () => this.sparkAPI.createMembershipToRoom(this.roomId, bot_email).catch((error)=> console.log(error)),
        error => {
          console.log(error);
        }
      );
    });
  }
  getMessageFromSheetOwner(bot_email, markdown) {
    return this.getOrCreateRoom(bot_email)
      .then(member => {
        return this.sparkAPI.sendMessageToRoom(this.roomId, markdown);
      })
      .then(() => this);
  }
  _fetchRecord() {
    return new Promise((resolve, reject) => {
      ShareModel.findOrCreate(
        {
          _id: this.email,
          name: this.name
        },
        (err, instance) => {
          if (err) reject(err);
          resolve(instance);
        }
      );
    });
  }
  getSheets(completed = false) {
    return new Promise((resolve, reject) => {
      Sheet.find({ "shares.user": this.email }, (err, sheets) => {
        if (err) reject(err);
        var result = getCompleted(sheets, this.email, completed);
        resolve(result);
      });
    });
  }
}

module.exports = function(share, factory) {
  var instance = new Share(share);
  instance.sparkAPI = factory.sparkAPI;
  return instance;
};
