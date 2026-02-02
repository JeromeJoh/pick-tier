// Overview Mode 模块 - 负责概览模式功能

export class OverviewMode {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
    this.isOverviewActive = false;
    this.originalLayout = null;
    this.scaleFactor = 1;
    this.transitionDuration = 300; // milliseconds

    this.init();
  }

  /**
   * 初始化概览模式
   */
  init() {
    this.bindEvents();
  }

  /**
   * 切换概览模式
   */
  toggle() {
    if (this.isOverviewActive) {
      this.exit();
    } else {
      this.enter();
    }
  }

  /**
   * 进入概览模式
   */
  enter() {
    if (this.isOverviewActive) return;

    // 存储原始布局状态
    this.storeOriginalLayout();

    // 计算最佳缩放比例
    this.calculateOptimalScale();

    // 应用概览模式布局
    this.updateLayout();

    // 更新状态
    this.isOverviewActive = true;

    // 更新UI反馈
    this.updateModeIndicator();

    console.log('Overview mode entered with scale factor:', this.scaleFactor);
  }

  /**
   * 退出概览模式
   */
  exit() {
    if (!this.isOverviewActive) return;

    // 恢复原始布局
    this.restoreLayout();

    // 更新状态
    this.isOverviewActive = false;

    // 更新UI反馈
    this.updateModeIndicator();

    console.log('Overview mode exited');
  }

  /**
   * 检查概览模式是否激活
   * @returns {boolean} 是否激活
   */
  isActive() {
    return this.isOverviewActive;
  }

  /**
   * 存储原始布局状态
   */
  storeOriginalLayout() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const tierContainer = document.querySelector('.tier-container');

    this.originalLayout = {
      sidebarState: sidebar ? sidebar.classList.contains('open') : false,
      mainContentMargin: mainContent ? mainContent.style.marginLeft : '',
      tierContainerTransform: tierContainer ? tierContainer.style.transform : ''
    };
  }

  /**
   * 计算最佳缩放比例
   */
  calculateOptimalScale() {
    const tierContainer = document.querySelector('.tier-container');
    const sidebar = document.querySelector('.sidebar');

    if (!tierContainer) {
      this.scaleFactor = 1;
      return;
    }

    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // 获取分级容器的原始尺寸
    const containerRect = tierContainer.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;

    // 计算侧边栏宽度（如果打开）
    const sidebarWidth = sidebar && sidebar.classList.contains('open') ? 280 : 0;

    // 计算可用空间（留出边距）
    const availableWidth = viewportWidth - sidebarWidth - 100; // 50px margin on each side
    const availableHeight = viewportHeight - 100; // 50px margin top and bottom

    // 计算缩放比例
    const scaleX = availableWidth / containerWidth;
    const scaleY = availableHeight / containerHeight;

    // 使用较小的缩放比例以确保完全适应
    this.scaleFactor = Math.min(scaleX, scaleY, 1); // 不超过原始大小

    // 设置最小缩放比例
    this.scaleFactor = Math.max(this.scaleFactor, 0.3);
  }

  /**
   * 应用概览模式布局
   */
  updateLayout() {
    const body = document.body;
    const tierContainer = document.querySelector('.tier-container');
    const sidebar = document.querySelector('.sidebar');

    // 添加概览模式类
    body.classList.add('overview-mode');

    // 确保侧边栏可见
    if (sidebar && !sidebar.classList.contains('open')) {
      sidebar.classList.add('open');
    }

    // 应用缩放变换
    if (tierContainer) {
      tierContainer.style.transform = `scale(${this.scaleFactor})`;
      tierContainer.style.transformOrigin = 'top left';
      tierContainer.style.transition = `transform ${this.transitionDuration}ms ease`;
    }
  }

  /**
   * 恢复原始布局
   */
  restoreLayout() {
    const body = document.body;
    const tierContainer = document.querySelector('.tier-container');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    // 移除概览模式类
    body.classList.remove('overview-mode');

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

    // 恢复主内容边距
    if (mainContent && this.originalLayout) {
      mainContent.style.marginLeft = this.originalLayout.mainContentMargin;
    }
  }

  /**
   * 更新模式指示器
   */
  updateModeIndicator() {
    const overviewButton = document.querySelector('[data-action="overview-mode"]');

    if (overviewButton) {
      if (this.isOverviewActive) {
        overviewButton.classList.add('active');
      } else {
        overviewButton.classList.remove('active');
      }
    }
  }

  /**
   * 绑定事件监听器
   */
  bindEvents() {
    // 监听窗口大小变化
    window.addEventListener('resize', () => {
      if (this.isOverviewActive) {
        // 重新计算缩放比例并更新布局
        this.calculateOptimalScale();
        this.updateLayout();
      }
    });
  }

  /**
   * 解绑事件监听器
   */
  unbindEvents() {
    // 移除窗口大小变化监听器
    window.removeEventListener('resize', this.handleResize);
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.unbindEvents();

    // 如果概览模式激活，先退出
    if (this.isOverviewActive) {
      this.exit();
    }

    this.originalLayout = null;
  }
}