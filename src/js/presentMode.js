// 幻灯片展示模式模块

export class PresentMode {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.currentIndex = 0;
    this.elements = [];
    this.isActive = false;
    this.modal = null;
    this.autoAdvance = false;
    this.autoAdvanceInterval = null;
    this.autoAdvanceDelay = 5000; // 5秒自动切换
  }

  /**
   * 启动幻灯片展示模式
   */
  start() {
    // 获取所有未分级的元素
    this.elements = this.tierMaker.elements.filter(el =>
      !this.tierMaker.isElementInTier(el.id)
    );

    if (this.elements.length === 0) {
      this.showMessage('No elements available for presentation. Please upload some images first.', 'error');
      return;
    }

    this.currentIndex = 0;
    this.isActive = true;
    this.createPresentModal();
    this.showCurrentElement();
  }

  /**
   * 停止幻灯片展示模式
   */
  stop() {
    this.isActive = false;
    this.stopAutoAdvance();

    if (this.modal) {
      this.modal.remove();
      this.modal = null;
      // 允许背景滚动
      this.tierMaker.modalManager.allowBackgroundScroll();
    }

    // 更新主界面显示
    this.tierMaker.updateDisplay();
  }

  /**
   * 创建幻灯片展示模态框
   */
  createPresentModal() {
    this.modal = document.createElement('div');
    this.modal.className = 'present-modal';
    this.modal.innerHTML = `
      <div class="present-content">
        <div class="present-header">
          <div class="present-info">
            <span class="present-counter">1 / ${this.elements.length}</span>
            <h3>Present Mode</h3>
          </div>
          <div class="present-controls">
            <button class="present-btn present-auto-btn" onclick="presentMode.toggleAutoAdvance()" title="Toggle Auto Advance">
              ⏯️
            </button>
            <button class="present-btn present-close-btn" onclick="presentMode.stop()" title="Exit Present Mode">
              ✕
            </button>
          </div>
        </div>
        
        <div class="present-main">
          <div class="present-navigation">
            <button class="present-nav-btn present-prev-btn" onclick="presentMode.previous()" title="Previous">
              ◀
            </button>
          </div>
          
          <div class="present-display">
            <div class="present-image-container">
              <img class="present-image" src="" alt="" loading="lazy">
            </div>
            <div class="present-element-info">
              <h4 class="present-element-name"></h4>
              <p class="present-element-description"></p>
            </div>
          </div>
          
          <div class="present-navigation">
            <button class="present-nav-btn present-next-btn" onclick="presentMode.next()" title="Next">
              ▶
            </button>
          </div>
        </div>
        
        <div class="present-tiers">
          <h5>Quick Rank</h5>
          <div class="present-tier-buttons">
            ${this.renderTierButtons()}
          </div>
        </div>
        
        <div class="present-footer">
          <div class="present-progress">
            <div class="present-progress-bar">
              <div class="present-progress-fill" style="width: ${(1 / this.elements.length) * 100}%"></div>
            </div>
          </div>
          <div class="present-actions">
            <button class="present-btn present-skip-btn" onclick="presentMode.skipElement()">
              Skip
            </button>
            <button class="present-btn present-finish-btn" onclick="presentMode.stop()">
              Finish
            </button>
          </div>
        </div>
        
        <div class="present-shortcuts">
          <div>⌨️ Shortcuts: ←→ Navigate | 1-5 Quick Rank | S Skip | ESC Exit</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);

    // 防止背景滚动
    this.tierMaker.modalManager.preventBackgroundScroll();

    // 添加键盘事件监听
    this.bindKeyboardEvents();

    // 显示动画
    setTimeout(() => this.modal.classList.add('show'), 100);
  }

  /**
   * 渲染分级按钮
   * @returns {string} HTML字符串
   */
  renderTierButtons() {
    return this.tierMaker.tiers.map(tier => `
      <button class="present-tier-btn" 
              style="background-color: ${tier.color}" 
              onclick="presentMode.rankElement('${tier.id}')"
              title="Rank as ${tier.label}">
        ${tier.label}
      </button>
    `).join('');
  }

  /**
   * 显示当前元素
   */
  showCurrentElement() {
    if (!this.isActive || this.currentIndex >= this.elements.length) {
      return;
    }

    const element = this.elements[this.currentIndex];
    if (!element) return;

    // 更新图片和信息
    const img = this.modal.querySelector('.present-image');
    const name = this.modal.querySelector('.present-element-name');
    const description = this.modal.querySelector('.present-element-description');
    const counter = this.modal.querySelector('.present-counter');
    const progressFill = this.modal.querySelector('.present-progress-fill');

    // 预加载图片以确保正确显示
    if (img) {
      // 先隐藏图片
      img.style.opacity = '0';
      img.style.transform = 'scale(0.9)';

      // 创建新的图片对象来预加载
      const newImg = new Image();
      newImg.onload = () => {
        // 图片加载完成后更新显示
        img.src = element.src;
        img.alt = element.name;

        // 显示图片动画
        setTimeout(() => {
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
        }, 100);
      };
      newImg.onerror = () => {
        // 图片加载失败时显示占位符
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIEVycm9yPC90ZXh0Pjwvc3ZnPg==';
        img.alt = 'Image loading error';
        img.style.opacity = '1';
        img.style.transform = 'scale(1)';
      };
      newImg.src = element.src;
    }

    if (name) name.textContent = element.name;
    if (description) {
      description.textContent = element.description || 'No description available';
    }
    if (counter) counter.textContent = `${this.currentIndex + 1} / ${this.elements.length}`;
    if (progressFill) {
      progressFill.style.width = `${((this.currentIndex + 1) / this.elements.length) * 100}%`;
    }

    // 更新导航按钮状态
    const prevBtn = this.modal.querySelector('.present-prev-btn');
    const nextBtn = this.modal.querySelector('.present-next-btn');

    if (prevBtn) prevBtn.disabled = this.currentIndex === 0;
    if (nextBtn) nextBtn.disabled = this.currentIndex === this.elements.length - 1;
  }

  /**
   * 下一个元素
   */
  next() {
    if (this.currentIndex < this.elements.length - 1) {
      this.currentIndex++;
      this.showCurrentElement();
    }
  }

  /**
   * 上一个元素
   */
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.showCurrentElement();
    }
  }

  /**
   * 跳过当前元素
   */
  skipElement() {
    this.next();

    // 如果是最后一个元素，自动结束
    if (this.currentIndex >= this.elements.length - 1) {
      setTimeout(() => this.stop(), 1000);
    }
  }

  /**
   * 对当前元素进行分级
   * @param {string} tierId 分级ID
   */
  rankElement(tierId) {
    const element = this.elements[this.currentIndex];
    if (!element) {
      console.warn('No element found at current index:', this.currentIndex);
      return;
    }

    console.log('Ranking element:', element.name, 'to tier:', tierId);

    // 将元素添加到指定分级
    try {
      this.tierMaker.moveElementToTier(element.id, tierId);
      console.log('Element moved to tier successfully');
    } catch (error) {
      console.error('Error moving element to tier:', error);
      this.showMessage('Failed to rank element. Please try again.', 'error');
      return;
    }

    // 从展示列表中移除该元素
    this.elements.splice(this.currentIndex, 1);

    // 显示分级成功消息
    const tier = this.tierMaker.tiers.find(t => t.id === tierId);
    if (tier) {
      this.showMessage(`"${element.name}" ranked as ${tier.label}`, 'success');
    }

    // 如果没有更多元素，结束展示
    if (this.elements.length === 0) {
      this.showMessage('All elements have been ranked!', 'success');
      setTimeout(() => this.stop(), 2000);
      return;
    }

    // 调整当前索引
    if (this.currentIndex >= this.elements.length) {
      this.currentIndex = this.elements.length - 1;
    }

    // 更新分级按钮和显示
    this.updateTierButtons();
    this.showCurrentElement();
  }

  /**
   * 更新分级按钮
   */
  updateTierButtons() {
    const tierButtonsContainer = this.modal.querySelector('.present-tier-buttons');
    if (tierButtonsContainer) {
      tierButtonsContainer.innerHTML = this.renderTierButtons();
    }
  }

  /**
   * 切换自动播放
   */
  toggleAutoAdvance() {
    this.autoAdvance = !this.autoAdvance;
    const autoBtn = this.modal.querySelector('.present-auto-btn');

    if (this.autoAdvance) {
      this.startAutoAdvance();
      if (autoBtn) autoBtn.textContent = '⏸️';
      this.showMessage('Auto advance enabled', 'success');
    } else {
      this.stopAutoAdvance();
      if (autoBtn) autoBtn.textContent = '▶️';
      this.showMessage('Auto advance disabled', 'success');
    }
  }

  /**
   * 开始自动播放
   */
  startAutoAdvance() {
    this.stopAutoAdvance(); // 清除现有定时器

    this.autoAdvanceInterval = setInterval(() => {
      if (this.isActive && this.currentIndex < this.elements.length - 1) {
        this.next();
      } else {
        this.stopAutoAdvance();
      }
    }, this.autoAdvanceDelay);
  }

  /**
   * 停止自动播放
   */
  stopAutoAdvance() {
    if (this.autoAdvanceInterval) {
      clearInterval(this.autoAdvanceInterval);
      this.autoAdvanceInterval = null;
    }
    this.autoAdvance = false;
  }

  /**
   * 绑定键盘事件
   */
  bindKeyboardEvents() {
    this.keyboardHandler = (e) => {
      if (!this.isActive) return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.previous();
          break;
        case 'ArrowRight':
        case ' ':
          e.preventDefault();
          this.next();
          break;
        case 'Escape':
          e.preventDefault();
          this.stop();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          this.skipElement();
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
      }
    };

    document.addEventListener('keydown', this.keyboardHandler);
  }

  /**
   * 解绑键盘事件
   */
  unbindKeyboardEvents() {
    if (this.keyboardHandler) {
      document.removeEventListener('keydown', this.keyboardHandler);
      this.keyboardHandler = null;
    }
  }

  /**
   * 显示消息提示
   * @param {string} message 消息内容
   * @param {string} type 消息类型
   */
  showMessage(message, type = 'info') {
    const messageEl = document.createElement('div');
    messageEl.className = `present-message present-message-${type}`;
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

  /**
   * 清理资源
   */
  cleanup() {
    this.stop();
    this.unbindKeyboardEvents();
  }
}