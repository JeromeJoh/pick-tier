// Pick Tier 主应用类

import { generateRandomColor, generateUniqueId, isImageFile } from './utils.js';
import { DragHandler } from './dragHandler.js';
import { ModalManager } from './modalManager.js';
import { Renderer } from './renderer.js';
import { ExportManager } from './exportManager.js';
import { PresentMode } from './presentMode.js';
import { StorageManager } from './storageManager.js';

export class TierMaker {
  constructor() {
    // 初始化存储管理器
    this.storageManager = new StorageManager();

    // 应用数据 - 先设置默认值
    this.elements = [];
    this.tiers = [
      { id: 'S', label: 'S', color: '#ff7f7f', elements: [] },
      { id: 'A', label: 'A', color: '#ffbf7f', elements: [] },
      { id: 'B', label: 'B', color: '#ffdf7f', elements: [] },
      { id: 'C', label: 'C', color: '#ffff7f', elements: [] },
      { id: 'D', label: 'D', color: '#bfff7f', elements: [] }
    ];
    this.nextElementId = 1;

    // 尝试从本地存储加载数据
    this.loadFromStorage();

    // 初始化模块
    this.dragHandler = new DragHandler(this);
    this.modalManager = new ModalManager(this);
    this.renderer = new Renderer(this);
    this.exportManager = new ExportManager(this);
    this.presentMode = new PresentMode(this);

    // 创建自动保存函数
    this.autoSave = this.storageManager.createAutoSave(() => {
      this.saveToStorage();
    }, 1000);

    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    this.render();
    this.bindEvents();

    // 显示存储状态信息
    this.showStorageStatus();
  }

  /**
   * 从会话存储加载数据
   */
  loadFromStorage() {
    if (!this.storageManager.isStorageAvailable()) {
      console.warn('会话存储不可用，将使用默认数据');
      return;
    }

    const savedData = this.storageManager.loadData();
    if (savedData) {
      // 恢复元素数据
      if (savedData.elements && Array.isArray(savedData.elements)) {
        this.elements = savedData.elements;
      }

      // 恢复分级数据
      if (savedData.tiers && Array.isArray(savedData.tiers)) {
        this.tiers = savedData.tiers;
      }

      // 恢复下一个元素ID
      if (savedData.nextElementId && typeof savedData.nextElementId === 'number') {
        this.nextElementId = savedData.nextElementId;
      }

      console.log(`已从会话存储恢复 ${this.elements.length} 个元素和 ${this.tiers.length} 个分级`);
    }
  }

  /**
   * 保存数据到会话存储
   */
  saveToStorage() {
    if (!this.storageManager.isStorageAvailable()) {
      return false;
    }

    const dataToSave = {
      elements: this.elements,
      tiers: this.tiers,
      nextElementId: this.nextElementId
    };

    return this.storageManager.saveData(dataToSave);
  }

  /**
   * 显示存储状态信息
   */
  showStorageStatus() {
    const storageInfo = this.storageManager.getStorageInfo();
    if (storageInfo && storageInfo.elementsCount > 0) {
      this.showMessage(`已恢复 ${storageInfo.elementsCount} 个元素 (上次保存: ${storageInfo.lastModified})`, 'success');
    }
  }

  /**
   * 显示消息提示
   * @param {string} message 消息内容
   * @param {string} type 消息类型
   */
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `storage-message storage-message-${type}`;
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    setTimeout(() => messageEl.classList.add('show'), 100);

    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 4000);
  }

  /**
   * 渲染应用界面
   */
  render() {
    const app = document.getElementById('app');
    if (app) {
      app.innerHTML = this.renderer.renderApp();
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 文件上传事件
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // 元素池拖拽事件
    const elementsContainer = document.getElementById('elementsContainer');
    if (elementsContainer) {
      elementsContainer.addEventListener('drop', (e) => this.dragHandler.handlePoolDrop(e));
      elementsContainer.addEventListener('dragover', (e) => this.dragHandler.handleDragOver(e));
      elementsContainer.addEventListener('dragleave', (e) => this.dragHandler.handleDragLeave(e));
    }

    // 点击外部关闭导出选项
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.export-button-wrapper')) {
        this.hideExportOptions();
      }
    });
  }

  /**
   * 处理上传按钮点击
   */
  handleUploadClick() {
    const imageInput = document.getElementById('imageInput');
    if (imageInput) {
      imageInput.click();
    }
  }

  /**
   * 处理文件上传
   * @param {Event} event 文件输入事件
   */
  handleFileUpload(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
      if (isImageFile(file)) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const element = {
            id: this.nextElementId++,
            name: file.name.split('.')[0],
            description: '',
            src: e.target.result
          };
          this.elements.push(element);
          this.updateElementsPool();
          // 更新侧边栏统计
          this.updateSidebarStats();
          // 自动保存
          this.autoSave();
        };
        reader.readAsDataURL(file);
      }
    });

    // 清空文件输入
    event.target.value = '';
  }

  // 拖拽事件代理方法
  handleDragStart(event) { this.dragHandler.handleDragStart(event); }
  handleDragEnd(event) { this.dragHandler.handleDragEnd(event); }
  handleDragOver(event) { this.dragHandler.handleDragOver(event); }
  handleDragLeave(event) { this.dragHandler.handleDragLeave(event); }
  handleDrop(event) { this.dragHandler.handleDrop(event); }

  /**
   * 将元素移动到指定分级
   * @param {string} elementId 元素ID
   * @param {string} tierId 分级ID
   */
  moveElementToTier(elementId, tierId) {
    // 从所有分级中移除元素
    this.tiers.forEach(tier => {
      tier.elements = tier.elements.filter(id => id !== elementId);
    });

    // 添加到目标分级
    const targetTier = this.tiers.find(tier => tier.id === tierId);
    if (targetTier) {
      targetTier.elements.push(elementId);
    }

    this.updateDisplay();
    // 自动保存
    this.autoSave();
  }

  /**
   * 将元素移回元素池
   * @param {string} elementId 元素ID
   */
  moveElementToPool(elementId) {
    // 从所有分级中移除元素
    this.tiers.forEach(tier => {
      tier.elements = tier.elements.filter(id => id !== elementId);
    });

    this.updateDisplay();
    // 自动保存
    this.autoSave();
  }

  /**
   * 检查元素是否在某个分级中
   * @param {string} elementId 元素ID
   * @returns {boolean} 是否在分级中
   */
  isElementInTier(elementId) {
    return this.tiers.some(tier => tier.elements.includes(elementId));
  }

  /**
   * 更新显示
   */
  updateDisplay() {
    // 更新分级区域
    this.tiers.forEach(tier => {
      const tierContent = document.querySelector(`[data-tier-id="${tier.id}"]`);
      if (tierContent) {
        tierContent.innerHTML = tier.elements.map(elementId => {
          const element = this.elements.find(el => el.id == elementId);
          return element ? this.renderer.renderElement(element) : '';
        }).join('');

        // 添加空状态提示
        if (tier.elements.length === 0) {
          tierContent.innerHTML = '<div class="empty-state"><p>Drop elements here</p></div>';
        }
      }
    });

    // 更新元素池
    this.updateElementsPool();

    // 更新侧边栏统计
    this.updateSidebarStats();
  }

  /**
   * 更新元素池显示
   */
  updateElementsPool() {
    const container = document.getElementById('elementsContainer');
    if (container) {
      container.innerHTML = this.renderer.renderPoolElements();
    }
  }

  /**
   * 编辑分级标签
   * @param {string} tierId 分级ID
   */
  editTierLabel(tierId) {
    const labelElement = document.getElementById(`tierLabel_${tierId}`);
    const tier = this.tiers.find(t => t.id === tierId);

    if (!tier || !labelElement || labelElement.classList.contains('editing')) return;

    labelElement.classList.add('editing');
    const currentLabel = tier.label;

    labelElement.innerHTML = `<input type="text" value="${currentLabel}" onblur="tierMaker.saveTierLabel('${tierId}', this.value)" onkeypress="if(event.key==='Enter') this.blur()">`;
    const input = labelElement.querySelector('input');
    if (input) {
      input.focus();
      input.select();
    }
  }

  /**
   * 保存分级标签
   * @param {string} tierId 分级ID
   * @param {string} newLabel 新标签
   */
  saveTierLabel(tierId, newLabel) {
    const tier = this.tiers.find(t => t.id === tierId);
    const labelElement = document.getElementById(`tierLabel_${tierId}`);

    if (tier && newLabel.trim()) {
      tier.label = newLabel.trim();
      // 自动保存
      this.autoSave();
    }

    if (labelElement) {
      labelElement.classList.remove('editing');
      labelElement.innerHTML = tier.label;
    }
  }

  /**
   * 更新分级标签
   * @param {string} tierId 分级ID
   * @param {string} newLabel 新标签
   */
  updateTierLabel(tierId, newLabel) {
    const tier = this.tiers.find(t => t.id === tierId);
    if (tier && newLabel.trim()) {
      tier.label = newLabel.trim();
      // 更新显示
      const labelElement = document.getElementById(`tierLabel_${tierId}`);
      if (labelElement) {
        labelElement.textContent = tier.label;
      }
      // 自动保存
      this.autoSave();
    }
  }

  /**
   * 更新分级颜色
   * @param {string} tierId 分级ID
   * @param {string} newColor 新颜色
   */
  updateTierColor(tierId, newColor) {
    const tier = this.tiers.find(t => t.id === tierId);
    if (tier) {
      tier.color = newColor;
      // 更新显示
      const labelElement = document.getElementById(`tierLabel_${tierId}`);
      if (labelElement) {
        labelElement.style.backgroundColor = newColor;
      }
      // 自动保存
      this.autoSave();
    }
  }

  /**
   * 添加新分级
   */
  addTier() {
    const newId = generateUniqueId();
    const newTier = {
      id: newId,
      label: 'New Tier',
      color: generateRandomColor(),
      elements: []
    };

    this.tiers.push(newTier);

    // 自动保存
    this.autoSave();

    // 重新渲染整个应用
    this.render();
    this.bindEvents();

    // 重新打开配置模态框
    this.openConfigModal();
  }

  /**
   * 删除分级
   * @param {string} tierId 分级ID
   */
  deleteTier(tierId) {
    if (this.tiers.length <= 1) {
      this.modalManager.showAlert('At least one tier must remain!');
      return;
    }

    if (this.modalManager.showConfirm('Are you sure you want to delete this tier? Elements in this tier will be moved back to the pool.')) {
      this.tiers = this.tiers.filter(t => t.id !== tierId);

      // 自动保存
      this.autoSave();

      // 重新渲染
      this.render();
      this.bindEvents();
      this.openConfigModal();
    }
  }

  /**
   * 编辑元素
   * @param {string} elementId 元素ID
   */
  editElement(elementId) {
    this.modalManager.openElementModal(elementId);
  }

  /**
   * 删除元素
   * @param {string} elementId 元素ID
   */
  deleteElement(elementId) {
    if (this.modalManager.showConfirm('Are you sure you want to delete this element?')) {
      // 从元素列表中移除
      this.elements = this.elements.filter(el => el.id != elementId);

      // 从所有分级中移除
      this.tiers.forEach(tier => {
        tier.elements = tier.elements.filter(id => id != elementId);
      });

      this.updateDisplay();
      // 自动保存
      this.autoSave();
    }
  }

  /**
   * 清空所有数据
   */
  clearAll() {
    if (this.modalManager.showConfirm('Are you sure you want to clear all elements and tier settings? This action cannot be undone!')) {
      this.elements = [];
      this.tiers.forEach(tier => {
        tier.elements = [];
      });
      this.updateDisplay();
      // 自动保存
      this.autoSave();
      // 清除会话存储
      this.storageManager.clearData();
      this.showMessage('All data cleared and session storage reset', 'info');
    }
  }

  /**
   * 重置所有分类，将元素放回元素池
   */
  resetAllRankings() {
    // 计算统计信息
    const rankedElements = this.tiers.reduce((count, tier) => count + tier.elements.length, 0);
    const poolElements = this.elements.filter(el => !this.isElementInTier(el.id)).length;

    if (rankedElements === 0) {
      this.modalManager.showAlert('No ranked elements to reset. All elements are already in the pool.');
      return;
    }

    const stats = {
      totalElements: this.elements.length,
      rankedElements: rankedElements,
      poolElements: poolElements
    };

    // 显示自定义确认对话框
    this.modalManager.showResetConfirm(stats).then(confirmed => {
      if (confirmed) {
        // 将所有元素从分级中移除
        this.tiers.forEach(tier => {
          tier.elements = [];
        });

        // 更新显示
        this.updateDisplay();

        // 自动保存
        this.autoSave();

        // 显示成功消息
        this.showResetMessage(`Successfully reset ${rankedElements} element(s) back to the pool.`);
      }
    });
  }

  /**
   * 显示重置成功消息
   * @param {string} message 消息内容
   */
  showResetMessage(message) {
    const messageEl = document.createElement('div');
    messageEl.className = 'reset-message reset-message-success';
    messageEl.textContent = message;

    document.body.appendChild(messageEl);

    setTimeout(() => messageEl.classList.add('show'), 100);

    setTimeout(() => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
        }
      }, 300);
    }, 3000);
  }

  // 模态框相关方法代理
  openConfigModal() { this.modalManager.openConfigModal(); }
  closeConfigModal() { this.modalManager.closeConfigModal(); }
  closeElementModal() { this.modalManager.closeElementModal(); }
  saveElement() { this.modalManager.saveElement(); }

  /**
   * 渲染分级配置
   * @returns {string} HTML字符串
   */
  renderTierConfig() {
    return this.renderer.renderTierConfig();
  }

  /**
   * 导出分级图片
   * @param {string} format 导出格式 ('png' | 'jpeg')
   */
  async exportTierImage(format = 'png') {
    // 隐藏导出选项
    this.hideExportOptions();

    // 检查是否有元素可导出
    if (this.elements.length === 0) {
      this.exportManager.showExportMessage('No elements to export. Please upload some images first.', 'error');
      return;
    }

    // 执行导出
    await this.exportManager.exportTierImage(format);
  }

  /**
   * 显示导出预览
   * @param {string} format 导出格式 ('png' | 'jpeg')
   */
  async showExportPreview(format = 'png') {
    // 隐藏导出选项
    this.hideExportOptions();

    // 检查是否有元素可导出
    if (this.elements.length === 0) {
      this.exportManager.showExportMessage('No elements to preview. Please upload some images first.', 'error');
      return;
    }

    // 显示预览
    await this.exportManager.showExportPreview(format);
  }

  /**
   * 确认导出（从预览模态框调用）
   * @param {string} format 导出格式
   */
  async confirmExport(format) {
    // 关闭预览模态框
    const previewModal = document.querySelector('.preview-modal');
    if (previewModal) {
      previewModal.remove();
    }

    // 执行导出
    await this.exportManager.exportTierImage(format);
  }

  /**
   * 切换导出选项显示
   * @param {Event} event 点击事件
   */
  toggleExportOptions(event) {
    event.stopPropagation();

    // 隐藏其他导出选项
    document.querySelectorAll('.export-options').forEach(el => {
      if (el !== event.target.nextElementSibling) {
        el.classList.remove('show');
      }
    });

    // 切换当前导出选项
    const options = event.target.nextElementSibling;
    if (options) {
      options.classList.toggle('show');
    }
  }

  /**
   * 隐藏所有导出选项
   */
  hideExportOptions() {
    document.querySelectorAll('.export-options').forEach(el => {
      el.classList.remove('show');
    });
  }

  /**
   * 切换侧边栏显示状态（移动端）
   */
  toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      sidebar.classList.toggle('open');
    }
  }

  /**
   * 更新侧边栏统计信息
   */
  updateSidebarStats() {
    const sidebar = document.querySelector('.sidebar');
    if (sidebar) {
      // 重新渲染侧边栏
      sidebar.innerHTML = this.renderer.renderSidebar();
    }
  }

  /**
   * 渲染分级配置
   * @returns {string} HTML字符串
   */
  renderTierConfig() {
    return this.renderer.renderTierConfig();
  }

  /**
   * 启动幻灯片展示模式
   */
  startPresentMode() {
    this.presentMode.start();
  }

  /**
   * 打开批量操作模态框
   */
  openBulkActionsModal() {
    const modal = document.getElementById('bulkActionsModal');
    if (modal) {
      // 重新渲染批量操作列表
      const bulkTierList = document.getElementById('bulkTierList');
      if (bulkTierList) {
        bulkTierList.innerHTML = this.renderer.renderBulkTierList();
      }
      modal.classList.add('show');
    }
  }

  /**
   * 关闭批量操作模态框
   */
  closeBulkActionsModal() {
    const modal = document.getElementById('bulkActionsModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  /**
   * 重置选中的分级
   */
  resetSelectedTiers() {
    const checkboxes = document.querySelectorAll('.bulk-tier-checkbox:checked');
    const selectedTierIds = Array.from(checkboxes).map(cb => cb.dataset.tierId);

    if (selectedTierIds.length === 0) {
      this.modalManager.showAlert('Please select at least one tier to reset.');
      return;
    }

    // 计算要重置的元素数量
    let totalElementsToReset = 0;
    const tierNames = [];

    selectedTierIds.forEach(tierId => {
      const tier = this.tiers.find(t => t.id === tierId);
      if (tier) {
        totalElementsToReset += tier.elements.length;
        tierNames.push(tier.label);
      }
    });

    const confirmMessage = `Are you sure you want to reset ${totalElementsToReset} element(s) from ${tierNames.join(', ')}? These elements will be moved back to the pool.`;

    if (this.modalManager.showConfirm(confirmMessage)) {
      // 重置选中的分级
      selectedTierIds.forEach(tierId => {
        const tier = this.tiers.find(t => t.id === tierId);
        if (tier) {
          tier.elements = [];
        }
      });

      // 更新显示
      this.updateDisplay();

      // 自动保存
      this.autoSave();

      // 关闭模态框
      this.closeBulkActionsModal();

      // 显示成功消息
      this.showResetMessage(`Successfully reset ${totalElementsToReset} element(s) from ${tierNames.length} tier(s).`);
    }
  }

  /**
   * 导出数据备份
   */
  exportDataBackup() {
    const dataToExport = {
      elements: this.elements,
      tiers: this.tiers,
      nextElementId: this.nextElementId
    };

    if (this.storageManager.exportData(dataToExport)) {
      this.showMessage('Data backup exported successfully', 'success');
    } else {
      this.showMessage('Failed to export data backup', 'error');
    }
  }

  /**
   * 导入数据备份
   */
  importDataBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        const importedData = await this.storageManager.importData(file);

        // 确认导入
        if (this.modalManager.showConfirm('This will replace all current data. Are you sure you want to continue?')) {
          // 恢复数据
          if (importedData.elements) this.elements = importedData.elements;
          if (importedData.tiers) this.tiers = importedData.tiers;
          if (importedData.nextElementId) this.nextElementId = importedData.nextElementId;

          // 保存到会话存储
          this.saveToStorage();

          // 更新显示
          this.render();
          this.bindEvents();

          this.showMessage(`Successfully imported ${this.elements.length} elements and ${this.tiers.length} tiers`, 'success');
        }
      } catch (error) {
        this.showMessage('Failed to import data: ' + error.message, 'error');
      }
    };

    input.click();
  }
}