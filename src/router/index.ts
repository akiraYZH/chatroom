import { createRouter, createWebHistory } from "vue-router";
import { routes } from "./routes";
import { inject } from "vue";
import { globalState } from "../types/types";

const router = createRouter({
    history: createWebHistory(),
    routes
});

// router.beforeEach((to, from, next) => {
//     let state:globalState | undefined = inject("state");
//     console.log(state, 123);
    
//     if (!state?.login) {
//         if (to.path === '/signin') {
//             next()
//         } else {
//             next('/signin')
//         }
//     } else{
//         next()
//     }
// })

export default router;