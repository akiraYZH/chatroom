import { createApp } from 'vue'
import App from './App.vue'

import router from "./router/index";

let app = createApp(App)
app.use(router);
// # sourceMappingURL = main.js.map



// Vue global properties
app.mount('#app');
