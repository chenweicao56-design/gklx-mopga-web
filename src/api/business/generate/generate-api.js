/**
 * 生成 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-05 13:54:04
 * @Copyright  gklx
 */
import {getRequest, postRequest, request} from '/@/lib/axios';
import axios from "axios";


export const generateApi = {

    syncTable: (databaseId, containColumn) => {
        return getRequest('/gen/sync/table/' + databaseId, {containColumn: containColumn});
    },
    /**
     * 增加  @author  gklx
     */
    syncTableColumn: (tableId) => {
        return getRequest('/gen/sync/column/' + tableId, {});
    },
    batchSyncTableColumn: (tableIds) => {
        return postRequest('/gen/batch/sync/column', tableIds);
    },
    preview: (tableId) => {
        return getRequest('/gen/preview/' + tableId, {});
    },
    createTable: (table, isSync) => {
        return request({
            url: `/gen/create/table`,
            method: 'post',
            params: {
                isSync: isSync,
            },
            data: table
        })
    },
    createTablePreview: (table) => {
        return request({
            url: `/gen/create/table/preview`,
            method: 'post',
            data: table
        })
    },
    coverCode: (url, data) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
            },
        };
        return axios.post(url + '/create-file', data, config)
    }


};
