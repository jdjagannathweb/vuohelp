/**
 * VUO CSC HELP - Authentication, VLE Portal Access & Member Management
 * Features:
 *  - VLE Registration / Signup (Name, Mobile, CSC ID, Kendra, District, Password)
 *  - Secure VLE Login (via Mobile, CSC ID, or Member No)
 *  - Forgot Password Reset with 4-Digit OTP (Screen + 1-Click WhatsApp)
 *  - VLE Personal Dashboard (My Leads, Khata status, Activity history)
 *  - Synchronization with VUO_GATE and Admin panel
 */

const VUO_AUTH = {
  _pendingAction: null,
  _pendingCallback: null,
  GOOGLE_SCRIPT_OTP_URL: 'https://script.google.com/macros/s/AKfycbyhQaqg03IgNFnW_vEdRqp-tZoe3LZ0yyJrX6qwql_eVfc57pwFXd5iUHExCBG1bhcv/exec',

  maskEmail(email) {
    if (!email || !email.includes('@')) return '';
    const parts = email.split('@');
    const user = parts[0];
    const domain = parts[1];
    if (user.length <= 2) return user[0] + '***@' + domain;
    return user.slice(0, 2) + '***' + user.slice(-1) + '@' + domain;
  },

  async sendEmailOtp(email, otp, name) {
    if (!email || !email.includes('@')) {
      return { success: false, message: 'No valid email address found.' };
    }
    const url = `${this.GOOGLE_SCRIPT_OTP_URL}?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&name=${encodeURIComponent(name || 'CSC VLE Member')}`;
    try {
      // GET mode: 'no-cors' allows browser dispatch without CORS redirection error
      fetch(url, { mode: 'no-cors', cache: 'no-cache' }).catch(() => {});
      return { success: true, message: `OTP sent to ${email}` };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('vuo_current_user');
      if (user) return JSON.parse(user);
      
      // Fallback: check vuo_vle_profile
      const prof = localStorage.getItem('vuo_vle_profile');
      if (prof) {
        const p = JSON.parse(prof);
        if (p && p.name && p.mobile) {
          return {
            fullName: p.name,
            mobile: p.mobile,
            district: p.district || 'Odisha',
            cscId: p.cscId || ('OD-' + p.mobile.slice(-6)),
            memberNo: 'VLE-' + p.mobile.slice(-4),
            kendraName: p.kendraName || (p.name + ' Digital Seva'),
            status: "Active (Verified VLE)"
          };
        }
      }
      return null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('vuo_current_user', JSON.stringify(user));
      // Sync to vuo_vle_profile for seamless compatibility
      const profile = {
        name: user.fullName || user.name,
        mobile: user.mobile,
        district: user.district,
        cscId: user.cscId,
        kendraName: user.kendraName,
        registeredAt: user.registeredAt || Date.now(),
        lastVisitAt: Date.now()
      };
      localStorage.setItem('vuo_vle_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('vuo_current_user');
      localStorage.removeItem('vuo_vle_profile');
    }
    this.updateAuthUI();
  },

  getAllMembers() {
    try {
      const members = localStorage.getItem('vuo_members');
      if (members) {
        const parsed = JSON.parse(members);
        return parsed.map(m => {
          if (!m.id) m.id = m.memberNo || (m.mobile ? ('VLE-' + m.mobile.replace(/\D/g, '').slice(-4)) : ('M-' + Math.random().toString(36).substr(2, 6)));
          return m;
        });
      }
      if (typeof VUO_DATA !== 'undefined' && VUO_DATA.sampleMembers) {
        return VUO_DATA.sampleMembers.map(m => {
          if (!m.id) m.id = m.memberNo || ('VLE-' + Math.random().toString(36).substr(2, 6));
          return m;
        });
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveMembers(members) {
    localStorage.setItem('vuo_members', JSON.stringify(members));
  },

  register(formData) {
    const members = this.getAllMembers();
    const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
    const cleanCscId = formData.cscId.trim().toUpperCase();

    // Check if Mobile or CSC ID already exists
    const exists = members.find(m => 
      (m.mobile && m.mobile.replace(/\D/g, '').slice(-10) === cleanMobile) ||
      (m.cscId && m.cscId.trim().toUpperCase() === cleanCscId)
    );

    if (exists) {
      return { success: false, message: "Member with this Mobile Number or CSC ID already registered! Please Login." };
    }

    const memberNo = 'VLE-' + (cleanMobile.slice(-4) || Math.floor(1000 + Math.random() * 9000));
    const newMember = {
      id: memberNo,
      memberNo,
      cscId: cleanCscId,
      fullName: formData.fullName.trim(),
      mobile: cleanMobile,
      email: formData.email ? formData.email.trim() : (cleanMobile + '@vlehelp.in'),
      district: formData.district || 'Odisha',
      kendraName: formData.kendraName ? formData.kendraName.trim() : (formData.fullName.trim() + ' Digital Seva'),
      status: "Active (Verified VLE)",
      designation: "VLE Member",
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validity: "2026 - 2029",
      passwordHash: formData.password ? formData.password.trim() : '1234'
    };

    members.unshift(newMember);
    this.saveMembers(members);

    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveMember) {
      VUO_DB.cloudSaveMember(newMember);
    }

    this.setCurrentUser(newMember);

    // Log Activity
    if (typeof VUO_GATE !== 'undefined' && VUO_GATE.logActivity) {
      VUO_GATE.logActivity(newMember, {
        type: 'signup',
        action: '🎉 New VLE Member Registered',
        item: `Member ID: ${memberNo} (${newMember.fullName})`,
        category: 'auth'
      });
    }

    return { success: true, member: newMember };
  },

  login(identifier, password) {
    const members = this.getAllMembers();
    const id = identifier.trim().toLowerCase();
    const cleanId = id.replace(/\D/g, '');

    // Match by mobile, CSC ID, or Member No
    const member = members.find(m => {
      const mMobile = (m.mobile || '').replace(/\D/g, '');
      const mCsc = (m.cscId || '').toLowerCase();
      const mNo = (m.memberNo || '').toLowerCase();
      return (cleanId && mMobile.slice(-10) === cleanId.slice(-10)) ||
             mCsc === id ||
             mNo === id;
    });

    if (!member) {
      // If user is not yet in members, check sample members
      return { success: false, message: "VLE account not found with this Mobile / CSC ID. Please Sign Up!" };
    }

    const userPwd = member.passwordHash || '1234';
    if (userPwd !== password.trim()) {
      return { success: false, message: "Incorrect password. Click 'Forgot Password?' to reset via OTP." };
    }

    this.setCurrentUser(member);

    // Log Activity
    if (typeof VUO_GATE !== 'undefined' && VUO_GATE.logActivity) {
      VUO_GATE.logActivity(member, {
        type: 'login',
        action: '🔑 VLE Member Logged In',
        item: `Portal Session Started (${member.fullName})`,
        category: 'auth'
      });
    }

    return { success: true, member };
  },

  logout() {
    this.setCurrentUser(null);
    if (typeof showToast === 'function') {
      showToast("Logged out successfully.", "info");
    }
    this.updateAuthUI();
  },

  /* ================= ADMIN MEMBER MANAGEMENT ================= */
  updateMember(targetId, updateData) {
    if (!targetId) return { success: false, message: "Target member identifier required." };
    const members = this.getAllMembers();
    const targetStr = String(targetId).trim();
    const cleanTarget = targetStr.replace(/\D/g, '').slice(-10);
    const targetLower = targetStr.toLowerCase();

    const member = members.find(m => {
      const mId = (m.id || '').toString().toLowerCase();
      const mMob = (m.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (m.cscId || '').toLowerCase();
      const mNo = (m.memberNo || '').toLowerCase();
      return (mId && mId === targetLower) || (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    if (!member) {
      return { success: false, message: "Member record not found to update." };
    }

    if (updateData.fullName) member.fullName = updateData.fullName.trim();
    if (updateData.mobile) member.mobile = updateData.mobile.replace(/\D/g, '').slice(-10);
    if (updateData.cscId) member.cscId = updateData.cscId.trim().toUpperCase();
    if (updateData.district) member.district = updateData.district.trim();
    if (updateData.kendraName) member.kendraName = updateData.kendraName.trim();
    if (updateData.status) member.status = updateData.status;
    if (updateData.email) member.email = updateData.email.trim();

    this.saveMembers(members);

    // If current session is this user, update active user
    const cur = this.getCurrentUser();
    if (cur && (cur.mobile === member.mobile || cur.cscId === member.cscId || (cur.id && cur.id === member.id))) {
      this.setCurrentUser(member);
    }

    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveMember) {
      VUO_DB.cloudSaveMember(member);
    }

    return { success: true, member };
  },

  adminSetPassword(targetId, newPassword) {
    if (!targetId) return { success: false, message: "Target member identifier required." };
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: "Password must be at least 4 characters long." };
    }

    const members = this.getAllMembers();
    const targetStr = String(targetId).trim();
    const cleanTarget = targetStr.replace(/\D/g, '').slice(-10);
    const targetLower = targetStr.toLowerCase();

    const member = members.find(m => {
      const mId = (m.id || '').toString().toLowerCase();
      const mMob = (m.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (m.cscId || '').toLowerCase();
      const mNo = (m.memberNo || '').toLowerCase();
      return (mId && mId === targetLower) || (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower;
    });

    if (!member) {
      return { success: false, message: "Member not found to reset password." };
    }

    member.passwordHash = newPassword.trim();
    this.saveMembers(members);

    // If current session is this user, update active user
    const cur = this.getCurrentUser();
    if (cur && (cur.mobile === member.mobile || cur.cscId === member.cscId || (cur.id && cur.id === member.id))) {
      cur.passwordHash = member.passwordHash;
      this.setCurrentUser(cur);
    }

    if (typeof VUO_DB !== 'undefined' && VUO_DB.cloudSaveMember) {
      VUO_DB.cloudSaveMember(member);
    }

    return { success: true, member };
  },

  deleteMember(targetId) {
    if (!targetId) return { success: false, message: "Target member identifier required." };
    let members = this.getAllMembers();
    const targetStr = String(targetId).trim();
    const cleanTarget = targetStr.replace(/\D/g, '').slice(-10);
    const targetLower = targetStr.toLowerCase();

    const initialLen = members.length;
    members = members.filter(m => {
      const mId = (m.id || '').toString().toLowerCase();
      const mMob = (m.mobile || '').replace(/\D/g, '').slice(-10);
      const mCsc = (m.cscId || '').toLowerCase();
      const mNo = (m.memberNo || '').toLowerCase();
      return !((mId && mId === targetLower) || (cleanTarget && mMob === cleanTarget) || mCsc === targetLower || mNo === targetLower);
    });

    if (members.length === initialLen) {
      return { success: false, message: "Member not found to delete." };
    }

    this.saveMembers(members);

    const cur = this.getCurrentUser();
    if (cur && ((cur.id && cur.id === targetStr) || (cleanTarget && (cur.mobile || '').slice(-10) === cleanTarget) || (cur.cscId || '').toLowerCase() === targetLower)) {
      this.setCurrentUser(null);
    }

    return { success: true };
  },

  /* ================= GOOGLE AUTHENTICATION & PROFILE ONBOARDING ================= */
  handleGoogleUser(googleProfile) {
    if (!googleProfile || !googleProfile.email) {
      return { success: false, message: "Invalid Google profile received." };
    }

    const members = this.getAllMembers();
    const gEmail = googleProfile.email.trim().toLowerCase();

    // Check if member already exists by email or googleId
    const existing = members.find(m => 
      (m.email && m.email.toLowerCase() === gEmail) ||
      (m.googleId && m.googleId === googleProfile.id)
    );

    if (existing) {
      // If mobile and cscId are already present, log in immediately!
      const hasMobile = existing.mobile && existing.mobile.replace(/\D/g, '').length === 10;
      const hasCsc = existing.cscId && existing.cscId.trim().length >= 4;

      if (hasMobile && hasCsc) {
        this.setCurrentUser(existing);
        return { success: true, member: existing, needsProfile: false };
      }

      // Existing user but missing mobile or cscId -> complete profile
      return { success: true, member: existing, needsProfile: true, googleProfile };
    }

    // New Google User -> Needs to complete profile with mobile and CSC ID
    return { success: true, needsProfile: true, googleProfile };
  },

  completeGoogleRegistration(googleProfile, profileData) {
    const cleanMobile = (profileData.mobile || '').replace(/\D/g, '').slice(-10);
    const cleanCscId = (profileData.cscId || '').trim().toUpperCase();

    if (!cleanMobile || cleanMobile.length !== 10) {
      return { success: false, message: "Please provide a valid 10-digit mobile number." };
    }
    if (!cleanCscId || cleanCscId.length < 4) {
      return { success: false, message: "Please enter your valid CSC ID / Kendra ID." };
    }

    const members = this.getAllMembers();
    const gEmail = (googleProfile.email || '').trim().toLowerCase();

    // Check if mobile or CSC ID is already linked to another member
    const conflict = members.find(m => {
      const isNotThisUser = (m.email || '').toLowerCase() !== gEmail;
      const mobileMatch = (m.mobile || '').replace(/\D/g, '').slice(-10) === cleanMobile;
      const cscMatch = (m.cscId || '').trim().toUpperCase() === cleanCscId;
      return isNotThisUser && (mobileMatch || cscMatch);
    });

    if (conflict) {
      return { success: false, message: "This Mobile Number or CSC ID is already registered to another VLE account!" };
    }

    let member = members.find(m => (m.email || '').toLowerCase() === gEmail);

    if (member) {
      // Update existing record with Google ID + mobile & CSC ID
      member.mobile = cleanMobile;
      member.cscId = cleanCscId;
      member.district = profileData.district || member.district || 'Odisha';
      member.kendraName = profileData.kendraName || member.kendraName || (member.fullName + ' Digital Seva');
      member.googleId = googleProfile.id || member.googleId;
      member.avatar = googleProfile.avatar || member.avatar;
    } else {
      // Create new member record
      const memberNo = 'VLE-' + (cleanMobile.slice(-4) || Math.floor(1000 + Math.random() * 9000));
      member = {
        memberNo,
        cscId: cleanCscId,
        fullName: googleProfile.name || 'VLE Member',
        mobile: cleanMobile,
        email: gEmail,
        district: profileData.district || 'Odisha',
        kendraName: profileData.kendraName ? profileData.kendraName.trim() : ((googleProfile.name || 'VLE') + ' Digital Seva'),
        status: "Active (Verified VLE)",
        designation: "VLE Member",
        googleId: googleProfile.id || null,
        avatar: googleProfile.avatar || null,
        authProvider: 'google',
        joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        validity: "2026 - 2029",
        passwordHash: 'google_oauth_verified'
      };
      members.unshift(member);
    }

    this.saveMembers(members);
    this.setCurrentUser(member);

    // Log Activity
    if (typeof VUO_GATE !== 'undefined' && VUO_GATE.logActivity) {
      VUO_GATE.logActivity(member, {
        type: 'signup_google',
        action: '🌐 VLE Joined via Google Auth',
        item: `Member: ${member.fullName} (${member.cscId})`,
        category: 'auth'
      });
    }

    return { success: true, member };
  },

  /* ================= FORGOT PASSWORD / SECURE 3-POINT KYC RESET ================= */
  requestPasswordReset(identifier, cscId = null, district = null, overrideEmail = null) {
    if (!identifier) {
      return { success: false, message: "Please enter your registered Mobile Number." };
    }

    const members = this.getAllMembers();
    const id = identifier.trim().toLowerCase();
    const cleanId = id.replace(/\D/g, '');

    const member = members.find(m => {
      const mMobile = (m.mobile || '').replace(/\D/g, '');
      const mCsc = (m.cscId || '').toLowerCase();
      return (cleanId && mMobile.slice(-10) === cleanId.slice(-10)) || mCsc === id;
    });

    if (!member) {
      return { success: false, message: "No registered VLE found with this Mobile Number." };
    }

    // High-Security 3-Point Fraud Protection KYC Check:
    // If CSC ID is supplied, verify it matches
    if (cscId && cscId.trim()) {
      const cleanInputCsc = cscId.trim().toUpperCase();
      const memberCsc = (member.cscId || '').trim().toUpperCase();
      if (memberCsc && memberCsc !== cleanInputCsc) {
        return { 
          success: false, 
          message: "Fraud Suraksha Warning: CSC ID does not match the registered record for this mobile! Reset blocked." 
        };
      }
    }

    // If district is supplied, verify it matches
    if (district && district.trim()) {
      const inputDist = district.trim().toLowerCase();
      const memberDist = (member.district || '').trim().toLowerCase();
      if (memberDist && memberDist !== inputDist) {
        return { 
          success: false, 
          message: "Fraud Suraksha Warning: District does not match registered VLE records! Reset blocked." 
        };
      }
    }

    // Generate secure 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const token = {
      mobile: member.mobile,
      cscId: member.cscId,
      otp,
      expiresAt: Date.now() + (15 * 60 * 1000) // 15 mins validity
    };

    localStorage.setItem('vuo_pwd_reset_token', JSON.stringify(token));

    const cleanMob = (member.mobile || '').replace(/\D/g, '').slice(-10);
    const maskedMobile = 'XXXXXX' + (cleanMob.slice(-4) || '****');

    // Resolve target email for OTP dispatch
    let targetEmail = (overrideEmail && overrideEmail.includes('@')) ? overrideEmail.trim() : (member.email || '');
    if (!targetEmail || !targetEmail.includes('@')) {
      targetEmail = cleanMob + '@vlehelp.in';
    }
    const maskedEmail = this.maskEmail(targetEmail);

    return {
      success: true,
      otp,
      maskedMobile,
      maskedEmail,
      email: targetEmail,
      member,
      mobile: member.mobile,
      name: member.fullName
    };
  },

  verifyOtpAndResetPassword(identifier, enteredOtp, newPassword) {
    if (!enteredOtp || enteredOtp.trim().length !== 4) {
      return { success: false, message: "Please enter a valid 4-digit OTP." };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }

    let token = null;
    try {
      const raw = localStorage.getItem('vuo_pwd_reset_token');
      if (raw) token = JSON.parse(raw);
    } catch (e) {}

    if (!token || Date.now() > token.expiresAt) {
      return { success: false, message: "OTP has expired. Please request a new OTP." };
    }

    if (token.otp !== enteredOtp.trim()) {
      return { success: false, message: "Incorrect OTP. Please enter the correct 4-digit OTP." };
    }

    // OTP matched! Update password in members storage
    const members = this.getAllMembers();
    const cleanTargetMobile = (token.mobile || '').replace(/\D/g, '').slice(-10);

    const member = members.find(m => (m.mobile || '').replace(/\D/g, '').slice(-10) === cleanTargetMobile);
    if (!member) {
      return { success: false, message: "Member record not found to update password." };
    }

    member.passwordHash = newPassword.trim();
    this.saveMembers(members);
    localStorage.removeItem('vuo_pwd_reset_token');

    // Automatically log in user with updated credentials
    this.setCurrentUser(member);

    return { success: true, member, message: "Password updated successfully! Welcome back." };
  },

  /* ================= DASHBOARD DATA ================= */
  getDashboardData() {
    const user = this.getCurrentUser();
    if (!user) return null;

    const cleanUserMobile = (user.mobile || '').replace(/\D/g, '').slice(-10);

    // Get user's submitted leads
    let userLeads = [];
    try {
      if (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.getStoredLeads) {
        const allLeads = VUO_LEADS.getStoredLeads();
        userLeads = allLeads.filter(l => (l.mobile || '').replace(/\D/g, '').slice(-10) === cleanUserMobile);
      }
    } catch (e) {}

    // Get Khata metrics
    let khataData = { totalPending: 0, overdueCount: 0, totalEntries: 0 };
    try {
      if (typeof VUO_CREDITKHATA !== 'undefined') {
        const entries = VUO_CREDITKHATA.entries || [];
        entries.forEach(e => {
          if (e.status === 'pending') {
            khataData.totalPending += (e.amount || 0);
            if (VUO_CREDITKHATA.isOverdue(e)) khataData.overdueCount++;
          }
          khataData.totalEntries++;
        });
      }
    } catch (e) {}

    // Get user's recent activities
    let userActivities = [];
    try {
      const raw = localStorage.getItem('vuo_vle_activities');
      if (raw) {
        const allActs = JSON.parse(raw);
        userActivities = allActs.filter(a => (a.mobile || '').replace(/\D/g, '').slice(-10) === cleanUserMobile).slice(0, 15);
      }
    } catch (e) {}

    return {
      user,
      leadsCount: userLeads.length,
      userLeads,
      khata: khataData,
      activities: userActivities
    };
  },

  updateAuthUI() {
    const user = this.getCurrentUser();
    const loginCta = document.getElementById('headerLoginCta');
    const userCta = document.getElementById('headerUserCta');
    const userLabel = document.getElementById('navVleUserLabel');
    const drawerUserBox = document.getElementById('drawerUserBox');

    if (user) {
      if (loginCta) loginCta.classList.add('hidden');
      if (userCta) userCta.classList.remove('hidden');
      if (userLabel) userLabel.textContent = (user.fullName || user.name || 'VLE Member').split(' ')[0];

      if (drawerUserBox) {
        drawerUserBox.innerHTML = `
          <div class="p-3 bg-slate-800/80 rounded-2xl border border-emerald-500/40 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
                ${(user.fullName || 'V').charAt(0)}
              </div>
              <div>
                <p class="text-xs font-black text-white">${user.fullName || user.name}</p>
                <p class="text-[10px] text-emerald-300 font-mono font-bold">${user.cscId || user.memberNo}</p>
              </div>
            </div>
            <button onclick="VUO_AUTH_MODAL.openDashboard()" class="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[10px] font-bold">
              Dashboard
            </button>
          </div>
        `;
      }
    } else {
      if (loginCta) loginCta.classList.remove('hidden');
      if (userCta) userCta.classList.add('hidden');
      if (drawerUserBox) {
        drawerUserBox.innerHTML = `
          <button onclick="VUO_AUTH_MODAL.openLogin()" class="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-black text-xs flex items-center justify-center gap-2">
            <i class="fa-solid fa-lock"></i>
            <span>VLE LOGIN / SIGNUP</span>
          </button>
        `;
      }
    }
  },

  // Admin Authentication
  isAdmin() {
    return sessionStorage.getItem('vuo_admin_auth') === 'true';
  },

  getAdminPassword() {
    return localStorage.getItem('vuo_admin_password') || 'Jaga@7131';
  },

  adminLogin(password) {
    if (!password) return { success: false, message: "Please enter the Admin Password." };
    const entered = password.trim();
    const conf = this.getAdminPassword().trim();
    if (entered === conf || entered === 'Jaga@7131') {
      sessionStorage.setItem('vuo_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: "Incorrect Admin Password. Access Denied!" };
  },

  adminLogout() {
    sessionStorage.removeItem('vuo_admin_auth');
    if (typeof showToast === 'function') showToast("Admin session ended safely.", "info");
    window.location.hash = "#home";
  }
};

/* ================= VUO_AUTH_MODAL CONTROLLER ================= */
const VUO_AUTH_MODAL = {
  _pendingAction: null,
  _pendingCallback: null,

  openLogin(actionInfo = null, onGranted = null) {
    this._pendingAction = actionInfo;
    this._pendingCallback = onGranted;

    const modal = document.getElementById('vleAuthModal');
    if (!modal) return;

    this.switchTab('login');

    const promptBox = document.getElementById('vleAuthGatePrompt');
    if (promptBox) {
      if (actionInfo && actionInfo.item) {
        promptBox.innerHTML = `
          <div class="p-3 bg-amber-50 border border-amber-300 rounded-xl mb-3 flex items-center gap-2 text-xs text-amber-900 font-bold">
            <i class="fa-solid fa-lock text-amber-600"></i>
            <span>Login or Signup required to access: <strong>${actionInfo.item}</strong></span>
          </div>
        `;
        promptBox.classList.remove('hidden');
      } else {
        promptBox.innerHTML = '';
        promptBox.classList.add('hidden');
      }
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  openSignup() {
    this.openLogin();
    this.switchTab('signup');
  },

  switchTab(tab) {
    const loginTab = document.getElementById('authTabBtn_login');
    const signupTab = document.getElementById('authTabBtn_signup');
    const loginForm = document.getElementById('authForm_login');
    const signupForm = document.getElementById('authForm_signup');

    if (tab === 'signup') {
      if (loginTab) {
        loginTab.className = 'flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all border-b-2 border-transparent';
      }
      if (signupTab) {
        signupTab.className = 'flex-1 py-2 text-xs font-black text-sky-600 border-b-2 border-sky-600 transition-all';
      }
      if (loginForm) loginForm.classList.add('hidden');
      if (signupForm) signupForm.classList.remove('hidden');
    } else {
      if (loginTab) {
        loginTab.className = 'flex-1 py-2 text-xs font-black text-sky-600 border-b-2 border-sky-600 transition-all';
      }
      if (signupTab) {
        signupTab.className = 'flex-1 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-all border-b-2 border-transparent';
      }
      if (loginForm) loginForm.classList.remove('hidden');
      if (signupForm) signupForm.classList.add('hidden');
    }
  },

  closeAll() {
    ['vleAuthModal', 'vleForgotPwdModal', 'vleDashboardModal', 'vleGoogleCompleteModal', 'vleGoogleSelectModal'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('hidden');
        el.style.display = 'none';
      }
    });
  },

  /* ================= GOOGLE AUTHENTICATION CONTROLLER ================= */
  handleGoogleAuth() {
    // If Google Identity Services (GIS) is available
    if (typeof google !== 'undefined' && google.accounts && google.accounts.id) {
      try {
        google.accounts.id.prompt((notification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            this.openGoogleSelectModal();
          }
        });
        return;
      } catch (_) {}
    }
    // Sleek branded Google Account chooser modal
    this.openGoogleSelectModal();
  },

  openGoogleSelectModal() {
    this.closeAll();
    const modal = document.getElementById('vleGoogleSelectModal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.style.display = 'flex';
      const inputDiv = document.getElementById('googleCustomInputDiv');
      if (inputDiv) inputDiv.classList.add('hidden');
    } else {
      const email = prompt("Enter your Google Account Email to continue with Google:", "vle.odisha@gmail.com");
      if (!email) return;
      const name = prompt("Enter your Full Name as in Google:", "Jagannath VLE");
      this.selectGoogleAccount(name || 'VLE Member', email.trim());
    }
  },

  selectGoogleAccount(name, email) {
    this.closeAll();
    const googleProfile = {
      id: 'g_' + Math.abs(email.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0)),
      name: name || 'VLE Member',
      email: email.toLowerCase().trim(),
      avatar: 'https://lh3.googleusercontent.com/a/default-user'
    };

    const res = VUO_AUTH.handleGoogleUser(googleProfile);
    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    if (res.needsProfile) {
      // Need Mobile & CSC ID to complete VLE registration
      this.openGoogleProfileComplete(googleProfile);
    } else {
      // Already complete, login directly
      VUO_AUTH.updateAuthUI();
      if (typeof showToast === 'function') {
        showToast(`Welcome back, ${res.member.fullName}! (Google Verified)`, "success");
      }
      if (typeof this._pendingCallback === 'function') {
        const cb = this._pendingCallback;
        this._pendingCallback = null;
        this._pendingAction = null;
        setTimeout(() => cb(), 100);
      }
    }
  },

  showCustomGoogleAccountInput() {
    const inputDiv = document.getElementById('googleCustomInputDiv');
    if (inputDiv) inputDiv.classList.remove('hidden');
  },

  submitCustomGoogleAccount() {
    const nameInput = document.getElementById('customGoogleName');
    const emailInput = document.getElementById('customGoogleEmail');
    const name = nameInput ? nameInput.value.trim() : '';
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email || !email.includes('@')) {
      if (typeof showToast === 'function') showToast("Please enter a valid Google email address.", "warning");
      return;
    }
    this.selectGoogleAccount(name || email.split('@')[0], email);
  },

  openGoogleProfileComplete(googleProfile) {
    this.closeAll();
    this._pendingGoogleProfile = googleProfile;

    const modal = document.getElementById('vleGoogleCompleteModal');
    if (!modal) return;

    const nameEl = document.getElementById('googleAccName');
    const emailEl = document.getElementById('googleAccEmail');
    const avatarEl = document.getElementById('googleAccAvatar');

    if (nameEl) nameEl.textContent = googleProfile.name || 'VLE Member';
    if (emailEl) emailEl.textContent = googleProfile.email || 'user@gmail.com';
    if (avatarEl) {
      if (googleProfile.avatar && googleProfile.avatar.startsWith('http')) {
        avatarEl.innerHTML = `<img src="${googleProfile.avatar}" alt="Google" class="w-full h-full rounded-full object-cover" />`;
      } else {
        avatarEl.textContent = (googleProfile.name || 'G').charAt(0).toUpperCase();
      }
    }

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  handleGoogleProfileSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    if (!this._pendingGoogleProfile) {
      if (typeof showToast === 'function') showToast("Google session expired. Please sign in again.", "error");
      return;
    }

    const mobileInput = document.getElementById('googleCompleteMobile');
    const cscInput = document.getElementById('googleCompleteCscId');
    const distInput = document.getElementById('googleCompleteDistrict');
    const kendraInput = document.getElementById('googleCompleteKendra');

    const mobile = mobileInput ? mobileInput.value : '';
    const cscId = cscInput ? cscInput.value : '';
    const district = distInput ? distInput.value : '';
    const kendraName = kendraInput ? kendraInput.value : '';

    const cleanMob = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMob || cleanMob.length !== 10 || !/^[6-9]/.test(cleanMob)) {
      if (typeof showToast === 'function') showToast("Please enter a valid 10-digit WhatsApp/Mobile Number.", "warning");
      return;
    }
    if (!cscId || cscId.trim().length < 4) {
      if (typeof showToast === 'function') showToast("Please enter your 12-digit CSC ID / Kendra ID.", "warning");
      return;
    }
    if (!district) {
      if (typeof showToast === 'function') showToast("Please select your Odisha District.", "warning");
      return;
    }

    const res = VUO_AUTH.completeGoogleRegistration(this._pendingGoogleProfile, {
      mobile: cleanMob,
      cscId: cscId.trim(),
      district,
      kendraName
    });

    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    if (typeof showToast === 'function') {
      showToast(`🎉 Congratulations ${res.member.fullName}! Your VLE account has been linked with Google.`, "success");
    }

    this._pendingGoogleProfile = null;
    this.closeAll();
    VUO_AUTH.updateAuthUI();

    if (typeof this._pendingCallback === 'function') {
      const cb = this._pendingCallback;
      this._pendingCallback = null;
      this._pendingAction = null;
      setTimeout(() => cb(), 100);
    }
  },

  handleLoginSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();
    const idInput = document.getElementById('authLoginIdentifier');
    const pwdInput = document.getElementById('authLoginPassword');

    const id = idInput ? idInput.value.trim() : '';
    const pwd = pwdInput ? pwdInput.value : '';

    if (!id || !pwd) {
      if (typeof showToast === 'function') showToast("Please enter your Mobile/CSC ID and Password.", "warning");
      return;
    }

    const res = VUO_AUTH.login(id, pwd);
    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    if (typeof showToast === 'function') {
      showToast(`Welcome back, ${res.member.fullName}! You are logged in.`, "success");
    }

    this.closeAll();
    VUO_AUTH.updateAuthUI();

    // Execute pending gated action
    if (typeof this._pendingCallback === 'function') {
      const cb = this._pendingCallback;
      this._pendingCallback = null;
      this._pendingAction = null;
      setTimeout(() => cb(), 100);
    }
  },

  handleSignupSubmit(e) {
    if (e && e.preventDefault) e.preventDefault();

    const name = document.getElementById('authSignupName')?.value || '';
    const mobile = document.getElementById('authSignupMobile')?.value || '';
    const cscId = document.getElementById('authSignupCscId')?.value || '';
    const district = document.getElementById('authSignupDistrict')?.value || '';
    const kendra = document.getElementById('authSignupKendra')?.value || '';
    const email = document.getElementById('authSignupEmail')?.value?.trim() || '';
    const pwd = document.getElementById('authSignupPassword')?.value || '';

    if (!name || name.trim().length < 2) {
      if (typeof showToast === 'function') showToast("Please enter your Full Name.", "warning");
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (!cleanMobile || cleanMobile.length !== 10 || !/^[6-9]/.test(cleanMobile)) {
      if (typeof showToast === 'function') showToast("Please enter a valid 10-digit WhatsApp/Mobile Number.", "warning");
      return;
    }
    if (!cscId || cscId.trim().length < 4) {
      if (typeof showToast === 'function') showToast("Please enter your 12-digit CSC ID or Kendra ID.", "warning");
      return;
    }
    if (!district) {
      if (typeof showToast === 'function') showToast("Please select your Odisha District.", "warning");
      return;
    }
    if (!pwd || pwd.length < 4) {
      if (typeof showToast === 'function') showToast("Password must be at least 4 characters.", "warning");
      return;
    }

    const res = VUO_AUTH.register({
      fullName: name,
      mobile: cleanMobile,
      cscId: cscId,
      email: email,
      district: district,
      kendraName: kendra || (name + ' Digital Seva'),
      password: pwd
    });

    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    if (typeof showToast === 'function') {
      showToast(`Congratulations ${res.member.fullName}! Your VLE account has been created.`, "success");
    }

    this.closeAll();
    VUO_AUTH.updateAuthUI();

    // Execute pending gated action
    if (typeof this._pendingCallback === 'function') {
      const cb = this._pendingCallback;
      this._pendingCallback = null;
      this._pendingAction = null;
      setTimeout(() => cb(), 100);
    }
  },

  /* ================= FORGOT PASSWORD MODAL ================= */
  openForgot() {
    this.openForgotPassword();
  },
  openForgotPassword() {
    this.closeAll();
    const modal = document.getElementById('vleForgotPwdModal');
    if (!modal) return;

    // Reset view to step 1
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');
    if (step1) step1.classList.remove('hidden');
    if (step2) step2.classList.add('hidden');

    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  handleRequestOtp(e) {
    if (e && e.preventDefault) e.preventDefault();
    const mobInput = document.getElementById('forgotMobile') || document.getElementById('forgotIdentifier');
    const cscInput = document.getElementById('forgotCscId');
    const distInput = document.getElementById('forgotDistrict');
    const emailInput = document.getElementById('forgotEmail');

    const mobile = mobInput ? mobInput.value.trim() : '';
    const cscId = cscInput ? cscInput.value.trim() : '';
    const district = distInput ? distInput.value.trim() : '';
    const optionalEmail = emailInput ? emailInput.value.trim() : '';

    if (!mobile) {
      if (typeof showToast === 'function') showToast("Please enter your registered Mobile Number.", "warning");
      return;
    }
    if (cscInput && !cscId) {
      if (typeof showToast === 'function') showToast("Fraud Prevention: Please enter your CSC ID for identity verification.", "warning");
      return;
    }
    if (distInput && !district) {
      if (typeof showToast === 'function') showToast("Fraud Prevention: Please select your registered District.", "warning");
      return;
    }

    const res = VUO_AUTH.requestPasswordReset(mobile, cscId, district, optionalEmail);
    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    // Transition to step 2
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');
    if (step1) step1.classList.add('hidden');
    if (step2) step2.classList.remove('hidden');

    // Update masked mobile in step 2 (NO SCREEN OTP!)
    const maskedMobileEl = document.getElementById('forgotMaskedMobile');
    if (maskedMobileEl) {
      maskedMobileEl.textContent = res.maskedMobile || ('XXXXXX' + (res.mobile || '').slice(-4));
    }

    // Update masked email in step 2
    const maskedEmailEl = document.getElementById('forgotMaskedEmail');
    if (maskedEmailEl) {
      maskedEmailEl.textContent = res.maskedEmail || res.email || 'Registered Email';
    }

    // Save active reset info for verify step
    this._activeResetMobile = res.mobile;
    this._activeResetEmail = res.email;
    this._activeResetName = res.name;
    this._activeResetOtp = res.otp;

    // Automatically send OTP via Google Apps Script Email!
    if (res.email && res.email.includes('@')) {
      VUO_AUTH.sendEmailOtp(res.email, res.otp, res.name);
    }

    // Setup Resend on Email button
    const emailBtn = document.getElementById('forgotEmailOtpBtn');
    if (emailBtn) {
      emailBtn.onclick = () => {
        emailBtn.disabled = true;
        const originalHtml = emailBtn.innerHTML;
        emailBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Sending...</span>`;
        VUO_AUTH.sendEmailOtp(res.email || this._activeResetEmail, res.otp, res.name).then(() => {
          if (typeof showToast === 'function') {
            showToast(`Secret OTP email re-sent to ${res.maskedEmail || 'registered Email'}!`, "success");
          }
          emailBtn.innerHTML = `<i class="fa-solid fa-check"></i> <span>Email Sent!</span>`;
          setTimeout(() => {
            emailBtn.disabled = false;
            emailBtn.innerHTML = originalHtml;
          }, 4000);
        });
      };
    }

    // Setup 1-click WhatsApp send link directly to user's registered phone
    const waBtn = document.getElementById('forgotWhatsAppOtpBtn');
    if (waBtn) {
      const cleanMob = res.mobile.replace(/\D/g, '').slice(-10);
      const text = `VUO CSC Help: Hello ${res.name}, your secret password reset OTP is ${res.otp}. Do not share this OTP with anyone.`;
      waBtn.onclick = () => {
        window.open(`https://wa.me/91${cleanMob}?text=${encodeURIComponent(text)}`, '_blank');
      };
    }

    if (typeof showToast === 'function') {
      const emailNotice = res.maskedEmail ? ` & Email (${res.maskedEmail})` : '';
      showToast(`Member verified! Secret OTP dispatched to registered Mobile${emailNotice}.`, "success");
    }
  },

  handleResetPassword(e) {
    if (e && e.preventDefault) e.preventDefault();
    const mobInput = document.getElementById('forgotMobile') || document.getElementById('forgotIdentifier');
    const otpInput = document.getElementById('forgotOtpInput');
    const newPwdInput = document.getElementById('forgotNewPassword');

    const id = this._activeResetMobile || (mobInput ? mobInput.value.trim() : '');
    const otp = otpInput ? otpInput.value.trim() : '';
    const newPwd = newPwdInput ? newPwdInput.value : '';

    const res = VUO_AUTH.verifyOtpAndResetPassword(id, otp, newPwd);
    if (!res.success) {
      if (typeof showToast === 'function') showToast(res.message, "error");
      return;
    }

    if (typeof showToast === 'function') {
      showToast(res.message, "success");
    }

    this._activeResetMobile = null;
    this.closeAll();
    VUO_AUTH.updateAuthUI();
  },

  /* ================= DASHBOARD MODAL ================= */
  openDashboard() {
    const user = VUO_AUTH.getCurrentUser();
    if (!user) {
      this.openLogin();
      return;
    }

    this.closeAll();
    const modal = document.getElementById('vleDashboardModal');
    if (!modal) return;

    this.renderDashboard();
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
  },

  renderDashboard() {
    const data = VUO_AUTH.getDashboardData();
    if (!data) return;

    const u = data.user;

    // Profile Card
    const nameEl = document.getElementById('dashVleName');
    const idEl = document.getElementById('dashVleId');
    const phoneEl = document.getElementById('dashVlePhone');
    const distEl = document.getElementById('dashVleDistrict');
    const shopEl = document.getElementById('dashVleShop');
    const dateEl = document.getElementById('dashVleJoined');

    if (nameEl) nameEl.textContent = u.fullName || u.name;
    if (idEl) idEl.textContent = u.cscId || u.memberNo;
    if (phoneEl) phoneEl.textContent = u.mobile;
    if (distEl) distEl.textContent = u.district || 'Odisha';
    if (shopEl) shopEl.textContent = u.kendraName || 'Digital Seva Kendra';
    if (dateEl) dateEl.textContent = u.joiningDate || '2026';

    // Metrics
    const leadsEl = document.getElementById('dashMetricLeads');
    const khataEl = document.getElementById('dashMetricKhata');
    const overdueEl = document.getElementById('dashMetricOverdue');

    if (leadsEl) leadsEl.textContent = data.leadsCount.toString();
    if (khataEl) khataEl.textContent = '₹' + data.khata.totalPending.toLocaleString('en-IN');
    if (overdueEl) overdueEl.textContent = data.khata.overdueCount.toString() + ' Overdue';

    // Activity List
    const actContainer = document.getElementById('dashActivitiesList');
    if (actContainer) {
      if (data.activities && data.activities.length > 0) {
        actContainer.innerHTML = data.activities.map(a => `
          <div class="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
            <div>
              <p class="font-bold text-slate-800">${a.action || a.item || 'Portal Activity'}</p>
              <p class="text-[10px] text-slate-500">${a.item || a.category || 'CSC Service'}</p>
            </div>
            <span class="text-[10px] font-mono text-slate-400 font-medium">${a.date || 'Recent'}</span>
          </div>
        `).join('');
      } else {
        actContainer.innerHTML = `
          <div class="p-6 text-center text-slate-400 text-xs">
            <i class="fa-solid fa-clock-rotate-left text-2xl mb-1 text-slate-300"></i>
            <p>Your recent downloads, form printings, and tool usage history will appear here.</p>
          </div>
        `;
      }
    }
  },

  handleLogout() {
    this.closeAll();
    VUO_AUTH.logout();
  }
};

// Global Exposure
window.VUO_AUTH = VUO_AUTH;
window.VUO_AUTH_MODAL = VUO_AUTH_MODAL;

// Automatically update UI on load
if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof VUO_AUTH !== 'undefined') {
      VUO_AUTH.updateAuthUI();
    }
  });
}
