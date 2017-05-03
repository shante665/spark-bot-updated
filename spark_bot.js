/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Cisco Spark bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Cisco Spark's APIs
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://botkit.ai

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/

var Botkit = require("./lib/Botkit.js");
var mongoose = require("mongoose");
mongoose.connect(process.env.mongoose_db);
var redisConfig = { url: process.env.REDIS_URL };
var redisStorage = require("botkit-storage-redis")(redisConfig);
var controller = Botkit.sparkbot({
  debug: false,
  log: false,
  public_address: process.env.public_address,
  ciscospark_access_token: process.env.CISCOSPARK_ACCESS_TOKEN,
  studio_token: process.env.studio_token, // get one from studio.botkit.ai to enable content management, stats, message console and more
  secret: process.env.secret, // this is an RECOMMENDED but optional setting that enables validation of incoming webhooks
  webhook_name: "Cisco Spark bot created with Botkit, override me before going to production",
  storage: redisStorage
  //    limit_to_domain: ['mycompany.com'],
  //    limit_to_org: 'my_cisco_org_id',
});
var { SparkAPIFactory } = require("./api/api");

var App = require("./api/App");

var bot = controller.spawn({});
controller.setupWebserver(process.env.PORT || 3000, function(err, webserver) {
  controller.createWebhookEndpoints(webserver, bot, function() {
    console.log("Cisco Spark: Webhooks set up!");
  });
});

controller.hears(["^create sheet"], "direct_message,direct_mention", function(
  bot,
  message
) {
  var response = message.text.split("create sheet");
  var owner_of_sheet = message.user;
  var sheetInstance = null;
  bot.reply(message, "You have begun the process");
});
controller.hears(["^access_token"], "direct_message,direct_mention", function(
  bot,
  message
) {
  var bot_email = controller.identity.emails[0];
  var response = message.text.split("access_token");
  console.log(response);
  if (response.length > 1) {
    createSheetConversation(message, bot, bot_email);
  }
});
// controller.hears(["^fill_sheet"], "direct_message,direct_mention", function(
//   bot,
//   message
// ) {
//   console.log(message);
//   var local_storage = new App(controller.storage, message.user);
//   local_storage.initializeStorage("populate");
//   local_storage.getQuestions().then(() => {
//     var sheets = local_storage.user.sheets;
//     bot.startPrivateConversation(message, (err, convo) => {
//       convo.addMessage(
//         {
//           text: "I  will now send you the questions in the sheet. Kindly respond respond with your answers",
//           action: "question"
//         },
//         "default"
//       );
//       if (sheets.length === 0) {
//         convo.addMessage(
//           {
//             text: "Oops, Looks like you don't currently have any sheet to fill",
//             action: "done"
//           },
//           "question"
//         );
//       }
//       sheets.forEach((s, index) => {
//         s.columns.forEach(x => {
//           convo.addQuestion(
//             x.title,
//             (response, conversation) => {
//               local_storage.saveAnswer(index, response.text).then(() => {
//                 conversation.next();
//               });
//             },
//             {},
//             "question"
//           );
//         });
//       });
//       convo.addMessage(
//         "Awesome !!! The sheet has been updated with a row of your response. No further action is needed. Thank you for your time and enjoy the rest of your day ",
//         "question"
//       );
//       convo.addMessage("Thanks for your time", "done");
//       convo.on("end", function(convo) {
//         if (convo.status == "completed") {
//           // do something useful with the users responses
//           // var res = convo.extractResponses();
//           // console.log(res);
//           local_storage.saveAnswers().then(
//             () => {
//               console.log("Populated sheets");
//             },
//             err => {
//               console.log(err);
//             }
//           );
//         } else {
//           // something happened that caused the conversation to stop prematurely
//         }
//       });
//     });
//   });
// });
controller.on("user_space_join", function(bot, message) {
  // var text = `Hello I’m the Smart Sheet filling Bot. Here are a list of commands. You can create, Update  and share Sheets`;
  // bot.reply(message, text);
});

controller.on("user_space_leave", function(bot, message) {
  bot.reply(message, "Bye, " + message.original_message.data.personDisplayName);
});

controller.on("bot_space_join", function(bot, message) {
  // var text0 = `Hello I’m the Smart Sheet filling Bot. Here are a list of commands. You can create, Update  and share Sheets`;
  // var text1 = `For Security purpose please provide your Smartsheet token. `;
  // var text2 = `If you don’t have one you can follow the instructions and generate one via https://app.smartsheet.com/b/home`;
  // var text3 = `  Go To Settings  API Access  Click Generate New Access Token `;
  // var text4 = `To get started type "create sheet" <access_token>`;
  // console.log(message);
  // bot.reply(message, text0);

  // bot.reply(message, text1 + text2 + text3);
  // bot.reply(text4);
});
function createSheetConversation(message, bot, bot_email) {
  bot.startPrivateConversation(message, (err, convo) => {
    convo.addMessage(
      "You have successfully added your access token",
      "default"
    );
    var response = message.text.split("access_token");

    var access_token = response[1];
    var local_storage = new App(controller.storage, message.user, access_token);
    local_storage.initializeStorage("create");
    var access_confirmation = `Got It!! SmartSheet Verification Successfully. 
      `;
    var sheet_create_question = `Now Enter A Name of the new sheet you would like to Create.
       Begin with the ‘Sheet_Name: <insert name here >’ command`;
    convo.addMessage(access_confirmation, "default");
    //proceed with the remaining steps of creating the sheet
    convo.addQuestion(
      sheet_create_question,
      (response, conversation) => {
        var sheet_name = response.text.split("Sheet_Name")[1];
        local_storage.saveHelper("sheet_name", sheet_name);
        conversation.addMessage(
          {
            text: "The name of the sheet is " + sheet_name,
            action: "col_question"
          },
          "sheet_response"
        );
        conversation.gotoThread("sheet_response");
        conversation.next();
      },
      {},
      "default"
    );
    convo.addQuestion(
      "To add a column to this sheet use Add_Col command. If adding more than 1, seperate consecutive columns with a comma",
      (response, conversation) => {
        var column_name = response.text.split("Add_Col")[1];
        local_storage.saveHelper("columns", column_name.split(",")).then(() =>
          local_storage.createSheet().then(() => {
            bot.startPrivateConversation(message, (err, convo2) => {
              convo2.addMessage(
                `The Url to your sheet is ${local_storage.getUrl()}`
              );
              convo2.addQuestion(
                "In order to fetch your rooms, we need your cisco spark access_token. Paste it here",
                (response, conversation) => {
                  //Get rooms
                  local_storage
                    .setAccessToken(response.text)
                    .then(() => local_storage.getRooms())
                    .then(() => {
                      bot.startPrivateConversation(message, (err, convo3) => {
                        convo3.addQuestion(
                          "When Ready To Start sharing the sheet with members in a room initiate with  Sheet_Share <group/direct>",
                          (response, conversation) => {
                            //Get rooms
                            conversation.next();
                          },
                          {}
                        );
                        convo3.addMessage({
                          text: "here is a list of all the group rooms you belong to.\n" +
                            local_storage.result,
                          markdown: "here is a list of all the group rooms you belong to.\n" +
                            local_storage.result
                        });
                        convo3.addQuestion(
                          " Specify which room you want to share with by responding with the number of the room.",
                          (response, conversation) => {
                            //Fetch users in room selected
                            console.log(response);
                            var roomId = local_storage.getSelectedRoom(
                              response.text
                            ).id;
                            local_storage.saveHelper("selectedRoom", roomId);
                            conversation.addMessage(
                              {
                                text: `You have requested to share sheet with ${local_storage.getSelectedRoom(response.text).title} group`,
                                action: "confirmation"
                              },
                              "room_result"
                            );
                            conversation.gotoThread("room_result");
                            conversation.next();
                          },
                          {}
                        );
                        convo3.addQuestion(
                          "send Yes to Confirm or No if it was in Error",
                          [
                            {
                              pattern: bot.utterances.yes,
                              callback: function(response, conversation) {
                                conversation.say("Great! I will now intiate the Sheet Sharing process ...");
                                // do something else...
                                // var is_cisco = user =>
                                //   user.email.split("@cisco.com").length > 1;
                                var is_cisco = user => user.email.split("@sparkbot.io").length == 1;
                                local_storage
                                  .sendSheet(bot_email, is_cisco)
                                  .then(
                                    () => {
                                      bot.startPrivateConversation(
                                        message,
                                        (err, convo4) => {
                                          convo4.say(
                                            "The sheet has successfully been shared."
                                          );
                                        }
                                      );
                                    },
                                    err => {
                                      console.log(err);
                                    }
                                  );
                                conversation.next();
                              }
                            },
                            {
                              pattern: bot.utterances.no,
                              callback: function(response, conversation) {
                                conversation.say("Perhaps later.");
                                // do something else...
                                conversation.next();
                              }
                            },
                            {
                              default: true,
                              callback: function(response, conversation) {
                                // just repeat the question
                                conversation.repeat();
                                conversation.next();
                              }
                            }
                          ],
                          {},
                          "confirmation"
                        );
                        convo3.on("end", function(convo) {
                          if (convo.status == "completed") {
                          } else {
                            // something happened that caused the conversation to stop prematurely
                          }
                        });
                      });
                    });
                  conversation.next();
                },
                {}
              );
            });
          })
        );
        conversation.addMessage(
          "The column you added was " + column_name,
          "column_response"
        );

        conversation.addMessage(
          "Fantastic!!! Sheet successfully updated with column.",
          "column_response"
        );
        conversation.gotoThread("column_response");
        conversation.next();
      },
      {},
      "col_question"
    );
  });
}
controller.on("direct_mention", function(bot, message) {
  console.log(message);
  console.log("direct message");
  console.log(controller.identity);
  var bot_email = controller.identity.emails[0];
  var response = message.text.split("access_token");
  console.log(response);
  if (response.length > 1) {
    createSheetConversation(message, bot, bot_email);
  }
  response = message.text.toLowerCase().split("yes");
  if (response.length > 1) {
    console.log(message);
    var local_storage = new App(controller.storage, message.user);
    local_storage.initializeStorage("populate");
    local_storage.getQuestions().then(
      () => {
        var sheets = local_storage.user.sheets;
        bot.startPrivateConversation(message, (err, convo) => {
          convo.addMessage(
            {
              text: "I  will now send you the questions in the Form. Kindly respond with your answers.",
              action: "question"
            },
            "default"
          );
          if (sheets.length === 0) {
            convo.addMessage(
              {
                text: "Oops, Looks like you don't currently have any sheet to fill",
                action: "done"
              },
              "question"
            );
          }
          sheets.forEach((s, index) => {
            s.columns.forEach(x => {
              convo.addQuestion(
                x.title,
                (response, conversation) => {
                  local_storage.saveAnswer(index, response.text).then(() => {
                    conversation.next();
                  });
                },
                {},
                "question"
              );
            });
          });
          convo.addMessage(
            "Awesome !!! The sheet has been updated with a row of your response. No further action is needed. Thank you for your time and enjoy the rest of your day ",
            "question"
          );
          convo.addMessage("Thanks for your time", "done");
          convo.on("end", function(convo) {
            if (convo.status == "completed") {
              // do something useful with the users responses
              // var res = convo.extractResponses();
              // console.log(res);
              local_storage.saveAnswers().then(
                () => {
                  console.log("Populated sheets");
                },
                err => {
                  console.log(err);
                }
              );
            } else {
              // something happened that caused the conversation to stop prematurely
            }
          });
        });
      },
      error => {
        console.log(error);
      }
    );
  }
});

controller.on("direct_message", function(bot, message) {
  bot.reply(
    message,
    {text:'Hello I’m the Smart Sheet filling Bot. You can create, Update  and share Sheets. <br />' + 'For Security purpose please provide your Smartsheet token. ' +
    'If you don’t have one you can follow the instructions and generate one via https://app.smartsheet.com/b/home <br />' +
    'Go To Settings  API Access  Click Generate New Access Token. <br />' + ' To get started type access_token' ,
    markdown: 'Hello I’m the Smart Sheet filling Bot. You can Create, Update  and Share Sheets. <br />' + 'For Security purpose please provide your Smartsheet token. <br />' +
    'If you don’t have one you can follow the instructions and generate one via https://app.smartsheet.com/b/home  <br />' +
    'Go To Settings, API Access and  click Generate New Access Token. <br />' + '**To get started type access_token**' ,
    }
    
  );
  if (message.original_message.files) {
    bot.retrieveFileInfo(message.original_message.files[0], function(
      err,
      file
    ) {
      bot.reply(message, "I also got an attached file called " + file.filename);
    });
  }
});

if (process.env.studio_token) {
  controller.on("direct_message,direct_mention", function(bot, message) {
    controller.studio
      .runTrigger(bot, message.text, message.user, message.channel)
      .then(function(convo) {
        if (!convo) {
          // console.log('NO STUDIO MATCH');
        }
      })
      .catch(function(err) {
        console.error("Error with Botkit Studio: ", err);
      });
  });
}
