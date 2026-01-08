/**
 * 表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const tableApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/table/queryPage', param);
  },

  /**
   * 查询  @author  gklx
   */
  all: (databaseId) => {
      return getRequest(`/table/all/${databaseId}`);
  },

  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/table/add', param);
  },

  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/table/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/table/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/table/delete/${id}`);
  },

  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/table/batchDelete', idList);
  },

};