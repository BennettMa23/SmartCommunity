import request from '@/utils/request'

/**
 * 获取楼宇列表
 * @param { page, pageSize} params
 * @returns
 */
export function getCardListAPI(params) {
  return request({
    url: '/parking/card/list',
    params
  })
}
