import axios from 'axios'
import { Message } from 'element-ui'
import { getToken } from '@/utils/auth'
const service = axios.create({
  baseURL: 'https://api-hmzs.itheima.net/v1',
  timeout: 5000 // request timeout
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 添加token
    const token = getToken()
    if (token) {
      // 前面是固定的写法  后面token的拼接模式由后端来决定
      config.headers.Authorization = token
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    // console.log(response)
    return response.data
  },
  error => {
    // Token 401处理
    // console.dir(error.response.status)
    // if (error.response.status === 401) {
    //   // 1. 跳转到登录
    // //   router.push('/login')
    //   // 2. 清空用户数据
    //   this.$store.commit('user/clearUserInfo')
    // }
    // 错误统一处理
    // 错误类型有可能有好多种 根据不同的错误码做不同的用户提示 写的位置都在这里
    Message({
      type: 'warning',
      message: error.response.data.msg
    })
    // Message.error(error.response.data.msg)
    return Promise.reject(error)
  }
)

export default service
