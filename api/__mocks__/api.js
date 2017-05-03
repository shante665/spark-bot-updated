var { SparkAPI, SmartSheetAPI } = require("../api/SparkAndSmartSheetAPI");

class API {
  constructor(token) {}
  shareSheet({ body, sheetId }) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          resultCode: 0,
          result: [
            {
              id: "AAAFeF82FOeE",
              type: "USER",
              userId: 1539725208119172,
              email: body[0].email,
              name: "Jane Doe",
              accessLevel: body[0].accessLevel,
              scope: "ITEM"
            }
          ],
          message: "SUCCESS"
        }));
    });
  }
  createSheet({ body: { name, columns } }) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          message: "SUCCESS",
          result: {
            accessLevel: "OWNER",
            columns: [
              Object.assign({}, columns[0], {
                id: 642523719853956,
                index: 0
              })
            ],
            id: 2331373580117892,
            name,
            permalink: "https://app.smartsheet.com/b/home?lx=0HHzeGnfHik-N13ZT8pU7g"
          },
          resultCode: 0
        }));
    });
  }
  getSheet({ id }) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          accessLevel: "OWNER",
          projectSettings: {},
          columns: [
            {
              id: 4583173393803140,
              index: 0,
              primary: true,
              title: "Primary Column",
              type: "TEXT_NUMBER"
            }
          ],
          createdAt: "2012-07-24T18:22:29-07:00",
          id,
          modifiedAt: "2012-07-24T18:30:52-07:00",
          name: "sheet 1",
          permalink: "https://app.smartsheet.com/b/home?lx=pWNSDH9itjBXxBzFmyf-5w",
          rows: []
        }));
    });
  }
  getColumns(options) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          pageNumber: 1,
          pageSize: 100,
          totalPages: 1,
          totalCount: 3,
          data: [
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
          ]
        }));
    });
  }
  addRows({ body, sheetId }) {
    var cells = body[0].cells.map(cell => ({
      columnId: cell.columnId,
      type: "TEXT_NUMBER",
      value: cell.value
    }));

    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          message: "SUCCESS",
          result: [
            {
              id: 7670198317672324,
              sheetId: 2331373580117892,
              rowNumber: 1,
              expanded: true,
              createdAt: "2013-02-28T17:45:13-08:00",
              modifiedAt: "2013-02-28T17:45:13-08:00",
              cells
            }
          ],
          version: 14,
          resultCode: 0
        }));
    });
  }
}

class SparkAPICall {
  constructor(instance) {}
  getSparkUser(email) {
    return new Promise((resolve, reject) => {
      var data = {
        items: [
          {
            id: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8wNi0wMmIzZjNkYmI1OWE",
            emails: [email],
            displayName: "Dummy data",
            nickName: "Data",
            orgId: "Y2lzY29zcGFyazovL3VzL09SR0FOSVpBVElPTi9jb2cg",
            created: "2017-04-04T10:07:16.899Z",
            lastActivity: "2017-04-10T09:27:49.817Z",
            status: "active",
            type: "person"
          }
        ]
      };
      process.nextTick(() => resolve(data));
    });
  }
  createRoom(title) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          id: "Y2lzY29zcGFyazovL3VzL1JPT00vMWU40xMWU3L3NmZlYzNlOTI3",
          title,
          type: "group",
          isLocked: false,
          lastActivity: "2017-04-04T10:19:32.418Z",
          creatorId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS83JkLTQ4MTEtOWNmZS0yMjNmOTZmZTFjN2I",
          created: "2017-04-04T10:19:00.014Z"
        }));
    });
  }
  createMembershipToRoom(roomId, personEmail) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          id: "Y2lzY29zcGFyazovL3VzL01FTUJFUlNISVAvMDJiM2YzZGJiNTlhOjFlOGFhNGUwLTE5MjAtMTFlNy04NTA3LWM5NzZmZWMzZTkyNw",
          roomId,
          personId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8wNGYzZxYS1mNTJlLTQ4MGMtYmRiNi0wMmIzZjNkYmI1OWE",
          personEmail,
          personDisplayName: "Data",
          isModerator: false,
          isMonitor: false,
          created: "2017-04-04T10:19:00.452Z"
        }));
    });
  }
  sendMessageToRoom(roomId, markdown) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          id: "Y2lzY29zcGFyazovL3VzL01FU1NBR0UvN2ExZTdjNjAtMWRkNC0xMWU3LWJjMTQtMzcyYmU2OWZmOTE4",
          roomId,
          roomType: "group",
          text: "Hello from",
          personId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS8wNGYzZTgxYS1mNTJlLTQ4MGMtYmRiNi0wMmIzZjNkYmI1OWE",
          personEmail: "test@gmail.com",
          markdown,
          html: "<p><strong>Hello</strong> from <em>Data</em></p>",
          created: "2017-04-10T10:00:07.718Z"
        }));
    });
  }
  getRooms(options) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          items: [
            {
              id: "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0",
              title: "Project Unicorn - Sprint 0",
              type: "group",
              isLocked: true,
              teamId: "Y2lzY29zcGFyazovL3VzL1JPT00vNjRlNDVhZTAtYzQ2Yi0xMWU1LTlkZjktMGQ0MWUzNDIxOTcz",
              lastActivity: "2016-04-21T19:12:48.920Z",
              created: "2016-04-21T19:01:55.966Z"
            }
          ]
        }));
    });
  }
  getMembership(roomId) {
    return new Promise((resolve, reject) => {
      process.nextTick(() =>
        resolve({
          items: [
            {
              id: "Y2lzY29zcGFyazovL3VzL01FTUJFUlNISVAvMGQwYzkxYjYtY2U2MC00NzI1LWI2ZDAtMzQ1NWQ1ZDExZWYzOmNkZTFkZDQwLTJmMGQtMTFlNS1iYTljLTdiNjU1NmQyMjA3Yg",
              roomId: "Y2lzY29zcGFyazovL3VzL1JPT00vYmJjZWIxYWQtNDNmMS0zYjU4LTkxNDctZjE0YmIwYzRkMTU0",
              personId: "Y2lzY29zcGFyazovL3VzL1BFT1BMRS9mNWIzNjE4Ny1jOGRkLTQ3MjctOGIyZi1mOWM0NDdmMjkwNDY",
              personEmail: "r2d2@example.com",
              personDisplayName: "Any Name",
              isModerator: true,
              isMonitor: true,
              created: "2015-10-18T14:26:16+00:00"
            }
          ]
        }));
    });
  }
}

function SparkAPIFactory(token) {
  return new SparkAPI(new SparkAPICall(token));
}
function SheetAPIFactory(token) {
  console.log("holla was here");
  return new SmartSheetAPI(new API(token));
}

module.exports = {
  SparkAPIFactory,
  SheetAPIFactory
};
