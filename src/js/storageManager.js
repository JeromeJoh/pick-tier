// 会话存储管理模块

export class StorageManager {
  constructor() {
    this.storageKey = 'pickTier_data';
    this.version = '1.0';
  }

  /**
   * 保存应用数据到会话存储
   * @param {Object} data 要保存的数据
   */
  saveData(data) {
    try {
      const storageData = {
        version: this.version,
        timestamp: Date.now(),
        data: {
          elements: data.elements || [],
          tiers: data.tiers || [],
          nextElementId: data.nextElementId || 1
        }
      };

      sessionStorage.setItem(this.storageKey, JSON.stringify(storageData));
      console.log('数据已保存到会话存储');
      return true;
    } catch (error) {
      console.error('保存数据到会话存储失败:', error);
      return false;
    }
  }

  /**
   * 从会话存储加载应用数据
   * @returns {Object|null} 加载的数据或null
   */
  loadData() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) {
        console.log('会话存储中没有找到数据');
        return null;
      }

      const storageData = JSON.parse(stored);

      // 检查版本兼容性
      if (storageData.version !== this.version) {
        console.warn('存储数据版本不匹配，将使用默认数据');
        return null;
      }

      console.log('从会话存储加载数据成功');
      return storageData.data;
    } catch (error) {
      console.error('从会话存储加载数据失败:', error);
      return null;
    }
  }

  /**
   * 清除会话存储数据
   */
  clearData() {
    try {
      sessionStorage.removeItem(this.storageKey);
      console.log('会话存储数据已清除');
      return true;
    } catch (error) {
      console.error('清除会话存储数据失败:', error);
      return false;
    }
  }

  /**
   * 检查会话存储是否可用
   * @returns {boolean} 是否支持会话存储
   */
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch (error) {
      console.warn('会话存储不可用:', error);
      return false;
    }
  }

  /**
   * 获取存储数据的信息
   * @returns {Object|null} 存储信息
   */
  getStorageInfo() {
    try {
      const stored = sessionStorage.getItem(this.storageKey);
      if (!stored) return null;

      const storageData = JSON.parse(stored);
      return {
        version: storageData.version,
        timestamp: storageData.timestamp,
        lastModified: new Date(storageData.timestamp).toLocaleString(),
        elementsCount: storageData.data.elements?.length || 0,
        tiersCount: storageData.data.tiers?.length || 0
      };
    } catch (error) {
      console.error('获取存储信息失败:', error);
      return null;
    }
  }

  /**
   * 导出数据为JSON文件
   * @param {Object} data 要导出的数据
   */
  exportData(data) {
    try {
      const exportData = {
        version: this.version,
        timestamp: Date.now(),
        exportDate: new Date().toISOString(),
        data: data
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pick-tier-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('数据导出成功');
      return true;
    } catch (error) {
      console.error('导出数据失败:', error);
      return false;
    }
  }

  /**
   * 从JSON文件导入数据
   * @param {File} file JSON文件
   * @returns {Promise<Object|null>} 导入的数据
   */
  importData(file) {
    return new Promise((resolve, reject) => {
      if (!file || file.type !== 'application/json') {
        reject(new Error('请选择有效的JSON文件'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          // 验证数据格式
          if (!importData.data || !importData.version) {
            reject(new Error('无效的数据格式'));
            return;
          }

          console.log('数据导入成功');
          resolve(importData.data);
        } catch (error) {
          reject(new Error('解析JSON文件失败: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('读取文件失败'));
      };

      reader.readAsText(file);
    });
  }

  /**
   * 自动保存功能 - 防抖处理
   * @param {Function} saveFunction 保存函数
   * @param {number} delay 延迟时间（毫秒）
   */
  createAutoSave(saveFunction, delay = 1000) {
    let timeoutId = null;

    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        saveFunction.apply(this, args);
      }, delay);
    };
  }
}