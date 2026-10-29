import { MeeshoAdapter } from '../adapters/MeeshoAdapter';
import { AutofillEngine, AutofillSummary } from '../engine/AutofillEngine';
import { MessageAction, sendExtensionMessage } from '../../shared/messaging';
import { ExtensionTemplateDTO, ExtensionListingDTO } from '../../shared/types';
import { FieldFillResult } from '../adapters/MarketplaceAdapter';

export class ListivoFloatingPanel {
  private shadow: ShadowRoot;
  private adapter: MeeshoAdapter;
  private engine: AutofillEngine;
  private isMinimized: boolean = false;
  private selectedType: 'TEMPLATE' | 'LISTING' = 'TEMPLATE';
  private templates: ExtensionTemplateDTO[] = [];
  private listings: ExtensionListingDTO[] = [];
  private selectedRecord: ExtensionTemplateDTO | ExtensionListingDTO | null = null;
  private overwritePolicy: 'EMPTY_ONLY' | 'REPLACE_ALL' = 'EMPTY_ONLY';
  private lastUrl: string = window.location.href;
  private urlCheckInterval: any = null;
  private unloadHandler: (() => void) | null = null;
  private popstateHandler: (() => void) | null = null;

  constructor(shadow: ShadowRoot) {
    this.shadow = shadow;
    this.adapter = new MeeshoAdapter();
    this.engine = new AutofillEngine(this.adapter);
  }

  public init() {
    this.renderStyles();
    this.renderBadge();
    this.fetchData();

    // Prevent autofill continuing across SPA / page navigations & clean up
    this.unloadHandler = () => this.destroy();
    window.addEventListener('beforeunload', this.unloadHandler);
    window.addEventListener('pagehide', this.unloadHandler);

    this.popstateHandler = () => this.handleNavigation();
    window.addEventListener('popstate', this.popstateHandler);

    // Bounded periodic check for SPA client-side route changes
    this.urlCheckInterval = setInterval(() => {
      if (window.location.href !== this.lastUrl) {
        this.lastUrl = window.location.href;
        this.handleNavigation();
      }
    }, 1200);
  }

  private handleNavigation() {
    if (this.engine.isRunning()) {
      console.warn('[LISTIVO] Navigation detected during autofill. Aborting engine immediately.');
      this.engine.abort();
      this.closeModal();
    }
    this.renderBadge();
  }

  public destroy() {
    if (this.engine.isRunning()) {
      this.engine.abort();
    }
    if (this.urlCheckInterval) {
      clearInterval(this.urlCheckInterval);
      this.urlCheckInterval = null;
    }
    if (this.unloadHandler) {
      window.removeEventListener('beforeunload', this.unloadHandler);
      window.removeEventListener('pagehide', this.unloadHandler);
      this.unloadHandler = null;
    }
    if (this.popstateHandler) {
      window.removeEventListener('popstate', this.popstateHandler);
      this.popstateHandler = null;
    }
    this.closeModal();
  }

  private renderStyles() {
    const style = document.createElement('style');
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      
      .listivo-badge-container {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 999999;
        transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .listivo-card {
        background: #0B0F19;
        color: #F8FAFC;
        border: 1px solid #1E293B;
        border-radius: 16px;
        padding: 16px;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
        width: 320px;
      }

      .listivo-card-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
      }

      .listivo-brand-title {
        font-weight: 900;
        letter-spacing: 0.5px;
        font-size: 14px;
        background: linear-gradient(135deg, #818CF8, #C084FC);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }

      .listivo-status-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 11px;
        font-weight: 700;
        color: #34D399;
        background: rgba(16, 185, 129, 0.1);
        padding: 3px 10px;
        border-radius: 999px;
        border: 1px solid rgba(16, 185, 129, 0.25);
      }

      .listivo-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background-color: #34D399;
        box-shadow: 0 0 8px #34D399;
      }

      .listivo-btn-primary {
        width: 100%;
        background: linear-gradient(135deg, #4F46E5, #7C3AED);
        color: white;
        border: none;
        padding: 10px 16px;
        border-radius: 10px;
        font-weight: 700;
        font-size: 13px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(79, 70, 229, 0.35);
      }

      .listivo-btn-primary:hover {
        opacity: 0.94;
        transform: translateY(-1px);
      }

      .listivo-btn-secondary {
        background: #1E293B;
        color: #CBD5E1;
        border: 1px solid #334155;
        padding: 8px 12px;
        border-radius: 8px;
        font-weight: 600;
        font-size: 12px;
        cursor: pointer;
        transition: background 0.15s;
      }

      .listivo-btn-secondary:hover {
        background: #334155;
        color: white;
      }

      .listivo-modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(11, 15, 25, 0.75);
        backdrop-filter: blur(6px);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000000;
        animation: fadeIn 0.2s ease;
      }

      .listivo-modal-content {
        background: #0B0F19;
        border: 1px solid #1E293B;
        border-radius: 20px;
        padding: 24px;
        width: 440px;
        max-width: 92vw;
        max-height: 88vh;
        overflow-y: auto;
        color: #F8FAFC;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
      }

      .listivo-tab-group {
        display: flex;
        background: #111827;
        padding: 4px;
        border-radius: 12px;
        margin-bottom: 16px;
        border: 1px solid #1F2937;
      }

      .listivo-tab {
        flex: 1;
        padding: 8px;
        text-align: center;
        font-size: 12px;
        font-weight: 700;
        color: #94A3B8;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s;
      }

      .listivo-tab.active {
        background: #4F46E5;
        color: white;
      }

      .listivo-select {
        width: 100%;
        background: #111827;
        border: 1px solid #374151;
        color: #F8FAFC;
        padding: 10px 12px;
        border-radius: 10px;
        font-size: 13px;
        margin-bottom: 16px;
        outline: none;
      }

      .listivo-select:focus {
        border-color: #6366F1;
      }

      .listivo-info-card {
        background: #111827;
        border: 1px solid #1F2937;
        border-radius: 12px;
        padding: 12px 14px;
        margin-bottom: 16px;
        font-size: 12px;
      }

      .listivo-tag-pill {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 3px 8px;
        border-radius: 6px;
        font-size: 11px;
        font-weight: 700;
      }

      .listivo-tag-green { background: rgba(16, 185, 129, 0.15); color: #34D399; border: 1px solid rgba(16, 185, 129, 0.3); }
      .listivo-tag-amber { background: rgba(245, 158, 11, 0.15); color: #FBBF24; border: 1px solid rgba(245, 158, 11, 0.3); }
      .listivo-tag-red { background: rgba(239, 68, 68, 0.15); color: #F87171; border: 1px solid rgba(239, 68, 68, 0.3); }
      .listivo-tag-blue { background: rgba(59, 130, 246, 0.15); color: #60A5FA; border: 1px solid rgba(59, 130, 246, 0.3); }

      .listivo-progress-bar {
        width: 100%;
        height: 8px;
        background: #1F2937;
        border-radius: 999px;
        overflow: hidden;
        margin: 12px 0;
      }

      .listivo-progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #4F46E5, #C084FC);
        width: 0%;
        transition: width 0.2s ease;
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: scale(0.96); }
        to { opacity: 1; transform: scale(1); }
      }
    `;
    this.shadow.appendChild(style);
  }

  private async fetchData() {
    try {
      const templatesRes = await sendExtensionMessage<any, ExtensionTemplateDTO[]>({
        action: MessageAction.GET_TEMPLATES,
      });

      if (templatesRes.success && Array.isArray(templatesRes.data)) {
        this.templates = templatesRes.data;
        if (this.templates.length > 0) {
          this.selectedRecord = this.templates[0];
        }
      }

      const listingsRes = await sendExtensionMessage<any, ExtensionListingDTO[]>({
        action: MessageAction.GET_LISTING,
      });

      if (listingsRes.success && Array.isArray(listingsRes.data)) {
        this.listings = listingsRes.data;
      }
    } catch (e) {
      console.warn('[LISTIVO UI] Error fetching extension data:', e);
    }
  }

  private renderBadge() {
    const existing = this.shadow.querySelector('.listivo-badge-container');
    if (existing) existing.remove();

    const detection = this.adapter.detectPage();

    const wrapper = document.createElement('div');
    wrapper.className = 'listivo-badge-container';

    wrapper.innerHTML = `
      <div class="listivo-card">
        <div class="listivo-card-header">
          <div class="listivo-brand-title">LISTIVO</div>
          <div class="listivo-status-badge">
            <div class="listivo-dot"></div>
            Connected
          </div>
        </div>
        <div style="font-size: 12px; color: #94A3B8; margin-bottom: 8px;">
          Detected: <strong style="color: #F8FAFC;">Meesho Supplier Portal</strong>
        </div>
        <div style="font-size: 11px; margin-bottom: 12px;" class="listivo-tag-pill ${detection.isListingForm ? 'listivo-tag-green' : 'listivo-tag-amber'}">
          ${detection.isListingForm ? '✓ Upload Form Ready' : '⚠ Navigate to Add Catalog'}
        </div>
        <button id="listivo-trigger-btn" class="listivo-btn-primary">
          <span>Fill with LISTIVO</span>
          <span>→</span>
        </button>
      </div>
    `;

    this.shadow.appendChild(wrapper);

    const btn = wrapper.querySelector('#listivo-trigger-btn');
    if (btn) {
      btn.addEventListener('click', () => this.openPanel());
    }
  }

  private openPanel() {
    this.closeModal();

    const detection = this.adapter.detectPage();
    const overlay = document.createElement('div');
    overlay.className = 'listivo-modal-overlay';

    overlay.innerHTML = `
      <div class="listivo-modal-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <div style="font-size:16px; font-weight:800; color:#F8FAFC;">LISTIVO Meesho Autofill</div>
          <button id="listivo-modal-close" style="background:none; border:none; color:#64748B; font-size:18px; cursor:pointer;">✕</button>
        </div>

        <div class="listivo-tab-group">
          <div class="listivo-tab ${this.selectedType === 'TEMPLATE' ? 'active' : ''}" id="tab-template">
            Templates (${this.templates.length})
          </div>
          <div class="listivo-tab ${this.selectedType === 'LISTING' ? 'active' : ''}" id="tab-listing">
            Listings (${this.listings.length})
          </div>
        </div>

        <div style="font-size:12px; font-weight:700; color:#CBD5E1; margin-bottom:6px;">
          Select ${this.selectedType === 'TEMPLATE' ? 'Catalog Template' : 'Product Listing'}
        </div>
        <select class="listivo-select" id="listivo-record-select">
          ${this.renderOptions()}
        </select>

        <div class="listivo-info-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-weight:700; color:#CBD5E1;">Overwrite Policy:</span>
            <select id="listivo-policy-select" style="background:#1F2937; color:#F8FAFC; border:1px solid #374151; padding:4px 8px; border-radius:6px; font-size:11px;">
              <option value="EMPTY_ONLY" ${this.overwritePolicy === 'EMPTY_ONLY' ? 'selected' : ''}>Empty fields only (Safe)</option>
              <option value="REPLACE_ALL" ${this.overwritePolicy === 'REPLACE_ALL' ? 'selected' : ''}>Replace existing values</option>
            </select>
          </div>
          <div style="color:#94A3B8; font-size:11px; line-height:1.4;" id="validation-summary-box">
            ${this.getValidationSummaryHtml()}
          </div>
        </div>

        <div style="display:flex; gap:10px;">
          <button id="listivo-start-autofill" class="listivo-btn-primary" style="flex:1;">
            <span>🚀 Start Meesho Autofill</span>
          </button>
        </div>
      </div>
    `;

    this.shadow.appendChild(overlay);

    // Event handlers
    overlay.querySelector('#listivo-modal-close')?.addEventListener('click', () => this.closeModal());

    overlay.querySelector('#tab-template')?.addEventListener('click', () => {
      this.selectedType = 'TEMPLATE';
      if (this.templates.length > 0) this.selectedRecord = this.templates[0];
      this.openPanel();
    });

    overlay.querySelector('#tab-listing')?.addEventListener('click', () => {
      this.selectedType = 'LISTING';
      if (this.listings.length > 0) this.selectedRecord = this.listings[0];
      this.openPanel();
    });

    const recordSelect = overlay.querySelector('#listivo-record-select') as HTMLSelectElement;
    if (recordSelect) {
      recordSelect.addEventListener('change', (e) => {
        const id = (e.target as HTMLSelectElement).value;
        if (this.selectedType === 'TEMPLATE') {
          this.selectedRecord = this.templates.find((t) => t.id === id) || null;
        } else {
          this.selectedRecord = this.listings.find((l) => l.id === id) || null;
        }
        const valBox = overlay.querySelector('#validation-summary-box');
        if (valBox) valBox.innerHTML = this.getValidationSummaryHtml();
      });
    }

    const policySelect = overlay.querySelector('#listivo-policy-select') as HTMLSelectElement;
    if (policySelect) {
      policySelect.addEventListener('change', (e) => {
        const newPolicy = (e.target as HTMLSelectElement).value as 'EMPTY_ONLY' | 'REPLACE_ALL';
        if (newPolicy === 'REPLACE_ALL') {
          this.showOverwriteConfirmation(() => {
            this.overwritePolicy = 'REPLACE_ALL';
          }, () => {
            this.overwritePolicy = 'EMPTY_ONLY';
            policySelect.value = 'EMPTY_ONLY';
          });
        } else {
          this.overwritePolicy = 'EMPTY_ONLY';
        }
      });
    }

    overlay.querySelector('#listivo-start-autofill')?.addEventListener('click', () => {
      if (!this.selectedRecord) {
        return;
      }
      if (this.overwritePolicy === 'REPLACE_ALL') {
        this.showOverwriteConfirmation(() => {
          this.runAutofillFlow();
        });
      } else {
        this.runAutofillFlow();
      }
    });
  }

  private showOverwriteConfirmation(onConfirm: () => void, onCancel?: () => void) {
    const confirmOverlay = document.createElement('div');
    confirmOverlay.className = 'listivo-modal-overlay';
    confirmOverlay.style.zIndex = '1000005';
    confirmOverlay.innerHTML = `
      <div class="listivo-modal-content" style="max-width:380px;">
        <div style="font-size:15px; font-weight:800; color:#FBBF24; margin-bottom:8px; display:flex; align-items:center; gap:8px;">
          <span>⚠</span> Confirm Overwrite Policy
        </div>
        <p style="font-size:12px; color:#CBD5E1; line-height:1.5; margin-bottom:16px;">
          You selected <strong>Replace existing values</strong>. This will overwrite any product data, attributes, or pricing already entered on the Meesho form.
        </p>
        <div style="display:flex; gap:10px;">
          <button id="overwrite-cancel-btn" class="listivo-btn-secondary" style="flex:1;">
            Keep Safe (Empty Only)
          </button>
          <button id="overwrite-confirm-btn" class="listivo-btn-primary" style="flex:1; background:#EA580C;">
            Confirm Overwrite
          </button>
        </div>
      </div>
    `;

    this.shadow.appendChild(confirmOverlay);

    confirmOverlay.querySelector('#overwrite-cancel-btn')?.addEventListener('click', () => {
      confirmOverlay.remove();
      if (onCancel) onCancel();
    });

    confirmOverlay.querySelector('#overwrite-confirm-btn')?.addEventListener('click', () => {
      confirmOverlay.remove();
      onConfirm();
    });
  }

  private renderOptions(): string {
    if (this.selectedType === 'TEMPLATE') {
      if (this.templates.length === 0) return `<option value="">No templates found</option>`;
      return this.templates
        .map(
          (t) =>
            `<option value="${t.id}" ${this.selectedRecord?.id === t.id ? 'selected' : ''}>
              ${t.name} (${t.category})
            </option>`
        )
        .join('');
    } else {
      if (this.listings.length === 0) return `<option value="">No product listings found</option>`;
      return this.listings
        .map(
          (l) =>
            `<option value="${l.id}" ${this.selectedRecord?.id === l.id ? 'selected' : ''}>
              ${l.title} (SKU: ${l.sku})
            </option>`
        )
        .join('');
    }
  }

  private getValidationSummaryHtml(): string {
    if (!this.selectedRecord) return 'No catalog item selected.';

    const validation = this.engine.validateData(this.selectedRecord);
    if (validation.isValid) {
      return `<div style="color:#34D399; font-weight:700;">✓ Ready to autofill ${validation.mappedFieldsCount} fields onto Meesho DOM.</div>`;
    } else {
      const errs = validation.issues.map((i) => `• ${i.fieldLabel}: ${i.message}`).join('<br/>');
      return `<div style="color:#F87171; font-weight:700; margin-bottom:4px;">⚠ Pre-check warnings:</div>${errs}`;
    }
  }

  private async runAutofillFlow() {
    if (!this.selectedRecord) return;

    this.closeModal();

    // Render Progress Modal
    const overlay = document.createElement('div');
    overlay.className = 'listivo-modal-overlay';
    overlay.innerHTML = `
      <div class="listivo-modal-content">
        <div style="font-size:16px; font-weight:800; color:#F8FAFC; margin-bottom:8px;">
          Autofilling Meesho Form...
        </div>
        <div style="font-size:12px; color:#94A3B8;" id="progress-status-label">
          Initializing DOM field mapper...
        </div>

        <div class="listivo-progress-bar">
          <div class="listivo-progress-fill" id="progress-fill-bar"></div>
        </div>

        <div style="max-height:180px; overflow-y:auto; background:#111827; border:1px solid #1F2937; border-radius:10px; padding:10px; font-size:11px; display:flex; flex-direction:column; gap:6px; margin-bottom:12px;" id="progress-log-list">
        </div>

        <button id="progress-cancel-btn" class="listivo-btn-secondary" style="width:100%;">
          Stop Autofill
        </button>
      </div>
    `;

    this.shadow.appendChild(overlay);

    const fillBar = overlay.querySelector('#progress-fill-bar') as HTMLElement;
    const statusLabel = overlay.querySelector('#progress-status-label') as HTMLElement;
    const logList = overlay.querySelector('#progress-log-list') as HTMLElement;
    const cancelBtn = overlay.querySelector('#progress-cancel-btn') as HTMLElement;

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.engine.abort();
        if (statusLabel) statusLabel.textContent = 'Stopping autofill process...';
        cancelBtn.setAttribute('disabled', 'true');
        cancelBtn.textContent = 'Stopping...';
      });
    }

    const summary = await this.engine.executeAutofill(
      this.selectedRecord,
      { overwritePolicy: this.overwritePolicy },
      (fieldKey, fieldLabel, status, percent, detail) => {
        if (fillBar) fillBar.style.width = `${percent}%`;
        if (statusLabel) statusLabel.textContent = `Applying '${fieldLabel}' (${percent}%)...`;

        if (detail) {
          const item = document.createElement('div');
          item.style.display = 'flex';
          item.style.justifyContent = 'space-between';
          item.style.alignItems = 'center';

          let statusTagHtml = '';
          switch (detail.status) {
            case 'SUCCESS':
              statusTagHtml = `<span class="listivo-tag-pill listivo-tag-green">✓ Applied</span>`;
              break;
            case 'SKIPPED':
              statusTagHtml = `<span class="listivo-tag-pill listivo-tag-amber">Skipped</span>`;
              break;
            case 'MANUAL_CONFIRMATION_REQUIRED':
              statusTagHtml = `<span class="listivo-tag-pill listivo-tag-blue">Manual</span>`;
              break;
            default:
              statusTagHtml = `<span class="listivo-tag-pill listivo-tag-red">Not Found</span>`;
              break;
          }

          item.innerHTML = `<span style="color:#CBD5E1;">${fieldLabel}</span> ${statusTagHtml}`;
          logList.appendChild(item);
          logList.scrollTop = logList.scrollHeight;
        }
      }
    );

    // Record activity in LISTIVO Dashboard backend
    sendExtensionMessage({
      action: MessageAction.LOG_ACTIVITY,
      payload: {
        type: 'MEESHO_AUTOFILL',
        title: 'Meesho Listing Autofill Completed',
        description: `Autofilled ${summary.successCount} fields, skipped ${summary.skippedCount}, manual ${summary.manualCount} for Meesho catalog item.`,
        marketplace: 'MEESHO',
        fieldsCount: summary.successCount,
      },
    }).catch(() => {});

    // Render Final Summary Modal
    this.renderSummaryModal(summary);
  }

  private renderSummaryModal(summary: AutofillSummary) {
    this.closeModal();

    const overlay = document.createElement('div');
    overlay.className = 'listivo-modal-overlay';

    const detailsRows = summary.details
      .map((d) => {
        let tag = `<span class="listivo-tag-pill listivo-tag-green">Success</span>`;
        if (d.status === 'SKIPPED') tag = `<span class="listivo-tag-pill listivo-tag-amber">Skipped</span>`;
        if (d.status === 'MANUAL_CONFIRMATION_REQUIRED') tag = `<span class="listivo-tag-pill listivo-tag-blue">Manual Action Required</span>`;
        if (d.status === 'FAILED' || d.status === 'NOT_FOUND') tag = `<span class="listivo-tag-pill listivo-tag-red">Not Found</span>`;

        return `
          <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #1F2937; font-size:12px;">
            <div>
              <div style="font-weight:700; color:#F8FAFC;">${d.fieldLabel}</div>
              <div style="font-size:11px; color:#94A3B8;">${d.reason || (d.appliedValue ? `Applied: ${d.appliedValue}` : 'N/A')}</div>
            </div>
            <div>${tag}</div>
          </div>
        `;
      })
      .join('');

    overlay.innerHTML = `
      <div class="listivo-modal-content">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
          <div style="font-size:16px; font-weight:800; color:#F8FAFC;">Autofill Execution Complete</div>
          <button id="summary-close-btn" style="background:none; border:none; color:#64748B; font-size:18px; cursor:pointer;">✕</button>
        </div>

        <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:8px; margin-bottom:16px;">
          <div style="background:#111827; border:1px solid #1F2937; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#34D399;">${summary.successCount}</div>
            <div style="font-size:10px; color:#94A3B8;">Applied</div>
          </div>
          <div style="background:#111827; border:1px solid #1F2937; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#FBBF24;">${summary.skippedCount}</div>
            <div style="font-size:10px; color:#94A3B8;">Skipped</div>
          </div>
          <div style="background:#111827; border:1px solid #1F2937; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#60A5FA;">${summary.manualCount}</div>
            <div style="font-size:10px; color:#94A3B8;">Manual</div>
          </div>
          <div style="background:#111827; border:1px solid #1F2937; border-radius:10px; padding:10px; text-align:center;">
            <div style="font-size:18px; font-weight:800; color:#F87171;">${summary.failedCount}</div>
            <div style="font-size:10px; color:#94A3B8;">Not Found</div>
          </div>
        </div>

        <div style="max-height:220px; overflow-y:auto; margin-bottom:16px; padding-right:4px;">
          ${detailsRows}
        </div>

        <div style="display:flex; gap:10px;">
          ${
            summary.failedCount > 0
              ? `<button id="retry-failed-btn" class="listivo-btn-secondary" style="flex:1;">Retry Missing Fields</button>`
              : ''
          }
          <button id="done-summary-btn" class="listivo-btn-primary" style="flex:1;">
            Close & Return to Meesho
          </button>
        </div>
      </div>
    `;

    this.shadow.appendChild(overlay);

    overlay.querySelector('#summary-close-btn')?.addEventListener('click', () => this.closeModal());
    overlay.querySelector('#done-summary-btn')?.addEventListener('click', () => this.closeModal());

    overlay.querySelector('#retry-failed-btn')?.addEventListener('click', async () => {
      const retryBtn = overlay.querySelector('#retry-failed-btn') as HTMLElement;
      const failed = summary.details.filter((d) => d.status === 'FAILED' || d.status === 'NOT_FOUND');
      if (this.selectedRecord && failed.length > 0 && retryBtn) {
        retryBtn.textContent = 'Retrying missing fields...';
        retryBtn.setAttribute('disabled', 'true');
        await this.engine.retryFailedFields(failed, this.selectedRecord, { overwritePolicy: 'REPLACE_ALL' });
        retryBtn.textContent = 'Retry Complete';
        setTimeout(() => this.closeModal(), 1000);
      }
    });
  }

  private closeModal() {
    if (this.engine.isRunning()) {
      this.engine.abort();
    }
    const modals = this.shadow.querySelectorAll('.listivo-modal-overlay');
    modals.forEach((m) => m.remove());
  }
}
