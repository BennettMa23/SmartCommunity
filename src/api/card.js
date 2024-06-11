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
/**
 * 新增月卡
 * @data
 * @returns
 */
export function createCardAPI(data) {
  return request({
    url: '/parking/card',
    method: 'POST',
    data
  })
}
/**
 * 获取编辑页详情
 * @param {*} id
 * @returns
 */
export function getDetailAPI(id) {
  return request({
    url: `/parking/card/detail/${id}`
  })
}
/**
 * 更新月卡
 * @param {*} data
 * @returns
 */
export function updateCardAPI(data) {
  return request({
    url: '/parking/card/edit',
    method: 'PUT',
    data
  })
}
/**
 * 删除月卡
 * @param {*} id
 * @returns
 */
export function delCardAPI(id) {
  return request({
    url: `/parking/card/${id}`,
    method: 'DELETE'
  })
}
/**
 * 批量删除月卡
 * @param {*} id
 * @returns
 */
export function delCardListAPI(idList) {
  console.log(idList)
  return request({
    url: `/parking/card/${idList.join(',')}`,
    method: 'DELETE'
  })
}

