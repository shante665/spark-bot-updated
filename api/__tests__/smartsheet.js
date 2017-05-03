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
const { difference, getCompleted } = require("../models");

describe("SparkBot Model", function() {
  describe("#difference()", function() {
    it("should return correct result", function() {
      expect(difference([1, 2, 3, 4], [1, 2, 3, 4])).toEqual([]);
      expect(difference([1, 2, 3, 4], [1, 2, 3])).toEqual([4]);
      expect(difference([1, 2], [1, 2, 3, 4])).toEqual([3, 4]);
    });
  });
  describe("#getCompleted", () => {
    var sheets = [
      {
        shares: [
          { user: "john@gmail.com", completed: true },
          { user: "john@example.com", completed: false }
        ]
      },
      {
        shares: [
          { user: "john@gmail.com", completed: false },
          { user: "james@example.com", completed: true }
        ]
      },
      {
        shares: [{ user: "john@gmail.com", completed: true }]
      }
    ];
    test("should return valid results", () => {
      expect(getCompleted(sheets, "john@gmail.com", true).length).toEqual(2);
      expect(getCompleted(sheets, "john@gmail.com", false).length).toEqual(1);
      expect(getCompleted(sheets, "james@example.com", false).length).toEqual(
        1
      );
      expect(getCompleted(sheets, "james@example.com", true).length).toEqual(1);
    });
  });
});
