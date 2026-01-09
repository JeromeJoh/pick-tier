// 渲染器模块 - 负责生成HTML内容

export class Renderer {
  constructor(tierMaker) {
    this.tierMaker = tierMaker;
  }

  /**
   * 渲染主应用界面
   * @returns {string} HTML字符串
   */
  renderApp() {
    return `
      <div class="app">
        <div class="header">
          <h1>🏆 Pick Tier</h1>
        </div>
        <div class="main-content">
          <div class="controls">
            <div class="file-input-wrapper">
              <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
              <button class="upload-btn" onclick="tierMaker.handleUploadClick()">
                📁 Upload Images
              </button>
            </div>
            <button class="config-btn" onclick="tierMaker.openConfigModal()">
              ⚙️ Configure Tiers
            </button>
            <button class="clear-btn" onclick="tierMaker.clearAll()">
              🗑️ Clear All
            </button>
          </div>
          
          <div class="tier-container">
            ${this.renderTiers()}
          </div>
          
          <div class="elements-pool">
            <h3>📦 Elements Pool</h3>
            <div class="elements-container" id="elementsContainer">
              ${this.renderPoolElements()}
            </div>
          </div>
        </div>
      </div>
      
      ${this.renderModals()}
      
      <div class="drag-indicator" id="dragIndicator"></div>
    `;
  }

  /**
   * 渲染分级区域
   * @returns {string} HTML字符串
   */
  renderTiers() {
    return this.tierMaker.tiers.map(tier => `
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
          ${tier.elements.map(elementId => {
      const element = this.tierMaker.elements.find(el => el.id == elementId);
      return element ? this.renderElement(element) : '';
    }).join('')}
        </div>
      </div>
    `).join('');
  }

  /**
   * 渲染元素池中的元素
   * @returns {string} HTML字符串
   */
  renderPoolElements() {
    const poolElements = this.tierMaker.elements.filter(el => !this.tierMaker.isElementInTier(el.id));
    return poolElements.map(element => this.renderElement(element)).join('');
  }

  /**
   * 渲染单个元素
   * @param {Object} element 元素对象
   * @returns {string} HTML字符串
   */
  renderElement(element) {
    return `
      <div class="element" 
           draggable="true" 
           data-element-id="${element.id}"
           ondragstart="tierMaker.handleDragStart(event)"
           ondragend="tierMaker.handleDragEnd(event)">
        <img src="${element.src}" alt="${element.name}" loading="lazy">
        <div class="element-info">${element.name}</div>
        <div class="element-actions">
          <button class="element-action edit-btn" onclick="tierMaker.editElement('${element.id}')" title="Edit">
            ✏️
          </button>
          <button class="element-action delete-btn" onclick="tierMaker.deleteElement('${element.id}')" title="Delete">
            ❌
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染分级配置界面
   * @returns {string} HTML字符串
   */
  renderTierConfig() {
    return this.tierMaker.tiers.map(tier => `
      <div class="form-group">
        <label>Tier ${tier.label}</label>
        <div style="display: flex; gap: 10px; align-items: center;">
          <input type="text" value="${tier.label}" 
                 onchange="tierMaker.updateTierLabel('${tier.id}', this.value)"
                 style="flex: 1;" placeholder="Tier name">
          <input type="color" value="${tier.color}" 
                 onchange="tierMaker.updateTierColor('${tier.id}', this.value)"
                 class="color-input" title="Choose color">
          <button class="btn btn-secondary" onclick="tierMaker.deleteTier('${tier.id}')"
                  style="padding: 8px 12px;" title="Delete tier">Delete</button>
        </div>
      </div>
    `).join('');
  }

  /**
   * 渲染所有模态框
   * @returns {string} HTML字符串
   */
  renderModals() {
    return `
      <!-- Configuration Modal -->
      <div class="modal" id="configModal">
        <div class="modal-content">
          <h3>Configure Tiers</h3>
          <div id="tierConfigList">
            ${this.renderTierConfig()}
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="tierMaker.addTier()">Add Tier</button>
            <button class="btn btn-secondary" onclick="tierMaker.closeConfigModal()">Close</button>
          </div>
        </div>
      </div>
      
      <!-- Element Edit Modal -->
      <div class="modal" id="elementModal">
        <div class="modal-content">
          <h3>Edit Element</h3>
          <div class="form-group">
            <label>Name</label>
            <input type="text" id="elementName" placeholder="Enter element name">
          </div>
          <div class="form-group">
            <label>Description</label>
            <textarea id="elementDescription" placeholder="Enter element description" rows="3"></textarea>
          </div>
          <div class="modal-actions">
            <button class="btn btn-primary" onclick="tierMaker.saveElement()">Save</button>
            <button class="btn btn-secondary" onclick="tierMaker.closeElementModal()">Cancel</button>
          </div>
        </div>
      </div>
    `;
  }
}