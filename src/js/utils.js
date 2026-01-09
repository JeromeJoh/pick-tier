// 工具函数集合

/**
 * 生成随机颜色
 * @returns {string} 十六进制颜色值
 */
export function generateRandomColor() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

/**
 * 生成唯一ID
 * @returns {string} 基于时间戳的唯一ID
 */
export function generateUniqueId() {
  return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} wait 等待时间
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 深拷贝对象
 * @param {any} obj 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj.getTime());
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (typeof obj === 'object') {
    const clonedObj = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }
}

/**
 * 检查文件是否为图片
 * @param {File} file 文件对象
 * @returns {boolean} 是否为图片
 */
export function isImageFile(file) {
  return file && file.type.startsWith('image/');
}

/**
 * 格式化文件大小
 * @param {number} bytes 字节数
 * @returns {string} 格式化后的文件大小
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 创建并下载文件
 * @param {string} content 文件内容
 * @param {string} filename 文件名
 * @param {string} mimeType MIME类型
 */
export function downloadFile(content, filename, mimeType = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * 将Canvas转换为图片并下载
 * @param {HTMLCanvasElement} canvas Canvas元素
 * @param {string} filename 文件名
 * @param {string} format 图片格式 ('png' | 'jpeg')
 * @param {number} quality 图片质量 (0-1)
 */
export function downloadCanvasAsImage(canvas, filename, format = 'png', quality = 0.9) {
  const mimeType = `image/${format}`;
  const dataURL = canvas.toDataURL(mimeType, quality);
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 等待图片加载完成
 * @param {string} src 图片源地址
 * @returns {Promise<HTMLImageElement>} 加载完成的图片元素
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}