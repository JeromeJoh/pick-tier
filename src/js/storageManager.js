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
      console.log('Data saved to session storage');
      return true;
    } catch (error) {
      console.error('Failed to save data to session storage:', error);
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
        console.log('No data found in session storage');
        return null;
      }

      const storageData = JSON.parse(stored);

      // 检查版本兼容性
      if (storageData.version !== this.version) {
        console.warn('Storage data version mismatch, using default data');
        return null;
      }

      console.log('Data loaded from session storage successfully');
      return storageData.data;
    } catch (error) {
      console.error('Failed to load data from session storage:', error);
      return null;
    }
  }

  /**
   * 清除会话存储数据
   */
  clearData() {
    try {
      sessionStorage.removeItem(this.storageKey);
      console.log('Session storage data cleared');
      return true;
    } catch (error) {
      console.error('Failed to clear session storage data:', error);
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
      console.warn('Session storage not available:', error);
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
      console.error('Failed to get storage info:', error);
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

      console.log('Data exported successfully');
      return true;
    } catch (error) {
      console.error('Failed to export data:', error);
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
        reject(new Error('Please select a valid JSON file'));
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importData = JSON.parse(e.target.result);

          // 验证数据格式
          if (!importData.data || !importData.version) {
            reject(new Error('Invalid data format'));
            return;
          }

          console.log('Data imported successfully');
          resolve(importData.data);
        } catch (error) {
          reject(new Error('Failed to parse JSON file: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Failed to read file'));
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