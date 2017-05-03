var { SheetAPIFactory } = require("./api");
var { Sheet, User } = require("./models");
var SingleShare = require("./ShareInstance");
class SingleSheetInstance {
  constructor(sheet, factory) {
    this.url = "";
    this.sheetId = sheet.sheetId || null;
    this.shares = sheet.shares || [];
    this.name = sheet.name || "";
    this.user = sheet.user || "";
    this.user_details = {};
    this.completed = false;
    this.columns = [];
  }
  createSheet() {
    return this.smartSheetAPI
      .createSheet(this.name, this.columns)
      .then(data => {
        this.sheetId = data.result.id;
        this.url = data.result.permalink;
        return {
          sheetId: this.sheetId,
          url: this.url,
          name: data.result.name
        };
      });
  }
  populateColumn(title) {
    this.columns.push({
      title,
      type: "TEXT_NUMBER"
    });
  }
  _getColumns() {
    console.log(this.sheetId)
    console.log(this.name)
    return this.smartSheetAPI.getColumns(this.sheetId).then(list => {
      this.columns = list;
    },err=>{console.log(err); return err;});
  }
  _shareSheet(emails) {
    var shares = emails.map(email => ({ email, accessLevel: "EDITOR" }));
    return this.smartSheetAPI.shareSheet(shares, this.sheetId);
  }
  notifyShares(users, bot_email, markdown, condition) {
    var defaultCondition = user => {
      var is_cisco = user.email.split("@cisco.com");
      return is_cisco.length > 1;
    };
    var new_condition = condition || defaultCondition;
    var response = users
      .map(user => {
        return { displayName: user.personDisplayName, email: user.personEmail };
      })
      .filter(user => new_condition(user))
      .filter(user => user.email !== "spark-cisco-it-admin-bot@cisco.com");
    return this._shareSheet(response.map(x => x.email)).then(() => {
      return Promise.all(
        response.map(x => {
          var shareInstance = SingleShare(x, { sparkAPI: this.sparkAPI });
          return shareInstance.getMessageFromSheetOwner(bot_email, markdown);
        })
      );
    });
  }
  _populateRows(columnIndex, response) {
    var column = this.columns[columnIndex];
    column.response = response;
    this.columns[columnIndex] = column;
  }
  _populateAllRows() {
    return this.smartSheetAPI.populateRows(this.columns, this.sheetId);
  }
  completedSheet(email) {
    var shareIndex = this.shares.findIndex(share => share.user == email);
    var share = this.shares[shareIndex];
    share.completed = true;
    this.shares[shareIndex] = share;
    return new Promise((resolve, reject) => {
      Sheet.findOneAndUpdate(
        { sheetId: this.sheetId },
        {
          shares: this.shares
        },
        (err, result) => {
          if (err) reject(err);
          this.completed = true;
          resolve(this);
        }
      );
    });
  }
  populateDetailInSheet(answers) {
    this.columns.forEach((column, index) => {
      this._populateRows(index, answers[index]);
    });
    return this._populateAllRows();
  }
  _getUseDetails() {
    return new Promise((resolve, reject) => {
      if (this.user) {
        User.findOrCreate({ _id: this.user }, (err, instance) => {
          this.user_details = instance;
          this.smartSheetAPI = this.smartSheetAPI ||
            SheetAPIFactory(instance.access_token.trim());
          resolve(this);
        });
      } else {
        console.log(this.user);
        reject("Could not find user");
      }
    });
  }
  initializeSheet() {
    return this._getUseDetails().then(() => {
      return this._getColumns();
    });
  }
  addToDatabase(shares, email) {
    var promise = new Promise((resolve, reject) => {
      Sheet.findOrCreate({ sheetId: this.sheetId }, (err, instance) => {
        if (err) reject(err);
        var new_shares = shares.map(share => ({
          user: share.email,
          completed: false
        }));
        this.shares = new_shares;
        this.user = email;

        Sheet.findOneAndUpdate(
          { sheetId: this.sheetId },
          {
            user: email,
            name: this.name,
            shares: new_shares
          },
          (err, result) => {
            resolve({ result, shares });
          }
        );
      });
    });
    return promise;
  }
}
//this factory is useful for testing purposes.
module.exports = {
  singleSheetFactory: function(sheet, factory) {
    var instance = new SingleSheetInstance(sheet);
    instance.smartSheetAPI = factory.smartSheetAPI;
    instance.sparkAPI = factory.sparkAPI;
    return instance;
  },
  SingleSheetInstance
};
