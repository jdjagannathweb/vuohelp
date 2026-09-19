/**
 * VUO CSC HELP - VLE Verification & Action Gate Engine
 * Handles user verification (Name, Mobile, District) for downloads, video watching,
 * and tracks repeat visits across all devices and Firebase cloud.
 */

const VUO_GATE = {
  _pendingAction: null,
  _pendingCallback: null,
  _initialized: false,

  init() {
    if (this._initialized) return;
    this._initialized = true;

    // Check repeat visit
    this.checkRepeatVisit();
    this.updateUserGreetingBadge();
  },

  getProfile() {
    try {
      const stored = localStorage.getItem('vuo_vle_profile');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name && parsed.mobile) return parsed;
      }
    } catch (e) {}
    return null;
  },

  saveProfile(profile) {
    try {
      profile.registeredAt = profile.registeredAt || Date.now();
      profile.lastVisitAt = Date.now();
      localStorage.setItem('vuo_vle_profile', JSON.stringify(profile));

      // Also register in VUO Members list if not present
      if (typeof VUO_DATA !== 'undefined' && VUO_DATA.registerMember) {
        VUO_DATA.registerMember({
          memberNo: 'VLE-' + profile.mobile.slice(-4),
          name: profile.name,
          mobile: profile.mobile,
          district: profile.district,
          cscId: profile.cscId || ('OD-' + profile.mobile.slice(-6)),
          kendraName: profile.kendraName || (profile.name + ' Digital Seva')
        });
      }

      // Sync to Firebase Cloud if available
      if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && VUO_DB.db) {
        VUO_DB.db.collection('vuo_vle_users').doc(profile.mobile).set(profile, { merge: true }).catch(err => console.warn(err));
      }
    } catch (e) {
      console.warn('saveProfile error:', e);
    }
  },

  // Check if registered VLE revisited in this session
  checkRepeatVisit() {
    const profile = this.getProfile();
    if (!profile) return;

    // Only log once per browser session
    const sessionKey = 'vuo_session_visit_logged';
    if (!sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      console.log('🌟 Registered VLE Re-visited Portal:', profile.name, profile.district);
      
      this.logActivity(profile, {
        type: 'visit',
        action: '🌐 Re-visited Portal / Website Opened',
        item: 'CSC Portal Homepage',
        category: 'visit'
      });
    }
  },

  updateUserGreetingBadge() {
    const profile = this.getProfile();
    const greetContainer = document.getElementById('vleUserGreetingPill');
    if (!greetContainer) return;

    if (profile && profile.name) {
      greetContainer.innerHTML = `
        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-xs">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Namaskar, <strong>${profile.name.split(' ')[0]}</strong> (${profile.district})</span>
          <button type="button" onclick="VUO_GATE.openProfileModal()" class="text-emerald-800 hover:text-emerald-950 ml-1 text-[10px] underline cursor-pointer" title="Edit my details">Edit</button>
        </div>
      `;
      greetContainer.classList.remove('hidden');
    } else {
      greetContainer.classList.add('hidden');
    }
  },

  /**
   * Universal Guard: Checks if VLE has registered.
   * If yes: logs activity and runs onGranted().
   * If no: opens verification modal and runs onGranted() after submit.
   */
  requireAccess(actionInfo, onGranted) {
    const profile = this.getProfile();

    if (profile && profile.name && profile.mobile) {
      // User is verified! Log action and proceed immediately
      this.logActivity(profile, actionInfo);
      if (typeof onGranted === 'function') {
        onGranted();
      }
      return;
    }

    // User is not yet verified: Prompt verification modal
    this._pendingAction = actionInfo || { type: 'download', item: 'CSC File' };
    this._pendingCallback = onGranted;

    this.openVerificationModal(this._pendingAction);
  },

  openVerificationModal(actionInfo) {
    const modal = document.getElementById('vleVerificationModal');
    if (!modal) {
      // Fallback: If modal markup is missing, allow user to proceed
      if (typeof this._pendingCallback === 'function') this._pendingCallback();
      return;
    }

    const titleEl = document.getElementById('vleGateActionTitle');
    if (titleEl && actionInfo && actionInfo.item) {
      titleEl.textContent = actionInfo.item;
    }

    const descEl = document.getElementById('vleGateActionTypeLabel');
    if (descEl && actionInfo) {
      if (actionInfo.type === 'video') {
        descEl.textContent = 'Watch Free Training Tutorial';
      } else {
        descEl.textContent = 'Instant High-Resolution Download';
      }
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  closeVerificationModal() {
    const modal = document.getElementById('vleVerificationModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }
    this._pendingAction = null;
    this._pendingCallback = null;
  },

  submitVerification(e) {
    if (e && e.preventDefault) e.preventDefault();

    const nameInput = document.getElementById('vleGateName');
    const mobileInput = document.getElementById('vleGateMobile');
    const districtInput = document.getElementById('vleGateDistrict');

    const name = nameInput ? nameInput.value.trim() : '';
    let mobile = mobileInput ? mobileInput.value.trim().replace(/\D/g, '') : '';
    const district = districtInput ? districtInput.value.trim() : '';

    // If starts with 91 and 12 digits, strip country code
    if (mobile.length === 12 && mobile.startsWith('91')) {
      mobile = mobile.substring(2);
    }

    if (!name || name.length < 2) {
      if (typeof showToast === 'function') showToast('Kripya apna poora Naam darj karein.', 'warning');
      if (nameInput) nameInput.focus();
      return;
    }

    if (!mobile || mobile.length !== 10 || !/^[6-9]/.test(mobile)) {
      if (typeof showToast === 'function') showToast('Kripya valid 10-digit WhatsApp/Calling mobile number darj karein.', 'warning');
      if (mobileInput) mobileInput.focus();
      return;
    }

    if (!district) {
      if (typeof showToast === 'function') showToast('Kripya apna Odisha District select karein.', 'warning');
      if (districtInput) districtInput.focus();
      return;
    }

    const profile = {
      name,
      mobile,
      district,
      registeredAt: Date.now()
    };

    // Save profile locally & cloud
    this.saveProfile(profile);
    this.updateUserGreetingBadge();

    // Log the current action
    const currentAction = this._pendingAction || { type: 'download', item: 'Verified Access' };
    this.logActivity(profile, {
      ...currentAction,
      action: 'Initial Verification & ' + (currentAction.item || currentAction.action || 'Download')
    });

    // Close modal
    const modal = document.getElementById('vleVerificationModal');
    if (modal) {
      modal.classList.add('hidden');
      modal.style.display = 'none';
    }

    if (typeof showToast === 'function') {
      showToast(`Swagat hai ${name}! Download shuru ho raha hai...`, 'success');
    }

    // Execute the pending action
    const cb = this._pendingCallback;
    this._pendingAction = null;
    this._pendingCallback = null;

    if (typeof cb === 'function') {
      setTimeout(() => cb(), 150);
    }
  },

  openProfileModal() {
    const profile = this.getProfile();
    const modal = document.getElementById('vleVerificationModal');
    if (!modal) return;

    if (profile) {
      if (document.getElementById('vleGateName')) document.getElementById('vleGateName').value = profile.name || '';
      if (document.getElementById('vleGateMobile')) document.getElementById('vleGateMobile').value = profile.mobile || '';
      if (document.getElementById('vleGateDistrict')) document.getElementById('vleGateDistrict').value = profile.district || '';
    }

    const titleEl = document.getElementById('vleGateActionTitle');
    if (titleEl) titleEl.textContent = 'Update My VLE Profile';

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  /**
   * Log Activity: Sends event to Cloud Firestore, Local Server, and Local Storage.
   */
  async logActivity(profile, actionInfo) {
    if (!profile) return;

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    const actObj = {
      id: 'ACT-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900),
      name: profile.name,
      mobile: profile.mobile,
      district: profile.district || 'Odisha',
      type: actionInfo.type || 'download',
      action: actionInfo.action || actionInfo.item || 'Download',
      item: actionInfo.item || actionInfo.action || 'CSC Tool',
      category: actionInfo.category || 'general',
      timestamp: Date.now(),
      dateStr: dateFormatted,
      device: isMobileDevice ? 'Mobile' : 'Computer'
    };

    // 1. Local Storage Cache (latest 200 entries)
    try {
      let localLogs = JSON.parse(localStorage.getItem('vuo_vle_activities') || '[]');
      localLogs.unshift(actObj);
      if (localLogs.length > 200) localLogs = localLogs.slice(0, 200);
      localStorage.setItem('vuo_vle_activities', JSON.stringify(localLogs));

      if (typeof VUO_ADMIN !== 'undefined' && typeof VUO_ADMIN.renderVleActivityTable === 'function') {
        VUO_ADMIN.renderVleActivityTable();
      }
    } catch (e) {}

    // 2. Firebase Cloud Firestore
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized && typeof VUO_DB.cloudSaveVleActivity === 'function') {
      try {
        VUO_DB.cloudSaveVleActivity(actObj);
      } catch (e) {
        console.warn('Firebase activity log notice:', e);
      }
    }

    // 3. Local HTTP Server Persistence
    if (typeof window !== 'undefined' && window.location && window.location.protocol.startsWith('http')) {
      try {
        fetch('api/log-vle-activity', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(actObj)
        }).catch(() => {});
      } catch (_) {}
    }
  }
};

window.VUO_GATE = VUO_GATE;

document.addEventListener('DOMContentLoaded', () => {
  VUO_GATE.init();
});
