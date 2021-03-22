export const routes = [
    { 
        path: '/',
        component: () => import("../views/Dashboard.vue"),
    },
    { 
        path: '/signin',
        component: () => import("../views/EnterName.vue"),
    },
    { 
        path: '/room/:roomId',
        component: () => import("../views/Chatroom.vue"),
    },
  ]