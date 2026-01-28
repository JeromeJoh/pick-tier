// Pick Tier 应用入口文件

import { TierMaker } from './tierMaker.js';

// 初始化应用
const tierMaker = new TierMaker();

// 导出到全局作用域以便HTML中的事件处理器使用
window.tierMaker = tierMaker;
window.presentMode = tierMaker.presentMode;

// 应用加载完成提示
console.log('🏆 Pick Tier application loaded successfully!');

// TODO: element size 作为基本单位设置其他宽高
// TODO: 所有的 modal 框样式
// TODO: 重点 present mode 样式优化
// TODO: 配置缓存导入是否有必要保留
// TODO: 使用自己的 toast 组件