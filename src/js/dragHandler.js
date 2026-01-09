// 拖拽功能处理模块

export class DragHandler {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.draggedElement = null;
    this.dragIndicator = null;
    this.init();
  }

  init() {
    this.createDragIndicator();
  }

  /**
   * 创建拖拽指示器
   */
  createDragIndicator() {
    this.dragIndicator = document.createElement('div');
    this.dragIndicator.className = 'drag-indicator';
    this.dragIndicator.id = 'dragIndicator';
    document.body.appendChild(this.dragIndicator);
  }

  /**
   * 处理拖拽开始事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragStart(event) {
    const elementId = event.target.closest('.element').dataset.elementId;
    this.draggedElement = elementId;
    event.target.closest('.element').classList.add('dragging');

    // 显示拖拽指示器
    this.dragIndicator.textContent = 'Drag to tier area';
    this.dragIndicator.classList.add('show');

    event.dataTransfer.effectAllowed = 'move';
  }

  /**
   * 处理拖拽结束事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragEnd(event) {
    event.target.closest('.element').classList.remove('dragging');
    this.draggedElement = null;

    // 隐藏拖拽指示器
    this.dragIndicator.classList.remove('show');

    // 移除所有拖拽样式
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  /**
   * 处理拖拽悬停事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');

    // 更新拖拽指示器位置
    this.dragIndicator.style.left = event.clientX + 10 + 'px';
    this.dragIndicator.style.top = event.clientY - 30 + 'px';
  }

  /**
   * 处理拖拽离开事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      event.currentTarget.classList.remove('drag-over');
    }
  }

  /**
   * 处理放置到分级区域事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!this.draggedElement) return;

    const tierId = event.currentTarget.dataset.tierId;
    this.tierMaker.moveElementToTier(this.draggedElement, tierId);
  }

  /**
   * 处理放置到元素池事件
   * @param {DragEvent} event 拖拽事件
   */
  handlePoolDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!this.draggedElement) return;

    this.tierMaker.moveElementToPool(this.draggedElement);
  }

  /**
   * 获取当前拖拽的元素ID
   * @returns {string|null} 元素ID
   */
  getDraggedElement() {
    return this.draggedElement;
  }
}