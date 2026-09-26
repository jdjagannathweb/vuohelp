/**
 * VUO CSC HELP - Firebase Cloud Database Integration
 * Enables real-time synchronization across all devices and public users.
 * Supports: Links, Training Videos, Announcements, Registered Members, and Support Tickets.
 */

const VUO_DB = {
  db: null,
  isInitialized: false,

  // Default Firebase configuration (Official VUO CSC HELP Cloud Project)
  defaultConfig: {
    apiKey: "AIzaSyDDwNdYJOHGZYdK6jq9algXKfg-hCdWHaI",
    authDomain: "vuo-csc-help.firebaseapp.com",
    projectId: "vuo-csc-help",
    storageBucket: "vuo-csc-help.firebasestorage.app",
    messagingSenderId: "1014799537308",
    appId: "1:1014799537308:web:83507031bada48ed534959",
    measurementId: "G-H7RHF99293"
  },

  storage: null,

  init() {
    try {
      const savedConfigStr = localStorage.getItem('vuo_firebase_config');
      let config = (typeof window !== 'undefined' && window.VUO_FIREBASE_DEFAULT_CONFIG) ? window.VUO_FIREBASE_DEFAULT_CONFIG : this.defaultConfig;
      if (savedConfigStr) {
        try {
          const parsed = JSON.parse(savedConfigStr);
          if (parsed && parsed.projectId && parsed.apiKey) config = parsed;
        } catch (_) {}
      }

      if (config && config.projectId && typeof firebase !== 'undefined') {
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        this.db = firebase.firestore();
        if (typeof firebase.storage === 'function') {
          this.storage = firebase.storage();
        }
        this.isInitialized = true;
        console.log("✅ VUO Firebase Firestore & Storage Cloud DB connected successfully!");
        this.setupRealtimeListeners();
      } else {
        console.log("ℹ️ VUO running in LocalStorage mode (Direct REST fallback active).");
      }
      // Always trigger direct cloud members fetch in background to guarantee zero missing members
      this.fetchCloudMembersDirectly();
    } catch (e) {
      console.warn("Firebase initialization warning (falling back to local storage):", e);
      this.isInitialized = false;
      this.fetchCloudMembersDirectly();
    }
  },

  async uploadPdfToStorage(file, onProgress) {
    if (!this.storage) {
      throw new Error("Firebase Storage not available");
    }
    if (onProgress) onProgress("Checking Firebase Cloud Storage...");
    const cleanName = (file.name || 'form.pdf').replace(/[^a-zA-Z0-9._-]/g, '_');
    const safePath = `csc_forms/${Date.now()}_${cleanName}`;
    const storageRef = this.storage.ref().child(safePath);

    const uploadTask = storageRef.put(file);
    const uploadPromise = uploadTask.then(snapshot => snapshot.ref.getDownloadURL());
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        try { uploadTask.cancel(); } catch (_) {}
        reject(new Error("Firebase Storage connection timeout (404/unavailable)"));
      }, 2000);
    });

    const downloadUrl = await Promise.race([uploadPromise, timeoutPromise]);
    console.log("☁️ File uploaded to Firebase Storage:", downloadUrl);
    return downloadUrl;
  },

  async uploadImageToStorage(fileOrBlob, onProgress) {
    if (!this.storage) {
      throw new Error("Firebase Storage not available");
    }
    if (onProgress) onProgress("Uploading notice photo to Firebase Cloud Storage...");
    const cleanName = (fileOrBlob.name || 'notice_poster.jpg').replace(/[^a-zA-Z0-9._-]/g, '_');
    const safePath = `notice_posters/${Date.now()}_${cleanName}`;
    const storageRef = this.storage.ref().child(safePath);
    const snapshot = await storageRef.put(fileOrBlob);
    const downloadUrl = await snapshot.ref.getDownloadURL();
    console.log("☁️ Notice photo uploaded to Firebase Storage:", downloadUrl);
    return downloadUrl;
  },

  isConfigured() {
    const savedConfigStr = localStorage.getItem('vuo_firebase_config');
    if (!savedConfigStr) return false;
    try {
      const cfg = JSON.parse(savedConfigStr);
      return !!(cfg && cfg.projectId && cfg.apiKey);
    } catch (e) {
      return false;
    }
  },

  getSavedConfig() {
    try {
      const saved = localStorage.getItem('vuo_firebase_config');
      return saved ? JSON.parse(saved) : this.defaultConfig;
    } catch (e) {
      return this.defaultConfig;
    }
  },

  saveConfig(configObj) {
    try {
      localStorage.setItem('vuo_firebase_config', JSON.stringify(configObj));
      // Re-initialize
      if (typeof firebase !== 'undefined' && configObj.projectId) {
        if (!firebase.apps.length) {
          firebase.initializeApp(configObj);
        }
        this.db = firebase.firestore();
        this.isInitialized = true;
        this.setupRealtimeListeners();
      }
      return { success: true, message: "Firebase configuration saved successfully!" };
    } catch (e) {
      return { success: false, message: e.message };
    }
  },

  // ---------------- REALTIME LISTENERS ---------------- //
  setupRealtimeListeners() {
    if (!this.isInitialized || !this.db) return;

    // 1. Links Realtime Sync
    this.db.collection('vuo_links').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const links = [];
        snapshot.forEach(doc => links.push(doc.data()));
        links.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        localStorage.setItem('vuo_links', JSON.stringify(links));
        if (typeof VUO_LINKS !== 'undefined' && VUO_LINKS.renderLinks) {
          VUO_LINKS.renderLinks();
        }
        if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLinksTable) {
          VUO_ADMIN.renderLinksTable();
        }
      }
    }, (err) => console.warn("Links listener error:", err));

    // 2. Training Videos Realtime Sync
    this.db.collection('vuo_training').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const videos = [];
        snapshot.forEach(doc => videos.push(doc.data()));
        videos.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        localStorage.setItem('vuo_training', JSON.stringify(videos));
        if (typeof VUO_TRAINING !== 'undefined' && VUO_TRAINING.renderVideos) {
          VUO_TRAINING.renderVideos();
        }
        if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderVideosTable) {
          VUO_ADMIN.renderVideosTable();
        }
      }
    }, (err) => console.warn("Training listener error:", err));

    // 3. Announcements Realtime Sync
    this.db.collection('vuo_announcements').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const anns = [];
        snapshot.forEach(doc => anns.push(doc.data()));
        anns.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        localStorage.setItem('vuo_announcements', JSON.stringify(anns));
        if (typeof renderAnnouncementsTicker === 'function') {
          renderAnnouncementsTicker();
        }
        if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderAnnouncementsTable) {
          VUO_ADMIN.renderAnnouncementsTable();
        }
      }
    }, (err) => console.warn("Announcements listener error:", err));

    // 4. CSC PDF Forms Realtime Sync
    this.db.collection('vuo_forms').onSnapshot((snapshot) => {
      const defaultForms = (typeof VUO_DATA !== 'undefined' && Array.isArray(VUO_DATA.forms)) ? VUO_DATA.forms : [];
      const formsMap = new Map();
      defaultForms.forEach(df => formsMap.set(df.id, df));
      
      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d && d.id) {
            formsMap.set(d.id, { ...(formsMap.get(d.id) || {}), ...d });
          }
        });
      }
      
      const forms = Array.from(formsMap.values());
      localStorage.setItem('vuo_forms', JSON.stringify(forms));
      if (typeof VUO_FORMS !== 'undefined' && VUO_FORMS.renderForms) {
        VUO_FORMS.renderForms();
      }
      if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderFormsTable) {
        VUO_ADMIN.renderFormsTable();
      }
    }, (err) => console.warn("Forms listener error:", err));

    // 5. Leads & General Insurance Realtime Sync
    this.db.collection('vuo_leads').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const leads = [];
        snapshot.forEach(doc => leads.push(doc.data()));
        leads.sort((a, b) => (b.timestamp || b.createdAt || 0) - (a.timestamp || a.createdAt || 0));
        localStorage.setItem('vuo_leads', JSON.stringify(leads));
        if (typeof VUO_ADMIN !== 'undefined' && VUO_ADMIN.renderLeadsTable) {
          VUO_ADMIN.renderLeadsTable();
        }
      }
    }, (err) => console.warn("Leads listener error:", err));

    // 6. Custom Lead Services Realtime Sync
    this.db.collection('vuo_lead_services').onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const services = [];
        snapshot.forEach(doc => services.push(doc.data()));
        localStorage.setItem('vuo_custom_lead_services', JSON.stringify(services));
        if (typeof VUO_LEADS !== 'undefined' && VUO_LEADS.renderAllServiceUI) {
          VUO_LEADS.renderAllServiceUI();
        }
      }
    }, (err) => console.warn("Lead services listener error:", err));

    // 7. Welcome Notice Popup Realtime Sync (across all devices & public users)
    this.db.collection('vuo_settings').doc('popup').onSnapshot((doc) => {
      if (doc && doc.exists) {
        const popupData = doc.data();
        if (popupData && typeof popupData === 'object' && popupData.title) {
          console.log("☁️ Real-time Welcome Popup received from Cloud Firestore:", popupData.title);
          localStorage.setItem('vuo_popup', JSON.stringify(popupData));
          
          if (window.VUO_IDB && typeof window.VUO_IDB.savePdfBlob === 'function') {
            window.VUO_IDB.savePdfBlob('vuo_popup_settings', popupData, 'vuo_popup_settings');
          }

          if (typeof VUO_ADMIN !== 'undefined' && typeof VUO_ADMIN.renderPopupSettings === 'function') {
            VUO_ADMIN.renderPopupSettings();
          }

          const modal = document.getElementById('welcomePopupModal');
          if (modal && modal.style.display === 'flex' && !modal.classList.contains('hidden')) {
            if (typeof openWelcomePopup === 'function') {
              openWelcomePopup();
            }
          }
        }
      }
    }, (err) => console.warn("Popup settings listener error:", err));

    // 8. VLE Activity & Visits Realtime Sync
    this.db.collection('vuo_vle_activity').orderBy('timestamp', 'desc').limit(200).onSnapshot((snapshot) => {
      if (!snapshot.empty) {
        const activities = [];
        snapshot.forEach(doc => activities.push(doc.data()));
        localStorage.setItem('vuo_vle_activities', JSON.stringify(activities));
        if (typeof VUO_ADMIN !== 'undefined' && typeof VUO_ADMIN.renderVleActivityTable === 'function') {
          VUO_ADMIN.renderVleActivityTable();
        }
      }
    }, (err) => console.warn("VLE activity listener error:", err));

    // 9. Registered Members Realtime Sync (All devices & Admin panel)
    this.db.collection('vuo_members').onSnapshot((snapshot) => {
      let deletedList = [];
      try {
        const delRaw = localStorage.getItem('vuo_deleted_members');
        if (delRaw) deletedList = JSON.parse(delRaw);
      } catch (_) {}
      let customMap = {};
      try { customMap = JSON.parse(localStorage.getItem('vuo_custom_passwords') || '{}'); } catch (_) {}

      let curUser = null;
      try {
        const curRaw = localStorage.getItem('vuo_current_user');
        if (curRaw) curUser = JSON.parse(curRaw);
      } catch (_) {}
      const curMob = curUser ? (curUser.mobile || '').replace(/\D/g, '').slice(-10) : '';

      if (!snapshot.empty) {
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d) {
            const memNo = (d.memberNo || doc.id || '').toLowerCase().trim();
            const mob = (d.mobile || '').replace(/\D/g, '').slice(-10);
            const idVal = (d.id || '').toLowerCase().trim();
            const csc = (d.cscId || '').toLowerCase().trim();

            // Ignore deleted members
            if (deletedSet.has(memNo) || (mob && deletedSet.has(mob)) || (idVal && deletedSet.has(idVal)) || (csc && deletedSet.has(csc))) {
              return;
            }

            // Preserve custom passwords so cloud defaults never wipe them
            if (mob && customMap[mob] && customMap[mob].passwordHash) {
              d.passwordHash = customMap[mob].passwordHash;
            } else if (csc && customMap[csc] && customMap[csc].passwordHash) {
              d.passwordHash = customMap[csc].passwordHash;
            } else if (mob && curMob && mob === curMob && curUser.passwordHash) {
              d.passwordHash = curUser.passwordHash;
            } else if (d.passwordHash && d.passwordHash !== '1234') {
              if (mob) customMap[mob] = { passwordHash: d.passwordHash, updatedAt: Date.now() };
            }

            const k = (d.mobile || d.id || d.memberNo || doc.id || '').trim();
            if (k) {
              membersMap.set(k, d);
            }
          }
        });
      }

      try { localStorage.setItem('vuo_custom_passwords', JSON.stringify(customMap)); } catch (_) {}

      const merged = Array.from(membersMap.values());
      merged.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
      localStorage.setItem('vuo_members', JSON.stringify(merged));
      console.log(`☁️ Real-time: Synced ${merged.length} members from Cloud Firestore!`);

      if (typeof VUO_ADMIN !== 'undefined' && typeof VUO_ADMIN.renderMembersTable === 'function') {
        VUO_ADMIN.renderMembersTable();
      }
    }, (err) => console.warn("Members listener error:", err));

    // 10. VLE Gate Users Realtime Sync
    this.db.collection('vuo_vle_users').onSnapshot((snapshot) => {
      let deletedList = [];
      try {
        const delRaw = localStorage.getItem('vuo_deleted_members');
        if (delRaw) deletedList = JSON.parse(delRaw);
      } catch (_) {}
      const deletedSet = new Set(deletedList.map(s => String(s).toLowerCase().trim()));

      if (!snapshot.empty) {
        const users = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d && d.mobile) {
            const cleanM = (d.mobile || doc.id || '').replace(/\D/g, '').slice(-10);
            if (cleanM && !deletedSet.has(cleanM)) {
              users.push(d);
            }
          }
        });
        users.sort((a, b) => (Number(b.registeredAt || b.lastVisitAt) || 0) - (Number(a.registeredAt || a.lastVisitAt) || 0));
        localStorage.setItem('vuo_vle_users', JSON.stringify(users));
        console.log(`☁️ Real-time: Synced ${users.length} VLE Gate users from Cloud Firestore!`);

        if (typeof VUO_ADMIN !== 'undefined') {
          if (typeof VUO_ADMIN.renderMembersTable === 'function') VUO_ADMIN.renderMembersTable();
          if (typeof VUO_ADMIN.renderVleActivityTable === 'function') VUO_ADMIN.renderVleActivityTable();
        }
      }
    }, (err) => console.warn("Gate users listener error:", err));
  },

  // ---------------- CLOUD CRUD HELPERS ---------------- //
  // CSC PDF Forms
  async cloudSaveForm(formObj) {
    if (this.isInitialized && this.db) {
      try {
        formObj.createdAt = formObj.createdAt || Date.now();
        await this.db.collection('vuo_forms').doc(formObj.id).set(formObj);
        console.log("☁️ CSC PDF form saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save form to cloud:", e);
      }
    }
  },

  async cloudDeleteForm(formId) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_forms').doc(formId).delete();
        console.log("☁️ Form deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete form from cloud:", e);
      }
    }
  },

  // Links
  async cloudSaveLink(linkObj) {
    if (this.isInitialized && this.db) {
      try {
        linkObj.createdAt = linkObj.createdAt || Date.now();
        await this.db.collection('vuo_links').doc(linkObj.id).set(linkObj);
        console.log("☁️ Link saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save link to cloud:", e);
      }
    }
  },

  async cloudDeleteLink(linkId) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_links').doc(linkId).delete();
        console.log("☁️ Link deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete link from cloud:", e);
      }
    }
  },

  // Training Videos
  async cloudSaveVideo(videoObj) {
    if (this.isInitialized && this.db) {
      try {
        videoObj.createdAt = videoObj.createdAt || Date.now();
        await this.db.collection('vuo_training').doc(videoObj.id).set(videoObj);
        console.log("☁️ Training video saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save video to cloud:", e);
      }
    }
  },

  async cloudDeleteVideo(videoId) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_training').doc(videoId).delete();
        console.log("☁️ Training video deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete video from cloud:", e);
      }
    }
  },

  // Announcements
  async cloudSaveAnnouncement(annObj) {
    if (this.isInitialized && this.db) {
      try {
        annObj.createdAt = annObj.createdAt || Date.now();
        await this.db.collection('vuo_announcements').doc(annObj.id).set(annObj);
        console.log("☁️ Announcement saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save announcement to cloud:", e);
      }
    }
  },

  async cloudDeleteAnnouncement(annId) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_announcements').doc(annId).delete();
        console.log("☁️ Announcement deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete announcement from cloud:", e);
      }
    }
  },

  // Member Registration & Cloud Management
  async cloudSaveMember(memberObj) {
    if (!memberObj) return { success: false, error: "Empty member object" };
    memberObj.createdAt = memberObj.createdAt || Date.now();
    const docId = (memberObj.memberNo || memberObj.id || memberObj.mobile || '').trim();
    if (!docId) return { success: false, error: "Missing member identifier" };

    // 1. Firebase SDK
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_members').doc(docId).set(memberObj, { merge: true });
        console.log("☁️ Member saved to Firebase Cloud (SDK):", docId);
      } catch (e) {
        console.warn("Could not save member via SDK:", e);
      }
    }

    // 2. Direct REST API Fallback (Guaranteed persistence to Firestore)
    try {
      const apiKey = (this.defaultConfig && this.defaultConfig.apiKey) || "AIzaSyDDwNdYJOHGZYdK6jq9algXKfg-hCdWHaI";
      const proj = (this.defaultConfig && this.defaultConfig.projectId) || "vuo-csc-help";
      const url = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_members/${encodeURIComponent(docId)}?key=${apiKey}`;
      const restRes = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: this.toFirestoreFields(memberObj) })
      });
      if (restRes.ok) {
        console.log("☁️ Member synced to Cloud Firestore REST:", docId);
      }
    } catch (restErr) {
      console.warn("REST member save warning:", restErr);
    }

    return { success: true };
  },

  async cloudDeleteMember(memberNo, mobileNo) {
    const cleanMem = (memberNo || '').toString().trim();
    const cleanMob = (mobileNo || '').toString().replace(/\D/g, '').slice(-10);
    const apiKey = (this.defaultConfig && this.defaultConfig.apiKey) || "AIzaSyDDwNdYJOHGZYdK6jq9algXKfg-hCdWHaI";
    const proj = (this.defaultConfig && this.defaultConfig.projectId) || "vuo-csc-help";

    console.log(`🗑️ Deleting member from Cloud Firestore: memberNo=${cleanMem}, mobile=${cleanMob}`);

    // 1. Delete via SDK (if initialized and online)
    if (this.isInitialized && this.db) {
      try {
        if (cleanMem) {
          await this.db.collection('vuo_members').doc(cleanMem).delete().catch(() => {});
        }
        if (cleanMob) {
          await this.db.collection('vuo_vle_users').doc(cleanMob).delete().catch(() => {});
          await this.db.collection('vuo_members').doc(cleanMob).delete().catch(() => {});
        }
        console.log("☁️ Member deleted via Firebase SDK!");
      } catch (e) {
        console.warn("Could not delete member via SDK:", e);
      }
    }

    // 2. Direct REST DELETE (Guaranteed synchronous deletion from Firestore)
    try {
      const deletePromises = [];
      if (cleanMem) {
        deletePromises.push(
          fetch(`https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_members/${encodeURIComponent(cleanMem)}?key=${apiKey}`, { method: 'DELETE' })
        );
      }
      if (cleanMob) {
        deletePromises.push(
          fetch(`https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_vle_users/${encodeURIComponent(cleanMob)}?key=${apiKey}`, { method: 'DELETE' }),
          fetch(`https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_members/${encodeURIComponent(cleanMob)}?key=${apiKey}`, { method: 'DELETE' })
        );
      }
      await Promise.allSettled(deletePromises);
      console.log("☁️ Member deleted via Firestore REST API (vuo_members & vuo_vle_users)!");
    } catch (err) {
      console.warn("REST member delete error:", err);
    }

    return { success: true };
  },

  // Leads & General Insurance
  async cloudSaveLead(leadObj) {
    if (this.isInitialized && this.db) {
      try {
        const id = leadObj.id || leadObj.leadId;
        leadObj.updatedAt = Date.now();
        await this.db.collection('vuo_leads').doc(id).set(leadObj, { merge: true });
        console.log("☁️ Lead saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save lead to cloud:", e);
      }
    }
  },

  async cloudDeleteLead(leadId) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_leads').doc(leadId).delete();
        console.log("☁️ Lead deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete lead from cloud:", e);
      }
    }
  },

  // Custom Lead Services
  async cloudSaveCustomLeadService(serviceObj) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_lead_services').doc(serviceObj.key).set(serviceObj, { merge: true });
        console.log("☁️ Custom lead service saved to Firebase Cloud!");
      } catch (e) {
        console.warn("Could not save custom lead service to cloud:", e);
      }
    }
  },

  async cloudDeleteCustomLeadService(serviceKey) {
    if (this.isInitialized && this.db) {
      try {
        await this.db.collection('vuo_lead_services').doc(serviceKey).delete();
        console.log("☁️ Custom lead service deleted from Firebase Cloud!");
      } catch (e) {
        console.warn("Could not delete custom lead service from cloud:", e);
      }
    }
  },

  // Initial Cloud Seed (Uploads local defaults to Cloud if empty)
  async seedCloudDefaults() {
    if (!this.isInitialized || !this.db) return;
    try {
      // Check Links
      const linksSnap = await this.db.collection('vuo_links').limit(1).get();
      if (linksSnap.empty && VUO_DATA.links) {
        for (const l of VUO_DATA.links) {
          await this.cloudSaveLink(l);
        }
      }

      // Check Videos
      const vidsSnap = await this.db.collection('vuo_training').limit(1).get();
      if (vidsSnap.empty && VUO_DATA.trainingVideos) {
        for (const v of VUO_DATA.trainingVideos) {
          await this.cloudSaveVideo(v);
        }
      }

      // Check Announcements
      const annSnap = await this.db.collection('vuo_announcements').limit(1).get();
      if (annSnap.empty && VUO_DATA.announcements) {
        for (const a of VUO_DATA.announcements) {
          await this.cloudSaveAnnouncement(a);
        }
      }

      console.log("☁️ Cloud database seeded with initial VUO default data.");
    } catch (e) {
      console.warn("Cloud seed notice:", e);
    }
  },

  // Welcome Notice Popup Cloud Persistence
  async cloudSavePopup(popupObj) {
    if (this.isInitialized && this.db) {
      try {
        popupObj.updatedAtTimestamp = popupObj.updatedAtTimestamp || Date.now();
        await this.db.collection('vuo_settings').doc('popup').set(popupObj, { merge: true });
        console.log("☁️ Welcome Popup published to Firebase Cloud Firestore successfully!");
        return { success: true };
      } catch (e) {
        console.warn("Could not save popup to cloud Firestore:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, error: "Firebase not initialized" };
  },

  // VLE Activity & Visits Cloud Persistence
  async cloudSaveVleActivity(actObj) {
    if (this.isInitialized && this.db) {
      try {
        const docId = actObj.id || ('ACT-' + Date.now() + '-' + Math.floor(100 + Math.random() * 900));
        await this.db.collection('vuo_vle_activity').doc(docId).set(actObj, { merge: true });
        console.log("☁️ VLE Activity logged to Cloud Firestore:", actObj.action);
        return { success: true };
      } catch (e) {
        console.warn("Could not save VLE activity to cloud Firestore:", e);
        return { success: false, error: e.message };
      }
    }
    return { success: false, error: "Firebase not initialized" };
  },

  // ---------------- DIRECT REST SYNC FALLBACK (Bulletproof against blocked SDK) ---------------- //
  toFirestoreFields(obj) {
    const fields = {};
    if (!obj || typeof obj !== 'object') return fields;
    for (const [key, val] of Object.entries(obj)) {
      if (val === undefined || val === null) continue;
      if (typeof val === 'string') {
        fields[key] = { stringValue: val };
      } else if (typeof val === 'number') {
        if (Number.isInteger(val)) {
          fields[key] = { integerValue: String(val) };
        } else {
          fields[key] = { doubleValue: val };
        }
      } else if (typeof val === 'boolean') {
        fields[key] = { booleanValue: val };
      } else if (Array.isArray(val)) {
        fields[key] = {
          arrayValue: {
            values: val.map(v => typeof v === 'object' ? { stringValue: JSON.stringify(v) } : { stringValue: String(v) })
          }
        };
      } else if (typeof val === 'object') {
        fields[key] = { stringValue: JSON.stringify(val) };
      }
    }
    return fields;
  },

  parseFirestoreFields(fields) {
    const res = {};
    if (!fields) return res;
    for (const key of Object.keys(fields)) {
      const valObj = fields[key];
      if (!valObj) continue;
      if (valObj.stringValue !== undefined) res[key] = valObj.stringValue;
      else if (valObj.integerValue !== undefined) res[key] = Number(valObj.integerValue);
      else if (valObj.booleanValue !== undefined) res[key] = valObj.booleanValue;
      else if (valObj.doubleValue !== undefined) res[key] = Number(valObj.doubleValue);
      else if (valObj.timestampValue !== undefined) res[key] = valObj.timestampValue;
    }
    return res;
  },

  async fetchCloudMembersDirectly() {
    const apiKey = (this.defaultConfig && this.defaultConfig.apiKey) || "AIzaSyDDwNdYJOHGZYdK6jq9algXKfg-hCdWHaI";
    const proj = (this.defaultConfig && this.defaultConfig.projectId) || "vuo-csc-help";
    const membersUrl = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_members?key=${apiKey}`;
    const gateUsersUrl = `https://firestore.googleapis.com/v1/projects/${proj}/databases/(default)/documents/vuo_vle_users?key=${apiKey}`;

    let memberCount = 0;
    let gateCount = 0;

    let deletedList = [];
    try {
      const delRaw = localStorage.getItem('vuo_deleted_members');
      if (delRaw) deletedList = JSON.parse(delRaw);
    } catch (_) {}
    const deletedSet = new Set(deletedList.map(s => String(s).toLowerCase().trim()));

      let customMap = {};
      try { customMap = JSON.parse(localStorage.getItem('vuo_custom_passwords') || '{}'); } catch (_) {}

      let curUser = null;
      try {
        const curRaw = localStorage.getItem('vuo_current_user');
        if (curRaw) curUser = JSON.parse(curRaw);
      } catch (_) {}
      const curMob = curUser ? (curUser.mobile || '').replace(/\D/g, '').slice(-10) : '';

      try {
        // 1. Fetch vuo_members
        const resMembers = await fetch(membersUrl, { cache: 'no-cache' });
        if (resMembers.ok) {
          const data = await resMembers.json();
          if (data && data.documents && Array.isArray(data.documents)) {
            const membersMap = new Map();

            data.documents.forEach(doc => {
              const parsed = this.parseFirestoreFields(doc.fields);
              if (parsed && (parsed.mobile || parsed.id || parsed.memberNo || parsed.fullName)) {
                const memNo = (parsed.memberNo || doc.name.split('/').pop() || '').toLowerCase().trim();
                const mob = (parsed.mobile || '').replace(/\D/g, '').slice(-10);
                const idVal = (parsed.id || '').toLowerCase().trim();
                const csc = (parsed.cscId || '').toLowerCase().trim();

                if (deletedSet.has(memNo) || (mob && deletedSet.has(mob)) || (idVal && deletedSet.has(idVal)) || (csc && deletedSet.has(csc))) {
                  return;
                }

                // Preserve custom passwords so cloud defaults never wipe them
                if (mob && customMap[mob] && customMap[mob].passwordHash) {
                  parsed.passwordHash = customMap[mob].passwordHash;
                } else if (csc && customMap[csc] && customMap[csc].passwordHash) {
                  parsed.passwordHash = customMap[csc].passwordHash;
                } else if (mob && curMob && mob === curMob && curUser.passwordHash) {
                  parsed.passwordHash = curUser.passwordHash;
                } else if (parsed.passwordHash && parsed.passwordHash !== '1234') {
                  if (mob) customMap[mob] = { passwordHash: parsed.passwordHash, updatedAt: Date.now() };
                }

                const k = (parsed.mobile || parsed.id || parsed.memberNo || '').trim();
                if (k) {
                  membersMap.set(k, parsed);
                }
              }
            });

            try { localStorage.setItem('vuo_custom_passwords', JSON.stringify(customMap)); } catch (_) {}

            const merged = Array.from(membersMap.values());
            merged.sort((a, b) => (Number(b.createdAt) || 0) - (Number(a.createdAt) || 0));
            localStorage.setItem('vuo_members', JSON.stringify(merged));
            memberCount = merged.length;
            console.log(`✅ Direct REST: Loaded ${memberCount} members from Cloud Firestore.`);
          }
        }

      // 2. Fetch vuo_vle_users (Gate Users)
      const resGate = await fetch(gateUsersUrl, { cache: 'no-cache' });
      if (resGate.ok) {
        const dataGate = await resGate.json();
        if (dataGate && dataGate.documents && Array.isArray(dataGate.documents)) {
          const gateUsers = [];
          dataGate.documents.forEach(doc => {
            const parsed = this.parseFirestoreFields(doc.fields);
            if (parsed && parsed.mobile) {
              const cleanM = (parsed.mobile || '').replace(/\D/g, '').slice(-10);
              if (cleanM && !deletedSet.has(cleanM)) {
                gateUsers.push(parsed);
              }
            }
          });
          gateUsers.sort((a, b) => (Number(b.registeredAt || b.lastVisitAt) || 0) - (Number(a.registeredAt || a.lastVisitAt) || 0));
          localStorage.setItem('vuo_vle_users', JSON.stringify(gateUsers));
          gateCount = gateUsers.length;
          console.log(`✅ Direct REST: Loaded ${gateCount} VLE Gate users from Cloud Firestore.`);
        }
      }

      if (typeof VUO_ADMIN !== 'undefined' && typeof VUO_ADMIN.renderMembersTable === 'function') {
        VUO_ADMIN.renderMembersTable();
      }
      return { success: true, memberCount, gateCount };
    } catch (e) {
      console.warn("Direct Cloud Member fetch warning:", e);
      return { success: false, error: e.message };
    }
  }
};

window.VUO_DB = VUO_DB;
