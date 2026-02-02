// 元素模态框管理器 - 处理元素双击展开功能

export class ElementModal {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.modal = null;
    this.currentElement = null;
    this.isActive = false;

    this.init();
  }

  /**
   * 初始化元素模态框
   */
  init() {
    this.bindGlobalEvents();
  }

  /**
   * 绑定全局双击事件
   */
  bindGlobalEvents() {
    // 为整个文档绑定双击事件，使用事件委托
    document.addEventListener('dblclick', (e) => {
      const element = e.target.closest('.element');
      console.log('Double-click detected on:', e.target);
      console.log('Closest .element found:', element);

      if (element) {
        e.preventDefault();
        e.stopPropagation();
        const elementId = element.dataset.elementId;
        console.log('Element ID from dataset:', elementId);

        if (!elementId) {
          console.warn('No elementId found in dataset');
          return;
        }

        this.openModal(elementId);
      }
    });

    // 绑定键盘事件
    document.addEventListener('keydown', (e) => {
      if (this.isActive) {
        this.handleKeyboard(e);
      }
    });
  }

  /**
   * 打开元素模态框
   */
  openModal(elementId) {
    console.log('Opening modal for elementId:', elementId);

    const element = this.tierMaker.elements.find(el => String(el.id) === String(elementId));
    if (!element) {
      console.warn('Element not found:', elementId);
      console.log('Available elements:', this.tierMaker.elements.map(el => ({ id: el.id, name: el.name })));
      return;
    }

    console.log('Found element:', element);
    this.currentElement = element;
    console.log('Set currentElement:', this.currentElement);

    // 确保在创建模态框前 currentElement 不为空
    if (!this.currentElement) {
      console.error('currentElement is null after assignment!');
      return;
    }

    this.createModal();
    this.isActive = true;

    console.log('Element modal opened for:', element.name);
  }

  /**
   * 创建模态框
   */
  createModal() {
    if (!this.currentElement) {
      console.warn('No current element to create modal for');
      return;
    }

    // 先保存当前元素的引用，避免在后续操作中被清空
    const element = this.currentElement;
    console.log('Creating modal for element:', element);

    // 移除已存在的模态框（但不调用完整的 closeModal）
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.tierMaker.modalManager.allowBackgroundScroll();
    }

    // 确保元素引用仍然有效
    if (!element) {
      console.error('Element reference lost during modal creation');
      return;
    }

    this.modal = document.createElement('div');
    this.modal.className = 'element-modal';
    this.modal.onclick = (e) => {
      if (e.target === this.modal) {
        this.closeModal();
      }
    };
    this.modal.innerHTML = `
      <div class="element-modal-content">
        <div class="element-modal-main">
          <div class="element-modal-image">
            <img src="${element.src}" alt="${element.name}" loading="lazy">
          </div>
        </div>
        <div class="element-modal-tiers">
          <div class="element-modal-tier-buttons">
            ${this.renderTierButtons()}
           </div>
        </div>
      </div>
      <div class="element-shortcuts">
        <div>Keyboard Shortcuts: 1-5 Quick Rank | ESC Exit</div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // 防止背景滚动
    this.tierMaker.modalManager.preventBackgroundScroll();

    // 显示动画
    setTimeout(() => {
      if (this.modal) {
        this.modal.classList.add('show');
      }
    }, 100);

    console.log('Element modal created successfully for:', element.name);
  }

  /**
   * 渲染分级按钮
   * @returns {string} HTML字符串
   */
  renderTierButtons() {
    return this.tierMaker.tiers.map(tier => `
      <button class="element-modal-tier-btn" 
              style="background-color: ${tier.color}" 
              onclick="elementModal.rankElement('${tier.id}')"
              title="Rank as ${tier.label}">
        ${tier.label}
      </button>
    `).join('');
  }

  /**
   * 对当前元素进行分级
   */
  rankElement(tierId) {
    if (!this.currentElement) return;

    console.log('Ranking element:', this.currentElement.name, 'to tier:', tierId);

    try {
      // 将元素添加到指定分级
      this.tierMaker.moveElementToTier(this.currentElement.id, tierId);

      // 显示成功消息
      const tier = this.tierMaker.tiers.find(t => t.id === tierId);
      if (tier) {
        toast.success(`"${this.currentElement.name}" ranked as ${tier.label}`);
      }

      // 关闭模态框
      this.closeModal();

    } catch (error) {
      console.error('Failed to rank element:', error);
      toast.error('Failed to rank element. Please try again.');
    }
  }

  /**
   * 将元素移回元素池
   */
  moveToPool() {
    if (!this.currentElement) return;

    console.log('Moving element to pool:', this.currentElement.name);

    try {
      // 将元素移回元素池
      this.tierMaker.moveElementToPool(this.currentElement.id);

      // 显示成功消息
      toast.success(`"${this.currentElement.name}" moved to pool`);

      // 关闭模态框
      this.closeModal();

    } catch (error) {
      console.error('Failed to move element to pool:', error);
      toast.error('Failed to move element. Please try again.');
    }
  }

  /**
   * 处理键盘事件
   */
  handleKeyboard(e) {
    if (!this.modal) return;

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        this.closeModal();
        break;
      // 数字键快速分级
      case '1':
      case '2':
      case '3':
      case '4':
      case '5':
        e.preventDefault();
        const tierIndex = parseInt(e.key) - 1;
        if (tierIndex < this.tierMaker.tiers.length) {
          this.rankElement(this.tierMaker.tiers[tierIndex].id);
        }
        break;
      // P 键移到元素池
      case 'p':
      case 'P':
        e.preventDefault();
        this.moveToPool();
        break;
    }
  }

  /**
   * 关闭模态框
   */
  closeModal() {
    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      this.tierMaker.modalManager.allowBackgroundScroll();
    }

    this.currentElement = null;
    this.isActive = false;
  }

  /**
   * 检查模态框是否激活
   */
  isModalActive() {
    return this.isActive;
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.closeModal();
    // 注意：不移除全局事件监听器，因为这是全局功能
  }
}