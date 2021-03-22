<template>
    <div class="container">
        <div class="window">
             <div class="top">
                <ArrowLeftOutlined  class="leave-room-btn" @click="leaveRoom"/>
                <h3 class="room-name">{{roomInfo.roomName}}</h3>
            </div>
            <div class="content">
                <div class="chat">
                    <div class="messagesWindow" id="messagesWindow">
                        <div  v-for="msg in messages" :key="msg" :class="msg.user.id === state.user.id ? 'me-box' : 'other-box'">
                            <div :class="'msg' + (msg.user.id === state.user.id ? ' me' : ' other')">
                                <Avatar :src="msg.user.avatar" size="80" class="avatar"/>
                                <p class="msg-text">{{msg.message}}</p>
                            </div>
                        </div>
                        
                    </div>
                    <div class="inputSection">
                        <div class="menu">
                            <EmojiDropdown @selectEmoji="addEmoji" class="menu-option"/>
                        </div>
                        <div class="actions">
                            <TextArea class="textarea" v-model:value="msgToSend" @keyup.enter="sendMsg" @input="input" :style="{'min-height':`${textareaHeight}`}"></TextArea>
                            
                            <Button type="primary" @click="sendMsg">Send</Button>
                        </div>
                    </div>
                </div>
                <div class="users">
                    <div class="userBox" v-for="user in roomInfo.users" :key="user.id">
                        <Avatar :src="user.avatar" size="middle"/>
                        <p>{{user.username}}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, onMounted, ref, reactive, onBeforeUnmount, nextTick, watch } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { globalState } from "../types/types";
import { Button, Avatar, Input , message } from 'ant-design-vue';
import { ArrowLeftOutlined }from "@ant-design/icons-vue";
import { SOCKET } from "../constants";
import { socket, systemMessage } from "../types/socket";
import EmojiDropdown from "../components/EmojiDropdown.vue";

export default defineComponent({
    setup (props, ctx) {
        const state: globalState = inject("state");
        const socket: socket = inject("socket");
        const router = useRouter();
        const route = useRoute();
        let msgToSend = ref<string>("");
        let roomInfo = reactive({id:"", users:[], roomName:""});
        let messages = ref<{}[]>([]);
        let textareaHeight = ref<string>("auto");
        

        onMounted(() => {    
           socket.emit(SOCKET.EVENTS.ROOM_INFO, route.params.roomId);
           
        })

        const input = (e):void => {
            textareaHeight.value = `auto`;
            nextTick(() => {
                return textareaHeight.value = e.target.scrollHeight + `px`;
            })
        }

        watch(messages.value, ()=>{
            nextTick(()=>{
                // after render
                if(document){
                    let msgWindow = document.querySelector("#messagesWindow");
                    msgWindow.scrollTop = msgWindow.scrollHeight;
                }
            })
        })

        const addEmoji= (emoji):void =>{
            msgToSend.value += emoji;
        };


        const sendMsg = ():void =>{
            if(msgToSend.value){
                socket.emit(SOCKET.EVENTS.SEND_MSG, {user:state.user, message:msgToSend.value});
                msgToSend.value = "";
            } else {
                message.warn("Empty message!");
            }
            
        }



        const leaveRoom = () => {
            socket.emit(SOCKET.EVENTS.LEAVE_ROOM, state.user);
        }


        // SOCKET subscriptions
        socket.on(SOCKET.EVENTS.LEAVE_ROOM, function(){
            router.push("/");
        })
        socket.on(SOCKET.EVENTS.ROOM_INFO, function(data){
            if(data){
                roomInfo.id = data.id;
                roomInfo.users = data.users;
                roomInfo.roomName = data.roomName;
            } else {
                router.push("/");
            }
        })
        socket.on(SOCKET.EVENTS.RECEIVE_MSG, function(data){
            messages.value.push(data);
            
        })
        socket.on(SOCKET.EVENTS.SYSTEM, (data: systemMessage) => {
        switch (data.status) {
            case SOCKET.STATUS.DISCONNECT: //someone leave the room
                return message.info(`${data.username} leaved the room`);
            case SOCKET.STATUS.JOIN_ROOM: //someone leave the room
                return message.info(`${data.username} joined room`);
            case SOCKET.STATUS.LEAVE_ROOM: //someone leave the room
                return message.info(`${data.username} leaved the room`);
            default:
                break;
        }
    });
        onBeforeUnmount(() => {
            socket.off(SOCKET.EVENTS.ROOM_INFO);
            socket.off(SOCKET.EVENTS.RECEIVE_MSG);
            socket.off(SOCKET.EVENTS.ROOM_INFO);
            socket.off(SOCKET.EVENTS.LEAVE_ROOM);
            socket.off(SOCKET.EVENTS.SYSTEM);

        });
        return { state, msgToSend, roomInfo, messages, sendMsg, leaveRoom, addEmoji, input, textareaHeight }
    },
    components: {
        "Button": Button,
        "Avatar": Avatar,
        "TextArea": Input.TextArea,
        "ArrowLeftOutlined": ArrowLeftOutlined,
        "EmojiDropdown": EmojiDropdown
    },
    mounted() {
        
        // this.$socket.emit('user_login');
    },
})
</script>

<style scoped lang="scss">
    .container {
        background: linear-gradient(to bottom, rgba(95, 138, 255, 0.384), rgb(255, 255, 255));
        min-height: 100vh;
        overflow: hidden;
        padding: 10px;
        box-sizing: border-box;
        .window {
            max-width: 1000px;
            margin: 30px auto 0;
            background: rgb(255, 255, 255);
            min-height: 90vh;
            border-radius: 10px;
            box-shadow: 0 0 10px rgb(240, 240, 240);
            padding: 20px;
            display: flex;
            flex-direction: column;
            .top{
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                text-align: center;
                .room-name {
                    margin: 0 auto;
                    min-width: 0;
                }
                .avatar {
                    margin-right: 10px;
                }
                .leave-room-btn {
                    color:rgb(184, 184, 184);
                    font-size: 20px;
                    cursor: pointer;
                    transition:  0.3s;
                    position: absolute;
                    left: 0;

                    &:hover {
                        color:aquamarine;
                    }
                }

            }
            .content{
                display: flex;
                flex-grow: 1;
                .chat{
                    width: 0;
                    flex-grow: 1;
                    display: flex;
                    flex-direction: column;
                    .messagesWindow{
                        width: 100%;
                        height: 0;
                        flex-grow: 1;
                        border: 1px solid rgb(233, 233, 233);
                        padding: 10px;
                        box-shadow: inset -1px 1px 4px rgb(219, 219, 219);
                        overflow-y: auto;
                        .me-box {
                            display: flex;
                            justify-content: flex-end;
                        }
                        .msg{
                            display: flex;
                            align-items: self-start;
                            max-width: 85%;
                            margin: 10px 0;
                            
                            .avatar {
                                flex-shrink: 0;
                            }
                            .msg-text{
                                padding: 7px;
                                margin: 0 5px;
                                border-radius: 4px;
                                text-align: left;
                                word-break: break-word;
                                font-size: 18px;
                            }
                            
                        }
                        .me {
                            flex-direction: row-reverse;
                            .msg-text{
                                background-color: rgb(151, 253, 190);
                            }
                                
                        }
                        .other {
                            
                            .msg-text{
                                background-color: rgb(241, 241, 241);
                            }
                            
                        }
                    }
                    .inputSection {
                        border:1px solid rgb(233, 233, 233);
                        border-top: none;
                        .menu{
                            height: 40px;
                            display: flex;
                            align-items: center;
                            border-bottom: 1px solid rgb(233, 233, 233);
                            .menu-option{
                                margin: 0 10px;
                            }
                        }
                        
                        .actions {
                            display: flex;
                            justify-content: flex-end;
                            padding: 5px;
                            box-shadow: inset -1px 1px 3px rgb(177, 177, 177);
                            .textarea{
                                width: 100%;
                                height: 32px;
                                resize: none;
                                border: none;
                                border: 1px solid #ececec;
                                box-sizing: border-box;
                                margin-right: 5px;
                                box-shadow: none;
                                box-shadow: 0 0 4px rgb(218, 218, 218);
                            }
                        }
                    }
                }
                .users{
                    width: 200px;
                    border: 1px solid rgb(233, 233, 233);
                    border-left: none;
                    display: flex;
                    justify-content: start;
                    flex-wrap: wrap;
                    overflow: auto;
                    padding:10px;
                    @media screen and (max-width: 600px) {
                        display: none;
                    }
                    .userBox{
                        width: 80px;
                    }
                }
            }
            
        }
    }
</style>