/**
 * 代码模板项表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-09 15:53:43
 * @Copyright  gklx
 */
import {postRequest, getRequest} from '/@/lib/axios';

export const templateCodeItemApi = {

    /**
     * 分页查询  @author  gklx
     */
    queryPage: (param) => {
        return postRequest('/templateCodeItem/queryPage', param);
    },

    /**
     * 增加  @author  gklx
     */
    add: (param) => {
        return postRequest('/templateCodeItem/add', param);
    },

    /**
     * 修改  @author  gklx
     */
    update: (param) => {
        return postRequest('/templateCodeItem/update', param);
    },
    /**
     * 新增/修改  @author  gklx
     */
    batchSaveOrUpdate: (param) => {
        return postRequest('/templateCodeItem/batchSaveOrUpdate', param);
    },


    /**
     * 删除  @author  gklx
     */
    delete: (id) => {
        return getRequest(`/templateCodeItem/delete/${id}`);
    },

    /**
     * 批量删除  @author  gklx
     */
    batchDelete: (idList) => {
        return postRequest('/templateCodeItem/batchDelete', idList);
    },
    test: (param) => {
        return postRequest('/templateCodeItem/test', param);
    }


};
