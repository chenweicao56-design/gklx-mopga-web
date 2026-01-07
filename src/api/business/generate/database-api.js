/**
 * 数据源表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const databaseApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/database/queryPage', param);
  },

  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/database/add', param);
  },

  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/database/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/database/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/database/delete/${id}`);
  },

  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/database/batchDelete', idList);
  },
  /**
   * 获取相关的数据库字典类型  @author  ${basic.frontAuthor}
   */
  getColumnTypes: (id) => {
    return getRequest(`/database/getColumnTypes/${id}`);
  },

};