import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { registerSW } from 'virtual:pwa-register'

if (typeof document !== 'undefined') document.title = 'wynnonline'
registerSW({ immediate: true })

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
