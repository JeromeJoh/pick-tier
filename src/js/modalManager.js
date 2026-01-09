// 模态框管理模块

export class ModalManager {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.currentEditingElement = null;
    this.init();
  }

  init() {
    this.bindEvents();
  }

  /**
   * 绑定模态框相关事件
   */
  bindEvents() {
    // 点击模态框外部关闭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });

    // ESC键关闭模态框
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });
  }

  /**
   * 打开配置模态框
   */
  openConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.add('show');
      // 重新渲染配置列表
      const configList = document.getElementById('tierConfigList');
      if (configList) {
        configList.innerHTML = this.tierMaker.renderTierConfig();
      }
    }
  }

  /**
   * 关闭配置模态框
   */
  closeConfigModal() {
    const modal = document.getElementById('configModal');
    if (modal) {
      modal.classList.remove('show');
    }
  }

  /**
   * 打开元素编辑模态框
   * @param {string} elementId 元素ID
   */
  openElementModal(elementId) {
    const element = this.tierMaker.elements.find(el => el.id == elementId);
    if (!element) return;

    this.currentEditingElement = element;

    const nameInput = document.getElementById('elementName');
    const descInput = document.getElementById('elementDescription');
    const modal = document.getElementById('elementModal');

    if (nameInput && descInput && modal) {
      nameInput.value = element.name;
      descInput.value = element.description;
      modal.classList.add('show');

      // 聚焦到名称输入框
      setTimeout(() => nameInput.focus(), 100);
    }
  }

  /**
   * 关闭元素编辑模态框
   */
  closeElementModal() {
    const modal = document.getElementById('elementModal');
    if (modal) {
      modal.classList.remove('show');
    }
    this.currentEditingElement = null;
  }

  /**
   * 保存元素信息
   */
  saveElement() {
    if (!this.currentEditingElement) return;

    const nameInput = document.getElementById('elementName');
    const descInput = document.getElementById('elementDescription');

    if (!nameInput || !descInput) return;

    const name = nameInput.value.trim();
    const description = descInput.value.trim();

    if (name) {
      this.currentEditingElement.name = name;
      this.currentEditingElement.description = description;
      this.tierMaker.updateDisplay();
    }

    this.closeElementModal();
  }

  /**
   * 关闭所有模态框
   */
  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
    this.currentEditingElement = null;
  }

  /**
   * 显示确认对话框
   * @param {string} message 确认消息
   * @returns {boolean} 用户确认结果
   */
  showConfirm(message) {
    return confirm(message);
  }

  /**
   * 显示警告对话框
   * @param {string} message 警告消息
   */
  showAlert(message) {
    alert(message);
  }
}