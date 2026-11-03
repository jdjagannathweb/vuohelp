import re
import shutil

# 1. Read affidavit.js and normalize blank lines
path = r'C:\Users\Jagannath\.gemini\antigravity\scratch\vuohelp\affidavit.js'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Collapse multiple consecutive empty lines to standard 1 or 2 empty lines
text = re.sub(r'\r\n', '\n', text)
text = re.sub(r'\n{3,}', '\n\n', text)

# 2. Update updateVisibleFields
old_update_visible = '''    if (this.template === 'income') {
      document.getElementById('affSection_Income')?.classList.remove('hidden');
    } else if (this.template === 'resident') {
      document.getElementById('affSection_Resident')?.classList.remove('hidden');
    } else if (this.template.startsWith('caste')) {
      document.getElementById('affSection_Caste')?.classList.remove('hidden');
    } else if (this.template === 'name_correction') {'''

new_update_visible = '''    if (this.template === 'income') {
      document.getElementById('affSection_Income')?.classList.remove('hidden');
    } else if (this.template === 'resident') {
      document.getElementById('affSection_Resident')?.classList.remove('hidden');
    } else if (this.template.startsWith('caste')) {
      document.getElementById('affSection_Caste')?.classList.remove('hidden');
      const catEl = document.getElementById('affCasteCategory');
      const subEl = document.getElementById('affSubCaste');
      const badgeEl = document.getElementById('affCasteBadge');

      if (this.template === 'caste_sc') {
        if (catEl) catEl.value = 'Scheduled Caste (SC)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || subEl.value === 'Kandha' || !subEl.value)) subEl.value = 'Dhoba';
        if (badgeEl) badgeEl.textContent = 'SC (ଅନୁସୂଚିତ ଜାତି)';
      } else if (this.template === 'caste_st') {
        if (catEl) catEl.value = 'Scheduled Tribe (ST)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || subEl.value === 'Dhoba' || !subEl.value)) subEl.value = 'Kandha';
        if (badgeEl) badgeEl.textContent = 'ST (ଅନୁସୂଚିତ ଜନଜାତି)';
      } else if (this.template === 'caste_scst') {
        if (catEl && !catEl.value.includes('SC') && !catEl.value.includes('ST')) catEl.value = 'Scheduled Caste (SC)';
        if (subEl && (subEl.value === 'Chasa / Khandayat' || !subEl.value)) subEl.value = 'Dhoba';
        if (badgeEl) badgeEl.textContent = 'SC / ST (ତଫସିଲଭୁକ୍ତ ଜାତି/ଜନଜାତି)';
      } else if (this.template === 'caste_sebc') {
        if (catEl) catEl.value = 'SEBC';
        if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Kandha' || !subEl.value)) subEl.value = 'Chasa / Khandayat';
        if (badgeEl) badgeEl.textContent = 'SEBC / OBC (ପଛୁଆ ବର୍ଗ)';
      }
    } else if (this.template === 'name_correction') {'''

assert old_update_visible in text, 'old_update_visible not found'
text = text.replace(old_update_visible, new_update_visible)

# 3. Update bindEvents to listen to affCasteCategory change
old_bind_input = """          if (id === 'affTemplate') {
            this.template = el.value;
            this.updateVisibleFields();
          } else if (id === 'affLanguage') {
            this.language = el.value;
          } else if (id === 'affPaperMode') {
            this.paperMode = el.value;
          }
          this.renderPreview();"""

new_bind_input = """          if (id === 'affTemplate') {
            this.template = el.value;
            this.updateVisibleFields();
          } else if (id === 'affLanguage') {
            this.language = el.value;
          } else if (id === 'affPaperMode') {
            this.paperMode = el.value;
          } else if (id === 'affCasteCategory') {
            const subEl = document.getElementById('affSubCaste');
            const val = el.value || '';
            if (val.includes('ST')) {
              if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Chasa / Khandayat')) subEl.value = 'Kandha';
            } else if (val.includes('SC')) {
              if (subEl && (subEl.value === 'Kandha' || subEl.value === 'Chasa / Khandayat')) subEl.value = 'Dhoba';
            } else if (val.includes('SEBC') || val.includes('OBC')) {
              if (subEl && (subEl.value === 'Dhoba' || subEl.value === 'Kandha')) subEl.value = 'Chasa / Khandayat';
            }
          }
          this.renderPreview();"""

assert old_bind_input in text, 'old_bind_input not found'
text = text.replace(old_bind_input, new_bind_input)

# 4. Update getFormData for casteCategory and subCaste
old_get_form = """      casteCategory: g('affCasteCategory') || 'SEBC',
      subCaste: g('affSubCaste') || 'Chasa / Khandayat',"""

new_get_form = """      casteCategory: g('affCasteCategory') || (this.template.includes('st') ? 'Scheduled Tribe (ST)' : (this.template.includes('sc') ? 'Scheduled Caste (SC)' : 'SEBC')),
      subCaste: g('affSubCaste') || (this.template.includes('st') ? 'Kandha' : (this.template.includes('sc') ? 'Dhoba' : 'Chasa / Khandayat')),"""

assert old_get_form in text, 'old_get_form not found'
text = text.replace(old_get_form, new_get_form)

# 5. Update renderPreview template switching
old_render_caste = """    } else if (this.template.startsWith('caste')) {
      contentHtml = isOdia ? this.renderOdiaCaste(d) : this.renderEnglishCaste(d);"""

new_render_caste = """    } else if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      contentHtml = isOdia ? this.renderOdiaScSt(d) : this.renderEnglishScSt(d);
    } else if (this.template === 'caste_sebc' || this.template.startsWith('caste')) {
      contentHtml = isOdia ? this.renderOdiaSebc(d) : this.renderEnglishSebc(d);"""

assert old_render_caste in text, 'old_render_caste not found'
text = text.replace(old_render_caste, new_render_caste)

# 6. Add renderOdiaScSt, renderEnglishScSt, renderOdiaSebc, renderEnglishSebc
# and replace renderOdiaCaste and renderEnglishCaste
caste_funcs = '''  // ================= 3. SC / ST CASTE VERIFICATION AFFIDAVIT ================= //
  renderOdiaScSt(d) {
    const isST = this.template === 'caste_st' || (d.casteCategory && d.casteCategory.includes('ST'));
    const categoryName = isST ? 'ଅନୁସୂଚିତ ଜନଜାତି (Scheduled Tribe - ST)' : 'ଅନୁସୂଚିତ ଜାତି (Scheduled Caste - SC)';
    const constitutionOrder = isST 
      ? 'ଭାରତ ସମ୍ବିଧାନ (ଅନୁସୂଚିତ ଜନଜାତି) ଆଦେଶ, ୧୯୫୦' 
      : 'ଭାରତ ସମ୍ବିଧାନ (ଅନୁସୂଚିତ ଜାତି) ଆଦେଶ, ୧୯୫୦';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ଶପଥ ପତ୍ର / ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(${categoryName} ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ${this.escapeHtml(d.relation === 'Son of' ? 'ପୁତ୍ର' : (d.relation === 'Daughter of' ? 'କନ୍ୟା' : 'ପତ୍ନୀ'))}: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ । ଏତଦ୍ୱାରା ଶପଥପୂର୍ବକ ସତ୍ୟର ସହିତ ଘୋଷଣା କରୁଅଛି ଯେ:
        </p>

        <p class="font-bold">ଶପଥ ବିବରଣୀ ନିମ୍ନ ପ୍ରକାରେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ <strong>${this.escapeHtml(d.subCaste || (isST ? 'କନ୍ଧ' : 'ଧୋବା'))}</strong> ଜାତି / ଉପଜାତିର ଅଟେ, ଯାହା <strong>${constitutionOrder}</strong> ଏବଂ ଓଡ଼ିଶା ସରକାରଙ୍କ ବିଜ୍ଞପ୍ତି ଅନୁଯାୟୀ ଓଡ଼ିଶା ରାଜ୍ୟରେ <strong>${categoryName}</strong> ଭାବେ ଆଇନଗତ ସ୍ୱୀକୃତ ।
          </li>
          <li>
            ମୁଁ କିମ୍ବା ମୋର ପୂର୍ବପୁରୁଷ କେବେହେଲେ ଧର୍ମାନ୍ତରିତ ହୋଇନାହାନ୍ତି କିମ୍ବା ଅନ୍ୟ କୌଣସି ଧର୍ମ ଗ୍ରହଣ କରିନାହାନ୍ତି । ମୁଁ ଜନ୍ମସୂତ୍ରେ ମୋର ମୂଳ ଜାତି ଓ ଧର୍ମ ପାଳନ କରିଆସୁଅଛି ।
          </li>
          <li>
            ମୋର ପରିବାର ୧୯୫୦ ମସିହା ପୂର୍ବରୁ ଓଡ଼ିଶା ରାଜ୍ୟରେ ସ୍ଥାୟୀ ଭାବେ ବସବାସ କରିଆସୁଅଛନ୍ତି ଏବଂ ଆମ୍ଭେ ଓଡ଼ିଶାର ମୂଳ ଅଧିବାସୀ ଅଟୁ ।
          </li>
          <li>
            ମୋତେ କିମ୍ବା ମୋ ପରିବାରର କୌଣସି ସଦସ୍ୟଙ୍କୁ ଅନ୍ୟ କୌଣସି ତହସିଲ, ଜିଲ୍ଲା କିମ୍ବା ଅନ୍ୟ ରାଜ୍ୟରୁ SC/ST ପ୍ରମାଣପତ୍ର ପ୍ରଦାନ କରାଯାଇ ନାହିଁ କିମ୍ବା ମୁଁ କେବେହେଲେ ଅନ୍ୟତ୍ର ଦାବି କରିନାହିଁ ।
          </li>
          <li>
            ଉପରୋକ୍ତ ସମସ୍ତ ତଥ୍ୟ ମୋର ଜ୍ଞାନ ଓ ବିଶ୍ୱାସ ମତେ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ । ଯଦି ଭବିଷ୍ୟତରେ ଏହା ମିଥ୍ୟା କିମ୍ବା ଜାଲ ପ୍ରମାଣିତ ହୁଏ, ତେବେ ଭାରତୀୟ ଆଇନ (BNS / IPC) ଏବଂ SC/ST ଆଇନ ଅନୁଯାୟୀ ମୋ ବିରୁଦ୍ଧରେ ଫୌଜଦାରୀ ମୋକଦ୍ଦମା ହେବ ଏବଂ ପ୍ରମାଣପତ୍ର ରଦ୍ଦ କରାଯିବ ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishScSt(d) {
    const isST = this.template === 'caste_st' || (d.casteCategory && d.casteCategory.includes('ST'));
    const categoryName = isST ? 'Scheduled Tribe (ST)' : 'Scheduled Caste (SC)';
    const constitutionOrder = isST 
      ? 'The Constitution (Scheduled Tribes) Order, 1950' 
      : 'The Constitution (Scheduled Castes) Order, 1950';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Affidavit / Sworn Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of ${categoryName} Certificate - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly affirm and state on oath as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I belong to the <strong>${this.escapeHtml(d.subCaste || (isST ? 'Kandha' : 'Dhoba'))}</strong> community / sub-caste, which is officially notified and recognized as <strong>${categoryName}</strong> in the State of Odisha under <strong>${constitutionOrder}</strong> (as amended from time to time).
          </li>
          <li>
            That neither myself nor my parents / ancestors have ever renounced our original faith or converted to any other religion.
          </li>
          <li>
            That my family has been continuously and permanently residing in the State of Odisha prior to the year 1950, and we are original permanent residents of Odisha.
          </li>
          <li>
            That neither I nor any member of my family has obtained a Caste Certificate from any other Tahasil, District, or State.
          </li>
          <li>
            That the statements made above are true and correct to the best of my knowledge, information, and belief. If any information is found false or fabricated, I shall be liable for criminal prosecution under applicable laws and the certificate issued shall be cancelled.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  // ================= 4. SEBC / OBC CASTE DECLARATION ================= //
  renderOdiaSebc(d) {
    const isObc = d.casteCategory && d.casteCategory.includes('OBC');
    const catTitle = isObc ? 'OBC (Other Backward Classes)' : 'SEBC (ପଛୁଆ ବର୍ଗ)';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide" style="text-align: center !important; margin: 0 auto;">ସ୍ୱୟଂ ଘୋଷଣାନାମା</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(${catTitle} ଜାତି ପ୍ରମାଣ ପତ୍ର ପ୍ରଦାନ ନିମନ୍ତେ - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          ମୁଁ <strong>${this.escapeHtml(d.name)}</strong>, ବୟସ ପ୍ରାୟ <strong>${this.escapeHtml(d.age)}</strong> ବର୍ଷ, 
          ପିତା/ସ୍ୱାମୀ: <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          ସାକିନ: <strong>${this.escapeHtml(d.village)}</strong>, 
          ପୋଷ୍ଟ: <strong>${this.escapeHtml(d.post)}</strong>, 
          ଥାନା: <strong>${this.escapeHtml(d.ps)}</strong>, 
          ତହସିଲ: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          ଜିଲ୍ଲା: <strong>${this.escapeHtml(d.district)}</strong>, ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟେ । ଏତଦ୍ୱାରା ସତ୍ୟର ସହିତ ଘୋଷଣା କରୁଅଛି ଯେ:
        </p>

        <p class="font-bold">ଘୋଷଣା ବିବରଣୀ ନିମ୍ନ ପ୍ରକାରେ:</p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            ମୁଁ <strong>${this.escapeHtml(d.subCaste || 'ଚାଷା / ଖଣ୍ଡାୟତ')}</strong> ଜାତିଭୁକ୍ତ ଅଟେ, ଯାହା ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା <strong>${this.escapeHtml(d.casteCategory || 'SEBC')}</strong> (Socially and Educationally Backward Class) ଶ୍ରେଣୀଭୁକ୍ତ ଭାବେ ଆଇନଗତ ସ୍ୱୀକୃତ ।
          </li>
          <li>
            ମୁଁ କିମ୍ବା ମୋର ପରିବାର ଭାରତ ସରକାର କିମ୍ବା ଓଡ଼ିଶା ସରକାରଙ୍କ ଦ୍ୱାରା ନିର୍ଦ୍ଧାରିତ କ୍ରିମିଲେୟାର (Creamy Layer) ଅନ୍ତର୍ଭୁକ୍ତ ନୁହଁନ୍ତି ।
          </li>
          <li>
            ଆମ୍ଭ ପରିବାରର ସମସ୍ତ ସୂତ୍ରରୁ ବାର୍ଷିକ ସମୁଦାୟ ଆୟ କ୍ରିମିଲେୟାର ସୀମା (୮ ଲକ୍ଷ ଟଙ୍କା) ରୁ କମ୍ ଅଟେ ।
          </li>
          <li>
            ମୋର ପରିବାର ଓଡ଼ିଶା ରାଜ୍ୟରେ ସ୍ଥାୟୀ ଭାବେ ବସବାସ କରିଆସୁଅଛନ୍ତି ଏବଂ ଆମ୍ଭେ ଓଡ଼ିଶାର ସ୍ଥାୟୀ ବାସିନ୍ଦା ଅଟୁ ।
          </li>
          <li>
            ଉପରୋକ୍ତ ସମସ୍ତ ତଥ୍ୟ ସମ୍ପୂର୍ଣ୍ଣ ସତ୍ୟ ଅଟେ । ଯଦି ଭବିଷ୍ୟତରେ ଏହା ମିଥ୍ୟା ପ୍ରମାଣିତ ହୁଏ, ତେବେ ସରକାରଙ୍କ ଆଇନ ଅନୁଯାୟୀ ମୁଁ ଦାୟୀ ରହିବି ।
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>ତାରିଖ:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>ସ୍ଥାନ:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              ଘୋଷଣାକାରୀଙ୍କ ସ୍ୱାକ୍ଷର / ଟିପ ଚିହ୍ନ
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderEnglishSebc(d) {
    const isObc = d.casteCategory && d.casteCategory.includes('OBC');
    const catTitle = isObc ? 'OBC (Other Backward Classes)' : 'SEBC (Socially and Educationally Backward Classes)';

    return `
      <div class="text-center pb-4 mb-4 border-b-2 border-slate-800" style="text-align: center !important;">
        <h2 class="text-base sm:text-lg font-black tracking-wide uppercase" style="text-align: center !important; margin: 0 auto;">Self Declaration</h2>
        <h3 class="text-xs sm:text-sm font-bold text-slate-700 mt-0.5" style="text-align: center !important; margin: 0 auto;">(For Issue of ${catTitle} Certificate - e-District Odisha)</h3>
      </div>

      <div class="space-y-3.5 text-xs sm:text-sm text-justify">
        <p>
          I, <strong>${this.escapeHtml(d.name)}</strong>, aged about <strong>${this.escapeHtml(d.age)}</strong> years, 
          ${this.escapeHtml(d.relation)} <strong>${this.escapeHtml(d.fatherName)}</strong>, 
          permanent resident of Village/Town: <strong>${this.escapeHtml(d.village)}</strong>, 
          PO: <strong>${this.escapeHtml(d.post)}</strong>, 
          PS: <strong>${this.escapeHtml(d.ps)}</strong>, 
          Tahasil: <strong>${this.escapeHtml(d.tahasil)}</strong>, 
          District: <strong>${this.escapeHtml(d.district)}</strong>, State: <strong>Odisha</strong>, do hereby solemnly declare as follows:
        </p>

        <ol class="list-decimal pl-6 space-y-2">
          <li>
            That I belong to the <strong>${this.escapeHtml(d.subCaste || 'Chasa / Khandayat')}</strong> community / sub-caste, which is officially recognized as <strong>${this.escapeHtml(d.casteCategory || 'SEBC')}</strong> by the Government of Odisha.
          </li>
          <li>
            That I do not belong to the Creamy Layer section as defined by the Government of India / Government of Odisha.
          </li>
          <li>
            That the total annual income of my family from all sources is within the non-creamy layer prescribed ceiling.
          </li>
          <li>
            That I am a permanent bona fide resident of the State of Odisha.
          </li>
          <li>
            That the facts stated in this declaration are true and correct to the best of my knowledge, and nothing material has been concealed.
          </li>
        </ol>

        <div class="pt-8 flex justify-between items-end" style="display: flex !important; justify-content: space-between !important; align-items: flex-end !important;">
          <div class="text-[11px] font-sans">
            <div><strong>Date:</strong> ${new Date().toLocaleDateString('en-GB')}</div>
            <div><strong>Place:</strong> ${this.escapeHtml(d.tahasil)}, ${this.escapeHtml(d.district)}</div>
          </div>
          <div class="text-center font-sans">
            <div class="h-10"></div>
            <div class="border-t border-slate-700 pt-1 text-xs font-bold">
              Signature / LTI of Deponent
            </div>
            <div class="text-[10px] text-slate-500">(${this.escapeHtml(d.name)})</div>
          </div>
        </div>
      </div>
    `;
  },

  renderOdiaCaste(d) {
    if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      return this.renderOdiaScSt(d);
    }
    return this.renderOdiaSebc(d);
  },

  renderEnglishCaste(d) {
    if (this.template === 'caste_sc' || this.template === 'caste_st' || this.template === 'caste_scst') {
      return this.renderEnglishScSt(d);
    }
    return this.renderEnglishSebc(d);
  },'''

# Replace old renderOdiaCaste & renderEnglishCaste
idx_caste_start = text.find('  renderOdiaCaste(d) {')
idx_caste_end = text.find('  renderOdiaNameCorrection(d) {')
assert idx_caste_start != -1 and idx_caste_end != -1 and idx_caste_start < idx_caste_end, 'renderOdiaCaste/NameCorrection not found'

text = text[:idx_caste_start] + caste_funcs + '\n\n' + text[idx_caste_end:]

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

shutil.copyfile(path, r'C:\Users\Jagannath\.gemini\antigravity\scratch\vuohelp\js\affidavit.js')
print('Successfully updated affidavit.js and js/affidavit.js!')
