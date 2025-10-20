/**
 * 翻译 api 封装
 *
 * @Author:    gklx
 * @Date:      2025-09-09 15:50:25
 * @Copyright  gklx
 */
import {postRequest} from '/@/lib/axios';

export const translationApi = {

    /**
     * 增加  @author  gklx
     */
    translation: (param) => {
        return postRequest('/translate', param);
    },

};
