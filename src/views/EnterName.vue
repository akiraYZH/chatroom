<template>
    <div class="container">
        <div class="window">
            <div class="form">
                <div class="avatarPreview">
                    <Avatar :size="100" :src="avatar" />
                </div>
                <div class="avatarList">
                    <div :class="`avatarBox ${path === avatar ? 'active' : ''}`" v-for="(path, index) in avatarList" :key="index" @click="handleChangeAvatar(path)">
                        <Avatar size="large" :src="path">
                        </Avatar>
                    </div>
                </div>
                <div class="row">
                    <input type="text" class="input" placeholder="Please enter your name." @input="handleChangeName">
                </div>
                <div class="row">
                    <Button type="primary" @click="userLogin({username:name, avatar: avatar})">Enter</Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref, inject, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from "vue-router";
import { Button, Avatar, message } from 'ant-design-vue';
import { socket } from "../types/socket";
import { globalState, fetchInterface } from "../types/types";
import { SOCKET } from "../constants";



export default defineComponent({
    setup (props, context) {
        const state:globalState = inject("state");
        const login: Function = inject("login");
        const fetch:fetchInterface = inject("fetch");
        const socket: socket = inject("socket");
        const router = useRouter();
        

        

        
        let name = ref("");
        function handleChangeName(e):void{
            name.value = e.target.value;
                        
        }

        let avatar = ref("");
        function handleChangeAvatar(path): void {            
            avatar.value = path;
        }


        let avatarList = ref([]);
        onMounted(() => {

            state.login && router.push("/");

            fetch("/api/avatars")
            .then(data => {
                if(data.ok){
                    return data.json();
                }
            })
            .then(data => {
                if(data.length) {
                    avatar.value = data[0];
                    avatarList.value = data;
                    
                }
            })
        })
            
            
            
        
        // login logic
        function userLogin({username, avatar}):void{
            // callback handlers are in App.vue
            if(username){
                socket.emit(SOCKET.EVENTS.LOGIN, {username, avatar});
            } else {
                message.warn("Empty username!");
            }
            
        }
        
        return {name, avatarList, avatar,userLogin, handleChangeName, handleChangeAvatar}
    },
    components: {
        "Button": Button,
        "Avatar": Avatar
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
            display: flex;
            justify-content: center;
            align-items: center;
            .form {
                max-width: 500px;
                width: 500px;
                position: relative;
                top: -3vh;
                .avatarPreview{
                    margin-bottom: 30px;
                }
                .avatarList{
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    flex-wrap: wrap;
                    .avatarBox {
                        padding: 1px;
                        margin: 20px;
                        border-radius: 50%;
                        border:2px solid transparent;
                        cursor: pointer;
                        transition: 0.3s;
                        &:hover {
                            border:2px solid rgb(255, 141, 141);
                        }
                    }
                    .active {
                        border:2px solid rgb(255, 163, 163);
                    }
                }
                .row {
                    margin-bottom: 10px;
                    width: 100%;
                    .input {
                        width: 100%;
                        max-width: 70%;
                        padding: 10px;
                        border: 1px solid rgb(219, 219, 219);
                    }
                }
                
            }
        }
    }
</style>