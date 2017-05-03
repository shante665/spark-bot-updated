var User = require("./UserInstance");

var { SparkAPIFactory } = require("./api");
class Storage {
  constructor(storage, email, access_token) {
    this.storage = storage;
    this.email = email;
    this.cisco_access_token = "";
    this.response = {
      id: email,
      sheet_name: "",
      columns: [],
      access_token,
      users: [],
      columns: [],
      answers: {},
      cisco_access_token: "",
      selectedRoom: "" // must be the id of the room
    };
    this.injected_factory = null;
    this.user = User(email, this.injected_factory);
    if (access_token) {
      this.user.inputAccessToken(access_token);
    }
    this.result;
    this.rooms = [];
  }
  setAccessToken(access_token) {
    return this.saveHelper("cisco_access_token", access_token).then(data => {
      var ff = "";
      if (this.injected_factory) {
        ff = this.injected_factory;
      } else {
        ff = { sparkAPI: SparkAPIFactory(data.cisco_access_token) };
      }
      this.user.sparkAPI = ff.sparkAPI;
      this.user.smartSheetAPI = ff.smartSheetAPI;
      this.cisco_access_token = access_token;
      return data;
    });
  }
  getRooms() {
    return this.user.getRooms().then(data => {
      this.result = "";
      data.forEach((x, i) => {
        this.result += `${i}. ${x.title} \n`;
      });
      return this.result;
    });
  }
  initializeStorage(option) {
    this.storage.users.save(this.response);
  }
  getQuestions() {
    return new Promise((resolve, reject) =>
      this.storage.users.save(this.response, () => resolve()))
      .then(() => this._getData())
      .then(data => {
        return this.user.getAllSheetSharedAndInitialize();
      })
      .then(sheets => {
        return this._initalizeAnswers(sheets);
      });
  }
  _getData() {
    return new Promise((resolve, reject) => {
      this.storage.users.get(this.email, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });
  }
  saveHelper(key, value) {
    return this._getData().then(data => {
      if (typeof value === "function") {
        data = value(data);
      } else {
        data[key] = value;
      }
      return new Promise((resolve, reject) => {
        this.storage.users.save(data, err => {
          resolve(data);
        });
      });
    });
  }
  getUrl() {
    return this.sheetData.url;
  }
  createSheet() {
    return this._getData()
      .then(response => {
        this.user._getSheetInstance();
        this.user.sheet.name = response.sheet_name;
        response.columns.forEach(column => {
          this.user.sheet.populateColumn(column);
        });
        return this.user.createSheet();
      })
      .then(data => this.sheetData = data);
  }
  sendSheet(bot_email, condition) {
    var db = {};
    return this._getData()
      .then(
        data => {
          db = data;
          return this.user.getUserDetails();
        },
        err => console.log(err)
      )
      .then(ddd => {
        var msgs = `Hi there ${ddd.displayName} has shared a sheet ${db.sheet_name} with 
                  you that requires your input. Would you like to fill the sheet now. Reply Yes or No`;
        return this.user.shareSheetToRoom(
          db.selectedRoom,
          bot_email,
          msgs,
          condition
        );
      })
      .then(data => {
        return new Promise((resolve, reject) => {
          var deletes = [];
          if ("delete" in this.storage.users) {
            deletes = this.storage.users.delete;
          } else {
            deletes = this.storage.users.remove;
          }
          deletes(this.email, (err, d) => {
            // if (err) reject(err);
            resolve({ data, d });
          });
        });
      });
  }
  _initalizeAnswers(sheets) {
    return this._getData().then(data => {
      sheets.forEach((x, index) => {
        data.answers[index] = [];
      });
      return new Promise((resolve, reject) => {
        this.storage.users.save(data, (err, data2) => {
          resolve(data2);
        });
      });
    });
  }
  getSelectedRoom(index) {
    var integer = parseInt(index);
    return this.user.rooms[integer - 1];
  }
  saveAnswer(index, answer) {
    const resolve = data => {
      var answers = data.answers[index];
      answers.push(answer);
      data.answers[index] = answers;
      return data;
    };
    return this.saveHelper("answers", resolve);
  }
  saveAnswers() {
    return this._getData()
      .then(data =>
        Promise.all(
          this.user.sheets.map((sheet, index) => {
            console.log(data.answers);
            if (Object.keys(data.answers).length > 0) {
              return sheet.populateDetailInSheet(data.answers[index]);
            }
            return new Promise((resolve, reject) => resolve());
          })
        ))
      .then(() => this.user.completedAllSheetFilling())
      .then(data => {
        console.log(this.storage.users);
        var deletes = [];
        if ("delete" in this.storage.users) {
          deletes = this.storage.users.delete;
        } else {
          deletes = this.storage.users.remove;
        }
        deletes(this.email);
        return data;
      });
  }
}
module.exports = Storage;
