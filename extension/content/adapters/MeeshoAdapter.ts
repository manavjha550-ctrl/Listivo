import {
  MarketplaceAdapter,
  PageDetectionResult,
  PageType,
  FieldFillResult,
  OverwriteOptions,
} from './MarketplaceAdapter';
import {
  MEESHO_PAGE_SELECTORS,
  MEESHO_FIELD_SELECTORS,
  FieldSelectorConfig,
} from './meeshoSelectors';

export class MeeshoAdapter implements MarketplaceAdapter {
  public marketplaceName = 'Meesho Supplier Panel';

  /**
   * Detect current Meesho page state and granular pageType
   */
  public detectPage(): PageDetectionResult {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    const isMeeshoHost = /supplier\.meesho\.com|meesho\.com/i.test(hostname);

    if (!isMeeshoHost) {
      return {
        isSupported: false,
        isListingForm: false,
        isLoggedIn: false,
        pageType: 'UNSUPPORTED_PAGE' as PageType,
        pageState: 'UNSUPPORTED_PAGE',
        details: 'Current domain is not Meesho Supplier Panel.',
      };
    }

    // Check explicit login indicators or login URL
    const isLoginPageUrl = pathname.includes('/login') || pathname.includes('/auth') || pathname.includes('/signup');
    const hasLoginPageElements = MEESHO_PAGE_SELECTORS.loginPageIndicators.some((sel) => {
      try {
        const el = document.querySelector(sel);
        return Boolean(el && this.isVisible(el as HTMLElement));
      } catch {
        return false;
      }
    });

    // Check authenticated indicators
    const hasAuthSession = MEESHO_PAGE_SELECTORS.loginIndicators.some((sel) => {
      try {
        return Boolean(document.querySelector(sel));
      } catch {
        return false;
      }
    });

    if ((isLoginPageUrl || hasLoginPageElements) && !hasAuthSession) {
      return {
        isSupported: true,
        isListingForm: false,
        isLoggedIn: false,
        pageType: 'MEESHO_LOGIN_PAGE',
        pageState: 'LOGIN_REQUIRED',
        details: 'Please log in to your Meesho supplier account first.',
      };
    }

    // Check listing form presence
    const isListingForm = MEESHO_PAGE_SELECTORS.listingFormIndicators.some((sel) => {
      try {
        const el = document.querySelector(sel);
        return Boolean(el && this.isVisible(el as HTMLElement));
      } catch {
        return false;
      }
    });

    if (isListingForm) {
      return {
        isSupported: true,
        isListingForm: true,
        isLoggedIn: true,
        pageType: 'MEESHO_LISTING_FORM',
        pageState: 'FORM_READY',
        details: 'Meesho product upload/listing form is active and ready for autofill.',
      };
    }

    // Classify other supplier portal pages
    const isCatalogPage = MEESHO_PAGE_SELECTORS.catalogPageIndicators.some((sel) => Boolean(document.querySelector(sel)));
    if (isCatalogPage || pathname.includes('/catalog')) {
      return {
        isSupported: true,
        isListingForm: false,
        isLoggedIn: true,
        pageType: 'MEESHO_CATALOG_PAGE',
        pageState: 'FORM_NOT_FOUND',
        details: 'On Meesho Catalog Management page. Click "Add Catalog" or "Add Single Product" to open listing form.',
      };
    }

    const isDashboard = MEESHO_PAGE_SELECTORS.dashboardIndicators.some((sel) => Boolean(document.querySelector(sel)));
    if (isDashboard || pathname === '/' || pathname.includes('/dashboard')) {
      return {
        isSupported: true,
        isListingForm: false,
        isLoggedIn: true,
        pageType: 'MEESHO_DASHBOARD',
        pageState: 'FORM_NOT_FOUND',
        details: 'On Meesho Supplier Dashboard. Navigate to Catalog Upload to start listing products.',
      };
    }

    return {
      isSupported: true,
      isListingForm: false,
      isLoggedIn: true,
      pageType: 'MEESHO_OTHER_PAGE',
      pageState: 'FORM_NOT_FOUND',
      details: 'On Meesho Supplier Portal, but no active upload form detected. Navigate to Add Catalog / Add Product.',
    };
  }

  /**
   * List keys of all supported fields
   */
  public getAvailableFields(): string[] {
    return Object.keys(MEESHO_FIELD_SELECTORS);
  }

  /**
   * Check if a field key is supported
   */
  public supportsField(fieldKey: string): boolean {
    return Boolean(MEESHO_FIELD_SELECTORS[fieldKey]?.supported);
  }

  /**
   * Locate target field element on Meesho page using prioritized Primary then Fallback strategies
   */
  public findField(fieldKey: string): HTMLElement | null {
    const config: FieldSelectorConfig | undefined = MEESHO_FIELD_SELECTORS[fieldKey];
    if (!config) return null;

    // Strategy 1: Primary CSS Selectors (semantic/stable)
    for (const selector of config.primarySelectors) {
      try {
        const el = document.querySelector<HTMLElement>(selector);
        if (el && this.isVisible(el)) {
          return el;
        }
      } catch {
        // Continue if selector error
      }
    }

    // Strategy 2: Fallback CSS Selectors
    for (const selector of config.fallbackSelectors) {
      try {
        const el = document.querySelector<HTMLElement>(selector);
        if (el && this.isVisible(el)) {
          return el;
        }
      } catch {
        // Continue if selector error
      }
    }

    // Strategy 3: Label Text Matching
    if (config.labelRegex) {
      const labels = Array.from(document.querySelectorAll<HTMLLabelElement>('label'));
      for (const label of labels) {
        if (config.labelRegex.test(label.textContent || '')) {
          if (label.htmlFor) {
            const el = document.getElementById(label.htmlFor);
            if (el && this.isVisible(el)) return el as HTMLElement;
          }

          const nestedInput = label.querySelector<HTMLElement>('input, textarea, select');
          if (nestedInput && this.isVisible(nestedInput)) return nestedInput;

          const nextInput = label.nextElementSibling?.querySelector<HTMLElement>(
            'input, textarea, select'
          ) || (label.nextElementSibling as HTMLElement);
          if (nextInput && this.isVisible(nextInput)) return nextInput;
        }
      }
    }

    // Strategy 4: Attribute / Placeholder Inspection across all input elements
    const allInputs = Array.from(
      document.querySelectorAll<HTMLElement>('input, textarea, select, [contenteditable="true"]')
    );
    for (const input of allInputs) {
      const placeholder = input.getAttribute('placeholder') || '';
      const ariaLabel = input.getAttribute('aria-label') || '';
      const name = input.getAttribute('name') || '';
      const id = input.id || '';

      if (
        (config.placeholderRegex && config.placeholderRegex.test(placeholder)) ||
        (config.labelRegex && (config.labelRegex.test(ariaLabel) || config.labelRegex.test(name) || config.labelRegex.test(id)))
      ) {
        if (this.isVisible(input)) return input;
      }
    }

    return null;
  }

  /**
   * Get current value of target field
   */
  public getCurrentValue(fieldKey: string): string | null {
    const element = this.findField(fieldKey);
    if (!element) return null;

    if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement || element instanceof HTMLSelectElement) {
      return element.value ? element.value.trim() : '';
    }

    if (element.isContentEditable) {
      return element.textContent ? element.textContent.trim() : '';
    }

    return element.innerText ? element.innerText.trim() : '';
  }

  /**
   * Fill field on Meesho DOM with price safety checks & native React state synchronization
   */
  public async fillField(
    fieldKey: string,
    value: any,
    options: OverwriteOptions = { overwritePolicy: 'EMPTY_ONLY' }
  ): Promise<FieldFillResult> {
    const config = MEESHO_FIELD_SELECTORS[fieldKey];
    if (!config) {
      return {
        fieldKey,
        fieldLabel: fieldKey,
        status: 'NOT_SUPPORTED',
        reason: `Field '${fieldKey}' is not supported by Meesho adapter.`,
      };
    }

    // Handle manual confirmation fields (e.g., file inputs)
    if (config.manualConfirmation || config.type === 'file') {
      return {
        fieldKey,
        fieldLabel: config.label,
        status: 'MANUAL_CONFIRMATION_REQUIRED',
        appliedValue: value,
        reason: 'Native file uploads require manual file selection in seller browser.',
      };
    }

    const element = this.findField(fieldKey);
    if (!element) {
      return {
        fieldKey,
        fieldLabel: config.label,
        status: 'NOT_FOUND',
        reason: `Could not locate DOM element for field '${config.label}' on Meesho page.`,
      };
    }

    const currentValue = this.getCurrentValue(fieldKey);
    const hasValue = Boolean(currentValue && currentValue.length > 0);

    // Existing value protection check
    if (options.overwritePolicy === 'EMPTY_ONLY' && hasValue) {
      return {
        fieldKey,
        fieldLabel: config.label,
        status: 'SKIPPED',
        existingValue: currentValue,
        reason: `Field already contains '${currentValue}' and policy is set to EMPTY_ONLY.`,
      };
    }

    let stringValue = String(value ?? '').trim();
    if (!stringValue) {
      return {
        fieldKey,
        fieldLabel: config.label,
        status: 'SKIPPED',
        reason: 'Value provided for autofill is empty.',
      };
    }

    // Price/MRP Safety Validation
    if (fieldKey === 'sellingPrice' || fieldKey === 'mrp' || fieldKey === 'weightGrams') {
      const numVal = parseFloat(stringValue.replace(/[^0-9.]/g, ''));
      if (isNaN(numVal) || numVal <= 0) {
        return {
          fieldKey,
          fieldLabel: config.label,
          status: 'FAILED',
          reason: `Invalid numeric value '${stringValue}' for field '${config.label}'.`,
        };
      }
      stringValue = String(numVal);
    }

    try {
      // Re-resolve fresh DOM element to prevent React virtual DOM stale reference bugs
      const freshElement = this.findField(fieldKey) || element;
      freshElement.focus();

      if (freshElement instanceof HTMLSelectElement) {
        // Handle native select
        let optionToSelect: HTMLOptionElement | null = null;
        const normalizedTarget = stringValue.toLowerCase().replace(/[^a-z0-9]/g, '');
        for (let i = 0; i < freshElement.options.length; i++) {
          const opt = freshElement.options[i];
          const optNorm = opt.text.toLowerCase().replace(/[^a-z0-9]/g, '');
          const valNorm = opt.value.toLowerCase().replace(/[^a-z0-9]/g, '');
          if (
            valNorm === normalizedTarget ||
            optNorm === normalizedTarget ||
            optNorm.includes(normalizedTarget) ||
            normalizedTarget.includes(optNorm)
          ) {
            optionToSelect = opt;
            break;
          }
        }

        if (optionToSelect) {
          const nativeSelectSetter = Object.getOwnPropertyDescriptor(
            window.HTMLSelectElement.prototype,
            'value'
          )?.set;
          if (nativeSelectSetter) {
            nativeSelectSetter.call(freshElement, optionToSelect.value);
          } else {
            freshElement.value = optionToSelect.value;
          }
          freshElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
          freshElement.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
        } else {
          return {
            fieldKey,
            fieldLabel: config.label,
            status: 'FAILED',
            reason: `Option '${stringValue}' not found in dropdown list options.`,
          };
        }
      } else if (freshElement instanceof HTMLInputElement || freshElement instanceof HTMLTextAreaElement) {
        // Native React input value setter hack to update React virtual DOM state
        const prototype =
          freshElement instanceof HTMLInputElement
            ? window.HTMLInputElement.prototype
            : window.HTMLTextAreaElement.prototype;

        const nativeSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

        if (nativeSetter) {
          nativeSetter.call(freshElement, stringValue);
        } else {
          freshElement.value = stringValue;
        }

        // Reset React's internal _valueTracker to force React to recognize state change
        const tracker = (freshElement as any)._valueTracker;
        if (tracker) {
          tracker.setValue('');
        }

        // Dispatch synthetic events
        freshElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        freshElement.dispatchEvent(new Event('change', { bubbles: true, cancelable: true }));
        freshElement.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));

        // Handle custom dropdown comboboxes where typing prompts a dropdown menu
        if (config.type === 'custom_dropdown') {
          await new Promise((r) => setTimeout(r, 100));
          const optionEl = document.querySelector<HTMLElement>(
            `[role="option"], .dropdown-item, li[data-value*="${stringValue}" i]`
          );
          if (optionEl && this.isVisible(optionEl)) {
            optionEl.click();
          }
        }
      } else if (freshElement.isContentEditable) {
        freshElement.textContent = stringValue;
        freshElement.dispatchEvent(new Event('input', { bubbles: true, cancelable: true }));
        freshElement.dispatchEvent(new Event('blur', { bubbles: true, cancelable: true }));
      } else if (config.type === 'custom_dropdown') {
        // Container dropdown trigger that requires interactive selection
        freshElement.click();
        return {
          fieldKey,
          fieldLabel: config.label,
          status: 'MANUAL_CONFIRMATION_REQUIRED',
          appliedValue: stringValue,
          reason: `Dropdown opened. Please click to confirm '${stringValue}' from the Meesho options menu.`,
        };
      }

      // Delay for React virtual DOM reconciliation
      await new Promise((r) => setTimeout(r, 150));

      // Re-read and strictly verify field
      const isVerified = await this.verifyField(fieldKey, stringValue);
      if (isVerified) {
        return {
          fieldKey,
          fieldLabel: config.label,
          status: 'SUCCESS',
          appliedValue: stringValue,
        };
      } else {
        const finalVal = this.getCurrentValue(fieldKey);
        return {
          fieldKey,
          fieldLabel: config.label,
          status: 'FAILED',
          appliedValue: stringValue,
          existingValue: finalVal,
          reason: `Verification failed: DOM value was '${finalVal || 'empty'}' after input dispatch (expected '${stringValue}').`,
        };
      }
    } catch (err: any) {
      return {
        fieldKey,
        fieldLabel: config.label,
        status: 'FAILED',
        reason: err.message || 'Error occurred while manipulating DOM element.',
      };
    }
  }

  /**
   * Verify field value in DOM with strict numeric, GST, and normalized string checks
   */
  public async verifyField(fieldKey: string, expectedValue: any): Promise<boolean> {
    const currentValue = this.getCurrentValue(fieldKey);
    if (currentValue === null || currentValue === undefined || currentValue === '') {
      return false;
    }

    // 1. Numeric fields (sellingPrice, mrp, weightGrams)
    if (fieldKey === 'sellingPrice' || fieldKey === 'mrp' || fieldKey === 'weightGrams') {
      const expectedNum = parseFloat(String(expectedValue).replace(/[^0-9.]/g, ''));
      const actualNum = parseFloat(currentValue.replace(/[^0-9.]/g, ''));
      if (isNaN(expectedNum) || isNaN(actualNum)) return false;
      return Math.abs(expectedNum - actualNum) < 0.01;
    }

    // 2. GST Rate comparison by numeric digits
    if (fieldKey === 'gstRate') {
      const expectedDigits = String(expectedValue).replace(/[^0-9]/g, '');
      const actualDigits = currentValue.replace(/[^0-9]/g, '');
      if (!expectedDigits || !actualDigits) return false;
      return expectedDigits === actualDigits;
    }

    // 3. String & Text fields: normalize whitespace & lowercasing
    const expectedStr = String(expectedValue ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
    const actualStr = currentValue.toLowerCase().replace(/\s+/g, ' ');

    if (actualStr === expectedStr) return true;

    // For long descriptions (where input might truncate at maximum field length)
    if (fieldKey === 'description' && actualStr.length >= 20) {
      return expectedStr.startsWith(actualStr) || actualStr.startsWith(expectedStr);
    }

    // Strict containment: must cover at least 70% of character length to avoid false substrings (e.g. "5" matching "1500")
    if (actualStr.includes(expectedStr) || expectedStr.includes(actualStr)) {
      const minLen = Math.min(actualStr.length, expectedStr.length);
      const maxLen = Math.max(actualStr.length, expectedStr.length);
      if (maxLen > 0 && minLen / maxLen >= 0.7) {
        return true;
      }
    }

    return false;
  }

  private isVisible(element: HTMLElement): boolean {
    return Boolean(
      element &&
        (element.offsetWidth > 0 ||
          element.offsetHeight > 0 ||
          element.getClientRects().length > 0)
    );
  }
}
