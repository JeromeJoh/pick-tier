// Tier Maker 应用主文件
class TierMaker {
  constructor() {
    this.elements = [];
    this.tiers = [
      { id: 'S', label: 'S', color: '#ff7f7f', elements: [] },
      { id: 'A', label: 'A', color: '#ffbf7f', elements: [] },
      { id: 'B', label: 'B', color: '#ffdf7f', elements: [] },
      { id: 'C', label: 'C', color: '#ffff7f', elements: [] },
      { id: 'D', label: 'D', color: '#bfff7f', elements: [] }
    ];
    this.draggedElement = null;
    this.nextElementId = 1;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="app">
        <div class="header">
          <h1>🏆 Tier Maker</h1>
        </div>
        <div class="main-content">
          <div class="controls">
            <div class="file-input-wrapper">
              <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
              <button class="upload-btn" onclick="document.getElementById('imageInput').click()">
                📁 上传图片
              </button>
            </div>
            <button class="config-btn" onclick="tierMaker.openConfigModal()">
              ⚙️ 配置分级
            </button>
            <button class="clear-btn" onclick="tierMaker.clearAll()">
              🗑️ 清空所有
            </button>
          </div>
          
          <div class="tier-container">
            ${this.renderTiers()}
          </div>
          
          <div class="elements-pool">
            <h3>📦 元素池</h3>
            <div class="elements-container" id="elementsContainer">
              ${this.renderPoolElements()}
            </div>
          </div>
        </div>
      </div>
      
      <!-- 配置模态框 -->
      <div class="modal" id="configModal">
        <div class="modal-content">
          <h3>配置分级</h3>
          <div id="tierConfigList">
            ${this.renderTierConfig()}
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="tierMaker.addTier()">添加分级</button>
            <button class="btn btn-secondary" onclick="tierMaker.closeConfigModal()">关闭</button>
          </div>
        </div>
      </div>
      
      <!-- 元素编辑模态框 -->
      <div class="modal" id="elementModal">
        <div class="modal-content">
          <h3>编辑元素</h3>
          <div class="form-group">
            <label>名称</label>
            <input type="text" id="elementName" placeholder="输入元素名称">
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea id="elementDescription" placeholder="输入元素描述" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="tierMaker.saveElement()">保存</button>
            <button class="btn btn-secondary" onclick="tierMaker.closeElementModal()">取消</button>
          </div>
        </div>
      </div>
      
      <div class="drag-indicator" id="dragIndicator"></div>
    `;
  }

  renderTiers() {
    return this.tiers.map(tier => `
      <div class="tier-row">
        <div class="tier-label" style="background-color: ${tier.color}" 
             onclick="tierMaker.editTierLabel('${tier.id}')" 
             id="tierLabel_${tier.id}">
          ${tier.label}
        </div>
        <div class="tier-content" 
             data-tier-id="${tier.id}"
             ondrop="tierMaker.handleDrop(event)"
             ondragover="tierMaker.handleDragOver(event)"
             ondragleave="tierMaker.handleDragLeave(event)">
          ${tier.elements.map(element => this.renderElement(element)).join('')}
        </div>
      </div>
    `).join('');
  }

  renderPoolElements() {
    const poolElements = this.elements.filter(el => !this.isElementInTier(el.id));
    return poolElements.map(element => this.renderElement(element)).join('');
  }

  renderElement(element) {
    return `
      <div class="element" 
           draggable="true" 
           data-element-id="${element.id}"
           ondragstart="tierMaker.handleDragStart(event)"
           ondragend="tierMaker.handleDragEnd(event)">
        <img src="${element.src}" alt="${element.name}">
        <div class="element-info">${element.name}</div>
        <div class="element-actions">
          <button class="element-action edit-btn" onclick="tierMaker.editElement('${element.id}')">✏️</button>
          <button class="element-action delete-btn" onclick="tierMaker.deleteElement('${element.id}')">❌</button>
        </div>
      </div>
    `;
  }

  renderTierConfig() {
    return this.tiers.map(tier => `
      <div class="form-group">
        <label>分级 ${tier.label}</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" value="${tier.label}" 
                 onchange="tierMaker.updateTierLabel('${tier.id}', this.value)"
                 style="flex: 1;">
          <input type="color" value="${tier.color}" 
                 onchange="tierMaker.updateTierColor('${tier.id}', this.value)"
                 class="color-input">
          <button class="btn btn-secondary" onclick="tierMaker.deleteTier('${tier.id}')"
                  style="padding: 8px 12px;">删除</button>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    // 文件上传
    document.getElementById('imageInput').addEventListener('change', (e) => {
      this.handleFileUpload(e);
    });

    // 元素池拖拽
    const elementsContainer = document.getElementById('elementsContainer');
    elementsContainer.addEventListener('drop', (e) => this.handlePoolDrop(e));
    elementsContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
    elementsContainer.addEventListener('dragleave', (e) => this.handleDragLeave(e));

    // 点击模态框外部关闭
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal')) {
        this.closeAllModals();
      }
    });
  }

  handleFileUpload(event) {
    const files = Array.from(event.target.files);

    files.forEach(file => {
      if (file.type.startsWith('image/')) {
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

  handleDragStart(event) {
    const elementId = event.target.closest('.element').dataset.elementId;
    this.draggedElement = elementId;
    event.target.closest('.element').classList.add('dragging');

    // 显示拖拽指示器
    const indicator = document.getElementById('dragIndicator');
    indicator.textContent = '拖拽到分级区域';
    indicator.classList.add('show');

    event.dataTransfer.effectAllowed = 'move';
  }

  handleDragEnd(event) {
    event.target.closest('.element').classList.remove('dragging');
    this.draggedElement = null;

    // 隐藏拖拽指示器
    const indicator = document.getElementById('dragIndicator');
    indicator.classList.remove('show');

    // 移除所有拖拽样式
    document.querySelectorAll('.drag-over').forEach(el => {
      el.classList.remove('drag-over');
    });
  }

  handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    event.currentTarget.classList.add('drag-over');

    // 更新拖拽指示器位置
    const indicator = document.getElementById('dragIndicator');
    indicator.style.left = event.clientX + 10 + 'px';
    indicator.style.top = event.clientY - 30 + 'px';
  }

  handleDragLeave(event) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      event.currentTarget.classList.remove('drag-over');
    }
  }

  handleDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!this.draggedElement) return;

    const tierId = event.currentTarget.dataset.tierId;
    this.moveElementToTier(this.draggedElement, tierId);
  }

  handlePoolDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('drag-over');

    if (!this.draggedElement) return;

    this.moveElementToPool(this.draggedElement);
  }

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

  moveElementToPool(elementId) {
    // 从所有分级中移除元素
    this.tiers.forEach(tier => {
      tier.elements = tier.elements.filter(id => id !== elementId);
    });

    this.updateDisplay();
  }

  isElementInTier(elementId) {
    return this.tiers.some(tier => tier.elements.includes(elementId));
  }

  updateDisplay() {
    // 更新分级区域
    this.tiers.forEach(tier => {
      const tierContent = document.querySelector(`[data-tier-id="${tier.id}"]`);
      if (tierContent) {
        tierContent.innerHTML = tier.elements.map(elementId => {
          const element = this.elements.find(el => el.id == elementId);
          return element ? this.renderElement(element) : '';
        }).join('');
      }
    });

    // 更新元素池
    this.updateElementsPool();
  }

  updateElementsPool() {
    const container = document.getElementById('elementsContainer');
    if (container) {
      container.innerHTML = this.renderPoolElements();
    }
  }

  editTierLabel(tierId) {
    const labelElement = document.getElementById(`tierLabel_${tierId}`);
    const tier = this.tiers.find(t => t.id === tierId);

    if (!tier || labelElement.classList.contains('editing')) return;

    labelElement.classList.add('editing');
    const currentLabel = tier.label;

    labelElement.innerHTML = `<input type="text" value="${currentLabel}" onblur="tierMaker.saveTierLabel('${tierId}', this.value)" onkeypress="if(event.key==='Enter') this.blur()">`;
    labelElement.querySelector('input').focus();
    labelElement.querySelector('input').select();
  }

  saveTierLabel(tierId, newLabel) {
    const tier = this.tiers.find(t => t.id === tierId);
    const labelElement = document.getElementById(`tierLabel_${tierId}`);

    if (tier && newLabel.trim()) {
      tier.label = newLabel.trim();
    }

    labelElement.classList.remove('editing');
    labelElement.innerHTML = tier.label;
  }

  editElement(elementId) {
    const element = this.elements.find(el => el.id == elementId);
    if (!element) return;

    this.currentEditingElement = element;
    document.getElementById('elementName').value = element.name;
    document.getElementById('elementDescription').value = element.description;
    document.getElementById('elementModal').classList.add('show');
  }

  saveElement() {
    if (!this.currentEditingElement) return;

    const name = document.getElementById('elementName').value.trim();
    const description = document.getElementById('elementDescription').value.trim();

    if (name) {
      this.currentEditingElement.name = name;
      this.currentEditingElement.description = description;
      this.updateDisplay();
    }

    this.closeElementModal();
  }

  deleteElement(elementId) {
    if (confirm('确定要删除这个元素吗？')) {
      // 从元素列表中移除
      this.elements = this.elements.filter(el => el.id != elementId);

      // 从所有分级中移除
      this.tiers.forEach(tier => {
        tier.elements = tier.elements.filter(id => id != elementId);
      });

      this.updateDisplay();
    }
  }

  openConfigModal() {
    document.getElementById('configModal').classList.add('show');
    // 重新渲染配置列表
    document.getElementById('tierConfigList').innerHTML = this.renderTierConfig();
  }

  closeConfigModal() {
    document.getElementById('configModal').classList.remove('show');
  }

  closeElementModal() {
    document.getElementById('elementModal').classList.remove('show');
    this.currentEditingElement = null;
  }

  closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('show');
    });
  }

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

  addTier() {
    const newId = 'T' + Date.now();
    const newTier = {
      id: newId,
      label: '新分级',
      color: '#' + Math.floor(Math.random() * 16777215).toString(16),
      elements: []
    };

    this.tiers.push(newTier);

    // 重新渲染整个应用
    this.render();
    this.bindEvents();

    // 重新打开配置模态框
    this.openConfigModal();
  }

  deleteTier(tierId) {
    if (this.tiers.length <= 1) {
      alert('至少需要保留一个分级！');
      return;
    }

    if (confirm('确定要删除这个分级吗？分级中的元素将移回元素池。')) {
      const tier = this.tiers.find(t => t.id === tierId);
      if (tier && tier.elements.length > 0) {
        // 将分级中的元素移回元素池（实际上就是从分级中移除）
      }

      this.tiers = this.tiers.filter(t => t.id !== tierId);

      // 重新渲染
      this.render();
      this.bindEvents();
      this.openConfigModal();
    }
  }

  clearAll() {
    if (confirm('确定要清空所有元素和分级设置吗？此操作不可撤销！')) {
      this.elements = [];
      this.tiers.forEach(tier => {
        tier.elements = [];
      });
      this.updateDisplay();
    }
  }
}

// 初始化应用
const tierMaker = new TierMaker();

// 导出到全局作用域以便HTML中的事件处理器使用
window.tierMaker = tierMaker;