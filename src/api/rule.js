import request from '@/utils/request'

/**
 * 创建规则
 * @returns
 */
export function createRuleAPI(data) {
  return request({
    url: '/parking/rule',
    method: 'POST',
    data
  })
}
