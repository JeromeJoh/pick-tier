// Toast消息管理器

export class ToastManager {
  constructor() {
    this.container = null;
    this.toasts = [];
  }

  /**
   * 获取或创建toast容器
   */
  getContainer() {
    if (!this.container || !document.body.contains(this.container)) {
      this.container = document.createElement('div');
      this.container.id = 'toastContainer';
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  /**
   * 显示toast消息
   * @param {string} message 消息内容
   * @param {string} type 消息类型 (info, success, error, warning)
   * @param {string} className 自定义类名前缀 (默认: 'storage-message')
   * @param {number} duration 显示时长（毫秒，默认4000）
   */
  show(message, type = 'info', className = 'storage-message', duration = 4000) {
    const container = this.getContainer();

    const messageEl = document.createElement('div');
    messageEl.className = `${className} ${className}-${type}`;
    messageEl.textContent = message;

    // 添加到toast列表
    this.toasts.push(messageEl);

    // 添加点击关闭功能
    const closeToast = () => {
      messageEl.classList.remove('show');
      setTimeout(() => {
        if (messageEl.parentNode) {
          messageEl.parentNode.removeChild(messageEl);
          // 从列表中移除
          const index = this.toasts.indexOf(messageEl);
          if (index > -1) {
            this.toasts.splice(index, 1);
          }
          // 如果容器为空，移除容器
          if (container.children.length === 0) {
            container.remove();
            this.container = null;
          }
        }
      }, 300);
    };

    messageEl.addEventListener('click', (e) => {
      // 检查是否点击了关闭按钮区域（右侧）
      const rect = messageEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      if (clickX > rect.width - 40) {
        closeToast();
      }
    });

    container.appendChild(messageEl);

    // 触发显示动画
    setTimeout(() => messageEl.classList.add('show'), 100);

    // 自动关闭
    if (duration > 0) {
      setTimeout(() => {
        closeToast();
      }, duration);
    }

    return messageEl;
  }

  /**
   * 关闭所有toast
   */
  clearAll() {
    this.toasts.forEach(toast => {
      if (toast.parentNode) {
        toast.classList.remove('show');
        setTimeout(() => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, 300);
      }
    });
    this.toasts = [];
    if (this.container && this.container.parentNode) {
      this.container.remove();
      this.container = null;
    }
  }
}
