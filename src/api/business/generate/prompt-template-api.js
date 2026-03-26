/**
 * 提示词模版 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-06 18:37:07
 * @Copyright  1.0
 */
import { postRequest, getRequest } from '/@/lib/axios';

export const promptTemplateApi = {
  /**
   * 分页查询  @author  gklx
   */
  queryPage : (param) => {
    return postRequest('/promptTemplate/queryPage', param);
  },

  /**
   * 增加  @author  gklx
   */
  add: (param) => {
      return postRequest('/promptTemplate/add', param);
  },

  /**
   * 修改  @author  gklx
   */
  update: (param) => {
      return postRequest('/promptTemplate/update', param);
  },

  /**
   * 获取详情  @author  ${basic.frontAuthor}
   */
  getDetail: (id) => {
      return getRequest(`/promptTemplate/getDetail/${id}`);
  },

  /**
   * 删除  @author  ${basic.frontAuthor}
   */
  delete: (id) => {
      return getRequest(`/promptTemplate/delete/${id}`);
  },

  /**
   * 批量删除  @author  ${basic.frontAuthor}
   */
  batchDelete: (idList) => {
      return postRequest('/promptTemplate/batchDelete', idList);
  },

};