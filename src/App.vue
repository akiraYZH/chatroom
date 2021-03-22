<template>
    <RouterView/>
</template>

<script lang="ts">
import { defineComponent, provide, onMounted, watch, onBeforeUnmount } from 'vue';
import { useRouter } from "vue-router";
import stateComposition from "./compositions/state";
import socketComposition from "./compositions/socket";
import fetch from './compositions/fetch';
import { SOCKET } from "./constants";


export default defineComponent({
    name: 'Index',
    setup(){
        let socket = socketComposition();
        let { login, startLoading, stopLoading, state} = stateComposition();
        let router = useRouter();
        provide("state", state);
        provide("fetch", fetch);
        provide("login", login);
        provide("startLoading", startLoading);
        provide("stopLoading", stopLoading);
        provide("socket", socket);

        watch(state, ()=> {
            !state.login && router.push("/signin");
        })
        onMounted(() => {
            let user = JSON.parse(sessionStorage.getItem("user"));
            if(user){
                socket.emit(SOCKET.EVENTS.LOGIN, user);
                
                
            }else {
                router.push("/signin");
            }
        })
        socket.on(SOCKET.EVENTS.LOGIN_SUC, (data) =>{
            login({id:data.id, username:data.username, avatar:data.avatar}, ()=>{
                router.push("/");
            });
        });
        socket.on(SOCKET.EVENTS.LOGIN_ERR, (data) =>{
            router.push("/signin");
        });

        onBeforeUnmount(() => {
            socket.off(SOCKET.EVENTS.LOGIN_SUC);
            socket.off(SOCKET.EVENTS.LOGIN_ERR);
        })
    }
})
</script>

<style lang="scss">

* {
  margin: 0;
  padding: 0;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>