
let socket = require("socket.io");// socket
let config = require("../config.json");
let constant = require("../constants.json");
let routes  = require("./routes.js");


module.exports = (server) => {
    let io = socket(server, { 
        cors: {
          origin: config.HOST.WHITELIST,
          credentials: true
        }
    }); 

    io.usersInfo = {};
    io.roomsInfo = {};
    
    io.on(constant.SOCKET.EVENTS.CONNECTION, routes.bind(this, io));
    return io;
}