var mongoose = require("mongoose");
mongoose.connect(process.env.mongoose_db);
var App = require("./api/App");
var { SparkAPIFactory } = require("./api/api");
var storageAPI = require("./lib/storage/simple_storage");
var { Sheet, Share, User } = require("./api/models")

Sheet.remove({}, (err,data)=>{console.log(data)})
Share.remove({}, (err,data)=>{console.log(data)})
User.remove({}, (err,data)=>{console.log(data)})


var app = new App(
  storageAPI(),
  "gbozee@gmail.com",
  "48l8tcslcd0uz2rgoqc5a6lwap"
);
app.initializeStorage("create");
app
  .saveHelper("sheet_name", "voltron2")
  .then(() => app.saveHelper("columns", "First name,Last name".split(",")))
  .then(() =>
    app.saveHelper(
      "selectedRoom",
      "Y2lzY29zcGFyazovL3VzL1JPT00vZWE0NDc2ZjAtN2M4ZS0zMjc3LTliOTgtOTVjOTFiNzQ4MGI0"
    )
  .then(() => app.createSheet().then(data => {
      console.log(data);
    }));

var controller = new Storage(storageAPI(), "hello@gmail.com");
controller.initializeStorage("populate");
controller.getQuestions(app).then(data => {
  console.log(data);
});
// app.getRooms().then(() => {
//   return controller.initializeStorage("create");
// }).then(()=>;
//   )
//   controller.saveHelper("columns", "First name,Last name".split(","));
//   var roomId = app.getSelectedRoom("3").id;
//   controller.saveHelper("selectedRoom", roomId);
// });
// // var response = {
// //   id: "gbozee@gmail.com",
// //   sheet_name: " voltron",
// //   columns: [" First name", " Last name", "Email"],
// //   access_token: " 48l8tcslcd0uz2rgoqc5a6lwap",
// //   users: [],
// //   selectedRoom: "Y2lzY29zcGFyazovL3VE0NDc2ZjAtN2M4ZS0zMjc3LTliOTgtOTVjOTFiNzQ4MGI0"
// // };
// // app.createSheetAndShare("smartbot2.0@sparkbot.io", response).then(
// //   data => {
// //     console.log(data);
// //   },
// //   err => {
// //     console.log(err);
// //   }
// // );
// app.getQuestions("hello@gmail.com").then(sheets => {});
