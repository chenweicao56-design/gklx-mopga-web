/**
 * 数据源表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-05 09:07:47
 * @Copyright  1
 */
import {postRequest, getRequest} from '/src/lib/axios';

export const databaseApi = {

    /**
     * 分页查询  @author  gklx
     */
    queryPage: (param) => {
        return postRequest('/database/queryPage', param);
    },

    /**
     * 查询  @author  gklx
     */
    get: (databaseId) => {
        return getRequest(`/database/${databaseId}`);
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
     * 删除  @author  gklx
     */
    delete: (id) => {
        return getRequest(`/database/delete/${id}`);
    },

    /**
     * 批量删除  @author  gklx
     */
    batchDelete: (idList) => {
        return postRequest('/database/batchDelete', idList);
    },

};
