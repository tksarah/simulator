// シンプルなステート管理
const state = {
  steps: [],
  disk: null,
  software: null,
  user: null,
};

function show(id){
  document.querySelectorAll('.screen').forEach(s=>s.classList.add('hidden'));
  document.getElementById(id).classList.remove('hidden');
  setActiveSidebar(id);
}

// Boot menu keyboard navigation & countdown
let bootIndex = 0;
let bootTimer = null;
let bootCountdown = 60;
let bootKeyHandler = null;

function startBootCountdown(){
  const items = Array.from(document.querySelectorAll('.boot-item'));
  if(!items.length) return;
  bootIndex = 0;
  updateBootSelection();
  document.getElementById('countdown').textContent = bootCountdown;
  clearBootTimer();
  bootTimer = setInterval(()=>{
    bootCountdown--;
    if(document.getElementById('countdown')) document.getElementById('countdown').textContent = bootCountdown;
    if(bootCountdown <= 0){
      clearBootTimer();
      applyBootChoice();
    }
  }, 1000);

  // keyboard
  bootKeyHandler = (e)=>{
    if(!document.getElementById('boot') || document.getElementById('boot').classList.contains('hidden')) return;
    const max = items.length - 1;
    if(e.key === 'ArrowDown'){
      e.preventDefault(); bootIndex = Math.min(max, bootIndex + 1); updateBootSelection();
    } else if(e.key === 'ArrowUp'){
      e.preventDefault(); bootIndex = Math.max(0, bootIndex - 1); updateBootSelection();
    } else if(e.key === 'Enter'){
      e.preventDefault(); applyBootChoice();
    }
  };
  window.addEventListener('keydown', bootKeyHandler);
}

function clearBootTimer(){
  if(bootTimer){ clearInterval(bootTimer); bootTimer = null; }
  if(bootKeyHandler){ window.removeEventListener('keydown', bootKeyHandler); bootKeyHandler = null; }
  bootCountdown = 60;
}

function updateBootSelection(){
  const items = Array.from(document.querySelectorAll('.boot-item'));
  items.forEach((it,i)=>{
    it.classList.toggle('selected', i === bootIndex);
  });
}

function applyBootChoice(){
  const items = Array.from(document.querySelectorAll('.boot-item'));
  const chosen = items[bootIndex] && items[bootIndex].getAttribute('data-value');
  clearBootTimer();
  if(chosen === 'install'){
    state.bootChoice = 'install';
    recordStep('boot_menu');
    show('language');
  } else if(chosen === 'test'){
    state.bootChoice = 'test';
    recordStep('boot_menu_test');
    alert('メディア検査をシミュレートします（テスト完了後、インストールへ進みます）');
    show('language');
  } else if(chosen === 'trouble'){
    state.bootChoice = 'trouble';
    recordStep('boot_menu_trouble');
    alert('Troubleshooting モードを選択しました（学習用のため詳細は省略します）');
    // stay on boot screen so student can choose another option
    startBootCountdown();
  } else {
    // default fallback
    state.bootChoice = 'install';
    recordStep('boot_menu');
    show('language');
  }
}

function setActiveSidebar(screenId){
  document.querySelectorAll('.step-item').forEach(el=>{
    el.classList.remove('active');
    // mark completed if applicable
    const sc = el.getAttribute('data-screen');
    if(state.steps.includes(sc+'_completed') || state.steps.includes(sc) ){
      el.classList.add('completed');
    }
  });
  const active = document.querySelector(`.step-item[data-screen="${screenId}"]`);
  if(active) active.classList.add('active');
}

function recordStep(step){
  if(!state.steps.includes(step)) state.steps.push(step);
  // update sidebar completion marker for some logical steps
  if(step === 'install_complete'){
    const el = document.querySelector('.step-item[data-screen="progress"]');
    if(el) el.classList.add('completed');
  }
}

// Start
document.getElementById('insertMedia').addEventListener('click',()=>{
  recordStep('media_inserted');
  show('boot');
  // start boot countdown when entering boot screen
  startBootCountdown();
});

// Boot: optional button removed in UI — attach handler only if element exists
const selectInstallBtn = document.getElementById('selectInstall');
if(selectInstallBtn){
  selectInstallBtn.addEventListener('click',()=>{
    applyBootChoice();
  });
}

// Language
document.getElementById('confirmLang').addEventListener('click',()=>{
  recordStep('language_select');
  show('summary');
  updateSummary();
});

// Language list population & selection (improved UI)
const languages = [
  {code:'ja', name:'日本語', en:'Japanese', region:'日本'},
  {code:'ar', name:'العربية', en:'Arabic'},
  {code:'en', name:'English', en:'English'},
  {code:'fr', name:'Français', en:'French'},
  {code:'de', name:'Deutsch', en:'German'},
  {code:'zh', name:'中文', en:'Mandarin Chinese'},
  {code:'ru', name:'Русский', en:'Russian'},
  {code:'es', name:'Español', en:'Spanish'},
  {code:'af', name:'Afrikaans', en:'Afrikaans'},
  {code:'am', name:'አማርኛ', en:'Amharic'}
];

function populateLanguageList(){
  const list = document.getElementById('languageList');
  if(!list) return;
  list.innerHTML = '';
  languages.forEach((l,i)=>{
    const li = document.createElement('li');
    li.className = 'lang-item';
    li.setAttribute('data-code', l.code);
    if(l.code === 'ja') li.classList.add('selected');
    li.innerHTML = `<span class="native">${l.name}</span><span class="en">${l.en}</span>`;
    li.addEventListener('click', ()=> selectLanguage(l));
    list.appendChild(li);
  });
  // select default (Japanese)
  selectLanguage(languages.find(x=>x.code==='ja') || languages[0]);
}



function selectLanguage(lang){
  document.querySelectorAll('.lang-item').forEach(el=>el.classList.remove('selected'));
  const el = document.querySelector(`.lang-item[data-code="${lang.code}"]`);
  if(el) el.classList.add('selected');
  const detail = document.getElementById('langDetail');
  if(detail){
    detail.innerHTML = `<div class="lang-header">${lang.name}${lang.region? ' ('+lang.region+')' : ''}</div><div class="lang-body">${lang.en? `<p>${lang.en}</p>` : ''}</div>`;
  }
  state.language = lang.code;
}

// Summary flow
function updateSummary(){
  // update new settings overview status indicators
  const sd = document.getElementById('s-disk');
  const ss = document.getElementById('s-software');
  const su = document.getElementById('s-user');
  // show detailed subtext only when set; otherwise leave blank under title
  const softwareSub = document.querySelector('#link-software .setting-sub');
  const diskSub = document.querySelector('#link-disk .setting-sub');
  const userSub = document.querySelector('#link-user .setting-sub');
  if(sd){
    sd.classList.toggle('status-ok', !!state.disk);
    sd.classList.toggle('status-missing', !state.disk);
    // set textual status label on right side
    sd.textContent = state.disk ? '設定済' : '未設定';
    if(diskSub) diskSub.textContent = state.disk ? (getDiskDisplay(state.disk)) : '';
  }
  if(ss){
    const softwareOk = !!(state.software && state.software.base);
    ss.classList.toggle('status-ok', softwareOk);
    ss.classList.toggle('status-missing', !softwareOk);
    ss.textContent = softwareOk ? '設定済' : '未設定';
    if(softwareSub) softwareSub.textContent = softwareOk ? 'サーバー（GUI 使用）' : '';
  }
  if(su){
    su.classList.toggle('status-ok', !!state.user);
    su.classList.toggle('status-missing', !state.user);
    su.textContent = state.user ? '設定済' : '未設定';
    if(userSub) userSub.textContent = state.user ? (state.user.username || '') : '';
  }
  const startBtn = document.getElementById('startInstall');
  if(startBtn) startBtn.disabled = !(state.disk && state.software && state.user);
}

function getDiskDisplay(diskVal){
  // simple mapping for demo; extend if more devices exist
  if(diskVal === 'sda') return '/dev/sda (ATA VBOX HARDDISK)';
  if(diskVal === 'sdb') return '/dev/sdb (ATA VBOX HARDDISK)';
  return diskVal;
}

// clickable links from settings overview
const linkDisk = document.getElementById('link-disk');
if(linkDisk) linkDisk.addEventListener('click', ()=> show('disk'));
const linkSoftware = document.getElementById('link-software');
if(linkSoftware) linkSoftware.addEventListener('click', ()=> show('software'));
const linkUser = document.getElementById('link-user');
if(linkUser) linkUser.addEventListener('click', ()=> show('user'));

const toDisk = document.getElementById('toDisk');
if(toDisk) toDisk.addEventListener('click',()=>{ show('disk'); });

// Disk
document.getElementById('confirmDisk').addEventListener('click',()=>{
  const sel = document.querySelector('input[name=disk]:checked');
  if(!sel) return alert('ディスクを選択してください');
  // If the user selected the 10 GiB device (value sdb), show insufficient space error
  if(sel.value === 'sdb'){
    alert('インストールするための容量が足りません');
    return;
  }
  state.disk = sel.value;
  recordStep('disk_select');
  show('summary');
  updateSummary();
});

// Software
document.getElementById('confirmSoftware').addEventListener('click',()=>{
  // read selected enabled software choices
  const baseChecked = document.getElementById('base_server_gui') && document.getElementById('base_server_gui').checked;
  const extraChecked = document.getElementById('extra_basic_web') && document.getElementById('extra_basic_web').checked;
  // Require BOTH Server (GUI) and Basic Web selected before completing
  if(!(baseChecked && extraChecked)){
    return alert('「サーバー（GUI 使用）」と「ベーシック Web サーバー」の両方を選択してください');
  }
  state.software = { base: 'server-gui', extra: 'basic-web' };
  recordStep('software_select');
  show('summary');
  updateSummary();
});

// Ensure the confirm button is only enabled when both required checkboxes are checked
function updateSoftwareConfirmState(){
  const base = document.getElementById('base_server_gui') && document.getElementById('base_server_gui').checked;
  const extra = document.getElementById('extra_basic_web') && document.getElementById('extra_basic_web').checked;
  const btn = document.getElementById('confirmSoftware');
  if(btn) btn.disabled = !(base && extra);
}

const swBase = document.getElementById('base_server_gui');
const swExtra = document.getElementById('extra_basic_web');
if(swBase) swBase.addEventListener('change', updateSoftwareConfirmState);
if(swExtra) swExtra.addEventListener('change', updateSoftwareConfirmState);
// initialize state on load
updateSoftwareConfirmState();

// User create validation
function validateUser(){
  const username = document.getElementById('username').value.trim();
  const pw = document.getElementById('password').value;
  const pw2 = document.getElementById('password2').value;
  const errors = [];
  if(!username) errors.push('ユーザー名は必須です');
  if(pw.length < 8) errors.push('パスワードは8文字以上必要です');
  if(!(/[A-Za-z]/.test(pw) && /[0-9]/.test(pw))) errors.push('パスワードは英字と数字を含めてください');
  if(/(.)\1\1/.test(pw)) errors.push('同一文字の連続は禁止です');
  if(pw.includes(username)) errors.push('パスワードにユーザー名を含めないでください');
  if(pw !== pw2) errors.push('確認用パスワードと一致しません');
  return errors;
}

document.getElementById('confirmUser').addEventListener('click',()=>{
  const errs = validateUser();
  const errDiv = document.getElementById('userErrors');
  errDiv.innerHTML = '';
  if(errs.length){ errDiv.innerHTML = errs.join('<br>'); return; }
  const uname = document.getElementById('username').value.trim();
  const pw = document.getElementById('password').value;
  // store user (without revealing password in state.user) and persist credentials for demo
  state.user = { fullname: document.getElementById('fullname').value.trim(), username: uname, isAdmin: document.getElementById('isAdmin').checked };
  try{
    localStorage.setItem('installer_user', JSON.stringify({ username: uname, password: pw }));
    // keep runtime-only copy of installer password so login works immediately
    state._installerPassword = pw;
  }catch(e){ }
  recordStep('user_create');
  show('summary');
  updateSummary();
});

// Start install
document.getElementById('startInstall').addEventListener('click',()=>{
  recordStep('install_summary');
  show('progress');
  startFakeInstall();
});

// Fake install
function startFakeInstall(){
  // 詳細カテゴリごとのメッセージ群（ユーザー指定の語尾パターンに合わせて揃えている）
  const messagesByCategory = [
    // 基本進行（汎用）
    [
      'インストール環境を準備しています',
      'システム設定を適用しています',
      '変更を保存しています',
      '処理を完了しています',
      '操作を実行しています'
    ],
    // ストレージ・ファイルシステム
    [
      'ディスクを検出しています',
      'パーティションを作成しています',
      'ファイルシステムを作成しています',
      'マウントポイントを設定しています',
      'データをコピーしています',
      'データ整合性を検証しています'
    ],
    // パッケージ・依存関係
    [
      'パッケージデータベースを更新しています',
      '依存関係を解決しています',
      'パッケージをインストールしています',
      'パッケージをアップグレードしています',
      '不要なパッケージを削除しています',
      'パッケージ署名を検証しています'
    ],
    // ネットワーク・ミラー
    [
      'ネットワーク接続を初期化しています',
      '最適なミラーを選択しています',
      'リポジトリに接続しています',
      'パッケージをダウンロードしています',
      'ダウンロードを検証しています'
    ],
    // ユーザー・セキュリティ
    [
      'タイムゾーンを設定しています',
      'ロケールを設定しています',
      'ホスト名を設定しています',
      'ユーザーアカウントを作成しています',
      'root パスワードを設定しています',
      'SSH 鍵を生成しています',
      'ファイアウォールルールを適用しています',
      '権限を設定しています'
    ],
    // ブート・システム
    [
      'ブートローダをインストールしています',
      'initramfs を生成しています',
      'サービスを有効化しています',
      'システムサービスを再起動しています'
    ],
    // ドライバ・ハードウェア
    [
      'ハードウェアを検出しています',
      'ドライバを読み込んでいます',
      'デバイスファームウェアを更新しています',
      'ネットワークインターフェイスを初期化しています'
    ]
  ];

  const flatMessages = [];
  // 各カテゴリを順に一定回数ずつ出力していく（インストールらしい流れを演出）
  messagesByCategory.forEach((group, gi)=>{
    // 各カテゴリのメッセージを2回ずつ繰り返して長さを稼ぐ
    for(let r=0;r<2;r++){
      group.forEach(m=> flatMessages.push(m + '...'));
    }
    // カテゴリ間のブレイクメッセージ
    if(gi < messagesByCategory.length-1) flatMessages.push('次の処理を適用しています...');
  });

  const logArea = document.getElementById('logArea');
  let idx = 0;
  const total = flatMessages.length;
  // ユーザー要求に合わせ、全体を約5秒で完了するように調整する
  const targetDuration = 4800; // ms 目標総時間（約5秒）
  // 各メッセージの間隔を均等に割り当てる。ただし短すぎないよう最小間隔を設定
  const minInterval = 30;
  const perMsg = Math.max(minInterval, Math.floor(targetDuration / Math.max(1, total)));
  const interval = setInterval(()=>{
    if(idx >= total){ clearInterval(interval); finishInstall(); return; }
    const msg = flatMessages[idx];
    logArea.textContent += msg + '\n';
    logArea.scrollTop = logArea.scrollHeight;
    const pct = Math.round(((idx+1)/ total) * 100);
    const fill = document.getElementById('progressFill');
    if(fill) fill.style.width = pct + '%';
    idx++;
  }, perMsg);
}

function finishInstall(){
  document.getElementById('progressFill').style.width = '100%';
  recordStep('install_progress');
  // small delay then complete
  setTimeout(()=>{
    recordStep('install_complete');
    // mark progress completed
    const el = document.querySelector('.step-item[data-screen="progress"]'); if(el) el.classList.add('completed');
    show('complete');
  }, 800);
}

// Reboot -> login
document.getElementById('reboot').addEventListener('click',()=>{
  recordStep('reboot');
  show('login');
});

// Finish/Exit: clear demo storage and attempt to close the app
const finishBtn = document.getElementById('finish');
if(finishBtn){
  finishBtn.addEventListener('click', ()=>{
    // Clear demo data and return to pre-simulation page
    try{ localStorage.removeItem('installer_user'); }catch(e){}
    try{ localStorage.clear(); }catch(e){}
    // also attempt to clear caches where available
    try{
      if(window.caches && typeof window.caches.keys === 'function'){
        caches.keys().then(names=> Promise.all(names.map(n=>caches.delete(n)))).catch(()=>{}).finally(()=>{
          recordStep('exit');
          window.location.href = 'index.html';
        });
        return;
      }
    }catch(e){}
    recordStep('exit');
    // navigate back to pre-simulation start page
    try{ window.location.href = 'index.html'; }catch(e){ /* ignore */ }
  });
}

// Login check: fixed credentials per spec
document.getElementById('doLogin').addEventListener('click',(e)=>{
  // prevent form submit which reloads the page and resets state
  if(e && e.preventDefault) e.preventDefault();
  const userInputEl = document.getElementById('loginUser');
  const passInputEl = document.getElementById('loginPass');
  const err = document.getElementById('loginError'); if(err) err.textContent='';
  const accountNameEl = document.getElementById('accountName');
  const user = userInputEl? userInputEl.value.trim() : '';
  const pass = passInputEl? passInputEl.value : '';
  // Allow either the built-in demo account OR the installer-created account (persisted in localStorage)
  const installerUser = state.user && state.user.username ? state.user.username.toLowerCase() : null;
  // installer password is stored in localStorage and restored into runtime state._installerPassword (see DOMContentLoaded restore)
  const installerPass = state._installerPassword || null;
    if((installerUser && user.toLowerCase() === installerUser && pass === installerPass) ||
      (user.toLowerCase() === 'techc' && pass === 'P@ssW0rd') ||
      (user.toLowerCase() === 'student' && pass === 'password')){
    recordStep('login_screen');
    recordStep('desktop');
    const welcomeEl = document.getElementById('welcomeName');
    if(welcomeEl) welcomeEl.textContent = 'これでインストールは完了です。';
    // reflect proper-cased account name in the account box
    if(accountNameEl) accountNameEl.textContent = (state.user && state.user.username) ? state.user.username.toUpperCase() : 'TECHC';
    show('desktop');
  } else {
    // if username not matching known account, show help like screenshot
    if(accountNameEl) accountNameEl.textContent = user ? user.toUpperCase() : '';
    if(err){
      if(!user){ err.textContent = 'ユーザー名を入力してください'; }
      else if(pass.length === 0){ err.textContent = 'パスワードを入力してください'; }
      else { err.textContent = '認証に失敗しました'; }
    }
    // also show the account-help message visually by toggling class on login section
    const loginSection = document.getElementById('login');
    if(loginSection){ loginSection.classList.add('account-not-found'); }
  }
});

// (Export progress button removed from UI)

// (Start tour button removed from UI)

// Ensure language list is populated immediately (script is at document end)
populateLanguageList();

// Init after DOM ready to attach interactive handlers
window.addEventListener('DOMContentLoaded', ()=>{
  // attach language search handler if input exists
  const langSearch = document.getElementById('langSearch');
  if(langSearch){
    langSearch.addEventListener('input', (e)=>{
      const q = e.target.value.trim().toLowerCase();
      const list = document.getElementById('languageList');
      if(!list) return;
      list.querySelectorAll('.lang-item').forEach(li=>{
        const native = (li.querySelector('.native') && li.querySelector('.native').textContent.toLowerCase()) || '';
        const en = (li.querySelector('.en') && li.querySelector('.en').textContent.toLowerCase()) || '';
        li.style.display = (native.includes(q) || en.includes(q))? '' : 'none';
      });
    });
    // clear button inside DOMContentLoaded
    const langClear = document.getElementById('langClear');
    if(langClear){
      langClear.addEventListener('click', ()=>{
        langSearch.value = '';
        const list = document.getElementById('languageList');
        if(list) list.querySelectorAll('.lang-item').forEach(li=> li.style.display = '');
        langSearch.focus();
      });
    }
  }

  show('start');
  recordStep('app_start');
  // ensure sidebar initial active
  setActiveSidebar('start');
  // Restore persisted user (if any) so the demo login can accept installer-created account
  try{
    const saved = localStorage.getItem('installer_user');
    if(saved){
      const obj = JSON.parse(saved);
      if(obj && obj.username){
        state.user = state.user || {};
        state.user.username = obj.username;
        // keep raw password in a runtime-only field for comparison (demo only)
        state._installerPassword = obj.password || '';
      }
    }
  }catch(e){ }
});

// Expose for debugging
window._simState = state;