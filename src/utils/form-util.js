import _ from 'lodash';
/**
 * 转为 小写中划线
 */
export function showForm(oldObj,newObj,defaultObj) {

    if (newObj && !_.isEmpty(newObj)) {
        Object.keys(oldObj).forEach(key =>
        {
            if(Object.prototype.hasOwnProperty.call(defaultObj, key)){
                if(Object.prototype.hasOwnProperty.call(newObj, key)){
                    oldObj[key] = newObj[key];
                }else{
                    oldObj[key] = defaultObj[key];
                }
            }else{
                delete oldObj[key];
            }
        });
    }else{
        Object.keys(oldObj).forEach(key =>
        {
            if(Object.prototype.hasOwnProperty.call(defaultObj, key)){
                oldObj[key] = defaultObj[key];
            }else{
                delete oldObj[key];
            }
        });
    }
}
