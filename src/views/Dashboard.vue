<template>
    <div class="container">
        
        <div class="window">
            <div class="top">
                <div>
                    <Avatar :src="state.user.avatar" size="large" class="avatar"/>
                    <span>{{state.user.username}}</span>
                </div>
                
                <Button type="primary" class="createBtn" @click="() => {showCreateRoomModal = true}">New room</Button>
            </div>
            <div class="roomList">
                <div class="roomBox" v-for="room in roomsInfo" :key="room.id" @click="joinRoom(room)">
                    <MessageTwoTone class="roomIcon" twoToneColor="rgb(129, 255, 207)"/>
                    <p>{{room.roomName}}</p>
                </div>
            </div>
            
            <div class="userList">
                <div class="userBox" v-for="user in usersInfo" :key="user.id">
                    <Avatar :src="user.avatar" size="middle"/>
                    <p>{{user.username}}</p>
                </div>
            </div>
        </div>
        <Modal
            :visible="showCreateRoomModal"
            @ok="createNewRoom"
            @cancel="() => {showCreateRoomModal = false}"
        >
            Room Name:<Input @change="(e) => {newRoomInfo.roomName = e.target.value}"/>
        </Modal>
    </div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import { MessageTwoTone } from '@ant-design/icons-vue';
import { useRouter } from "vue-router";
import { Button, Avatar, Modal, Input, message } from 'ant-design-vue';
import { globalState, createRoom } from "../types/types";
import { socket } from "../types/socket";
import { SOCKET } from "../constants";

export default defineComponent({
    setup (props, ctx) {
        const state: globalState = inject("state");
        const socket: socket = inject("socket");
        const router = useRouter();
        const showCreateRoomModal = ref(false);
        const newRoomInfo = reactive({roomName:""});
        let roomsInfo = ref([]);
        let usersInfo = ref([]);

        onMounted(()=>{
            socket.emit(SOCKET.EVENTS.ROOMSINFO);
            socket.emit(SOCKET.EVENTS.USERSINFO);

            socket.on(SOCKET.EVENTS.ROOMSINFO, (_roomsInfo) => {
                roomsInfo.value = _roomsInfo;
            })
            socket.on(SOCKET.EVENTS.USERSINFO, (_usersInfo) => {
                usersInfo.value = _usersInfo;
            })
        });

        onBeforeUnmount(()=>{
            socket.off(SOCKET.EVENTS.ROOMSINFO);
            socket.off(SOCKET.EVENTS.USERSINFO);
            socket.off(SOCKET.EVENTS.CREATE_ROOM_SUC);
            socket.off(SOCKET.EVENTS.JOIN_ROOM_SUC);
        })
        


        const createNewRoom:createRoom = ()=>{
            if(newRoomInfo.roomName){
                socket.emit(SOCKET.EVENTS.JOIN_ROOM, {room:newRoomInfo, user:state.user});
                showCreateRoomModal.value = false;
            } else {
                message.warn("Empty room name!");
            }
           

        }
        socket.on(SOCKET.EVENTS.CREATE_ROOM_SUC, (room) => {
                router.push(`/room/${room.id}`);
                message.success(`Created room ${room.roomName}!`);
        })

        function joinRoom(room){
            socket.emit(SOCKET.EVENTS.JOIN_ROOM, {room:room, user:state.user});
            
        }
        socket.on(SOCKET.EVENTS.JOIN_ROOM_SUC, (room) => {
                router.push(`/room/${room.id}`);
        })
        return { state, createNewRoom, showCreateRoomModal, newRoomInfo, joinRoom, usersInfo, roomsInfo };
    },
    components: {
        "Button": Button,
        "Avatar": Avatar,
        "Modal": Modal,
        "MessageTwoTone": MessageTwoTone,
        "Input": Input
    },
})
</script>

<style scoped lang="scss">
    .container {
        background: linear-gradient(to bottom, rgba(95, 138, 255, 0.384), rgb(255, 255, 255));
        width: 100%;
        min-height: 100vh;
        overflow: hidden;
        padding: 10px;
        box-sizing: border-box;
        .window {
            max-width: 1000px;
            box-sizing: border-box;
            margin: 30px auto 0;
            background: rgb(255, 255, 255);
            min-height: 90vh;
            border-radius: 10px;
            box-shadow: 0 0 10px rgb(240, 240, 240);
            padding: 20px;
            
            .top{
                margin-bottom: 10px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                .avatar {
                    margin-right: 10px;
                }

            }
            .roomList{
                height: 300px;
                border: 1px solid rgb(236, 236, 236);
                border-radius: 10px;
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                justify-content: start;
                overflow-y: auto;
                box-shadow: inset -1px 1px 4px rgb(187, 187, 187);
                .roomBox {
                    margin: 20px;
                    cursor: pointer;
                    transition: 0.3s;
                    transform-origin: center;
                    height: 60px;
                    width: 80px;
                    p {
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                    &:hover {
                        transform: scale(1.1);
                    }
                    .roomIcon {
                        font-size: 40px;
                    }
                }
            }
            .userList{
                height: 200px;
                display: flex;
                justify-content: start;
                flex-wrap: wrap;
                overflow: auto;
                
                .userBox{
                    width: 100px;
                }
            }
        }
    }
</style>