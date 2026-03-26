/**
 * 公共模板 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const templateCommonApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/templateCommon/queryPage', param);
  },

  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/templateCommon/add', param);
  },

  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/templateCommon/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/templateCommon/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/templateCommon/delete/${id}`);
  },

  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/templateCommon/batchDelete', idList);
  },

};