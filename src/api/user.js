import request from '@/utils/request'
// 就是export default service创建出的实例，名字可以任意

// 登录函数
/**
 * @description: 登录函数
 * @param {*} data { mobile,password}
 * @return {*} promise
 */
export function loginAPI(data) {
  // return request.post('/part/login',data)
  return request({
    url: '/park/login',
    method: 'POST',
    // data: data
    data
  })
}
