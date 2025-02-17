import { ipcMain, shell } from "electron";
import { createRequire } from "node:module";
import * as fs from "fs";

//
// Establishing communication with server using Socket
const require = createRequire(import.meta.url);
const io = require("socket.io-client");
const socket = io("http://localhost:5000");

// ------------------------------------------ //
//    frontend to backend functionalities     //
// ------------------------------------------ //

ipcMain.on("client-request-to-backend", (event, request) => {
  //
  //
  if (request["request_type"] == "clear-chat") {
    console.log("Chat Cleared");
  }
  //
  //
  else if (request["request_type"] == "save-user-info") {
    try {
      const userInfo = {
        full_name: request["full_name"],
        email_id: request["email_id"],
        bio: request["bio"],
      };
      const userInfoJson = JSON.stringify(userInfo);
      fs.writeFileSync("backend/user data/user_info.json", userInfoJson);
      event.reply("backend-response", {
        error_occurred: false,
        response: true,
        error: null,
      });
    } catch (error: unknown) {
      event.reply("backend-response", {
        error_occurred: true,
        response: false,
        error: error,
      });
    }
  }
  //
  //
  else if (request["request_type"] == "save-api-keys") {
    try {
      const apiKeys = `OPENAI_API_KEY = "${request["OPENAI_API_KEY"]}"\nGOOGLE_API_KEY = "${request["GOOGLE_API_KEY"]}"
      `;
      fs.writeFileSync("backend/user data/.env", apiKeys);
      event.reply("backend-response", {
        error_occurred: false,
        response: true,
        error: null,
      });
    } catch (error: unknown) {
      event.reply("backend-response", {
        error_occurred: true,
        response: false,
        error: error,
      });
    }
  }
  //
  //
  else if (request["request_type"] == "open-url-in-browser") {
    shell.openExternal(request["url"]);
  }
});

// -------------------------------- //
//       Frontend to Server         //
// -------------------------------- //

ipcMain.on("client-request-to-server", (event, request) => {
  socket.emit("message", request);
  socket.on("message-reply", (response: object) => {
    event.reply("server-response", response);
  });
});
