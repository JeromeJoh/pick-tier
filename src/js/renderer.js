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
      <div class="sidebar">
        ${this.renderSidebar()}
      </div>
      
      <div class="main-content">
        ${this.renderMainContent()}
      </div>
      
      ${this.renderModals()}
      
      <div class="drag-indicator" id="dragIndicator"></div>
      
      <button class="mobile-menu-btn" onclick="tierMaker.toggleSidebar()" style="display: none;">
        ☰
      </button>
    `;
  }

  /**
   * 渲染侧边栏
   * @returns {string} HTML字符串
   */
  renderSidebar() {
    return `
      <div class="sidebar-header">
        <h1>🏆 Pick Tier</h1>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3 class="nav-section-title">Actions</h3>
          <button class="nav-item" onclick="tierMaker.handleUploadClick()">
            📁 Upload Images
          </button>
          <button class="nav-item" onclick="tierMaker.openConfigModal()">
            ⚙️ Configure Tiers
          </button>
          <button class="nav-item" onclick="tierMaker.startPresentMode()">
            🎬 Present Mode
          </button>
          <div class="export-button-wrapper">
            <button class="nav-item" onclick="tierMaker.toggleExportOptions(event)">
              📸 Export Image
            </button>
            <div class="export-options" id="exportOptions">
              <button class="export-option" onclick="tierMaker.showExportPreview('png')">
                Preview PNG
              </button>
              <button class="export-option" onclick="tierMaker.showExportPreview('jpeg')">
                Preview JPEG
              </button>
              <button class="export-option" onclick="tierMaker.exportTierImage('png')">
                Export PNG
              </button>
              <button class="export-option" onclick="tierMaker.exportTierImage('jpeg')">
                Export JPEG
              </button>
            </div>
          </div>
          <button class="nav-item" onclick="tierMaker.resetAllRankings()">
            🔄 Reset Rankings
          </button>
          <button class="nav-item" onclick="tierMaker.openBulkActionsModal()">
            📋 Bulk Actions
          </button>
          <button class="nav-item" onclick="tierMaker.clearAll()">
            🗑️ Clear All
          </button>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Data Management</h3>
          <button class="nav-item" onclick="tierMaker.exportDataBackup()">
            💾 Export Backup
          </button>
          <button class="nav-item" onclick="tierMaker.importDataBackup()">
            📂 Import Backup
          </button>
          <button class="nav-item" onclick="tierMaker.storageManager.clearData(); tierMaker.showMessage('Session storage cleared', 'info')">
            🧹 Clear Session
          </button>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Tiers</h3>
          ${this.renderTierNavigation()}
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Statistics</h3>
          <div class="nav-item" style="cursor: default;">
            Elements: ${this.tierMaker.elements.length}
          </div>
          <div class="nav-item" style="cursor: default;">
            Tiers: ${this.tierMaker.tiers.length}
          </div>
          ${this.renderStorageInfo()}
        </div>
      </nav>
    `;
  }

  /**
   * 渲染分级导航
   * @returns {string} HTML字符串
   */
  renderTierNavigation() {
    return this.tierMaker.tiers.map(tier => `
      <div class="nav-item" style="display: flex; align-items: center; gap: 8px;">
        <div style="width: 16px; height: 16px; background: ${tier.color}; border-radius: 3px;"></div>
        <span>${tier.label} (${tier.elements.length})</span>
      </div>
    `).join('');
  }

  /**
   * 渲染主内容区域
   * @returns {string} HTML字符串
   */
  renderMainContent() {
    return `
      <div class="content-header">
        <h1>Tier Ranking</h1>
        <p>Drag and drop elements to rank them in different tiers</p>
      </div>
      
      <div class="controls">
        <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
        <button class="btn btn-primary" onclick="tierMaker.handleUploadClick()">
          📁 Upload Images
        </button>
        <button class="btn" onclick="tierMaker.openConfigModal()">
          ⚙️ Configure Tiers
        </button>
        <button class="btn" onclick="tierMaker.startPresentMode()">
          🎬 Present Mode
        </button>
        <div class="export-button-wrapper">
          <button class="btn btn-export" onclick="tierMaker.toggleExportOptions(event)">
            📸 Export Image
          </button>
          <div class="export-options" id="exportOptionsMain">
            <button class="export-option" onclick="tierMaker.showExportPreview('png')">
              Preview PNG
            </button>
            <button class="export-option" onclick="tierMaker.showExportPreview('jpeg')">
              Preview JPEG
            </button>
            <button class="export-option" onclick="tierMaker.exportTierImage('png')">
              Export PNG
            </button>
            <button class="export-option" onclick="tierMaker.exportTierImage('jpeg')">
              Export JPEG
            </button>
          </div>
        </div>
        <button class="btn" onclick="tierMaker.exportDataBackup()">
          💾 Export Backup
        </button>
        <button class="btn" onclick="tierMaker.importDataBackup()">
          📂 Import Backup
        </button>
        <button class="btn btn-warning" onclick="tierMaker.resetAllRankings()">
          🔄 Reset Rankings
        </button>
        <button class="btn btn-danger" onclick="tierMaker.clearAll()">
          🗑️ Clear All
        </button>
      </div>
      
      <div class="tier-container">
        <h2 class="tier-section-title">Ranking Tiers</h2>
        ${this.renderTiers()}
      </div>
      
      <div class="elements-pool">
        <h3>Elements Pool</h3>
        <div class="elements-container" id="elementsContainer">
          ${this.renderPoolElements()}
        </div>
      </div>
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
             id="tierLabel_${tier.id}"
             data-tooltip="Click to edit tier name">
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
          ${tier.elements.length === 0 ? '<div class="empty-state"><p>Drop elements here</p></div>' : ''}
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
    if (poolElements.length === 0) {
      return '<div class="empty-state"><h3>No elements yet</h3><p>Upload images to get started</p></div>';
    }
    return poolElements.map(element => this.renderElement(element)).join('');
  }

  /**
   * 渲染单个元素
   * @param {Object} element 元素对象
   * @returns {string} HTML字符串
   */
  renderElement(element) {
    return `
      <div class="element tooltip" 
           draggable="true" 
           data-element-id="${element.id}"
           data-tooltip="${element.name}"
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
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="text" value="${tier.label}" 
                 onchange="tierMaker.updateTierLabel('${tier.id}', this.value)"
                 style="flex: 1;" placeholder="Tier name">
          <input type="color" value="${tier.color}" 
                 onchange="tierMaker.updateTierColor('${tier.id}', this.value)"
                 class="color-input" title="Choose color">
          <button class="btn btn-danger" onclick="tierMaker.deleteTier('${tier.id}')"
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
            <button class="btn" onclick="tierMaker.closeConfigModal()">Close</button>
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
            <button class="btn" onclick="tierMaker.closeElementModal()">Cancel</button>
          </div>
        </div>
      </div>
      
      <!-- Bulk Actions Modal -->
      <div class="modal" id="bulkActionsModal">
        <div class="modal-content">
          <h3>Bulk Actions</h3>
          <p>Choose which tiers to reset or perform other bulk operations:</p>
          <div id="bulkTierList">
            ${this.renderBulkTierList()}
          </div>
          <div class="bulk-actions">
            <button class="btn btn-warning" onclick="tierMaker.resetSelectedTiers()">
              🔄 Reset Selected
            </button>
            <button class="btn" onclick="tierMaker.closeBulkActionsModal()">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 渲染批量操作分级列表
   * @returns {string} HTML字符串
   */
  renderBulkTierList() {
    return this.tierMaker.tiers.map(tier => {
      const elementCount = tier.elements.length;
      return `
        <div class="form-group">
          <label style="display: flex; align-items: center; gap: 12px; cursor: pointer;">
            <input type="checkbox" 
                   class="bulk-tier-checkbox" 
                   data-tier-id="${tier.id}"
                   ${elementCount > 0 ? '' : 'disabled'}>
            <div style="width: 20px; height: 20px; background: ${tier.color}; border-radius: 4px;"></div>
            <span>${tier.label} (${elementCount} element${elementCount !== 1 ? 's' : ''})</span>
          </label>
        </div>
      `;
    }).join('');
  }

  /**
   * 渲染存储信息
   * @returns {string} HTML字符串
   */
  renderStorageInfo() {
    const storageInfo = this.tierMaker.storageManager.getStorageInfo();
    if (!storageInfo) {
      return `
        <div class="nav-item storage-info" style="cursor: default; font-size: 0.75rem; color: #9ca3af;">
          No saved data
        </div>
      `;
    }

    return `
      <div class="nav-item storage-info" style="cursor: default; font-size: 0.75rem; color: #9ca3af;">
        💾 Last saved: ${new Date(storageInfo.timestamp).toLocaleTimeString()}
      </div>
    `;
  }
}