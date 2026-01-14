// 拖拽功能处理模块

import { isImageFile } from './utils.js';

export class DragHandler {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.draggedElement = null;
    this.dragIndicator = null;
    this.init();
  }

  init() {
    this.createDragIndicator();
    this.bindFileDragEvents();
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
   * 绑定文件拖拽事件
   */
  bindFileDragEvents() {
    // 防止默认的拖拽行为
    document.addEventListener('dragover', (e) => {
      e.preventDefault();
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
    });

    // 为元素池绑定文件拖拽事件
    this.bindElementsPoolFileDrag();
  }

  /**
   * 为元素池绑定文件拖拽事件
   */
  bindElementsPoolFileDrag() {
    // 使用事件委托，因为元素池可能会重新渲染
    document.addEventListener('dragover', (e) => {
      // 如果正在拖拽应用内的元素，不处理文件拖拽
      if (this.draggedElement) {
        return;
      }

      const elementsContainer = e.target.closest('.elements-container');
      const tierContent = e.target.closest('.tier-content');

      if (this.hasFiles(e)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        if (elementsContainer) {
          // 拖拽到元素池
          elementsContainer.classList.add('drag-over');
          this.showFileDragIndicator(e, 'Drop images here to add them');
        } else if (tierContent) {
          // 拖拽到分级区域
          tierContent.classList.add('drag-over');
          const tierId = tierContent.dataset.tierId;
          const tier = this.tierMaker.tiers.find(t => t.id === tierId);
          const tierLabel = tier ? tier.label : 'this tier';
          this.showFileDragIndicator(e, `Drop images to add and rank in ${tierLabel}`);
        }
      }
    });

    document.addEventListener('dragleave', (e) => {
      // 如果正在拖拽应用内的元素，不处理文件拖拽
      if (this.draggedElement) {
        return;
      }

      const elementsContainer = e.target.closest('.elements-container');
      const tierContent = e.target.closest('.tier-content');

      if (this.hasFiles(e)) {
        if (elementsContainer && !elementsContainer.contains(e.relatedTarget)) {
          elementsContainer.classList.remove('drag-over');
          this.hideFileDragIndicator();
        } else if (tierContent && !tierContent.contains(e.relatedTarget)) {
          tierContent.classList.remove('drag-over');
          this.hideFileDragIndicator();
        }
      }
    });

    document.addEventListener('drop', (e) => {
      // 如果正在拖拽应用内的元素，不处理文件拖拽
      if (this.draggedElement) {
        return;
      }

      const elementsContainer = e.target.closest('.elements-container');
      const tierContent = e.target.closest('.tier-content');

      if (this.hasFiles(e)) {
        e.preventDefault();
        this.hideFileDragIndicator();

        if (elementsContainer) {
          // 拖拽到元素池
          elementsContainer.classList.remove('drag-over');
          this.handleFileDrop(e);
        } else if (tierContent) {
          // 拖拽到分级区域
          tierContent.classList.remove('drag-over');
          const tierId = tierContent.dataset.tierId;
          this.handleFileDrop(e, tierId);
        }
      }
    });
  }

  /**
   * 检查拖拽事件是否包含文件
   * @param {DragEvent} event 拖拽事件
   * @returns {boolean} 是否包含文件
   */
  hasFiles(event) {
    if (!event.dataTransfer) return false;

    // 检查是否有文件类型
    return Array.from(event.dataTransfer.types).includes('Files') ||
      Array.from(event.dataTransfer.types).includes('application/x-moz-file');
  }

  /**
   * 显示文件拖拽指示器
   * @param {DragEvent} event 拖拽事件
   * @param {string} message 提示消息
   */
  showFileDragIndicator(event, message) {
    this.dragIndicator.textContent = message;
    this.dragIndicator.classList.add('show');
    this.dragIndicator.style.left = event.clientX + 10 + 'px';
    this.dragIndicator.style.top = event.clientY - 30 + 'px';
  }

  /**
   * 隐藏文件拖拽指示器
   */
  hideFileDragIndicator() {
    this.dragIndicator.classList.remove('show');
  }

  /**
   * 处理文件拖拽放置
   * @param {DragEvent} event 拖拽事件
   * @param {string} tierId 可选的分级ID，如果提供则直接分配到该分级
   */
  handleFileDrop(event, tierId = null) {
    const files = Array.from(event.dataTransfer.files);

    if (files.length === 0) return;

    // 过滤出图片文件
    const imageFiles = files.filter(file => isImageFile(file));

    if (imageFiles.length === 0) {
      this.tierMaker.showMessage('No valid image files found. Please drop image files (PNG, JPG, GIF, WebP).', 'error');
      return;
    }

    // 显示上传进度消息
    const targetMessage = tierId ?
      `Processing ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''} and adding to tier...` :
      `Processing ${imageFiles.length} image${imageFiles.length > 1 ? 's' : ''}...`;

    this.tierMaker.showMessage(targetMessage, 'info');

    // 处理图片文件
    this.processImageFiles(imageFiles, tierId);
  }

  /**
   * 处理图片文件
   * @param {File[]} files 图片文件数组
   * @param {string} tierId 可选的分级ID，如果提供则直接分配到该分级
   */
  processImageFiles(files, tierId = null) {
    let processedCount = 0;
    const totalCount = files.length;
    const createdElements = []; // 存储创建的元素ID，用于分级分配

    files.forEach(file => {
      const reader = new FileReader();

      reader.onload = (e) => {
        const element = {
          id: this.tierMaker.nextElementId++,
          name: file.name.split('.')[0], // 移除文件扩展名
          description: `Uploaded: ${file.name}`,
          src: e.target.result
        };

        this.tierMaker.elements.push(element);
        createdElements.push(String(element.id)); // 确保ID是字符串类型
        processedCount++;

        // 如果所有文件都处理完成，更新界面
        if (processedCount === totalCount) {
          // 如果指定了分级ID，将所有新元素分配到该分级
          if (tierId) {
            // 确保分级存在
            const targetTier = this.tierMaker.tiers.find(t => t.id === tierId);
            if (targetTier) {
              // 直接添加到分级，不调用moveElementToTier避免重复更新
              createdElements.forEach(elementId => {
                targetTier.elements.push(elementId);
              });
            }

            const tierLabel = targetTier ? targetTier.label : 'tier';

            // 显示成功消息
            this.tierMaker.showMessage(
              `Successfully added ${totalCount} image${totalCount > 1 ? 's' : ''} to ${tierLabel} tier!`,
              'success'
            );

            // 批量添加元素到分级区域
            const tierContent = document.querySelector(`[data-tier-id="${tierId}"]`);
            if (tierContent) {
              // 移除空状态提示
              const emptyState = tierContent.querySelector('.empty-state');
              if (emptyState) {
                emptyState.remove();
              }

              // 添加所有新元素
              createdElements.forEach(elementId => {
                const element = this.tierMaker.elements.find(el => String(el.id) === elementId);
                if (element) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = this.tierMaker.renderer.renderElement(element);
                  tierContent.appendChild(tempDiv.firstElementChild);
                }
              });
            }
          } else {
            // 显示成功消息
            this.tierMaker.showMessage(
              `Successfully added ${totalCount} image${totalCount > 1 ? 's' : ''} to elements pool!`,
              'success'
            );

            // 批量添加元素到元素池
            const container = document.getElementById('elementsContainer');
            if (container) {
              // 移除空状态提示
              const emptyState = container.querySelector('.empty-state');
              if (emptyState) {
                emptyState.remove();
              }

              // 添加所有新元素
              createdElements.forEach(elementId => {
                const element = this.tierMaker.elements.find(el => String(el.id) === elementId);
                if (element) {
                  const tempDiv = document.createElement('div');
                  tempDiv.innerHTML = this.tierMaker.renderer.renderElement(element);
                  container.appendChild(tempDiv.firstElementChild);
                }
              });
            }
          }

          // 更新侧边栏统计
          this.tierMaker.updateSidebarStats();
          this.tierMaker.autoSave();
        }
      };

      reader.onerror = () => {
        console.error('Failed to read file:', file.name);
        processedCount++;

        if (processedCount === totalCount) {
          // 如果有成功处理的元素，添加到界面
          if (createdElements.length > 0) {
            if (tierId) {
              // 添加到分级
              const targetTier = this.tierMaker.tiers.find(t => t.id === tierId);
              if (targetTier) {
                createdElements.forEach(elementId => {
                  targetTier.elements.push(elementId);
                });
              }

              // 批量添加元素到分级区域
              const tierContent = document.querySelector(`[data-tier-id="${tierId}"]`);
              if (tierContent) {
                const emptyState = tierContent.querySelector('.empty-state');
                if (emptyState) {
                  emptyState.remove();
                }

                createdElements.forEach(elementId => {
                  const element = this.tierMaker.elements.find(el => String(el.id) === elementId);
                  if (element) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = this.tierMaker.renderer.renderElement(element);
                    tierContent.appendChild(tempDiv.firstElementChild);
                  }
                });
              }
            } else {
              // 添加到元素池
              const container = document.getElementById('elementsContainer');
              if (container) {
                const emptyState = container.querySelector('.empty-state');
                if (emptyState) {
                  emptyState.remove();
                }

                createdElements.forEach(elementId => {
                  const element = this.tierMaker.elements.find(el => String(el.id) === elementId);
                  if (element) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = this.tierMaker.renderer.renderElement(element);
                    container.appendChild(tempDiv.firstElementChild);
                  }
                });
              }
            }
          }

          // 更新侧边栏统计
          this.tierMaker.updateSidebarStats();
          this.tierMaker.autoSave();

          this.tierMaker.showMessage('Some files could not be processed. Check console for details.', 'error');
        }
      };

      reader.readAsDataURL(file);
    });
  }

  /**
   * 处理拖拽开始事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragStart(event) {
    // 使用 currentTarget 而不是 target，因为事件是绑定在外层 div 上的
    // currentTarget 始终是绑定事件的元素（外层 div）
    // target 可能是内层的子元素（img, div 等）
    const elementContainer = event.currentTarget;

    // 验证这确实是一个元素容器
    if (!elementContainer || !elementContainer.classList.contains('element')) {
      console.warn('Invalid element container for drag start');
      event.preventDefault();
      return;
    }

    // 如果拖拽起始点是按钮，阻止拖拽
    if (event.target.classList.contains('element-action')) {
      event.preventDefault();
      return;
    }

    const elementId = elementContainer.dataset.elementId;
    if (!elementId) {
      console.warn('No element ID found for drag start');
      event.preventDefault();
      return;
    }

    this.draggedElement = elementId;
    elementContainer.classList.add('dragging');

    // 显示拖拽指示器
    this.dragIndicator.textContent = 'Drag to tier area';
    this.dragIndicator.classList.add('show');

    event.dataTransfer.effectAllowed = 'move';
    // 设置拖拽数据，确保拖拽操作有效
    event.dataTransfer.setData('text/plain', elementId);
  }

  /**
   * 处理拖拽结束事件
   * @param {DragEvent} event 拖拽事件
   */
  handleDragEnd(event) {
    // 使用 currentTarget 而不是 target.closest，保持与 handleDragStart 的一致性
    const elementContainer = event.currentTarget;
    if (elementContainer && elementContainer.classList.contains('element')) {
      elementContainer.classList.remove('dragging');
    }

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