function switchAdminTab(tab){
  document.querySelectorAll('.admin-nav button').forEach((btn)=>{
    btn.classList.toggle('active', btn.dataset.tab === tab);
  });
  document.querySelectorAll('.admin-panel').forEach((panel)=>{
    panel.classList.toggle('active', panel.id === `admin-${tab}`);
  });
}

function getAdminFlag(){
  return localStorage.getItem('isAdmin') === 'true' || sessionStorage.getItem('isAdmin') === 'true';
}

function ensureAdminAccess(){
  if(!getAdminFlag()){
    window.location.href = '/admin-login.html';
    return false;
  }
  return true;
}

function showMessage(text, isError){
  const status = document.getElementById('configStatus');
  if(!status) return;
  status.textContent = text;
  status.style.color = isError ? '#b3261e' : '#1f7a45';
  setTimeout(()=>{ if(status.textContent === text) status.textContent = ''; }, 2800);
}

async function fetchAdmin(url, options = {}){
  if(!ensureAdminAccess()) return null;
  let requestUrl = url;
  const init = { ...options };
  const method = String(init.method || 'GET').toUpperCase();
  if(method !== 'GET'){
    const bodyObj = init.body ? (typeof init.body === 'string' ? JSON.parse(init.body) : init.body) : {};
    init.headers = { 'Content-Type':'application/json', ...(init.headers || {}) };
    init.body = JSON.stringify({ ...bodyObj, isAdmin:true });
  }else{
    requestUrl += (requestUrl.includes('?') ? '&' : '?') + 'isAdmin=true';
  }
  return fetch(requestUrl, init);
}

async function loadUserList(query){
  const url = '/api/admin/users' + (query ? '?query=' + encodeURIComponent(query) : '');
  const res = await fetchAdmin(url);
  if(!res) return;
  const data = await res.json();
  const container = document.getElementById('userList');
  container.innerHTML = (data.users || []).map((u)=>`
    <div class="admin-row">
      <div><strong>${u.nickname || u.username}</strong>（${u.username}）</div>
      <div>${u.bio || '无简介'}</div>
      <div>状态：${u.banned ? '已封禁' : '正常'}</div>
      <div class="admin-actions">
        <button data-action="${u.banned ? 'unban' : 'ban'}" data-user="${u.username}">${u.banned ? '解禁' : '封禁'}</button>
        <button data-action="reset" data-user="${u.username}">重置密码</button>
      </div>
    </div>
  `).join('') || '<div class="admin-row">暂无用户</div>';
}

async function performUserAction(action, username){
  const path = `/api/admin/users/${encodeURIComponent(username)}/${action}`;
  const res = await fetchAdmin(path, { method:'POST' });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '操作失败', true);
  await loadUserList(document.getElementById('userSearch')?.value || '');
}

async function loadAuditList(){
  const res = await fetchAdmin('/api/admin/audit/pending');
  if(!res) return;
  const data = await res.json();
  const container = document.getElementById('auditList');
  container.innerHTML = (data.items || []).map((item)=>`
    <div class="admin-row">
      <div><strong>[${item.category}] ${item.title}</strong></div>
      <div>作者：${item.author}</div>
      <div>${item.preview || ''}</div>
      <div class="admin-actions">
        <button data-action="approve" data-id="${item.id}">通过</button>
        <button data-action="reject" data-id="${item.id}">驳回</button>
        <button data-action="delete" data-id="${item.id}">删除</button>
      </div>
    </div>
  `).join('') || '<div class="admin-row">当前无待审核内容</div>';
}

async function performAuditAction(action, id){
  let url = `/api/admin/audit/${id}/${action}`;
  let options = { method:'POST' };
  if(action === 'delete'){
    url = `/api/admin/audit/${id}`;
    options = { method:'DELETE' };
  }
  if(action === 'reject'){
    const reason = prompt('请输入驳回理由：');
    if(!reason) return;
    options = { method:'POST', body:{ reason } };
  }
  const res = await fetchAdmin(url, options);
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '审核操作失败', true);
  await loadAuditList();
  await loadWishList();
}

async function loadWishList(){
  const res = await fetchAdmin('/api/admin/wishes');
  if(!res) return;
  const data = await res.json();
  const container = document.getElementById('wishAdminList');
  container.innerHTML = (data.items || []).map((item)=>`
    <div class="admin-row">
      <div><strong>${item.nick || '匿名'}</strong>（ID:${item.id}）</div>
      <div>${item.text || ''}</div>
      <div>点赞：${item.likes || 0} · 评论：${item.commentsCount || 0}</div>
      <div>
        ${(item.comments || []).map((comment)=>`
          <div class="submission-item" style="margin:6px 0;">
            <div>${comment.author || '匿名'}：${comment.text}</div>
            <button data-action="del-comment" data-id="${item.id}" data-comment-id="${comment.id}">删除评论</button>
          </div>
        `).join('') || '暂无评论'}
      </div>
    </div>
  `).join('') || '<div class="admin-row">暂无便利贴数据</div>';
}

async function deleteWishComment(wishId, commentId){
  const res = await fetchAdmin(`/api/admin/wishes/${wishId}/comments/${commentId}`, { method:'DELETE' });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '删除失败', true);
  await loadWishList();
}

async function loadMusic(){
  const res = await fetchAdmin('/api/admin/music/tracks');
  if(!res) return;
  const data = await res.json();
  const list = data.tracks || [];
  const table = document.getElementById('musicTrackList');
  table.innerHTML = list.map((track)=>`
    <div class="admin-row">
      <div><strong>${track.title}</strong> - ${track.artist}（ID:${track.id}）</div>
      <div>音频：${track.audio || '未设置'}</div>
      <div>MV：${track.mv || '未设置'} · 状态：${track.status}</div>
      <div>台词行数：${Array.isArray(track.lyrics) ? track.lyrics.length : 0}</div>
      <div class="admin-actions">
        <button data-action="fill-track" data-id="${track.id}">载入编辑</button>
      </div>
    </div>
  `).join('') || '<div class="admin-row">暂无曲目</div>';

  const orderInput = document.getElementById('trackOrderInput');
  if(orderInput) orderInput.value = list.map((x)=>x.id).join(',');
}

function readMusicForm(){
  return {
    id: document.getElementById('musicId')?.value.trim(),
    title: document.getElementById('musicTitle')?.value.trim(),
    artist: document.getElementById('musicArtist')?.value.trim(),
    audio: document.getElementById('musicAudio')?.value.trim(),
    cover: document.getElementById('musicCover')?.value.trim(),
    mv: document.getElementById('musicMv')?.value.trim(),
    lyrics: document.getElementById('musicLyrics')?.value || '',
    status: document.getElementById('musicStatus')?.value || 'active'
  };
}

function fillMusicForm(track){
  document.getElementById('musicId').value = track.id || '';
  document.getElementById('musicTitle').value = track.title || '';
  document.getElementById('musicArtist').value = track.artist || '';
  document.getElementById('musicAudio').value = track.audio || '';
  document.getElementById('musicCover').value = track.cover || '';
  document.getElementById('musicMv').value = track.mv || '';
  document.getElementById('musicStatus').value = track.status || 'active';
  document.getElementById('musicLyrics').value = Array.isArray(track.lyrics) ? track.lyrics.map((x)=>x.text).join('\n') : '';
}

async function createTrack(){
  const form = readMusicForm();
  const res = await fetchAdmin('/api/admin/music/tracks', { method:'POST', body:form });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '新增失败', true);
  showMessage('新增曲目成功');
  await loadMusic();
}

async function updateTrack(){
  const form = readMusicForm();
  if(!form.id) return showMessage('请先填写曲目ID', true);
  const res = await fetchAdmin(`/api/admin/music/tracks/${form.id}`, { method:'POST', body:form });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '更新失败', true);
  showMessage('更新曲目成功');
  await loadMusic();
}

async function deleteTrack(){
  const id = document.getElementById('musicId')?.value.trim();
  if(!id) return showMessage('请先填写曲目ID', true);
  const res = await fetchAdmin(`/api/admin/music/tracks/${id}`, { method:'DELETE' });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '删除失败', true);
  showMessage('曲目已删除');
  await loadMusic();
}

async function saveTrackOrder(){
  const raw = document.getElementById('trackOrderInput')?.value || '';
  const ids = raw.split(',').map((x)=>x.trim()).filter(Boolean);
  if(!ids.length) return showMessage('请输入排序ID', true);
  const res = await fetchAdmin('/api/admin/music/tracks/reorder', { method:'POST', body:{ ids } });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '排序失败', true);
  showMessage('歌单排序已保存');
  await loadMusic();
}

async function loadAiConfig(){
  const res = await fetchAdmin('/api/admin/ai-config');
  if(!res) return;
  const data = await res.json();
  const ai = data.aiParams || {};
  document.getElementById('aiReplyStyle').value = ai.replyStyle || '';
  document.getElementById('aiPersonas').value = JSON.stringify(ai.rolePersonas || {}, null, 2);
  document.getElementById('aiBlockedInput').value = (ai.blockedInputKeywords || []).join(',');
  document.getElementById('aiBlockedOutput').value = (ai.blockedOutputKeywords || []).join(',');
}

async function saveAiConfig(event){
  event.preventDefault();
  try{
    const rolePersonas = JSON.parse(document.getElementById('aiPersonas').value || '{}');
    const replyStyle = document.getElementById('aiReplyStyle').value;
    const blockedInputKeywords = (document.getElementById('aiBlockedInput').value || '').split(',').map((x)=>x.trim()).filter(Boolean);
    const blockedOutputKeywords = (document.getElementById('aiBlockedOutput').value || '').split(',').map((x)=>x.trim()).filter(Boolean);
    const res = await fetchAdmin('/api/admin/ai-config', {
      method:'POST',
      body:{ replyStyle, rolePersonas, blockedInputKeywords, blockedOutputKeywords }
    });
    if(!res) return;
    const data = await res.json();
    if(!data.ok) return showMessage(data.message || '保存失败', true);
    showMessage('AI配置已保存');
  }catch{
    showMessage('角色人设JSON格式错误', true);
  }
}

async function loadSiteConfig(){
  const res = await fetchAdmin('/api/admin/site-content');
  if(!res) return;
  const data = await res.json();
  const cfg = data.config || {};
  document.getElementById('siteNotice').value = cfg.notice || '';
  document.getElementById('siteIntroTitle').value = cfg.intro?.title || '';
  document.getElementById('siteIntroMain').value = cfg.intro?.main || '';
  document.getElementById('siteIntroSub').value = cfg.intro?.sub || '';
  document.getElementById('siteNav').value = JSON.stringify(cfg.nav || [], null, 2);
  document.getElementById('siteHomeVideoSrc').value = cfg.homeVideo?.src || '';
  document.getElementById('siteHomeVideoPoster').value = cfg.homeVideo?.poster || '';
  document.getElementById('siteShopUrl').value = cfg.shopUrl || '';
  document.getElementById('siteTheme').value = JSON.stringify(cfg.theme || {}, null, 2);
}

async function saveSiteConfig(event){
  event.preventDefault();
  try{
    const nav = JSON.parse(document.getElementById('siteNav').value || '[]');
    const theme = JSON.parse(document.getElementById('siteTheme').value || '{}');
    const body = {
      notice: document.getElementById('siteNotice').value,
      nav,
      intro: {
        title: document.getElementById('siteIntroTitle').value,
        main: document.getElementById('siteIntroMain').value,
        sub: document.getElementById('siteIntroSub').value
      },
      homeVideo: {
        src: document.getElementById('siteHomeVideoSrc').value,
        poster: document.getElementById('siteHomeVideoPoster').value
      },
      shopUrl: document.getElementById('siteShopUrl').value,
      theme
    };
    const res = await fetchAdmin('/api/admin/site-content', { method:'POST', body });
    if(!res) return;
    const data = await res.json();
    if(!data.ok) return showMessage(data.message || '保存失败', true);
    showMessage('网站配置已保存');
  }catch{
    showMessage('导航或主题JSON格式错误', true);
  }
}

async function changeAdminPassword(event){
  event.preventDefault();
  const oldPassword = document.getElementById('adminOldPwd').value;
  const newPassword = document.getElementById('adminNewPwd').value;
  if(!oldPassword || !newPassword) return showMessage('请填写旧密码和新密码', true);
  const res = await fetchAdmin('/api/admin/change-password', { method:'POST', body:{ oldPassword, newPassword } });
  if(!res) return;
  const data = await res.json();
  if(!data.ok) return showMessage(data.message || '修改失败', true);
  document.getElementById('adminOldPwd').value = '';
  document.getElementById('adminNewPwd').value = '';
  showMessage('管理员密码修改成功');
}

async function initAdmin(){
  if(!ensureAdminAccess()) return;

  document.getElementById('adminExitBtn')?.addEventListener('click', ()=>{
    localStorage.removeItem('isAdmin');
    sessionStorage.removeItem('isAdmin');
    window.location.href = '/admin-login.html';
  });

  document.querySelectorAll('.admin-nav button').forEach((btn)=>{
    btn.addEventListener('click', ()=>switchAdminTab(btn.dataset.tab));
  });

  document.getElementById('userSearchBtn')?.addEventListener('click', ()=>loadUserList(document.getElementById('userSearch').value));
  document.getElementById('userList')?.addEventListener('click', (event)=>{
    const target = event.target;
    if(target.tagName === 'BUTTON') performUserAction(target.dataset.action, target.dataset.user);
  });

  document.getElementById('auditList')?.addEventListener('click', (event)=>{
    const target = event.target;
    if(target.tagName === 'BUTTON') performAuditAction(target.dataset.action, target.dataset.id);
  });

  document.getElementById('wishAdminList')?.addEventListener('click', (event)=>{
    const target = event.target;
    if(target.tagName === 'BUTTON' && target.dataset.action === 'del-comment'){
      deleteWishComment(target.dataset.id, target.dataset.commentId);
    }
  });

  document.getElementById('musicCreateBtn')?.addEventListener('click', createTrack);
  document.getElementById('musicUpdateBtn')?.addEventListener('click', updateTrack);
  document.getElementById('musicDeleteBtn')?.addEventListener('click', deleteTrack);
  document.getElementById('musicReloadBtn')?.addEventListener('click', loadMusic);
  document.getElementById('saveTrackOrderBtn')?.addEventListener('click', saveTrackOrder);
  document.getElementById('musicTrackList')?.addEventListener('click', async (event)=>{
    const target = event.target;
    if(target.tagName !== 'BUTTON' || target.dataset.action !== 'fill-track') return;
    const res = await fetchAdmin('/api/admin/music/tracks');
    if(!res) return;
    const data = await res.json();
    const found = (data.tracks || []).find((x)=>String(x.id) === String(target.dataset.id));
    if(found) fillMusicForm(found);
  });

  document.getElementById('aiConfigForm')?.addEventListener('submit', saveAiConfig);
  document.getElementById('siteConfigForm')?.addEventListener('submit', saveSiteConfig);
  document.getElementById('adminPwdForm')?.addEventListener('submit', changeAdminPassword);

  await loadUserList('');
  await loadAuditList();
  await loadWishList();
  await loadMusic();
  await loadAiConfig();
  await loadSiteConfig();
}

window.addEventListener('DOMContentLoaded', initAdmin);
