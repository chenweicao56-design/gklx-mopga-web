/**
 * 表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-05 13:54:04
 * @Copyright  gklx
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
  get: (tableId) => {
      return getRequest(`/table/${tableId}`);
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
   * 删除  @author  gklx
   */
  delete: (id) => {
      return getRequest(`/table/delete/${id}`);
  },

  /**
   * 批量删除  @author  gklx
   */
  batchDelete: (idList) => {
      return postRequest('/table/batchDelete', idList);
  },

};
