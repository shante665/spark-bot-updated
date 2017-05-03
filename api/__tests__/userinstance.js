"use strict";
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
var SingleSheetInstance = require("../SingleSheetInstance").singleSheetFactory;
var SingleSheetClass = require("../SingleSheetInstance").SingleSheetInstance;
var UserInstance = require("../UserInstance");
var models = require("../models");
var Share = require("../ShareInstance");
var { SheetAPIFactory, SparkAPIFactory } = require("../__mocks__/api");

describe("UserInstance", () => {
  var sparkAPI = SparkAPIFactory();
  var user1 = UserInstance("james@example.com", {
    sparkAPI,
    smartSheetAPI: SheetAPIFactory()
  });
  test("#inputAccessToken", () => {
    return user1.inputAccessToken("abeiosewew").then(() => {
      expect(user1.access_token).toEqual("abeiosewew");
      expect(user1.sheet).toBeInstanceOf(SingleSheetClass);
    });
  });
  describe("#Sheet Creation", () => {
    test("#getUserDetails", () => {
      return user1.getUserDetails().then(x => {
        expect(x.displayName).toEqual("Biola Oyeniyi");
      });
    });
    test("#create the sheet and added the columns", () => {
      user1.sheet.name = "My First Sheet";
      user1.sheet.populateColumn("First Name");
      user1.sheet.populateColumn("Last Name");
      return user1.createSheet().then(() => {
        expect(user1.sheet.sheetId).toEqual(2331373580117892);
        expect(user1.sheet.name).toEqual("My First Sheet");
        expect(user1.sheet.url).toEqual(
          "https://app.smartsheet.com/b/home?lx=0HHzeGnfHik-N13ZT8pU7g"
        );
      });
    });

    describe("Geet users in a room and share doc", () => {
      var users = [];
      test("#getMembersInRoom", () => {
        return user1
          .getRoomMembers(
            "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0"
          )
          .then(data => {
            expect(data).toEqual([
              {
                id: "Y2lzY29zcGFyazovL3VzL01FTUJFUlNISVAvMGQwYzkxYjYtY2U2MC00NzI1LWI2ZDAtMzQ1NWQ1ZDExZWYzOmNkZTFkZDQwLTJmMGQtMTFlNS1iYTljLTdiNjU1NmQyMjA3Yg",
                roomId: "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0",
                personId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mNWIzNjE4Ny1jOGRkLTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY",
                personEmail: "r2d2@example.com",
                personDisplayName: "test data",
                isModerator: true,
                isMonitor: true,
                created: "2015-10-18T14:26:16+00:00"
              }
            ]);
            users = data;
          });
      });
      test("#notifyShares", () => {
        return user1
          .notifyShares(
            users,
            "james@ooo.com",
            "hello",
            user => user.email.split("@example.com").length > 1
          )
          .then(() => {
            expect(user1.sheet.shares).toEqual([
              {
                user: "r2d2@example.com",
                completed: false
              }
            ]);
            expect(user1.sheet.user).toEqual("james@example.com");
          });
      });

      test("#shareSheetToRoom", () => {
        return user1
          .shareSheetToRoom(
            "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0",
            "james@ooo.com",
            "hello",
            user => user.email.split("@example.com").length > 1
          )
          .then(() => {
            expect(user1.sheet.shares).toEqual([
              {
                user: "r2d2@example.com",
                completed: false
              }
            ]);
            expect(user1.sheet.user).toEqual("james@example.com");
          });
      });
      test("# Share database has been populated with share details", () => {
        // models.Share.find({}, (err, inst) => {
        //   expect(inst.length).toEqual(1);
        //   expect(inst[0].roomId).toEqual(
        //     "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0"
        //   );
        // });
      });
    });
  });
  describe("#getAllSheetAndInitialize", () => {
    var smartSheetAPI = SheetAPIFactory();
    var fillSheetUser = UserInstance("r2d2@example.com", {
      sparkAPI,
      smartSheetAPI
    });
    test("#initializeSheet", () => {
      return fillSheetUser.share.getSheets().then(sheets => {
        expect(sheets.length).toEqual(1);
        expect(sheets[0].sheetId).toEqual("2331373580117892");
        expect(sheets[0].name).toEqual("My First Sheet");
      });
    });
    test("#actual implementation of getAllSheetSharedAndInitialize", () => {
      return fillSheetUser.getAllSheetSharedAndInitialize().then(() => {
        expect(fillSheetUser.sheets.length).toEqual(1);
        expect(fillSheetUser.sheets[0].sheetId).toEqual("2331373580117892");
        expect(fillSheetUser.sheets[0].name).toEqual("My First Sheet");
        expect(fillSheetUser.sheets[0].smartSheetAPI).toBe(smartSheetAPI);
        expect(fillSheetUser.sheets[0].columns).toEqual([
          {
            id: 7960873114331012,
            index: 0,
            symbol: "STAR",
            title: "Favorite",
            type: "CHECKBOX"
          },
          {
            id: 642523719853956,
            index: 1,
            primary: true,
            title: "Primary Column",
            type: "TEXT_NUMBER"
          },
          {
            id: 5146123347224452,
            index: 2,
            title: "Status",
            type: "PICKLIST"
          }
        ]);
      });
    });
    test("#sheet can populate all data", () => {
      expect(fillSheetUser.getUncompletedSheet().length).toEqual(1);
      var sheetToPopulate = fillSheetUser.populateRowsInSheet(0);
      var response = ["Yes I did", "Aloiba", "James"];
      var cells = sheetToPopulate.columns.map((cell, index) => ({
        columnId: cell.id,
        type: "TEXT_NUMBER",
        value: response[index]
      }));
      return sheetToPopulate.populateDetailInSheet(response).then(data => {
        expect(data).toEqual([
          {
            id: 7670198317672324,
            sheetId: 2331373580117892,
            rowNumber: 1,
            expanded: true,
            createdAt: "2013-02-28T17:45:13-08:00",
            modifiedAt: "2013-02-28T17:45:13-08:00",
            cells
          }
        ]);
      });
    });
    test("#completedSheetFilling", () => {
      expect(fillSheetUser.getUncompletedSheet().length).toEqual(1);
      return fillSheetUser.completedAllSheetFilling().then(rr => {
        expect(fillSheetUser.getUncompletedSheet()).toEqual([]);
      });
    });
  });
});
