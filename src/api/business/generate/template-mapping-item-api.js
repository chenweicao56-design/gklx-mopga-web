/**
 * 字段类型映射表 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-09 15:56:28
 * @Copyright  gklx
 */
import {postRequest, getRequest} from '/@/lib/axios';

export const templateMappingItemApi = {

    /**
     * 分页查询  @author  gklx
     */
    queryPage: (param) => {
        return postRequest('/templateMappingItem/queryPage', param);
    },

    /**
     * 增加  @author  gklx
     */
    add: (param) => {
        return postRequest('/templateMappingItem/add', param);
    },

    /**
     * 新增或修改  @author  gklx
     */
    batchSaveOrUpdate: (param) => {
        return postRequest('/templateMappingItem/batchSaveOrUpdate', param);
    },

    /**
     * 修改  @author  gklx
     */
    update: (param) => {
        return postRequest('/templateMappingItem/update', param);
    },


    /**
     * 删除  @author  gklx
     */
    delete: (id) => {
        return getRequest(`/templateMappingItem/delete/${id}`);
    },

    /**
     * 批量删除  @author  gklx
     */
    batchDelete: (idList) => {
        return postRequest('/templateMappingItem/batchDelete', idList);
    },

};
