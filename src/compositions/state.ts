import { reactive, readonly } from "vue";
import { userObj } from "../types/types";

// import socketCompositon from "./socket";
import {globalState, login, startLoading, stopLoading, setUserInfo, usersInfo, createRoom, setRoomsInfo, roomsInfo} from "../types/types"; //types and interfaces




export default function (){
    // globale state
    const _state: globalState = reactive({
        login: false,
        user: {
            id:"",
            username:  "",
            avatar: "",
        },
        usersInfo: [],
        roomsInfo: [],
        loading: false,
    });

    // state to expose
    const state = readonly(_state);

   
    const login: login = ({id, username, avatar}, callback) => {
        
        _state.user = {
            id: id,
            username: username,
            avatar: avatar
        }
        _state.login = true;
        
        window.sessionStorage.setItem("user", JSON.stringify( _state.user));
        if(callback){
            callback();
        }
    }
    const startLoading: startLoading = () => {
        _state.loading = true;
    }

    const stopLoading: stopLoading = () => {
        _state.loading = false;
    }
    
    

    
    return {
        state,
        login,
        startLoading,
        stopLoading,
        // createRoom,
    }
    
}