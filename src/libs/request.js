import axios from 'axios'
import qs from 'qs'
import config from '@/config'
import {getToken} from '@/libs/util'
import {Message} from 'iview'

const baseUrl = process.env.NODE_ENV === 'development' ? config.baseUrl.dev : config.baseUrl.pro
/** **** 创建axios实例 ******/
const service = axios.create({
  baseURL: baseUrl, // api的base_url
  timeout: 5000 // 请求超时时间
})
/** **** request拦截器==>对请求参数做处理 ******/
service.interceptors.request.use((config) => {
    config.method === 'post'
      ? config.data = qs.stringify({...config.data})
      : config.params = {...config.params}
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded'
    if (getToken()) {
      config.headers['Authorization'] = 'Bearer ' + getToken()
    }
    return config
  }
)

service.interceptors.response.use(
  (response) => {
    if (response.data.code === 0) {
      // 服务端定义的响应code码为0时请求成功
      // 使用Promise.resolve 正常响应
      return Promise.resolve(response.data)
    } else {
      // 若不是正确的返回code，抛出错误
      const err = new Error(response.data.message)
      err.response = response
      throw err
    }
  }, error => {
    let message = ''
    if (error && error.response) {
      switch (error.response.status) {
        case 401:
          message = '未授权，请重新登录'
          location.reload()
        default:
          message = error.response.data.message ? error.response.data.message : "服务器错误"
      }
      Message.error({content: message})
      // 请求错误处理
      return Promise.reject(error)
    } else {
      message = '连接服务器失败'
      Message.error({content: message})
      return Promise.reject(error)
    }
  }
)

export default service
