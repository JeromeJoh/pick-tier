// Pick Tier 主应用类

import { generateRandomColor, generateUniqueId, isImageFile } from './utils.js';
import { DragHandler } from './dragHandler.js';
import { ModalManager } from './modalManager.js';
import { Renderer } from './renderer.js';

export class TierMaker {
  constructor() {
    // 应用数据
    this.elements = [];
    this.tiers = [
      { id: 'S', label: 'S', color: '#ff7f7f', elements: [] },
      { id: 'A', label: 'A', color: '#ffbf7f', elements: [] },
      { id: 'B', label: 'B', color: '#ffdf7f', elements: [] },
      { id: 'C', label: 'C', color: '#ffff7f', elements: [] },
      { id: 'D', label: 'D', color: '#bfff7f', elements: [] }
    ];
    this.nextElementId = 1;

    // 初始化模块
    this.dragHandler = new DragHandler(this);
    this.modalManager = new ModalManager(this);
    this.renderer = new Renderer(this);

    this.init();
  }

  /**
   * 初始化应用
   */
  init() {
    this.render();
    this.bindEvents();
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
      }
    });

    // 更新元素池
    this.updateElementsPool();
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
    }
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
}