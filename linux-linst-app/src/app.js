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
    el.classList.remove('completed');
    // mark completed if applicable (handle grouped/child steps)
    const sc = el.getAttribute('data-screen');
    if(!sc) return;
    let completed = false;
    if(sc === 'software'){
      completed = !!(state.software && state.software.base) || state.steps.includes('software_select');
    } else if(sc === 'disk'){
      completed = !!state.disk || state.steps.includes('disk_select');
    } else if(sc === 'user'){
      completed = !!state.user || state.steps.includes('user_create');
    } else if(sc === 'summary'){
      completed = !!(state.disk && state.software && state.user);
    } else {
      completed = state.steps.includes(sc) || state.steps.includes(sc + '_completed');
    }
    if(completed) el.classList.add('completed');
  });
  const active = document.querySelector(`.step-item[data-screen="${screenId}"]`);
  if(active) active.classList.add('active');

  // expand/collapse the summary group when appropriate
  const summaryEl = document.querySelector('.step-item[data-screen="summary"]');
  if(summaryEl){
    const shouldExpand = ['summary','software','disk','user'].includes(screenId) || !!state.disk || !!state.software || !!state.user;
    summaryEl.classList.toggle('expanded', shouldExpand);
  }
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

  // Update sidebar nested indicators (ソフトウェア / インストール先 / ユーザー)
  const sidebarSoftware = document.querySelector('.step-item[data-screen="software"]');
  if(sidebarSoftware) sidebarSoftware.classList.toggle('completed', !!(state.software && state.software.base) || state.steps.includes('software_select'));
  const sidebarDisk = document.querySelector('.step-item[data-screen="disk"]');
  if(sidebarDisk) sidebarDisk.classList.toggle('completed', !!state.disk || state.steps.includes('disk_select'));
  const sidebarUser = document.querySelector('.step-item[data-screen="user"]');
  if(sidebarUser) sidebarUser.classList.toggle('completed', !!state.user || state.steps.includes('user_create'));

  // Ensure summary group expansion and active state reflect current visible screen
  const currentScreen = (document.querySelector('.screen:not(.hidden)')||{}).id || 'summary';
  setActiveSidebar(currentScreen);
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

// Sidebar click delegation: handle clicks on any step (including nested sub-steps)
const sidebarEl = document.querySelector('.sidebar');
if(sidebarEl){
  sidebarEl.addEventListener('click', (e)=>{
    const li = e.target.closest('.step-item[data-screen]');
    if(!li || !sidebarEl.contains(li)) return;
    const sc = li.getAttribute('data-screen');
    if(sc) show(sc);
  });
}

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
  state.user = { fullname: document.getElementById('fullname').value.trim(), username: uname };
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

// Finish/Exit: return to pre-simulation (no persistent post-sim flag)
const finishBtn = document.getElementById('finish');
if(finishBtn){
  finishBtn.addEventListener('click', ()=>{
    recordStep('exit');
    try{ window.location.href = 'index.html'; }catch(e){}
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
      (user.toLowerCase() === 'student' && pass === 'P@ssW0rd')){
    recordStep('login_screen');
    recordStep('desktop');
    const welcomeEl = document.getElementById('welcomeName');
    const desktopUserEl = document.getElementById('desktopUsername');
    // Determine display username:
    // - installer-created user -> use stored username (not fullname)
    // - built-in 'student' account -> display 'Student'
    // - otherwise fallback to typed username
    let displayUser = user;
    if(installerUser && user.toLowerCase() === installerUser && pass === installerPass){
      displayUser = (state.user && state.user.username) ? state.user.username : user;
    } else if(user.toLowerCase() === 'student' && pass === 'P@ssW0rd'){
      displayUser = 'Student';
    } else if(user.toLowerCase() === 'techc' && pass === 'P@ssW0rd'){
      displayUser = 'TechC';
    }
    if(desktopUserEl) desktopUserEl.textContent = displayUser;
    // welcome paragraph text is static in the HTML; username is injected into #desktopUsername
    // update account name displayed on the login card/avatar
    if(accountNameEl) accountNameEl.textContent = displayUser;
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
  // insert hint buttons into each screen card
  try{ insertHintButtons(); }catch(e){ /* ignore if function not yet available */ }
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
  // Make brand logo clickable: clear demo storage and return to pre-simulation page
  try{
    const brandLogo = document.getElementById('brandLogo') || document.querySelector('.brand-logo');
    if(brandLogo){
      brandLogo.setAttribute('role','button');
      brandLogo.style.cursor = 'pointer';
      const navigateOut = ()=>{
        // プレシミュレーションへ戻るのみ。localStorage はここでクリアしない。
        try{
          if(window.caches && typeof window.caches.keys === 'function'){
            caches.keys().then(names=> Promise.all(names.map(n=>caches.delete(n)))).catch(()=>{}).finally(()=>{ window.location.href = 'index.html'; });
            return;
          }
        }catch(e){}
        window.location.href = 'index.html';
      };
      brandLogo.addEventListener('click', navigateOut);
      brandLogo.addEventListener('keydown', (ev)=>{ if(ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); navigateOut(); } });
    }
  }catch(e){}
});

// Expose for debugging
// --- Hints feature: modal + per-screen hint data ---
const hints = {
  start: {
    title: 'インストールメディア',
    steps: [
      '「インストールメディアを挿入」ボタンを押してインストーラーを起動します。',
      '起動後、ブートメニューが表示されます。通常は「Install AlmaLinux ...」を選択してください。',
      '迷ったら教員に相談してください。'
    ]
  },
  boot: {
    title: 'ブートメニュー',
    steps: [
      '上下キーで項目を選び、Enterで決定します。',
      '自動起動するまでカウントダウンが続きます。',
      '詳細オプションは Tab キーで確認できます。'
    ]
  },
  language: {
    title: '言語選択',
    steps: [
      'インストール時に使用する言語を選択します。',
      '検索ボックスで言語を絞り込めます。',
      '日本語がデフォルトです。'
    ]
  },
  summary: {
    title: 'インストール概要',
    steps: [
      '各設定（ソフトウェア、インストール先、ユーザー）を確認してください。',
      '「設定済」表示が出ていることを確認します。',
      '準備が整ったら「インストール開始」を押します。'
    ]
  },
  disk: {
    title: 'インストール先',
    steps: [
      'インストールするディスクを選択してください。',
      '空き容量が足りない場合は選ばないでください（エラーになります）。',
      '自動かカスタムかを選べます。'
    ]
  },
  software: {
    title: 'ソフトウェアの選択',
    steps: [
      '必要なプロファイルにチェックを入れてください。',
      '教育用に一部のみ選択可能です。',
      '両方選ばないと次に進めません。'
    ]
  },
  user: {
    title: 'ユーザー作成',
    steps: [
      'ユーザー名とパスワードを設定してください。',
      {
        text: 'ユーザー名は以下のルールで作成してください。',
        sub: [
          '先頭は英小文字',
          '使用可能：a–z / 0–9 / - / _',
          '1〜32 文字'
        ]
      },
      'パスワードは8文字以上・英字と数字を含めてください。',
      
    ]
  },
  progress: {
    title: 'インストール中',
    steps: [
      '進捗とログを確認してください。',
      '処理が終わるまで操作は控えてください。'
    ]
  },
  complete: {
    title: '完了',
    steps: [
      'インストールが完了しました。',
      '「再起動」を押して次へ進みます。'
    ]
  },
  login: {
    title: 'ログイン',
    steps: [
      'インストール概要で作成したユーザーでログインします。',
      'ユーザー名かパスワードに誤りがないか確認してください。'
    ]
  },
  desktop: {
    title: 'デスクトップ',
    steps: [
      '「終了」でトップページに戻ります。'
    ]
  }
};

function createHintModal(){
  if(document.getElementById('hintOverlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'hintOverlay';
  overlay.className = 'hint-modal-overlay hidden';
  overlay.innerHTML = `
    <div class="hint-modal" role="dialog" aria-modal="true" aria-labelledby="hintTitle" tabindex="-1">
      <div class="hint-header"><h3 id="hintTitle"></h3><button class="hint-close" aria-label="閉じる">×</button></div>
      <div class="hint-body"><ul id="hintList"></ul></div>
    </div>`;
  document.body.appendChild(overlay);
  // close when clicking backdrop
  overlay.addEventListener('click', (e)=>{ if(e.target === overlay) closeHint(); });
  overlay.querySelector('.hint-close').addEventListener('click', closeHint);
}

function openHint(screenId){
  createHintModal();
  const overlay = document.getElementById('hintOverlay');
  const data = hints[screenId] || { title: 'ヒント', steps: ['この画面に特別なヒントはありません。'] };
  overlay.querySelector('#hintTitle').textContent = data.title;
  const list = overlay.querySelector('#hintList');
  list.innerHTML = '';
  data.steps.forEach(s=>{
    const li = document.createElement('li');
    // plain string step
    if(typeof s === 'string' || typeof s === 'number'){
      li.textContent = s;
      list.appendChild(li);
      return;
    }
    // object with text + sub-list
    if(s && typeof s === 'object'){
      li.textContent = s.text || '';
      if(Array.isArray(s.sub) && s.sub.length){
        const subul = document.createElement('ul');
        s.sub.forEach(subItem=>{
          const subli = document.createElement('li');
          subli.textContent = subItem;
          subul.appendChild(subli);
        });
        li.appendChild(subul);
      }
      list.appendChild(li);
      return;
    }
    // fallback
    li.textContent = String(s);
    list.appendChild(li);
  });
  overlay.classList.remove('hidden');
  // lock scroll
  try{ document.body.style.overflow = 'hidden'; }catch(e){}
  const closeBtn = overlay.querySelector('.hint-close');
  if(closeBtn) closeBtn.focus();
  const escHandler = (ev)=>{ if(ev.key === 'Escape') closeHint(); };
  overlay._escHandler = escHandler;
  document.addEventListener('keydown', escHandler);
}

function closeHint(){
  const overlay = document.getElementById('hintOverlay');
  if(!overlay) return;
  overlay.classList.add('hidden');
  try{ document.body.style.overflow = ''; }catch(e){}
  if(overlay._escHandler) document.removeEventListener('keydown', overlay._escHandler);
  overlay._escHandler = null;
}

function insertHintButtons(){
  document.querySelectorAll('.screen.card').forEach(screenEl=>{
    const id = screenEl.id;
    if(!id) return;
    if(screenEl.querySelector('.hint-btn')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'hint-btn';
    btn.setAttribute('aria-label', 'ヒント');
    btn.setAttribute('data-screen', id);
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M9 21h6v-1a4 4 0 0 0-6 0v1z"/><path d="M12 2a6 6 0 0 0-4 10c0 1.5.6 2.7 1.6 3.6.8.7 1.9 1.4 2.4 2.8h1.9c.5-1.4 1.6-2.1 2.4-2.8A6.1 6.1 0 0 0 16 12a6 6 0 0 0-4-10z"/></svg>`;
    btn.addEventListener('click', ()=> openHint(id));
    // allow keyboard activation via Enter/Space automatically by being a button
    screenEl.appendChild(btn);
  });
}

// ensure hint buttons are present when JS loads (and after DOM ready we call insertHintButtons above)
try{ insertHintButtons(); }catch(e){}

// Expose control for debugging
window._hints = { openHint, closeHint, hints };
window._simState = state;