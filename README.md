// 引入diff-match-patch库
import DiffMatchPatch from 'diff-match-patch'

// 将库挂载到全局以便merge插件使用
window.diff_match_patch = DiffMatchPatch
window.DIFF_DELETE = -1  // 删除操作标识
window.DIFF_INSERT = 1   // 插入操作标识
window.DIFF_EQUAL = 0    // 相同内容标识

// 引入merge插件及其样式（关键步骤！）
import 'codemirror/addon/merge/merge.css'
import 'codemirror/addon/merge/merge.js'
