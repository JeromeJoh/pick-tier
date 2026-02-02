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
      <div class="sidebar" id="sidebar">
        ${this.renderSidebar()}
      </div>
      
      <div class="main-content">
      <input type="file" id="imageInput" class="file-input" accept="image/*" multiple>
        <button class="sidebar-toggle-btn" id="sidebarToggle" onclick="tierMaker.toggleSidebar()">
          <i class="ph ph-text-indent"></i>
        </button>
        ${this.renderMainContent()}
      </div>
      
      ${this.renderModals()}
      
      <div class="drag-indicator" id="dragIndicator"></div>
      
      <button class="main-export-button" data-action="export">
        <i class="ph ph-share-fat"></i>
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
        <img src="logo.svg" alt="Pick Tier Logo" class="sidebar-logo">
        <h1>Pick Tier</h1>
      </div>
      <div class="elements-pool">
        <div class="elements-pool-header">
          <h3>Elements Pool</h3>
          <button title="Upload Images" onclick="tierMaker.handleUploadClick()">
            <i class="ph ph-plus-circle"></i>
          </button>
        </div>
        <div class="elements-container" id="elementsContainer">
          ${this.renderPoolElements()}
        </div>
      </div>
      
      <nav class="sidebar-nav">
        <div class="nav-section">
          <h3 class="nav-section-title">Actions</h3>
          <button class="nav-item" onclick="tierMaker.openConfigModal()">
            <i class="ph ph-gear"></i>
            <span>Configure Tiers</span>
          </button>
          <button class="nav-item" onclick="tierMaker.toggleFullViewMode()" data-action="full-view-mode">
            <i class="ph ph-eye"></i>
            <span>Full View Mode</span>
          </button>
          <button class="nav-item" onclick="tierMaker.startPresentMode()">
            <i class="ph ph-presentation"></i>
            <span>Present Mode</span>
          </button>
          <!--
          <div class="export-button-wrapper">
            <button class="nav-item" data-action="export">
              <i class="ph ph-image-square"></i>
              <span>Export Image</span>
            </button>
          </div>
          -->
          <button class="nav-item" onclick="tierMaker.resetAllRankings()">
            <i class="ph ph-arrow-clockwise"></i>
            <span>Reset Rankings</span>
          </button>
          <!--
          <button class="nav-item" onclick="tierMaker.openBulkActionsModal()">
            Bulk Actions
          </button>
          -->
          <button class="nav-item" onclick="tierMaker.clearAll()">
            <i class="ph ph-broom"></i>
            <span>Clear All</span>
          </button>
        </div>
        
        <div class="nav-section">
          <h3 class="nav-section-title">Data Management</h3>
          <button class="nav-item" onclick="tierMaker.exportDataBackup()">
            <i class="ph ph-arrow-square-out"></i>
            Export Backup
          </button>
          <button class="nav-item" onclick="tierMaker.importDataBackup()">
            <i class="ph ph-arrow-square-in"></i>
            Import Backup
          </button>
          <button class="nav-item" onclick="tierMaker.storageManager.clearData(); toast.info('Session storage cleared')">
            <i class="ph ph-x"></i>
            Clear Session
          </button>
          ${this.renderStorageInfo()}
        </div>
      </nav>
    `;
  }

  /**
   * 渲染主内容区域
   * @returns {string} HTML字符串
   */
  renderMainContent() {
    return `
      <div class="content-header">
        <h1>How to Use Pick Tier</h1>
        <div class="steps-list">
          <p><em>1.</em> Upload images using the "+" button in the Elements Pool.</p>
          <p><em>2.</em> Drag and drop elements to rank them in different tiers.</p>
          <p><em>3.</em> Use the sidebar to configure tiers, present, or reset rankings.</p>
          <p><em>4.</em> Export your ranked tiers as an image when ready.</p>
        </div>
      </div>
      <div class="tier-container">
        <h2 class="tier-section-title">
          <input id="sectionTitle" type="text" value="Your Tiers">
          <div class="tier-stats">
            <div>
              Tiers: ${this.tierMaker.tiers.length}
            </div>
            <div>
              Elements: ${this.tierMaker.elements.length}
            </div>
        </div>
        </h2>
        ${this.renderTiers()}
      </div>
      <footer class="app-footer">Powered By Pick Tier</footer>
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
             oncontextmenu="tierMaker.editTierColor(event,'${tier.id}')" 
             id="tierLabel_${tier.id}"
             data-tooltip="Click to edit tier name">
          ${tier.label}
        </div>
        <div class="tier-content" 
             data-tier-id="${tier.id}">
          ${tier.elements.map(elementId => {
      const element = this.tierMaker.elements.find(el => String(el.id) === String(elementId));
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
        <img src="${element.src}" alt="${element.name}" loading="lazy" draggable="false">
        <div class="element-info">${element.name}</div>
        <div class="element-actions">
          <button class="element-action edit-btn" onclick="tierMaker.editElement('${element.id}')" title="Edit">
            <i class="ph ph-pencil-simple-line"></i>
          </button>
          <button class="element-action delete-btn" onclick="tierMaker.deleteElement('${element.id}')" title="Delete">
            <i class="ph ph-trash-simple"></i>
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
        <div style="display: flex; gap: 12px; align-items: center;">
          <input type="color" value="${tier.color}" 
                onchange="tierMaker.updateTierColor('${tier.id}', this.value)"
                class="color-input" title="Choose color">
          <input type="text" value="${tier.label}" 
                 onchange="tierMaker.updateTierLabel('${tier.id}', this.value)"
                 style="flex: 1;" placeholder="Tier name">
          <button class="delete-tier" onclick="tierMaker.deleteTier('${tier.id}')">
            <i class="ph ph-x"></i>
          </button>
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
        <div class="nav-item storage-info" style="cursor: default; font-size: 0.75rem; color: #9ca3af;pointer-events: none;">
          No saved data
        </div>
      `;
    }

    return `
      <div class="storage-info nav-item">
         <i class="ph ph-floppy-disk"></i>Last saved: ${new Date(storageInfo.timestamp).toLocaleTimeString()}
      </div>
    `;
  }
}