/**
 * 映射表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';
    
export const mappingApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/mapping/queryPage', param);
  },
  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/mapping/add', param);
  },
    
  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/mapping/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/mapping/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/mapping/delete/${id}`);
  },
    
  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/mapping/batchDelete', idList);
  },
    
};