// 导出管理模块

import { downloadCanvasAsImage, loadImage } from './utils.js';

export class ExportManager {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
  }

  /**
   * 导出分级图片
   * @param {string} format 导出格式 ('png' | 'jpeg')
   * @param {number} quality 图片质量 (0-1)
   */
  async exportTierImage(format = 'png', quality = 0.9) {
    try {
      const canvas = await this.createTierCanvas();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `pick-tier-ranking-${timestamp}.${format}`;

      downloadCanvasAsImage(canvas, filename, format, quality);

      // 显示成功消息
      this.showExportMessage('Tier ranking exported successfully!', 'success');
    } catch (error) {
      console.error('Export failed:', error);
      this.showExportMessage('Export failed. Please try again.', 'error');
    }
  }

  /**
   * 创建分级排行的Canvas
   * @returns {Promise<HTMLCanvasElement>} Canvas元素
   */
  async createTierCanvas() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 设置Canvas尺寸和样式
    const canvasWidth = 1200;
    const tierHeight = 120;
    const headerHeight = 80;
    const footerHeight = 40;
    const padding = 20;

    const canvasHeight = headerHeight + (this.tierMaker.tiers.length * tierHeight) + footerHeight + (padding * 2);

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // 设置背景
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // 绘制标题
    await this.drawHeader(ctx, canvasWidth, headerHeight, padding);

    // 绘制分级
    let currentY = headerHeight + padding;
    for (const tier of this.tierMaker.tiers) {
      await this.drawTierRow(ctx, tier, 0, currentY, canvasWidth, tierHeight);
      currentY += tierHeight;
    }

    // 绘制页脚
    this.drawFooter(ctx, canvasWidth, canvasHeight - footerHeight, footerHeight);

    return canvas;
  }

  /**
   * 绘制标题区域
   * @param {CanvasRenderingContext2D} ctx Canvas上下文
   * @param {number} width 宽度
   * @param {number} height 高度
   * @param {number} padding 内边距
   */
  async drawHeader(ctx, width, height, padding) {
    // 绘制标题背景
    const gradient = ctx.createLinearGradient(0, 0, width, 0);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // 绘制标题文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🏆 Pick Tier Ranking', width / 2, height / 2);

    // 绘制时间戳
    ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const timestamp = new Date().toLocaleString();
    ctx.fillText(`Generated on ${timestamp}`, width / 2, height - 15);
  }

  /**
   * 绘制分级行
   * @param {CanvasRenderingContext2D} ctx Canvas上下文
   * @param {Object} tier 分级对象
   * @param {number} x X坐标
   * @param {number} y Y坐标
   * @param {number} width 宽度
   * @param {number} height 高度
   */
  async drawTierRow(ctx, tier, x, y, width, height) {
    const labelWidth = 100;
    const contentX = labelWidth;
    const contentWidth = width - labelWidth;

    // 绘制分级标签
    ctx.fillStyle = tier.color;
    ctx.fillRect(x, y, labelWidth, height);

    // 绘制标签边框
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, labelWidth, height);

    // 绘制标签文字
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(tier.label, x + labelWidth / 2, y + height / 2);

    // 绘制内容区域背景
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(contentX, y, contentWidth, height);
    ctx.strokeRect(contentX, y, contentWidth, height);

    // 绘制元素
    if (tier.elements.length > 0) {
      await this.drawTierElements(ctx, tier, contentX + 10, y + 10, contentWidth - 20, height - 20);
    } else {
      // 绘制空状态文字
      ctx.fillStyle = '#9ca3af';
      ctx.font = '16px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('No elements in this tier', contentX + contentWidth / 2, y + height / 2);
    }
  }

  /**
   * 绘制分级中的元素
   * @param {CanvasRenderingContext2D} ctx Canvas上下文
   * @param {Object} tier 分级对象
   * @param {number} x X坐标
   * @param {number} y Y坐标
   * @param {number} width 可用宽度
   * @param {number} height 可用高度
   */
  async drawTierElements(ctx, tier, x, y, width, height) {
    const elementSize = Math.min(80, height);
    const elementSpacing = 10;
    const elementsPerRow = Math.floor(width / (elementSize + elementSpacing));

    let currentX = x;
    let currentY = y;
    let elementCount = 0;

    for (const elementId of tier.elements) {
      const element = this.tierMaker.elements.find(el => el.id == elementId);
      if (!element) continue;

      // 如果当前行放不下，换行
      if (elementCount > 0 && elementCount % elementsPerRow === 0) {
        currentX = x;
        currentY += elementSize + elementSpacing;

        // 如果超出可用高度，停止绘制
        if (currentY + elementSize > y + height) {
          break;
        }
      }

      try {
        // 加载并绘制图片
        const img = await loadImage(element.src);

        // 绘制元素背景
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(currentX, currentY, elementSize, elementSize);
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        ctx.strokeRect(currentX, currentY, elementSize, elementSize);

        // 绘制图片（保持宽高比）
        this.drawImageFit(ctx, img, currentX + 2, currentY + 2, elementSize - 4, elementSize - 4);

        // 绘制元素名称（如果有空间）
        if (element.name && elementSize > 60) {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
          ctx.fillRect(currentX, currentY + elementSize - 20, elementSize, 20);

          ctx.fillStyle = '#ffffff';
          ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';

          // 截断过长的文字
          let displayName = element.name;
          if (displayName.length > 10) {
            displayName = displayName.substring(0, 8) + '...';
          }

          ctx.fillText(displayName, currentX + elementSize / 2, currentY + elementSize - 10);
        }

      } catch (error) {
        console.warn('Failed to load element image:', element.name, error);

        // 绘制占位符
        ctx.fillStyle = '#f3f4f6';
        ctx.fillRect(currentX, currentY, elementSize, elementSize);
        ctx.strokeStyle = '#d1d5db';
        ctx.strokeRect(currentX, currentY, elementSize, elementSize);

        ctx.fillStyle = '#6b7280';
        ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('Image\nError', currentX + elementSize / 2, currentY + elementSize / 2);
      }

      currentX += elementSize + elementSpacing;
      elementCount++;
    }
  }

  /**
   * 按比例绘制图片
   * @param {CanvasRenderingContext2D} ctx Canvas上下文
   * @param {HTMLImageElement} img 图片元素
   * @param {number} x X坐标
   * @param {number} y Y坐标
   * @param {number} width 目标宽度
   * @param {number} height 目标高度
   */
  drawImageFit(ctx, img, x, y, width, height) {
    const imgRatio = img.width / img.height;
    const targetRatio = width / height;

    let drawWidth, drawHeight, drawX, drawY;

    if (imgRatio > targetRatio) {
      // 图片更宽，以高度为准
      drawHeight = height;
      drawWidth = height * imgRatio;
      drawX = x - (drawWidth - width) / 2;
      drawY = y;
    } else {
      // 图片更高，以宽度为准
      drawWidth = width;
      drawHeight = width / imgRatio;
      drawX = x;
      drawY = y - (drawHeight - height) / 2;
    }

    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, width, height);
    ctx.clip();
    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();
  }

  /**
   * 绘制页脚
   * @param {CanvasRenderingContext2D} ctx Canvas上下文
   * @param {number} width 宽度
   * @param {number} y Y坐标
   * @param {number} height 高度
   */
  drawFooter(ctx, width, y, height) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, y, width, height);

    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();

    ctx.fillStyle = '#6b7280';
    ctx.font = '12px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Generated by Pick Tier - Ranking Tool', width / 2, y + height / 2);
  }

  /**
   * 显示导出消息
   * @param {string} message 消息内容
   * @param {string} type 消息类型 ('success' | 'error')
   */
  showExportMessage(message, type = 'success') {
    // 创建消息元素
    const messageEl = document.createElement('div');
    messageEl.className = `export-message export-message-${type}`;
    messageEl.textContent = message;

    // 添加到页面
    document.body.appendChild(messageEl);

    // 显示动画
    setTimeout(() => messageEl.classList.add('show'), 100);

    // 自动隐藏
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
   * 显示导出预览
   * @param {string} format 导出格式 ('png' | 'jpeg')
   */
  async showExportPreview(format = 'png') {
    try {
      const canvas = await this.createTierCanvas();
      this.displayPreviewModal(canvas, format);
    } catch (error) {
      console.error('Preview generation failed:', error);
      this.showExportMessage('Preview generation failed. Please try again.', 'error');
    }
  }

  /**
   * 显示预览模态框
   * @param {HTMLCanvasElement} canvas Canvas元素
   * @param {string} format 导出格式
   */
  displayPreviewModal(canvas, format) {
    // 创建预览模态框
    const modal = document.createElement('div');
    modal.className = 'preview-modal';
    modal.innerHTML = `
      <div class="preview-content">
        <div class="preview-header">
          <h3>Export Preview</h3>
          <button class="preview-close" onclick="this.closest('.preview-modal').remove(); this.tierMaker.modalManager.allowBackgroundScroll()">×</button>
        </div>
        <div class="preview-info">
          <strong>Format:</strong> ${format.toUpperCase()} | 
          <strong>Size:</strong> ${canvas.width} × ${canvas.height}px |
          <strong>Elements:</strong> ${this.tierMaker.elements.length} total
        </div>
        <div class="preview-canvas-container">
          <canvas class="preview-canvas" width="${canvas.width}" height="${canvas.height}"></canvas>
        </div>
        <div class="preview-actions">
          <button class="btn btn-primary" onclick="tierMaker.confirmExport('${format}')">
            📸 Export ${format.toUpperCase()}
          </button>
          <button class="btn" onclick="this.closest('.preview-modal').remove(); tierMaker.modalManager.allowBackgroundScroll()">
            Cancel
          </button>
        </div>
      </div>
    `;

    // 复制canvas内容到预览canvas
    const previewCanvas = modal.querySelector('.preview-canvas');
    const previewCtx = previewCanvas.getContext('2d');
    previewCtx.drawImage(canvas, 0, 0);

    // 添加到页面并显示
    document.body.appendChild(modal);
    this.tierMaker.modalManager.preventBackgroundScroll();
    setTimeout(() => modal.classList.add('show'), 100);

    // 点击外部关闭
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
        this.tierMaker.modalManager.allowBackgroundScroll();
      }
    });

    // ESC键关闭
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        modal.remove();
        this.tierMaker.modalManager.allowBackgroundScroll();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }
}