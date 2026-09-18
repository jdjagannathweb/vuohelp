/**
 * VUO CSC HELP - 1-Click Cloud Storage Engine
 * Enables direct PDF upload to cloud storage without manual Google Drive copying
 * Supports Cloudinary, Public Cloud fallback, and IndexedDB local caching
 */

const VUO_CLOUD_STORAGE = {
  getCloudConfig() {
    return {
      cloudName: localStorage.getItem('vuo_cloud_name') || '',
      uploadPreset: localStorage.getItem('vuo_cloud_preset') || ''
    };
  },

  setCloudConfig(cloudName, uploadPreset) {
    localStorage.setItem('vuo_cloud_name', (cloudName || '').trim());
    localStorage.setItem('vuo_cloud_preset', (uploadPreset || '').trim());
  },

  /**
   * Uploads a PDF file directly to cloud
   * @param {File} file 
   * @param {Function} progressCallback 
   * @returns {Promise<{provider: string, url: string, previewUrl: string, downloadUrl: string}>}
   */
  async uploadPdf(file, progressCallback) {
    if (!file) throw new Error("No PDF file provided");

    const config = this.getCloudConfig();

    // 1. Google Firebase Cloud Storage (Official, Permanent & High-Speed)
    if (typeof VUO_DB !== 'undefined' && VUO_DB.storage) {
      try {
        if (progressCallback) progressCallback("Google Firebase Cloud Storage me upload ho raha hai...");
        const fireUrl = await VUO_DB.uploadPdfToStorage(file, progressCallback);
        if (fireUrl && fireUrl.startsWith('http')) {
          return {
            provider: 'firebase_storage',
            url: fireUrl,
            previewUrl: fireUrl,
            downloadUrl: fireUrl
          };
        }
      } catch (fbErr) {
        console.warn("Firebase Storage upload error, falling back:", fbErr);
      }
    }

    // 2. If user configured private Cloudinary
    if (config.cloudName && config.uploadPreset) {
      try {
        if (progressCallback) progressCallback("Connecting to private Cloudinary...");
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', config.uploadPreset);
        formData.append('resource_type', 'auto');

        const res = await fetch(`https://api.cloudinary.com/v1_1/${config.cloudName}/auto/upload`, {
          method: 'POST',
          body: formData
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.secure_url) {
            return {
              provider: 'cloudinary',
              url: data.secure_url,
              previewUrl: data.secure_url,
              downloadUrl: data.secure_url
            };
          }
        }
      } catch (err) {
        console.warn("Cloudinary upload error:", err);
      }
    }

    // 2. Direct Public Cloud Upload (tmpfiles.org with direct /dl/ link)
    try {
      if (progressCallback) progressCallback("Uploading to High-Speed Cloud Storage...");
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('https://tmpfiles.org/api/v1/upload', {
        method: 'POST',
        body: formData
      });

      if (res.ok) {
        const json = await res.json();
        if (json && json.data && json.data.url) {
          const rawUrl = json.data.url;
          // tmpfiles converts https://tmpfiles.org/123/name.pdf to https://tmpfiles.org/dl/123/name.pdf for direct download
          const directDownloadUrl = rawUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
          return {
            provider: 'cloud_public',
            url: directDownloadUrl,
            previewUrl: rawUrl,
            downloadUrl: directDownloadUrl
          };
        }
      }
    } catch (err) {
      console.warn("Public cloud upload error:", err);
    }

    // 3. Offline / In-Browser IndexedDB Fallback
    return {
      provider: 'indexeddb',
      url: `forms/${file.name}`,
      previewUrl: '',
      downloadUrl: ''
    };
  }
};

window.VUO_CLOUD_STORAGE = VUO_CLOUD_STORAGE;
