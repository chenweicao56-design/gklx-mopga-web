/**
 * 模板字段 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-26 16:01:38
 * @Copyright  gklx
 */
import {postRequest, getRequest} from '/@/lib/axios';


export const templateColumnApi = {

    /**
     * 分页查询  @author  gklx
     */
    queryPage: (param) => {
        return postRequest('/templateColumn/queryPage', param);
    },
    listByDatabaseId: (databaseId) => {
        return getRequest(`/templateColumn/listByDatabaseId/${databaseId}`);
    },
    /**
     * 新增/修改  @author  gklx
     */
    batchSaveOrUpdate: (param) => {
        return postRequest('/templateColumn/batchSaveOrUpdate', param);
    },
    /**
     * 增加  @author  gklx
     */
    add: (param) => {
        return postRequest('/templateColumn/add', param);
    },
    /**
     * 增加  @author  gklx
     */
    addByColumnId: (columnId) => {
        return getRequest(`/templateColumn/add/${columnId}`);
    },
    /**
     * 修改  @author  gklx
     */
    update: (param) => {
        return postRequest('/templateColumn/update', param);
    },

    /**
     * 获取详情  @author  ${basic.frontAuthor}
     */
    getDetail: (id) => {
        return getRequest(`/templateColumn/getDetail/${id}`);
    },

    /**
     * 删除  @author  ${basic.frontAuthor}
     */
    delete: (id) => {
        return getRequest(`/templateColumn/delete/${id}`);
    },
    /**
     * 批量删除  @author  ${basic.frontAuthor}
     */
    batchDelete: (idList) => {
        return postRequest('/templateColumn/batchDelete', idList);
    },
};
