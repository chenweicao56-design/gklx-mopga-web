/**
 * 模板表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-09 15:50:25
 * @Copyright  gklx
 */
import {postRequest, getRequest} from '/@/lib/axios';

export const templateApi = {

    /**
     * 分页查询  @author  gklx
     */
    queryPage: (param) => {
        return postRequest('/template/queryPage', param);
    },

    /**
     * 增加  @author  gklx
     */
    add: (param) => {
        return postRequest('/template/add', param);
    },

    /**
     * 修改  @author  gklx
     */
    update: (param) => {
        return postRequest('/template/update', param);
    },


    /**
     * 删除  @author  gklx
     */
    delete: (id) => {
        return getRequest(`/template/delete/${id}`);
    },

    /**
     * 批量删除  @author  gklx
     */
    batchDelete: (idList) => {
        return postRequest('/template/batchDelete', idList);
    },
    /**
     * 增加  @author  gklx
     */
    copy: (param) => {
        return postRequest('/template/copy', param);
    },

};
