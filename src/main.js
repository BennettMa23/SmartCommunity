import Vue from 'vue'
import 'normalize.css/normalize.css'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import '@/styles/index.scss' // global css

import App from './App'

import store from './store'

import router from './router'

// 注册svg
import '@/icons'
// 全局注册组件
Vue.use(ElementUI)

// 测试环境变化
console.log('环境变量为:', process.env.VUE_APP_BASE_URL)
Vue.config.productionTip = false

// 注册自己的插件
import componentPlugin from '@/components'
Vue.use(componentPlugin)

// 执行全局指令注册
import './directive'

// 添加权限控制初始化(直接把permmision.js中的代码立即执行)
import './permission'

// import './registerMicroApp'

// vue实例化
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

// render: h => h(App)是ES6的写法，其实就是如下内容的简写：

// render: function (createElement) {
//      return createElement(App);
// }

// 进一步缩写为(ES6 语法)：

// render (createElement) {
//     return createElement(App);
// }

// 再进一步缩写为：
// render (h){
//     return h(App);
// }

// 按照 ES6 箭头函数的写法，就得到了：
// render: h => h(App);
// render函数是渲染一个视图，然后提供给el挂载，如果没有render那页面什么都不会出来