
let socket = require("socket.io");// socket
let config = require("../config.json");
let constant = require("../constants.json");
let generateId = require("../utils/gennerateId.js");


module.exports = (server) => {
    let usersInfo = [];
    let roomsInfo = {};
    let io = socket(server, { 
        cors: {
          origin: config.HOST.WHITELIST,
          credentials: true
        }
      
    }); 

    

    
    io.on(constant.SOCKET.EVENTS.CONNECTION, function(socket){
        // the user is connected to the socket
        
        console.log("a user connected");
        //   login event
        socket.on(constant.SOCKET.EVENTS.LOGIN, function(user){
            try{
                if(usersInfo.find(userObj => userObj.username === user.username)){
                    // check if the username exists already
                    socket.emit(constant.SOCKET.EVENTS.LOGIN_ERR); // triggers current client loginError event
                } else {
                    // login success
                    // 1. generate unique id for the user and push to "usersInfo"""
                    // 2. emit login success event to the client
                    // 3. broadcast to every client that a new user logined
                    // 4. broadcast to every client to update usersInfo data
                    user.id = socket.id;
                    usersInfo.push(user);
    
                    socket.emit(constant.SOCKET.EVENTS.LOGIN_SUC, {id:user.id, username:user.username, avatar: user.avatar}); // triggers current client loginSuccess event
                    io.emit(constant.SOCKET.EVENTS.USERSINFO, usersInfo);  // all users info
                    io.emit(constant.SOCKET.EVENTS.SYSTEM, {  // broadcast to everyone that the current user has logined
                        username: user.username,
                        status: constant.SOCKET.STATUS.LOGINED
                    });
                    
                    console.log(usersInfo.length + ' user connect.'); // print connected user number
                }
            } catch(e) {
                console.log(e);
            }
            
        });



        socket.on(constant.SOCKET.EVENTS.USERSINFO, function(){
            socket.emit(constant.SOCKET.EVENTS.USERSINFO, usersInfo);  // all users info
        });

        socket.on(constant.SOCKET.EVENTS.ROOMSINFO, function(){
            socket.emit(constant.SOCKET.EVENTS.ROOMSINFO, roomsInfo);  // all users info
        });

        

        socket.on(constant.SOCKET.EVENTS.JOIN_ROOM, ({room, user}) => {
            let foundRoom = roomsInfo[room.id];
            console.log(room);
            if(foundRoom){
                // the room exists
                foundRoom.users.push(user);
                
                socket.roomId = room.id;
                socket.join(room.id);    // join room
                // notify everyone in the room
                io.in(room.id).emit(constant.SOCKET.EVENTS.SYSTEM, {
                    username: user.username,
                    status: constant.SOCKET.STATUS.JOIN_ROOM
                });
                io.to(socket.roomId).emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom); //update room info
                socket.emit(constant.SOCKET.EVENTS.JOIN_ROOM_SUC, foundRoom);  
                
            } else {
                // the room doesn't exit, then create a new room
                let roomObj = {
                    id: generateId(),
                    roomName: room.roomName,
                    users: [user]
                }
                roomsInfo[roomObj.id] = roomObj;
                socket.roomId = roomObj.id;
                socket.join(roomObj.id);    // join room
                io.sockets.in(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                    username: user.username,
                    status: constant.SOCKET.STATUS.JOIN_ROOM
                });
                socket.emit(constant.SOCKET.EVENTS.CREATE_ROOM_SUC, roomObj);
                
                


                
            }
            io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(roomsInfo));  // update all rooms info
        })
        

        socket.join("roomObjid");    // join room

        socket.on(constant.SOCKET.EVENTS.SEND_MSG, function(msgObj){
            // io.to(socket.roomId).emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
            io.to(socket.roomId).emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
            // io.to(socket.roomId).emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
            // io.to("123").emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
            // io.emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
        });






        socket.on(constant.SOCKET.EVENTS.ROOM_INFO, function(roomId){

            let foundRoom = roomsInfo[roomId];
            socket.emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
        })
        
        socket.on(constant.SOCKET.EVENTS.LEAVE_ROOM, function(user){
            if(socket.roomId){
                socket.leave(socket.roomId); //leave room
                let foundRoom = roomsInfo[socket.roomId];
                foundRoom.users = foundRoom.users.filter(user => user.id !== socket.id); //update room info
                if(!foundRoom.users.length){
                    delete roomsInfo[socket.roomId];
                }else {
                    io.to(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                        username: user.username,
                        status: constant.SOCKET.STATUS.LEAVE_ROOM
                    });
                    io.to(socket.roomId).emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
                }
                socket.roomId = undefined;

                socket.emit(constant.SOCKET.EVENTS.LEAVE_ROOM);
                
                io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(roomsInfo));  // update all rooms info
            }
        })

        socket.on(constant.SOCKET.EVENTS.DISCONNECT, function(){
            let userDisconnected = usersInfo.find(user => user.id === socket.id);
            usersInfo = usersInfo.filter(user => user.id !== socket.id);

            if(socket.roomId){
                socket.leave(socket.roomId); //leave room
                let foundRoom = roomsInfo[socket.roomId];
                foundRoom.users = foundRoom.users.filter(user => user.id !== socket.id); //update room info

                if(!foundRoom.users.length){
                    delete roomsInfo[socket.roomId];
                } else{
                    io.to(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                        username: userDisconnected.username,
                        status: constant.SOCKET.STATUS.LEAVE_ROOM
                    });
                    io.to(socket.roomId).emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
                }
                

                
                socket.roomId = undefined;
                io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(roomsInfo));  // update all rooms info
            }

            if(userDisconnected){
                io.emit(constant.SOCKET.EVENTS.SYSTEM, {  // broadcast to everyone that the a user has logged out
                    username: userDisconnected.username,
                    status: constant.SOCKET.STATUS.DISCONNECT
                });
            }
            
            io.emit(constant.SOCKET.EVENTS.USERSINFO, usersInfo);  // refresh all users info
        });

        
      });
      
      
      

      return io;
}