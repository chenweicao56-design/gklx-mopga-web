/*
 * 字符串 相关操作
 *
 * @Author:    1024创新实验室-主任：卓大
 * @Date:      2022-09-06 20:58:49
 * @Wechat:    zhuda1024
 * @Email:     lab1024@163.com
 * @Copyright  1024创新实验室 （ https://1024lab.net ），Since 2012
 */

/**
 * 转为 小写中划线
 */
export function convertLowerHyphen(str) {
  if (!str) {
    return '';
  }

  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .substring(1);
}
/**
 * 转为驼峰
 */
export function convertUpperCamel(str) {
  if (!str) {
    return '';
  }

  str = str.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
  // 首字母大写
  return str[0].toUpperCase() + str.substring(1);
}

/**
 * 转为驼峰
 */
export function convertLowerCamel(str) {
  if (!str) {
    return '';
  }

  return str.replace(/_(\w)/g, (_, letter) => letter.toUpperCase());
}


/**
 * 去掉字符串首尾的```json和```标记
 * @param {string} str - 带json标记的字符串
 * @returns {string} 纯净的JSON字符串（匹配不到则返回原字符串）
 */
export function removeJsonMark(str) {
  if (typeof str !== 'string') return str; // 非字符串直接返回，避免报错
  const reg = /```json\s*([\s\S]*?)\s*```/;
  return str.match(reg)?.[1] || str;
}