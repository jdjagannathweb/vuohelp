/**
 * VUO CSC HELP - Free SMS & Notification Gateway Service
 * Provides SMS dispatch for OTP verification, Udhar Khata (Credit) customer reminders,
 * and service notices via direct device SMS protocol (100% free) & configurable SMS APIs.
 */

const VUO_SMS = {
  configKey: 'vuo_sms_config',

  getConfig() {
    try {
      const saved = localStorage.getItem(this.configKey);
      if (saved) return JSON.parse(saved);
    } catch(e) {}
    return {
      provider: 'device_direct', // 'device_direct', 'fast2sms', 'custom_api'
      apiUrl: '',
      apiKey: '',
      senderId: 'CSCHLP'
    };
  },

  saveConfig(cfg) {
    try {
      localStorage.setItem(this.configKey, JSON.stringify(cfg));
      if (typeof showToast === 'function') showToast("SMS Gateway settings saved successfully!", "success");
      return true;
    } catch(e) {
      return false;
    }
  },

  cleanMobile(mobile) {
    if (!mobile) return '';
    const digits = mobile.toString().replace(/\D/g, '');
    return digits.slice(-10);
  },

  /**
   * Main sendSms function
   * Dispatches SMS to 10-digit Indian mobile numbers
   */
  async sendSms(mobile, text, options = {}) {
    const clean10 = this.cleanMobile(mobile);
    if (!clean10 || clean10.length !== 10) {
      if (typeof showToast === 'function') {
        showToast("Invalid mobile number for SMS. 10 digits required.", "warning");
      }
      return { success: false, message: "Invalid 10-digit mobile number." };
    }

    const config = this.getConfig();

    // 1. If Custom or Fast2SMS API is configured with key
    if (config.provider === 'fast2sms' && config.apiKey) {
      try {
        const resp = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            'authorization': config.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            route: 'q',
            message: text,
            language: 'unicode',
            flash: 0,
            numbers: clean10
          })
        });
        const resJson = await resp.json();
        if (resJson.return) {
          if (typeof showToast === 'function') showToast(`SMS sent to +91 ${clean10} via Gateway!`, "success");
          return { success: true, method: 'fast2sms', data: resJson };
        }
      } catch (err) {
        console.warn("Fast2SMS API error, falling back to direct SMS:", err);
      }
    } else if (config.provider === 'custom_api' && config.apiUrl) {
      try {
        let endpoint = config.apiUrl
          .replace('{mobile}', clean10)
          .replace('{msg}', encodeURIComponent(text))
          .replace('{message}', encodeURIComponent(text))
          .replace('{apiKey}', config.apiKey || '');
        await fetch(endpoint, { method: 'GET', mode: 'no-cors' });
        if (typeof showToast === 'function') showToast(`SMS dispatched via custom API to +91 ${clean10}!`, "success");
        return { success: true, method: 'custom_api' };
      } catch (err) {
        console.warn("Custom SMS API error, falling back to direct SMS:", err);
      }
    }

    // 2. Default & 100% Free: Native Device SMS Gateway Protocol (sms:+91... or sms:...;body=...)
    this.openDeviceSms(clean10, text);

    if (typeof showToast === 'function') {
      showToast(`SMS app opened for +91 ${clean10} (Free SMS)`, "success");
    }

    return { success: true, method: 'device_direct' };
  },

  /**
   * Opens the device native SMS application with number and message prefilled.
   * Works on Android, iPhone, Windows 10/11 Phone Link, and Mac.
   */
  openDeviceSms(clean10, text) {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    // iOS uses '&body=' while Android and standard standards use '?body='
    const separator = isIOS ? '&' : '?';
    const smsUrl = `sms:+91${clean10}${separator}body=${encodeURIComponent(text)}`;
    
    // Create invisible anchor and click to prevent popup blockers
    const a = document.createElement('a');
    a.href = smsUrl;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 1000);
  },

  /**
   * Send OTP via SMS
   */
  async sendOtp(mobile, otp, name = 'VLE Member') {
    const text = `VLE HELP DESK: Hello ${name}, your verification OTP is ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
    return await this.sendSms(mobile, text);
  },

  /**
   * Send 100% Odia Credit / Udhar Khata Reminder
   */
  async sendCreditReminder(mobile, customerName, dueAmount, serviceName, vleName, shopName, vlePhone) {
    const text = `ନମସ୍କାର ${customerName} ଆଜ୍ଞା, ${shopName} ରେ ଆପଣଙ୍କର ${serviceName} ବାବଦକୁ ₹${dueAmount}/- ଟଙ୍କା ବାକି ଅଛି। ଦୟାକରି ଶୀଘ୍ର ପରିଶୋଧ କରନ୍ତୁ। ଧନ୍ୟବାଦ - ${vleName} (ମୋ: ${vlePhone})`;
    return await this.sendSms(mobile, text);
  },

  /**
   * Open SMS Gateway & Test Modal
   */
  openSmsModal() {
    const modal = document.getElementById('vleSmsGatewayModal');
    if (!modal) return;
    const cfg = this.getConfig();
    const provSelect = document.getElementById('smsProviderSelect');
    const apiKeyInput = document.getElementById('smsApiKeyInput');
    const apiUrlInput = document.getElementById('smsApiUrlInput');
    if (provSelect) provSelect.value = cfg.provider || 'device_direct';
    if (apiKeyInput) apiKeyInput.value = cfg.apiKey || '';
    if (apiUrlInput) apiUrlInput.value = cfg.apiUrl || '';
    this.updateProviderView();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeSmsModal() {
    const modal = document.getElementById('vleSmsGatewayModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
  },

  updateProviderView() {
    const provSelect = document.getElementById('smsProviderSelect');
    const val = provSelect ? provSelect.value : 'device_direct';
    const apiBox = document.getElementById('smsApiConfigBox');
    if (apiBox) {
      if (val === 'device_direct') {
        apiBox.classList.add('hidden');
      } else {
        apiBox.classList.remove('hidden');
      }
    }
  },

  saveSettingsFromModal() {
    const prov = document.getElementById('smsProviderSelect')?.value || 'device_direct';
    const apiKey = document.getElementById('smsApiKeyInput')?.value?.trim() || '';
    const apiUrl = document.getElementById('smsApiUrlInput')?.value?.trim() || '';
    this.saveConfig({ provider: prov, apiKey, apiUrl, senderId: 'CSCHLP' });
    if (typeof showToast === 'function') {
      showToast("SMS Gateway settings updated successfully!", "success");
    }
    this.closeSmsModal();
  },

  async testSmsFromModal() {
    const phoneInput = document.getElementById('smsTestMobile');
    const typeSelect = document.getElementById('smsTestType');
    const rawPhone = phoneInput ? phoneInput.value.trim() : '';
    const clean = this.cleanMobile(rawPhone);
    if (!clean || clean.length !== 10) {
      if (typeof showToast === 'function') showToast("Please enter a valid 10-digit mobile number to test.", "warning");
      if (phoneInput) phoneInput.focus();
      return;
    }

    const testType = typeSelect ? typeSelect.value : 'credit';
    let text = '';
    if (testType === 'credit') {
      text = `ନମସ୍କାର ରାମେଶ ଆଜ୍ଞା, ଆପଣଙ୍କର Digital Seva Kendra ରେ Aadhaar Card Print ବାବଦକୁ ₹150/- ବାକି ଅଛି। ଦୟାକରି ଶୀଘ୍ର ପରିଶୋଧ କରନ୍ତୁ। ଧନ୍ୟବାଦ (Free Odia SMS Gateway Test)`;
    } else {
      text = `VLE HELP DESK: Hello Member, your test verification OTP is ${Math.floor(1000 + Math.random() * 9000)}. Free SMS Gateway test successful!`;
    }

    await this.sendSms(clean, text);
    if (typeof showToast === 'function') {
      showToast(`Test SMS initiated for +91 ${clean}!`, "success");
    }
  }
};

window.VUO_SMS = VUO_SMS;

