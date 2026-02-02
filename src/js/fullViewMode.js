// 全景模式模块 - 一屏展示分类和元素池

export class FullViewMode {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.isActive = false;
    this.originalLayout = null;
    this.scaleFactor = 1;
    this.transitionDuration = 300;
    this.elementModal = null;
    this.currentElement = null;

    this.init();
  }

  /**
   * 初始化全景模式
   */
  init() {
    this.bindEvents();
  }

  /**
   * 切换全景模式
   */
  toggle() {
    if (this.isActive) {
      this.exit();
    } else {
      this.enter();
    }
  }

  /**
   * 进入全景模式
   */
  enter() {
    if (this.isActive) return;

    // 重置滚动位置到顶部，确保一致的起始状态
    this.resetScrollPosition();

    // 存储原始布局状态
    this.storeOriginalLayout();

    // 应用全景模式布局（先应用布局再计算缩放）
    this.updateLayout();

    // 更新状态
    this.isActive = true;

    // 更新UI反馈
    this.updateModeIndicator();

    console.log('Full view mode entered');
  }

  /**
   * 退出全景模式
   */
  exit() {
    if (!this.isActive) return;

    // 恢复原始布局
    this.restoreLayout();

    // 清理 CSS 变量
    this.clearDynamicHeights();

    // 更新状态
    this.isActive = false;

    // 更新UI反馈
    this.updateModeIndicator();

    console.log('Full view mode exited');
  }

  /**
   * 清理动态高度 CSS 变量
   */
  clearDynamicHeights() {
    document.documentElement.style.removeProperty('--full-view-element-size');
    document.documentElement.style.removeProperty('--full-view-available-height');
    document.documentElement.style.removeProperty('--full-view-tier-height');
  }

  /**
   * 检查全景模式是否激活
   */
  isActiveMode() {
    return this.isActive;
  }

  /**
   * 重置滚动位置
   */
  resetScrollPosition() {
    // 重置主内容区域的滚动位置
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.scrollTop = 0;
    }

    // 重置页面滚动位置
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    console.log('Scroll position reset to top');
  }

  /**
   * 存储原始布局状态
   */
  storeOriginalLayout() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const tierContainer = document.querySelector('.tier-container');
    const sidebarToggler = document.querySelector('.sidebar-toggle-btn');

    this.originalLayout = {
      sidebarState: sidebar ? sidebar.classList.contains('open') : false,
      mainContentMargin: mainContent ? mainContent.style.marginLeft : '',
      mainContentPadding: mainContent ? mainContent.style.padding : '',
      mainContentMaxWidth: mainContent ? mainContent.style.maxWidth : '',
      tierContainerTransform: tierContainer ? tierContainer.style.transform : '',
      bodyOverflow: document.body.style.overflow,
      sidebarTogglerDisplay: sidebarToggler ? sidebarToggler.style.display : ''
    };
  }

  /**
   * 计算并设置动态高度 - 每个tier-row平分视口高度
   */
  calculateDynamicHeights() {
    const viewportHeight = window.innerHeight;
    const tierCount = this.tierMaker.tiers.length;

    // 直接平分视口高度，不留边距（因为不需要缩放）
    const tierHeight = Math.floor(viewportHeight / tierCount);

    // 设置 CSS 变量
    document.documentElement.style.setProperty('--full-view-tier-height', `${tierHeight}px`);
    document.documentElement.style.setProperty('--full-view-available-height', `${viewportHeight}px`);
    document.documentElement.style.setProperty('--full-view-element-size', `${tierHeight}px`);

    console.log('Dynamic heights calculated for full viewport:', {
      viewportHeight,
      tierCount,
      tierHeight,
      totalUsedHeight: tierHeight * tierCount
    });
  }

  /**
   * 计算最佳缩放比例
   */
  calculateOptimalScale() {
    const tierContainer = document.querySelector('.tier-container');

    if (!tierContainer) {
      this.scaleFactor = 1;
      return;
    }

    // 先计算动态高度
    this.calculateDynamicHeights();

    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 侧边栏宽度（全景模式下强制显示）
    const sidebarWidth = 280;

    // 计算可用空间
    const availableWidth = viewportWidth - sidebarWidth;
    const availableHeight = viewportHeight;

    // 临时移除变换以获取原始尺寸
    const originalTransform = tierContainer.style.transform;
    tierContainer.style.transform = '';

    // 强制重新布局以获取准确尺寸
    tierContainer.offsetHeight; // 触发重排

    // 获取分级容器的原始尺寸
    const containerRect = tierContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 恢复变换
    tierContainer.style.transform = originalTransform;

    // 计算缩放比例，留出更多边距确保完全可见
    const marginX = 60; // 左右各30px边距
    const marginY = 80; // 上下各40px边距

    const scaleX = (availableWidth - marginX) / containerWidth;
    const scaleY = (availableHeight - marginY) / containerHeight;

    // 使用较小的缩放比例以确保完全适应，并添加安全系数
    this.scaleFactor = Math.min(scaleX, scaleY, 1) * 0.95; // 95% 安全系数

    // 设置最小缩放比例
    this.scaleFactor = Math.max(this.scaleFactor, 0.15);

    console.log('Full view scale calculation:', {
      viewportWidth,
      viewportHeight,
      availableWidth,
      availableHeight,
      containerWidth,
      containerHeight,
      scaleX,
      scaleY,
      finalScale: this.scaleFactor,
      marginX,
      marginY
    });
  }

  /**
   * 应用全景模式布局
   */
  updateLayout() {
    const body = document.body;
    const tierContainer = document.querySelector('.tier-container');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // 添加全景模式类
    body.classList.add('full-view-mode');

    // 强制显示侧边栏
    if (sidebar) {
      sidebar.classList.add('open');
    }

    // 调整主内容区域
    if (mainContent) {
      mainContent.style.marginLeft = '280px';
      mainContent.style.maxWidth = 'calc(100vw - 280px)';
      mainContent.style.padding = '0';
    }

    // 防止页面滚动
    body.style.overflow = 'hidden';

    // 等待CSS应用后计算高度分配
    setTimeout(() => {
      // 计算动态高度（每个tier-row平分视口高度）
      this.calculateDynamicHeights();

      // 不需要缩放，tier-container直接占满main-content
      if (tierContainer) {
        tierContainer.style.transform = '';
        tierContainer.style.transformOrigin = '';
        tierContainer.style.transition = '';
      }

      console.log('Full view layout applied without scaling');
    }, 100);
  }

  /**
   * 应用缩放和居中
   */
  applyScaleAndCenter() {
    const tierContainer = document.querySelector('.tier-container');
    if (!tierContainer) return;

    // 获取缩放后的尺寸
    const scaledWidth = tierContainer.offsetWidth * this.scaleFactor;
    const scaledHeight = tierContainer.offsetHeight * this.scaleFactor;

    // 计算居中位置
    const availableWidth = window.innerWidth - 280; // 减去侧边栏宽度
    const availableHeight = window.innerHeight;

    const translateX = Math.max(0, (availableWidth - scaledWidth) / 2);
    const translateY = Math.max(0, (availableHeight - scaledHeight) / 2);

    // 应用变换
    tierContainer.style.transformOrigin = 'top left';
    tierContainer.style.transition = `transform ${this.transitionDuration}ms ease`;
    tierContainer.style.transform = `translate(${translateX}px, ${translateY}px) scale(${this.scaleFactor})`;

    console.log('Scale and center applied:', {
      scaleFactor: this.scaleFactor,
      scaledWidth,
      scaledHeight,
      translateX,
      translateY,
      availableWidth,
      availableHeight
    });
  }

  /**
   * 恢复原始布局
   */
  restoreLayout() {
    const body = document.body;
    const tierContainer = document.querySelector('.tier-container');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const sidebarToggler = document.querySelector('.sidebar-toggle-btn');

    // 移除全景模式类
    body.classList.remove('full-view-mode');

    // 恢复侧边栏状态
    if (sidebar && this.originalLayout) {
      if (this.originalLayout.sidebarState) {
        sidebar.classList.add('open');
      } else {
        sidebar.classList.remove('open');
      }
    }

    // 恢复分级容器变换
    if (tierContainer) {
      tierContainer.style.transform = this.originalLayout?.tierContainerTransform || '';
      tierContainer.style.transformOrigin = '';
      tierContainer.style.transition = `transform ${this.transitionDuration}ms ease`;
    }

    // 恢复主内容样式
    if (mainContent && this.originalLayout) {
      mainContent.style.marginLeft = this.originalLayout.mainContentMargin;
      mainContent.style.maxWidth = this.originalLayout.mainContentMaxWidth;
      mainContent.style.padding = this.originalLayout.mainContentPadding;
    }

    // 恢复 sidebar toggler 显示
    if (sidebarToggler && this.originalLayout) {
      sidebarToggler.style.display = this.originalLayout.sidebarTogglerDisplay;
    }

    // 恢复页面滚动
    body.style.overflow = this.originalLayout?.bodyOverflow || '';
  }

  /**
   * 更新模式指示器
   */
  updateModeIndicator() {
    const fullViewButton = document.querySelector('[data-action="full-view-mode"]');

    if (fullViewButton) {
      const span = fullViewButton.querySelector('span');
      const icon = fullViewButton.querySelector('i');

      if (this.isActive) {
        fullViewButton.classList.add('active');
        if (span) span.textContent = 'Exit Full View';
        if (icon) {
          icon.className = 'ph ph-monitor-fill';
        }
      } else {
        fullViewButton.classList.remove('active');
        if (span) span.textContent = 'Full View Mode';
        if (icon) {
          icon.className = 'ph ph-monitor';
        }
      }
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 监听窗口大小变化
    this.resizeHandler = () => {
      if (this.isActive) {
        // 重新计算高度分配
        this.calculateDynamicHeights();
      }
    };

    window.addEventListener('resize', this.resizeHandler);
  }

  /**
   * 解绑事件监听器
   */
  unbindEvents() {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = null;
    }
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.unbindEvents();

    // 如果全景模式激活，先退出
    if (this.isActive) {
      this.exit();
    }

    this.originalLayout = null;
  }
}