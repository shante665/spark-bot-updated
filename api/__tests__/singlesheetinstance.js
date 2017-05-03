"use strict";
var mongoose = require("mongoose");
// var Mockgoose = require("mockgoose").Mockgoose;

// let mockgoose = new Mockgoose(mongoose);
jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
beforeAll(() => {
  try {
    mongoose.connect("mongodb://localhost/userApi2"); //- starting a db connection
  } catch (err) {
    mongoose.createConnection("mongodb://localhost/userApi2"); //- starting another db connection
  }
});
var SingleSheetInstance = require("../SingleSheetInstance").singleSheetFactory;
var Share = require("../ShareInstance");
var { SheetAPIFactory, SparkAPIFactory } = require("../__mocks__/api");
describe("SingleSmartSheetInstance", () => {
  var sparkAPI = SparkAPIFactory();
  var newSheet = SingleSheetInstance(
    {},
    {
      smartSheetAPI: SheetAPIFactory(),
      sparkAPI
    }
  );
  describe("#createSheet", () => {
    newSheet.name = "hello";
    it("#should return a promise that resolves", () => {
      return newSheet.createSheet().then(data => {
        expect(data).toEqual({
          sheetId: 2331373580117892,
          name: "hello",
          url: "https://app.smartsheet.com/b/home?lx=0HHzeGnfHik-N13ZT8pU7g"
        });
        expect(newSheet.sheetId).toEqual(2331373580117892);
        expect(newSheet.url).toEqual(
          "https://app.smartsheet.com/b/home?lx=0HHzeGnfHik-N13ZT8pU7g"
        );
      });
    });
  });
  describe("#notifyShares", () => {
    test("#should return empty result", () => {
      return newSheet
        .notifyShares(
          [{ personEmail: "james@example.com", personDisplayName: "James" }],
          "james@ooo.com",
          "hello"
        )
        .then(data => {
          expect(data).toBeInstanceOf(Array);
          expect(data.length).toEqual(0);
        });
    });
    it("#should notify all users  about a particular message", () => {
      return newSheet
        .notifyShares(
          [{ personEmail: "james@example.com", personDisplayName: "James" }],
          "gbozee@example.com",
          "**hello world**",
          user => user.email.split("@example.com")
        )
        .then(data => {
          expect(data).toBeInstanceOf(Array);
          var result = Share(
            {
              email: "james@example.com",
              displayName: "James"
            },
            { sparkAPI }
          );
          result.roomId = data[0].roomId;
          expect(data).toEqual([result]);
        });
    });
  });
  describe("#populateColumn", () => {
    test("should populate the first row", () => {
      var first_row = {
        primary: true,
        title: "Primary Column",
        type: "TEXT_NUMBER"
      };
      expect(newSheet.columns).toEqual([first_row]);
      newSheet.populateColumn("First Name");
      expect(newSheet.columns).toEqual([
        first_row,
        {
          title: "First Name",
          type: "TEXT_NUMBER"
        }
      ]);
    });
  });
  describe("#completedSheet", () => {
    test("should update the sheet status to true", () => {
      expect(newSheet.shares).toEqual([]);
    });
  });
});
