
let constant = require("../constants.json");
let generateId = require("../utils/gennerateId.js");

module.exports = function (io, socket) {
        /**
     *
     * @description login event
     * @param { username:string, avatar:string} user 
     *
     */
    socket.on(constant.SOCKET.EVENTS.LOGIN, function(user){
        try{
            if(io.usersInfo && Object.values(io.usersInfo).find(userObj => userObj.username === user.username)){
                // check if the username exists already
                socket.emit(constant.SOCKET.EVENTS.LOGIN_ERR); // triggers current client loginError event
            } else {
                // login success
                // 1. generate unique id for the user and push to "usersInfo"""
                // 2. emit login success event to the client
                // 3. broadcast to every client that a new user logined
                // 4. broadcast to every client to update usersInfo data
                
                user.id = socket.id;
                socket.user = user;
                if(!io.usersInfo){
                    io.usersInfo = {};
                }
                io.usersInfo[user.id] = user;
                socket.emit(constant.SOCKET.EVENTS.LOGIN_SUC, {id:user.id, username:user.username, avatar: user.avatar}); // triggers current client loginSuccess event
                io.emit(constant.SOCKET.EVENTS.USERSINFO, Object.values(io.usersInfo));  // all users info
                io.emit(constant.SOCKET.EVENTS.SYSTEM, {  // broadcast to everyone that the current user has logined
                    username: user.username,
                    status: constant.SOCKET.STATUS.LOGINED
                });
                
                console.log(io.usersInfo.length + ' user connect.'); // print connected user number
            }
        } catch(e) {
            console.log(e);
        }
        
    });


       /**
     *
     * @description get all online users info
     *
     */
    socket.on(constant.SOCKET.EVENTS.USERSINFO, function(){
        socket.emit(constant.SOCKET.EVENTS.USERSINFO, Object.values(io.usersInfo));  // all users info
    });

       /**
     *
     * @description get all existing rooms
     *
     */
    socket.on(constant.SOCKET.EVENTS.ROOMSINFO, function(){
        socket.emit(constant.SOCKET.EVENTS.ROOMSINFO, io.roomsInfo);  // all users info
    });

    
      /**
     *
     * @description create room or join a room
     * @param { id:string, username:string, avatar:string} user 
     * @param { id?:string, roomName:string } room 
     */
    socket.on(constant.SOCKET.EVENTS.JOIN_ROOM, ({room, user}) => {
        let foundRoom = io.roomsInfo ? io.roomsInfo[room.id] : null;
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
            if(!io.roomsInfo){
                io.roomsInfo = {};
            }
            io.roomsInfo[roomObj.id] = roomObj;
            // roomsInfo[roomObj.id] = roomObj;
            socket.roomId = roomObj.id;
            socket.join(roomObj.id);    // join room
            io.sockets.in(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                username: user.username,
                status: constant.SOCKET.STATUS.JOIN_ROOM
            });
            socket.emit(constant.SOCKET.EVENTS.CREATE_ROOM_SUC, roomObj);
            
            


            
        }
        io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(io.roomsInfo));  // update all rooms info
    })
    

    /**
     *
     * @description send message in a room
     * @param {*} msgObj return back to clients in the room 
     */
    socket.on(constant.SOCKET.EVENTS.SEND_MSG, function(msgObj){
        io.to(socket.roomId).emit(constant.SOCKET.EVENTS.RECEIVE_MSG, msgObj)
    });





    /**
     *
     * @description get room info
     * @param {string} roomId 
     */
    socket.on(constant.SOCKET.EVENTS.ROOM_INFO, function(roomId){

        let foundRoom = io.roomsInfo ? io.roomsInfo[roomId] : null;
        socket.emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
    })
    

     /**
     *
     * @description leave current room
     * @param { id:string, username:string, avatar:string} user 
     */
    socket.on(constant.SOCKET.EVENTS.LEAVE_ROOM, function(user){
        if(socket.roomId){
            socket.leave(socket.roomId); //leave room
            let foundRoom = io.roomsInfo[socket.roomId];
            foundRoom.users = foundRoom.users.filter(user => user.id !== socket.id); //update room info

            // if there is no one in the room, delete the room
            if(!foundRoom.users.length){
                delete io.roomsInfo[socket.roomId];
                
            }else {
                io.to(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                    username: user.username,
                    status: constant.SOCKET.STATUS.LEAVE_ROOM
                });
                io.to(socket.roomId).emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
            }
            socket.roomId = undefined;

            socket.emit(constant.SOCKET.EVENTS.LEAVE_ROOM);
            
            io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(io.roomsInfo));  // update all rooms info
        }
    })

     /**
     *
     * @description client disconnect
     */
    socket.on(constant.SOCKET.EVENTS.DISCONNECT, function(){
        // if client joined a room        
        if(socket.roomId){
            socket.leave(socket.roomId); //leave room
            let foundRoom = io.roomsInfo[socket.roomId];
            foundRoom.users = foundRoom.users.filter(user => user.id !== socket.id); //update room info

            if(!foundRoom.users.length){
                delete io.roomsInfo[socket.roomId];
                
            } else{
                io.to(socket.roomId).emit(constant.SOCKET.EVENTS.SYSTEM, {
                    username: socket.user ? socket.user.username : null,
                    status: constant.SOCKET.STATUS.LEAVE_ROOM
                });
                io.to(socket.roomId).emit(constant.SOCKET.EVENTS.ROOM_INFO, foundRoom);
            }
            

            
            socket.roomId = undefined;
            io.emit(constant.SOCKET.EVENTS.ROOMSINFO, Object.values(io.roomsInfo));  // update all rooms info
        }

        if(socket.user){
            delete io.usersInfo[socket.user.id];
            io.emit(constant.SOCKET.EVENTS.USERSINFO, Object.values(io.usersInfo));  // refresh all users info

            io.emit(constant.SOCKET.EVENTS.SYSTEM, {  // broadcast to everyone that the a user has logged out
                username: socket.user.username,
                status: constant.SOCKET.STATUS.DISCONNECT
            });
        }
    });
}