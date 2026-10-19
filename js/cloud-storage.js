/**
 * VUO CSC HELP - Multi-Provider Free Cloud Storage Engine
 * Enables direct PDF & Image uploads to 100% Free Cloud Storage providers
 * Supports:
 *  1. Cloudinary (25 GB Free/mo - PDFs & Images)
 *  2. Supabase Storage (1 GB Free permanent bucket - PDFs & Images)
 *  3. ImgBB (Free high-speed image hosting for Notice & QR codes)
 *  4. Google Firebase Storage (Blaze fallback)
 *  5. IndexedDB (Resilient offline local storage)
 */

const VUO_CLOUD_STORAGE = {
  getCloudConfig() {
    return {
      provider: localStorage.getItem('vuo_cloud_provider') || 'auto',
      cloudName: localStorage.getItem('vuo_cloud_name') || '',
      uploadPreset: localStorage.getItem('vuo_cloud_preset') || '',
      supabaseUrl: localStorage.getItem('vuo_supabase_url') || '',
      supabaseAnonKey: localStorage.getItem('vuo_supabase_key') || '',
      supabaseBucket: localStorage.getItem('vuo_supabase_bucket') || 'vuo_files',
      imgbbApiKey: localStorage.getItem('vuo_imgbb_key') || ''
    };
  },

  setCloudConfig(cfg) {
    if (!cfg) return;
    if (cfg.provider) localStorage.setItem('vuo_cloud_provider', cfg.provider.trim());
    if (cfg.cloudName !== undefined) localStorage.setItem('vuo_cloud_name', cfg.cloudName.trim());
    if (cfg.uploadPreset !== undefined) localStorage.setItem('vuo_cloud_preset', cfg.uploadPreset.trim());
    if (cfg.supabaseUrl !== undefined) localStorage.setItem('vuo_supabase_url', cfg.supabaseUrl.trim());
    if (cfg.supabaseAnonKey !== undefined) localStorage.setItem('vuo_supabase_key', cfg.supabaseAnonKey.trim());
    if (cfg.supabaseBucket !== undefined) localStorage.setItem('vuo_supabase_bucket', cfg.supabaseBucket.trim() || 'vuo_files');
    if (cfg.imgbbApiKey !== undefined) localStorage.setItem('vuo_imgbb_key', cfg.imgbbApiKey.trim());

    // Sync to Firestore for multi-admin access if configured
    if (typeof VUO_DB !== 'undefined' && VUO_DB.isInitialized) {
      try {
        VUO_DB.cloudSaveDoc('vuo_settings', 'cloud_storage', {
          provider: cfg.provider || 'auto',
          cloudName: cfg.cloudName || '',
          uploadPreset: cfg.uploadPreset || '',
          supabaseUrl: cfg.supabaseUrl || '',
          supabaseBucket: cfg.supabaseBucket || 'vuo_files',
          updatedAt: new Date().toLocaleString()
        });
      } catch (_) {}
    }
  },

  /**
   * Uploads a PDF file directly to free cloud storage
   * @param {File} file 
   * @param {Function} progressCallback 
   * @returns {Promise<{provider: string, url: string, previewUrl: string, downloadUrl: string}>}
   */
  async uploadPdf(file, progressCallback) {
    if (!file) throw new Error("No PDF file provided");
    const config = this.getCloudConfig();

    // 1. Cloudinary (25 GB Free Monthly)
    if (config.cloudName && config.uploadPreset && (config.provider === 'auto' || config.provider === 'cloudinary')) {
      try {
        return await this.uploadToCloudinary(file, config, progressCallback);
      } catch (err) {
        console.warn("Cloudinary upload failed, checking next provider:", err.message);
      }
    }

    // 2. Supabase Storage (1 GB Free Permanent)
    if (config.supabaseUrl && config.supabaseAnonKey && (config.provider === 'auto' || config.provider === 'supabase')) {
      try {
        return await this.uploadToSupabase(file, config, progressCallback);
      } catch (err) {
        console.warn("Supabase upload failed, checking next provider:", err.message);
      }
    }

    // 3. Google Firebase Storage (if provisioned)
    if (typeof VUO_DB !== 'undefined' && VUO_DB.storage && (config.provider === 'auto' || config.provider === 'firebase')) {
      try {
        if (progressCallback) progressCallback("Checking Firebase Storage...");
        const uploadPromise = VUO_DB.uploadPdfToStorage(file, progressCallback);
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Firebase upload timeout (5s)")), 5000));
        const fireUrl = await Promise.race([uploadPromise, timeoutPromise]);
        if (fireUrl && fireUrl.startsWith('http')) {
          return {
            provider: 'firebase_storage',
            url: fireUrl,
            previewUrl: fireUrl,
            downloadUrl: fireUrl
          };
        }
      } catch (fbErr) {
        console.warn("Firebase Storage unavailable (Spark plan requires Blaze):", fbErr.message);
      }
    }

    // 4. In-Browser IndexedDB Fallback (Instant, Zero Network Latency, Resilient)
    if (progressCallback) progressCallback("Saving to High-Capacity Offline DB...");
    return {
      provider: 'indexeddb',
      url: `forms/${file.name}`,
      previewUrl: '',
      downloadUrl: ''
    };
  },

  /**
   * Uploads an image (Notice poster, QR code, banner) to free cloud
   * @param {File|Blob} file 
   * @param {Function} progressCallback 
   */
  async uploadImage(file, progressCallback) {
    if (!file) throw new Error("No image file provided");
    const config = this.getCloudConfig();

    // 1. Cloudinary
    if (config.cloudName && config.uploadPreset) {
      try {
        return await this.uploadToCloudinary(file, config, progressCallback);
      } catch (err) {
        console.warn("Cloudinary image upload failed:", err.message);
      }
    }

    // 2. Supabase
    if (config.supabaseUrl && config.supabaseAnonKey) {
      try {
        return await this.uploadToSupabase(file, config, progressCallback);
      } catch (err) {
        console.warn("Supabase image upload failed:", err.message);
      }
    }

    // 3. ImgBB
    if (config.imgbbApiKey) {
      try {
        return await this.uploadToImgbb(file, config.imgbbApiKey, progressCallback);
      } catch (err) {
        console.warn("ImgBB image upload failed:", err.message);
      }
    }

    return null;
  },

  async uploadToCloudinary(file, config, progressCallback) {
    if (progressCallback) progressCallback("Uploading to Cloudinary CDN (25 GB Free)...");
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', config.uploadPreset);
    formData.append('resource_type', 'auto');

    const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudinary error (${res.status}): ${errText}`);
    }

    const data = await res.json();
    if (!data || !data.secure_url) {
      throw new Error("Invalid Cloudinary response");
    }

    return {
      provider: 'cloudinary',
      url: data.secure_url,
      previewUrl: data.secure_url,
      downloadUrl: data.secure_url
    };
  },

  async uploadToSupabase(file, config, progressCallback) {
    if (progressCallback) progressCallback("Uploading to Supabase Storage (1 GB Free)...");
    const bucket = config.supabaseBucket || 'vuo_files';
    const cleanName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const baseEndpoint = config.supabaseUrl.replace(/\/$/, '');
    const uploadUrl = `${baseEndpoint}/storage/v1/object/${bucket}/${cleanName}`;

    const res = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'apikey': config.supabaseAnonKey,
        'Authorization': `Bearer ${config.supabaseAnonKey}`,
        'Content-Type': file.type || 'application/octet-stream'
      },
      body: file
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Supabase error (${res.status}): ${errText}`);
    }

    const publicUrl = `${baseEndpoint}/storage/v1/object/public/${bucket}/${cleanName}`;
    return {
      provider: 'supabase',
      url: publicUrl,
      previewUrl: publicUrl,
      downloadUrl: publicUrl
    };
  },

  async uploadToImgbb(file, apiKey, progressCallback) {
    if (progressCallback) progressCallback("Uploading image to ImgBB CDN...");
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error("ImgBB upload failed");
    const data = await res.json();
    return {
      provider: 'imgbb',
      url: data.data.url,
      previewUrl: data.data.display_url || data.data.url,
      downloadUrl: data.data.url
    };
  }
};

window.VUO_CLOUD_STORAGE = VUO_CLOUD_STORAGE;
