/**
 * VUO CSC HELP - Authentication & Member Management
 * Supports Member Registration, Login, Session Management, and Admin Verification
 */

const VUO_AUTH = {
  getCurrentUser() {
    try {
      const user = localStorage.getItem('vuo_current_user');
      return user ? JSON.parse(user) : null;
    } catch (e) {
      return null;
    }
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem('vuo_current_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('vuo_current_user');
    }
    this.updateAuthUI();
  },

  getAllMembers() {
    try {
      const members = localStorage.getItem('vuo_members');
      return members ? JSON.parse(members) : VUO_DATA.sampleMembers;
    } catch (e) {
      return VUO_DATA.sampleMembers;
    }
  },

  saveMembers(members) {
    localStorage.setItem('vuo_members', JSON.stringify(members));
  },

  register(formData) {
    const members = this.getAllMembers();

    // Check if Member No or CSC ID already exists
    const exists = members.find(m => 
      m.memberNo.toLowerCase() === formData.memberNo.toLowerCase() || 
      m.cscId === formData.cscId ||
      m.mobile === formData.mobile
    );

    if (exists) {
      return { success: false, message: "Member with this Member Number, CSC ID or Mobile already exists!" };
    }

    const newMember = {
      memberNo: formData.memberNo.trim(),
      cscId: formData.cscId.trim(),
      fullName: formData.fullName.trim(),
      mobile: formData.mobile.trim(),
      email: formData.email.trim(),
      district: formData.district,
      block: formData.block,
      gp: formData.gp.trim(),
      status: "Active (Verified VLE)",
      designation: "VLE Member",
      joiningDate: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
      validity: "2026 - 2029",
      bloodGroup: formData.bloodGroup || "O+",
      passwordHash: formData.password
    };

    members.unshift(newMember);
    this.saveMembers(members);
    if (typeof VUO_DB !== 'undefined') {
      VUO_DB.cloudSaveMember(newMember);
    }
    this.setCurrentUser(newMember);

    return { success: true, member: newMember };
  },

  login(identifier, password) {
    const members = this.getAllMembers();
    const id = identifier.trim().toLowerCase();

    // Find member by Member No, CSC ID, Mobile or Email
    const member = members.find(m => 
      m.memberNo.toLowerCase() === id || 
      m.cscId.toLowerCase() === id || 
      m.mobile === id ||
      (m.email && m.email.toLowerCase() === id)
    );

    if (!member) {
      return { success: false, message: "Member not found. Please check your Member Number or CSC ID." };
    }

    if (member.passwordHash !== password) {
      return { success: false, message: "Incorrect password. Please try again or contact VUO Admin." };
    }

    this.setCurrentUser(member);
    return { success: true, member };
  },

  logout() {
    this.setCurrentUser(null);
    showToast("Logged out successfully.", "info");
    window.location.hash = "#home";
  },

  // Admin Authentication & Password Management
  isAdmin() {
    return sessionStorage.getItem('vuo_admin_auth') === 'true';
  },

  getAdminPassword() {
    return localStorage.getItem('vuo_admin_password') || 
           localStorage.getItem('vuo_admin_pin') || 
           'Jaga@7131';
  },

  adminLogin(password) {
    if (!password) {
      return { success: false, message: "Please enter the Admin Password." };
    }
    const entered = password.trim();
    const configuredPassword = this.getAdminPassword().trim();
    
    // Accept configured password OR master default Jaga@7131
    if (entered === configuredPassword || entered === 'Jaga@7131') {
      sessionStorage.setItem('vuo_admin_auth', 'true');
      return { success: true };
    }
    return { success: false, message: "Incorrect Admin Password. Access Denied!" };
  },

  updateAdminPassword(currentPassword, newPassword) {
    const configuredPassword = this.getAdminPassword().trim();
    const enteredCurrent = currentPassword ? currentPassword.trim() : '';
    if (enteredCurrent !== configuredPassword && enteredCurrent !== 'Jaga@7131') {
      return { success: false, message: "Current password does not match!" };
    }

    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }

    localStorage.setItem('vuo_admin_password', newPassword.trim());
    localStorage.setItem('vuo_admin_password_updated', new Date().toLocaleString());
    return { success: true, message: "Admin password updated successfully! Keep it safe." };
  },

  adminLogout() {
    sessionStorage.removeItem('vuo_admin_auth');
    showToast("Admin session ended safely.", "info");
    window.location.hash = "#home";
  },

  updateAuthUI() {
    const user = this.getCurrentUser();
    const loginBtn = document.getElementById('navLoginBtn');
    const userDropdown = document.getElementById('navUserDropdown');
    const userNameSpan = document.getElementById('navUserName');
    const userDistrictSpan = document.getElementById('navUserDistrict');

    if (user) {
      if (loginBtn) loginBtn.classList.add('hidden');
      if (userDropdown) userDropdown.classList.remove('hidden');
      if (userNameSpan) userNameSpan.textContent = user.fullName;
      if (userDistrictSpan) userDistrictSpan.textContent = `${user.district} (${user.memberNo})`;
    } else {
      if (loginBtn) loginBtn.classList.remove('hidden');
      if (userDropdown) userDropdown.classList.add('hidden');
    }
  }
};

// District and Block populate helpers
function populateDistrictDropdown(selectId, selectedDistrict = "") {
  const select = document.getElementById(selectId);
  if (!select) return;

  select.innerHTML = '<option value="">-- Select District (ଜିଲ୍ଲା ଚୟନ କରନ୍ତୁ) --</option>';
  VUO_DATA.districts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d.name;
    opt.textContent = d.name;
    if (d.name === selectedDistrict) opt.selected = true;
    select.appendChild(opt);
  });
}

function populateBlockDropdown(districtSelectId, blockSelectId, selectedBlock = "") {
  const distSelect = document.getElementById(districtSelectId);
  const blockSelect = document.getElementById(blockSelectId);
  if (!distSelect || !blockSelect) return;

  const districtName = distSelect.value;
  blockSelect.innerHTML = '<option value="">-- Select Block (ବ୍ଲକ ଚୟନ କରନ୍ତୁ) --</option>';
  
  if (!districtName) return;

  const distObj = VUO_DATA.districts.find(d => d.name === districtName);
  if (distObj && distObj.blocks) {
    distObj.blocks.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b;
      opt.textContent = b;
      if (b === selectedBlock) opt.selected = true;
      blockSelect.appendChild(opt);
    });
  }
}

// Global window exposure
if (typeof window !== 'undefined') {
  window.VUO_AUTH = VUO_AUTH;
}
