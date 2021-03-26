import {io} from "socket.io-client";
export default function() {
    //initialize socket
    let socket : any;
    if(process.env.NODE_ENV === "development"){
        socket = io("http://localhost:8081",{transports:["websocket", "polling"]});
    } else {
        socket = io({transports:["websocket", "polling"]});
    }

    return socket;
}
