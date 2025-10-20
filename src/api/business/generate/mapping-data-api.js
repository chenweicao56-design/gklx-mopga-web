/**
 * 映射数据表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';
    
export const mappingDataApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/mappingData/queryPage', param);
  },
  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/mappingData/add', param);
  },
    
  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/mappingData/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/mappingData/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/mappingData/delete/${id}`);
  },
    
  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/mappingData/batchDelete', idList);
  },
    
};