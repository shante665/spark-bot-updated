 ##About the Project (Use Case)
*SmartSheet bot is used as an interactive SmartSheet creating & filling solution right from Cisco Spark!  
*Users do not have to leave their favorite collaboration platform in order to fill surveys, reports, or forms
*Survey response rate may increase form an average of 40 % to more as users will feel like they are interacting with an actual person

 ##Demo Steps 
*To begin the process find the bot and send a direct message beginning with your smart sheet API access token using the  **access_token** command followed by the token
*To create a Sheet use **Sheet_Name** command followed by the name of the sheet
*To Add columns to the Sheet use **Add_Col** command followed by the title of the columns separated by a comma
*After the sheet is created, In order to enable the Bot get the list of rooms you belong to you would pate your Cisco Spark Access Token when requested
*To begin sharing the sheet with members in a room initiate with **Sheet_Share** command
*After the list of rooms have been populated respond with a number assigned to the room
*The Direct mention takes place and the User is sent a direct message to confirm availability to fill sheet in a room created by the Bot
*User responds with mention **@Smartsheetbot Yes** and the bot gets all the Users responses and populates the sheet with a row

##Components of the application/code 
1.MongoDB is the object oriented database we used to store the sheet ID against the list of shared users in a room. Mongoose is the npm library of mongo DB
2.Reddis allows the bot create a temporary database that allows conversations to persist data of a specific user conversation and handles the temporary storage across conversations between the bot and the sheet Creators/ Editors
3.BotKit Library comes with a majority of all the functions needed 
4.SmartSheet Node Package Manager allows us used prebuilt smart sheet functions in Node JS instead of reinventing the wheel.
 
##Installation Steps and Procedures to run the SmartSheet Bot locally.

*First clone the entire project folder from GitHub
*Before you begin Have at least Node JS 7.0 installed on your computer. It's better to *Install node version manager to install node 7
*Download, install and run a REDDIS instance and point the URL to the variable link
*Download, install and run Mongo DB instance and point the URL to the variable link. You can use MLAB to generate a free instance of the Mongo database
*Open terminal and run npm install  to install all the project dependencies
*Create a startup.sh file in the same spark_bot directory and include all the bot tokens and Urls as specified below . This is used to set all the environmental variables needed by assigning the bot tokens and links 
//export CISCOSPARK_ACCESS_TOKEN= ?
//export REDIS_URL= ?
//export access_token= ? //This is the same as the Spark Access token above
//export mongoose_db=? url to logo DB instance
//export public_address=? NGROK URL
 *To run the project open terminal within the IDE and run source startup.sh to run all the environmental variables, and use npm start to run the server

 ###Room for Improvement
*Update and Modify Smart Sheets directly from Cisco Spark
*Sheet Editors / admins should be able to add multiple responses to a sheet in form of rows.