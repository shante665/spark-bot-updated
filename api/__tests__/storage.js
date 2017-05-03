var mongoose = require("mongoose");
// var Mockgoose = require("mockgoose").Mockgoose;

// let mockgoose = new Mockgoose(mongoose);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 180000;
beforeAll(() => {
  try {
    mongoose.connect("mongodb://localhost/john22"); //- starting a db connection
  } catch (err) {
    mongoose.createConnection("mongodb://localhost/john22"); //- starting another db connection
  }
});
var { SheetAPIFactory, SparkAPIFactory } = require("../__mocks__/api");
const difference = require("../models").difference;
const Storage = require("../App");
var storageAPI = require("../../lib/storage/simple_storage");
// var redisConfig = { url: "redis://localhost:6379/0" };
// var storageAPI = require("botkit-storage-redis")(redisConfig);

describe("Storage", () => {
  var sparkAPI = SparkAPIFactory();
  var smartSheetAPI = SheetAPIFactory();
  var factory = {
    sparkAPI,
    smartSheetAPI
  };
  describe("Question", () => {
    var local_storage = new Storage(storageAPI(), "james@example.com", "1111");
    local_storage.injected_factory = factory;
    local_storage.initializeStorage("create");
    test("#setAccessToken", () => {
      return local_storage.setAccessToken("12345").then(x => {
        expect(x.cisco_access_token).toEqual("12345");
      });
    });
    test("#getRooms", () => {
      expect(local_storage.user.sparkAPI).toEqual(sparkAPI);
      return local_storage.getRooms().then(() => {
        expect(local_storage.user.rooms).toEqual([
          {
            id: "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0",
            title: "Project Unicorn - Sprint 0",
            type: "group",
            isLocked: true,
            teamId: "Y2lzY29zcGFyazovL3VzL1JPT00vNjRlNDVhZTAtYzQ2Yi0xMWU1LTlkZjktMGQ0MWUzNDIxOTcz",
            lastActivity: "2016-04-21T19:12:48.920Z",
            created: "2016-04-21T19:01:55.966Z"
          }
        ]);
      });
      expect(local_storage.response).toEqual("1: Project Unicorn - Sprint 0\n");
    });
    test("#saveHelper", () => {
      var first = local_storage.saveHelper("sheet_name", "the first file");
      var second = local_storage.saveHelper(
        "columns",
        "First name,Last name".split(",")
      );
      var third = local_storage.saveHelper(
        "selectedRoom",
        "Y2lzY29zcGFyazovL3VzL1JPT00vMWU4YWE0ZTAtMTkyMC0xMWU3LTg1MDctYzk3NmZlYzNlOTI3"
      );

      // var result = saves.reduce((acc, val) => acc.then(() => val));
      return first
        .then(data => {
          expect(data.sheet_name).toEqual("the first file");
          return second;
        })
        .then(data => {
          expect(data.columns).toEqual(["First name", "Last name"]);
          return third;
        })
        .then(data => {
          expect(data.selectedRoom).toEqual(
            "Y2lzY29zcGFyazovL3VzL1JPT00vMWU4YWE0ZTAtMTkyMC0xMWU3LTg1MDctYzk3NmZlYzNlOTI3"
          );
        });
    });

    test("#createSheet", () => {
      return local_storage.createSheet().then(() => {
        expect(local_storage.user.sheet.sheetId).toEqual(2331373580117892);
        expect(local_storage.user.sheet.name).toEqual("the first file");
        expect(local_storage.user.sheet.url).toEqual(
          "https://app.smartsheet.com/b/home?lx=0HHzeGnfHik-N13ZT8pU7g"
        );
      });
    });

    test("#sendSheet", () => {
      var condition = user => user.email.split("@example.com").length > 1;
      return local_storage
        .sendSheet("cisco@example.com", condition)
        .then(data => {
          expect(data.data.shares).toEqual([
            {
              // id: "Y2lzY29zcGFyazovL3VzL01FTUJFUlNISVAvMGQwYzkxLWI2ZDAtMzQ1NWQ1ZDExZWYzOmNkZTFkZDQwLTJmMGQtMTFlNS1iYTljLTdiNjU1NmQyMjA3Yg",
              roomId: "Y2lzY29zcGFyazovL3VzL1JPT00vMWU4YWE0ZTAtMTkyMC0xMWU3LTg1MDctYzk3NmZlYzNlOTI3",
              // personId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS9LTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY",
              email: "r2d2@example.com",
              name: "test data",
              // isModerator: true,
              // isMonitor: true,
              // created: "2015-10-18T14:26:16+00:00"
              sparkAPI
            }
          ]);
          //   local_storage.storage.users.get(local_storage.email, (err, data) => {
          //     expect(err.displayName).toEqual("NotFound");
          //     expect(data).toBeFalsy();
          //   });
        });
    });
  });

  describe("#Answers", () => {
    var local_storage = new Storage(storageAPI(), "r2d2@example.com");
    local_storage.initializeStorage("populate");
    local_storage.user.smartSheetAPI = smartSheetAPI;
    local_storage.user.access_token = "";
    local_storage.user.sparkAPI = sparkAPI;
    var sheets2 = [];

    test("#getQuestions", () => {
      expect(local_storage.user.smartSheetAPI).toEqual(smartSheetAPI);
      return local_storage.getQuestions().then(data => {
        expect(local_storage.user.sheets.length).toEqual(1);
        expect(local_storage.user.sheets[0].sheetId).toEqual(
          "2331373580117892"
        );
        expect(local_storage.user.sheets[0].name).toEqual("the first file");
        expect(data.answers).toEqual({ 0: [] });
        expect(data.columns).toEqual([]);
      });
    });

    test("#saveAnswer", () => {
      return local_storage
        .saveAnswer(0, "hello world")
        .then(() => local_storage.saveAnswer(0, "sama"))
        .then(() => local_storage.saveAnswer(0, "john"))
        .then(data => {
          expect(data.answers).toEqual({ 0: ["hello world", "sama", "john"] });
        });
    });
    test("#saveAnswers", () => {
      return local_storage.saveAnswers().then(x => {
        expect(local_storage.user.getUncompletedSheet()).toEqual([]);
      });
    });
  });
});
