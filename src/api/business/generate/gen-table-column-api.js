/**
 * 模板 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-05 14:10:43
 * @Copyright  gklx
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const genTableColumnApi = {

  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/genTableColumn/queryPage', param);
  },

  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/genTableColumn/add', param);
  },

  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/genTableColumn/update', param);
  },


  /**
   * 删除  @author  gklx
   */
  delete: (id) => {
      return getRequest(`/genTableColumn/delete/${id}`);
  },

  /**
   * 批量删除  @author  gklx
   */
  batchDelete: (idList) => {
      return postRequest('/genTableColumn/batchDelete', idList);
  },

};
