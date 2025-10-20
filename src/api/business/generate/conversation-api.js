/**
 * 会话表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';
    
export const conversationApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/conversation/queryPage', param);
  },
  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/conversation/add', param);
  },
    
  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/conversation/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/conversation/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/conversation/delete/${id}`);
  },
    
  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/conversation/batchDelete', idList);
  },
    
};