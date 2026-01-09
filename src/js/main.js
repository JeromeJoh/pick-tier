// Pick Tier 应用入口文件

import { TierMaker } from './tierMaker.js';

// 初始化应用
const tierMaker = new TierMaker();

// 导出到全局作用域以便HTML中的事件处理器使用
window.tierMaker = tierMaker;
window.presentMode = tierMaker.presentMode;

// 应用加载完成提示
console.log('🏆 Pick Tier application loaded successfully!');