// minimal client script
console.log('ZERONI front-end shell loaded');

let SHOP_EXTERNAL_URL = 'https://linefriendssquare.com/en/collections/zerobaseone-zeroni';

function activateTab(tabName){
	const hasTargetPanel = !!document.getElementById(tabName);
	if(!hasTargetPanel) return;
	document.querySelectorAll('.tab-trigger').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName));
	document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === tabName));
}

function initTabNavigation(){
	document.querySelectorAll('.tab-trigger').forEach((trigger)=>{
		trigger.addEventListener('click', (event)=>{
			event.preventDefault();
			const tab = trigger.getAttribute('data-tab');
			if(tab === 'shop'){
				window.open(SHOP_EXTERNAL_URL, '_blank', 'noopener,noreferrer');
				return;
			}
			activateTab(tab);
			if(tab === 'profile' && typeof initProfile === 'function') initProfile();
		});
	});
}

function initHomeInteractions(){
	document.getElementById('backToZerobase')?.addEventListener('click', ()=>{
		document.getElementById('home-screen-2')?.scrollIntoView({ behavior:'smooth', block:'start' });
	});

	document.querySelectorAll('.to-ai-role').forEach((card)=>{
		card.addEventListener('click', ()=>{
			const roleTarget = card.getAttribute('data-role');
			if(roleTarget){
				sessionStorage.setItem('zeroniSelectedRole', roleTarget);
			}
			activateTab('ai');
			setTimeout(()=>{
				if(typeof window.selectAiRoleById === 'function'){
					window.selectAiRoleById(roleTarget, true);
					return;
				}
				const target = document.getElementById(roleTarget);
				if(target) target.scrollIntoView({ behavior:'smooth', block:'center' });
			}, 80);
		});
	});

	const homeVideo = document.getElementById('homeScreen2Video');
	const mergedScreen = document.getElementById('home-screen-2');
	if(homeVideo && mergedScreen && 'IntersectionObserver' in window){
		const tryPlay = () => {
			const playPromise = homeVideo.play();
			if(playPromise && typeof playPromise.catch === 'function'){
				playPromise.catch(()=>{});
			}
		};

		homeVideo.muted = true;
		homeVideo.defaultMuted = true;
		homeVideo.playsInline = true;
		tryPlay();

		const observer = new IntersectionObserver((entries)=>{
			entries.forEach((entry)=>{
				if(entry.target !== mergedScreen) return;
				if(entry.isIntersecting && entry.intersectionRatio >= 0.1){
					tryPlay();
				}else{
					homeVideo.pause();
				}
			});
		},{ threshold:[0, 0.1, 0.45, 0.75] });

		observer.observe(mergedScreen);
	}
}

function enableVideoFreeSeek(){
	document.querySelectorAll('video').forEach((video)=>{
		video.controls = true;
		video.setAttribute('controls', 'controls');
		video.preload = 'auto';
		video.style.pointerEvents = 'auto';
		if(!video.hasAttribute('playsinline')) video.setAttribute('playsinline', 'playsinline');
	});
}

// carousel behavior for home
function initCarousel(){
	const carousel = document.getElementById('carousel');
	if(!carousel) return;
	const slides = Array.from(carousel.querySelectorAll('.slide'));
	let idx = 0;
	slides[idx].classList.add('active');
	setInterval(()=>{
		slides[idx].classList.remove('active');
		idx = (idx+1)%slides.length;
		slides[idx].classList.add('active');
	},4000);
}


const ROLE_CONFIG = {
	'ai-role-binini': {
		name: 'BININI',
		persona: '沉稳温柔队长，给人安全感，语气坚定又治愈。',
		greet: '我是BININI，今天也会稳稳陪着你。',
		typing: ['BININI 正在认真组织语言...', 'BININI 在温柔思考中...']
	},
	'ai-role-woongnini': {
		name: 'WOONGNINI',
		persona: '元气运动型，热血直率，擅长鼓励和打气。',
		greet: 'WOONGNINI 报到，先来一个元气抱抱！',
		typing: ['WOONGNINI 正在热血加载中...', 'WOONGNINI 马上给你打气回复！']
	},
	'ai-role-hanini': {
		name: 'HANINI',
		persona: '细腻治愈型，擅长倾听，回复温柔柔软。',
		greet: '我是HANINI，会认真听你每一句话。',
		typing: ['HANINI 正在轻轻整理想说的话...', 'HANINI 正在给你准备温柔回复...']
	},
	'ai-role-thewnini': {
		name: 'THEWNINI',
		persona: '阳光甜酷型，聊天轻松俏皮，带来快乐氛围。',
		greet: '嘿，我是THEWNINI，今天一起把心情聊亮吧。',
		typing: ['THEWNINI 正在想一句超有氛围感的话...', 'THEWNINI 在甜酷脑暴中...']
	},
	'ai-role-taenini': {
		name: 'TAENINI',
		persona: '浪漫音乐型，表达有画面感，语气温柔有旋律。',
		greet: '我是TAENINI，今天的对话也会像一段小旋律。',
		typing: ['TAENINI 正在谱写一句温柔旋律...', 'TAENINI 在浪漫思考中...']
	},
	'ai-role-rinini': {
		name: 'RININI',
		persona: '时尚贵气型，表达直接利落，但不失贴心。',
		greet: 'RININI 在这，今天你想聊点有态度的，还是软软的？',
		typing: ['RININI 正在打磨一句有态度的回复...', 'RININI 稍等，马上给你高质感回应。']
	},
	'ai-role-gyunini': {
		name: 'GYUNINI',
		persona: '活力小太阳型，积极可爱，擅长驱散低落。',
		greet: '我是GYUNINI，今天负责把你的心情点亮。',
		typing: ['GYUNINI 正在蓄满元气...', 'GYUNINI 在准备一条阳光回复！']
	},
	'ai-role-gunini': {
		name: 'GUNINI',
		persona: '可靠行动型，逻辑清晰，回复踏实有力量。',
		greet: 'GUNINI 已就位，我们一步一步把事情聊清楚。',
		typing: ['GUNINI 正在有条理地整理回复...', 'GUNINI 正在给你稳稳的回答。']
	},
	'ai-role-yunini': {
		name: 'YUNINI',
		persona: '清新真诚型，表达轻盈，语气自然亲近。',
		greet: '我是YUNINI，今天也会用最真诚的方式陪你。',
		typing: ['YUNINI 正在认真想你这句话...', 'YUNINI 在准备一条清新回复...']
	}
};

const ROLE_GALLERY = {
	'ai-role-binini': { src:'/images/hanbin.jpg', title:'BININI' },
	'ai-role-woongnini': { src:'/images/jiwoong.jpg', title:'WOONGNINI' },
	'ai-role-hanini': { src:'/images/hao.jpg', title:'HANINI' },
	'ai-role-thewnini': { src:'/images/mattew.jpg', title:'THEWNINI' },
	'ai-role-taenini': { src:'/images/taerae.jpg', title:'TAENINI' },
	'ai-role-rinini': { src:'/images/ricky.jpg', title:'RININI' },
	'ai-role-gyunini': { src:'/images/gyuvin.jpg', title:'GYUNINI' },
	'ai-role-gunini': { src:'/images/gunwook.jpg', title:'GUNINI' },
	'ai-role-yunini': { src:'/images/yujin.jpg', title:'YUNINI' }
};

const roleChatStore = {};

function pickRandomText(list, fallback){
	if(!Array.isArray(list) || !list.length) return fallback;
	const idx = Math.floor(Math.random() * list.length);
	return list[idx] || fallback;
}

function appendMsg(sender, text, targetLog){
	const log = targetLog || document.getElementById('chatLog');
	if(!log) return;
	const div = document.createElement('div');
	div.className = `msg ${sender === '我' ? 'msg-user' : 'msg-ai'}`;
	div.textContent = text || '';
	log.appendChild(div);
	log.scrollTop = log.scrollHeight;
}

function getCurrentUser(){
	try{
		const raw = localStorage.getItem('zeroniCurrentUser');
		return raw ? JSON.parse(raw) : null;
	}catch{
		return null;
	}
}

function setCurrentUser(user){
	if(user){
		localStorage.setItem('zeroniCurrentUser', JSON.stringify(user));
	}else{
		localStorage.removeItem('zeroniCurrentUser');
	}
}

function updateAccountButtonText(){
	const accountBtn = document.getElementById('accountBtn');
	if(!accountBtn) return;
	accountBtn.textContent = getCurrentUser() ? '已登录' : '登录/注册';
}

let accountModalApi = null;
function ensureAccountModal(){
	if(accountModalApi) return accountModalApi;

	const wrap = document.createElement('div');
	wrap.id = 'accountModal';
	wrap.className = 'modal-overlay';
	wrap.style.display = 'none';
	wrap.innerHTML = `
		<div class="modal-card" role="dialog" aria-modal="true" aria-label="登录注册">
			<button id="accountModalClose" class="modal-close-icon" type="button" aria-label="关闭">×</button>
			<div id="accountLoginPanel" class="modal-panel active">
				<h3>登录</h3>
				<input id="loginUsername" type="text" placeholder="用户名" />
				<input id="loginPassword" type="password" placeholder="密码" />
				<button id="loginSubmitBtn" class="modal-primary-btn" type="button">登录</button>
				<div class="modal-links">
					<button id="showRegisterPanel" class="modal-link-btn" type="button">还没有账号？去注册</button>
					<button id="showChangePwdPanel" class="modal-link-btn" type="button">修改密码</button>
					<button id="toAdminLoginPage" class="modal-link-btn" type="button">管理员登录入口</button>
				</div>
			</div>
			<div id="accountRegisterPanel" class="modal-panel">
				<h3>注册</h3>
				<input id="registerUsername" type="text" placeholder="用户名" />
				<input id="registerPassword" type="password" placeholder="密码" />
				<button id="registerSubmitBtn" class="modal-primary-btn" type="button">注册</button>
				<div class="modal-links">
					<button id="showLoginPanelFromRegister" class="modal-link-btn" type="button">已有账号？去登录</button>
				</div>
			</div>
			<div id="accountChangePwdPanel" class="modal-panel">
				<h3>修改密码</h3>
				<input id="changeOldPassword" type="password" placeholder="旧密码" />
				<input id="changeNewPassword" type="password" placeholder="新密码" />
				<button id="changePwdSubmitBtn" class="modal-primary-btn" type="button">确认修改</button>
				<div class="modal-links">
					<button id="showLoginPanelFromChange" class="modal-link-btn" type="button">返回登录</button>
				</div>
			</div>
			<div id="accountModalStatus" style="min-height:22px;color:#3b5e9b;margin-top:10px;"></div>
		</div>
	`;
	document.body.appendChild(wrap);

	const loginPanel = wrap.querySelector('#accountLoginPanel');
	const registerPanel = wrap.querySelector('#accountRegisterPanel');
	const changePanel = wrap.querySelector('#accountChangePwdPanel');
	const statusEl = wrap.querySelector('#accountModalStatus');

	const showPanel = (name)=>{
		loginPanel.classList.toggle('active', name === 'login');
		registerPanel.classList.toggle('active', name === 'register');
		changePanel.classList.toggle('active', name === 'changePwd');
		if(statusEl) statusEl.textContent = '';
	};

	const open = (panelName)=>{
		showPanel(panelName || 'login');
		wrap.style.display = 'flex';
	};

	const close = ()=>{
		wrap.style.display = 'none';
		if(statusEl) statusEl.textContent = '';
	};

	const setStatus = (msg, isError)=>{
		if(!statusEl) return;
		statusEl.textContent = msg || '';
		statusEl.style.color = isError ? '#b3261e' : '#3b5e9b';
	};

	wrap.querySelector('#accountModalClose')?.addEventListener('click', close);
	wrap.addEventListener('click', (event)=>{
		if(event.target === wrap) close();
	});
	wrap.querySelector('#showRegisterPanel')?.addEventListener('click', ()=>showPanel('register'));
	wrap.querySelector('#showLoginPanelFromRegister')?.addEventListener('click', ()=>showPanel('login'));
	wrap.querySelector('#showChangePwdPanel')?.addEventListener('click', ()=>showPanel('changePwd'));
	wrap.querySelector('#showLoginPanelFromChange')?.addEventListener('click', ()=>showPanel('login'));
	wrap.querySelector('#toAdminLoginPage')?.addEventListener('click', ()=>{
		window.location.href = '/admin-login.html';
	});

	wrap.querySelector('#loginSubmitBtn')?.addEventListener('click', async ()=>{
		const username = String(wrap.querySelector('#loginUsername')?.value || '').trim();
		const password = String(wrap.querySelector('#loginPassword')?.value || '').trim();
		if(!username || !password){
			setStatus('请输入用户名和密码', true);
			return;
		}
		try{
			const r = await fetch('/api/user/login', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await r.json();
			if(!data?.ok){
				setStatus(data?.message || '登录失败', true);
				return;
			}
			setCurrentUser(data.user || { username });
			updateAccountButtonText();
			close();
			activateTab('profile');
			await initProfile();
		}catch{
			setStatus('登录失败，请稍后重试', true);
		}
	});

	wrap.querySelector('#registerSubmitBtn')?.addEventListener('click', async ()=>{
		const username = String(wrap.querySelector('#registerUsername')?.value || '').trim();
		const password = String(wrap.querySelector('#registerPassword')?.value || '').trim();
		if(!username || !password){
			setStatus('请输入用户名和密码', true);
			return;
		}
		try{
			const r = await fetch('/api/user/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username, password })
			});
			const data = await r.json();
			if(!data?.ok){
				setStatus(data?.message || '注册失败', true);
				return;
			}
			const loginNameEl = wrap.querySelector('#loginUsername');
			if(loginNameEl) loginNameEl.value = username;
			setStatus('注册成功，请登录', false);
			showPanel('login');
		}catch{
			setStatus('注册失败，请稍后重试', true);
		}
	});

	wrap.querySelector('#changePwdSubmitBtn')?.addEventListener('click', async ()=>{
		const user = getCurrentUser();
		if(!user?.username){
			setStatus('请先登录后再修改密码', true);
			showPanel('login');
			return;
		}
		const oldPassword = String(wrap.querySelector('#changeOldPassword')?.value || '').trim();
		const newPassword = String(wrap.querySelector('#changeNewPassword')?.value || '').trim();
		if(!oldPassword || !newPassword){
			setStatus('请输入旧密码和新密码', true);
			return;
		}
		try{
			const r = await fetch('/api/user/change-password', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ username: user.username, oldPassword, newPassword })
			});
			const data = await r.json();
			if(!data?.ok){
				setStatus(data?.message || '修改失败', true);
				return;
			}
			setStatus('密码修改成功', false);
		}catch{
			setStatus('修改失败，请稍后重试', true);
		}
	});

	accountModalApi = {
		openLogin: ()=>open('login'),
		openRegister: ()=>open('register'),
		openChangePassword: ()=>open('changePwd'),
		close
	};

	return accountModalApi;
}

async function initProfile(){
	const userInfoEl = document.getElementById('userInfo');
	const submissionListEl = document.getElementById('submissionList');
	if(!userInfoEl || !submissionListEl) return;

	const user = getCurrentUser();
	if(!user?.username){
		userInfoEl.innerHTML = '<p>你还没有登录，点击右上角“登录/注册”开始吧。</p>';
		submissionListEl.innerHTML = '<div class="submission-empty">登录后可查看投稿记录</div>';
		return;
	}

	userInfoEl.innerHTML = `
		<div><strong>用户名：</strong>${user.username}</div>
		<div><strong>昵称：</strong>${user.nickname || user.username}</div>
		<div><strong>简介：</strong>${user.bio || '这个人很神秘，什么都没写。'}</div>
	`;

	try{
		const r = await fetch(`/api/user/submissions?username=${encodeURIComponent(user.username)}`);
		const data = await r.json();
		const pending = Array.isArray(data.pending) ? data.pending : [];
		const approvedWish = Array.isArray(data.approvedWish) ? data.approvedWish : [];
		const approvedDiary = Array.isArray(data.approvedDiary) ? data.approvedDiary : [];
		const approvedAssets = Array.isArray(data.approvedAssets) ? data.approvedAssets : [];
		void approvedAssets;

		const renderSection = (title, items, mapItem)=>{
			if(!items.length){
				return `<div class="submission-group"><h4>${title}</h4><div class="submission-empty">暂无记录</div></div>`;
			}
			return `
				<div class="submission-group">
					<h4>${title}</h4>
					${items.map(mapItem).join('')}
				</div>
			`;
		};

		submissionListEl.innerHTML = [
			renderSection('待审核', pending, (item)=>`
				<div class="submission-item">
					<div class="submission-title-row"><strong>${item.title || item.category || '投稿'}</strong><span class="submission-status status-pending">${item.status || 'pending'}</span></div>
					<div class="submission-text">${item.preview || ''}</div>
				</div>
			`),
			renderSection('已通过-心愿', approvedWish, (item)=>`
				<div class="submission-item">
					<div class="submission-title-row"><strong>心愿便利贴</strong><span class="submission-status status-approved">approved</span></div>
					<div class="submission-text">${item.text || ''}</div>
				</div>
			`),
			renderSection('已通过-日记', approvedDiary, (item)=>`
				<div class="submission-item">
					<div class="submission-title-row"><strong>${item.title || '日记'}</strong><span class="submission-status status-approved">approved</span></div>
					<div class="submission-text">${item.text || ''}</div>
				</div>
			`)
		].join('');
	}catch{
		submissionListEl.innerHTML = '<div class="submission-empty">投稿记录加载失败，请稍后重试</div>';
	}
}

function initAccount(){
	updateAccountButtonText();
	const modal = ensureAccountModal();
	const accountBtn = document.getElementById('accountBtn');
	if(accountBtn && !accountBtn.dataset.bound){
		accountBtn.dataset.bound = '1';
		accountBtn.addEventListener('click', ()=>{
			if(getCurrentUser()){
				activateTab('profile');
				initProfile();
				return;
			}
			modal.openLogin();
		});
	}

	const logoutBtn = document.getElementById('logoutBtn');
	if(logoutBtn && !logoutBtn.dataset.bound){
		logoutBtn.dataset.bound = '1';
		logoutBtn.addEventListener('click', ()=>{
			setCurrentUser(null);
			updateAccountButtonText();
			initProfile();
			alert('已退出登录');
		});
	}

	const changePassBtn = document.getElementById('changePassBtn');
	if(changePassBtn && !changePassBtn.dataset.bound){
		changePassBtn.dataset.bound = '1';
		changePassBtn.addEventListener('click', ()=>{
			if(!getCurrentUser()){
				modal.openLogin();
				return;
			}
			modal.openChangePassword();
		});
	}
}

function initAiGalleryTools(){
	const roleList = document.getElementById('roleList');
	const roleGallery = document.getElementById('roleGallery');
	const assetTitle = document.getElementById('assetTitle');
	const uploadBtn = document.getElementById('uploadRoleAssetBtn');
	const uploadInput = document.getElementById('roleAssetUpload');
	if(!roleList || !roleGallery || !uploadBtn || !uploadInput) return;

	const galleryStore = {};
	let draggingIndex = -1;

	const getActiveRoleId = ()=>roleList.querySelector('.role-item.is-active')?.id || 'ai-role-binini';

	const ensureRoleAssets = (roleId)=>{
		if(galleryStore[roleId]) return galleryStore[roleId];
		const profile = ROLE_CONFIG[roleId] || ROLE_CONFIG['ai-role-binini'];
		const fallback = ROLE_GALLERY[roleId] || ROLE_GALLERY['ai-role-binini'];
		galleryStore[roleId] = fallback ? [{
			id: `seed-${roleId}`,
			src: fallback.src,
			title: fallback.title || `${profile?.name || '角色'} 初始素材`
		}] : [];
		return galleryStore[roleId];
	};

	const renderGallery = (roleId)=>{
		const profile = ROLE_CONFIG[roleId] || ROLE_CONFIG['ai-role-binini'];
		const assets = ensureRoleAssets(roleId);
		if(assetTitle && profile){
			assetTitle.textContent = `${profile.name} 素材相册`;
		}

		if(!assets.length){
			roleGallery.innerHTML = '<div class="gallery-empty">拖拽图片到这里，或点击下方按钮上传素材</div>';
			return;
		}

		roleGallery.innerHTML = assets.map((item, index)=>`
			<article class="gallery-card gallery-card-uploaded" draggable="true" data-index="${index}">
				<button type="button" class="gallery-delete" aria-label="删除素材">×</button>
				<img src="${item.src}" alt="${item.title || '素材'}">
			</article>
		`).join('');
	};

	const fileToBase64 = (file)=>new Promise((resolve, reject)=>{
		const reader = new FileReader();
		reader.onload = ()=>resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

	const appendFilesToRole = async (fileList)=>{
		const roleId = getActiveRoleId();
		const assets = ensureRoleAssets(roleId);
		const files = Array.from(fileList || []).filter((f)=>String(f.type || '').startsWith('image/'));
		if(!files.length) return;

		for(const file of files){
			try{
				const dataUrl = await fileToBase64(file);
				assets.push({
					id: `upload-${Date.now()}-${Math.random()}`,
					src: dataUrl,
					title: file.name || '上传素材'
				});
			}catch{}
		}

		uploadInput.value = '';
		renderGallery(roleId);
	};

	if(!roleList.dataset.galleryBound){
		roleList.dataset.galleryBound = '1';
		roleList.querySelectorAll('.role-item').forEach((btn)=>{
			btn.addEventListener('click', ()=>{
				renderGallery(btn.id);
			});
		});
	}

	if(!uploadBtn.dataset.galleryBound){
		uploadBtn.dataset.galleryBound = '1';
		uploadBtn.addEventListener('click', ()=>uploadInput.click());
	}

	if(!uploadInput.dataset.galleryBound){
		uploadInput.dataset.galleryBound = '1';
		uploadInput.addEventListener('change', ()=>{
			if(uploadInput.files && uploadInput.files.length){
				appendFilesToRole(uploadInput.files);
			}
		});
	}

	if(!roleGallery.dataset.galleryDropBound){
		roleGallery.dataset.galleryDropBound = '1';
		['dragenter', 'dragover'].forEach((evt)=>{
			roleGallery.addEventListener(evt, (event)=>{
				event.preventDefault();
				roleGallery.classList.add('is-dragover');
			});
		});
		['dragleave', 'dragend'].forEach((evt)=>{
			roleGallery.addEventListener(evt, (event)=>{
				event.preventDefault();
				if(event.target === roleGallery) roleGallery.classList.remove('is-dragover');
			});
		});
		roleGallery.addEventListener('drop', (event)=>{
			event.preventDefault();
			roleGallery.classList.remove('is-dragover');
			if(event.dataTransfer?.files?.length){
				appendFilesToRole(event.dataTransfer.files);
			}
		});

		roleGallery.addEventListener('click', (event)=>{
			const deleteBtn = event.target.closest('.gallery-delete');
			if(!deleteBtn) return;
			event.preventDefault();
			event.stopPropagation();
			const card = deleteBtn.closest('.gallery-card');
			const roleId = getActiveRoleId();
			const assets = ensureRoleAssets(roleId);
			const idx = Number(card?.dataset.index || -1);
			if(Number.isNaN(idx) || idx < 0 || idx >= assets.length) return;
			assets.splice(idx, 1);
			renderGallery(roleId);
		});

		roleGallery.addEventListener('dragstart', (event)=>{
			const card = event.target.closest('.gallery-card');
			if(!card) return;
			draggingIndex = Number(card.dataset.index || -1);
			card.classList.add('is-dragging');
			if(event.dataTransfer){
				event.dataTransfer.effectAllowed = 'move';
				event.dataTransfer.setData('text/plain', String(draggingIndex));
			}
		});

		roleGallery.addEventListener('dragend', ()=>{
			draggingIndex = -1;
			roleGallery.querySelectorAll('.gallery-card').forEach((card)=>card.classList.remove('is-dragging', 'is-drop-target'));
		});

		roleGallery.addEventListener('dragover', (event)=>{
			const card = event.target.closest('.gallery-card');
			if(!card) return;
			event.preventDefault();
			roleGallery.querySelectorAll('.gallery-card').forEach((node)=>node.classList.toggle('is-drop-target', node === card));
		});

		roleGallery.addEventListener('drop', (event)=>{
			const targetCard = event.target.closest('.gallery-card');
			if(!targetCard) return;
			event.preventDefault();
			const roleId = getActiveRoleId();
			const assets = ensureRoleAssets(roleId);
			const targetIndex = Number(targetCard.dataset.index || -1);
			if(draggingIndex < 0 || targetIndex < 0 || draggingIndex === targetIndex) return;
			const moving = assets[draggingIndex];
			if(!moving) return;
			assets.splice(draggingIndex, 1);
			assets.splice(targetIndex, 0, moving);
			renderGallery(roleId);
		});
	}

	renderGallery(getActiveRoleId());
}

// AI page behaviors (stubs)
function initAI(){
	const chatInput = document.getElementById('chatInput');
	const chatLog = document.getElementById('chatLog');
	const sendBtn = document.getElementById('chatSendBtn');
	const roleList = document.getElementById('roleList');
	const chatTitle = document.querySelector('#ai .chat-box h3');
	let activeRoleId = 'ai-role-binini';

	const ensureRoleSession = (roleId)=>{
		if(!ROLE_CONFIG[roleId]) return;
		if(!roleChatStore[roleId]){
			roleChatStore[roleId] = [
				{ sender:'角色', text:ROLE_CONFIG[roleId].greet }
			];
		}
	};

	const renderRoleChat = (roleId)=>{
		if(!chatLog) return;
		chatLog.innerHTML = '';
		(roleChatStore[roleId] || []).forEach((msg)=>{
			appendMsg(msg.sender, msg.text, chatLog);
		});
	};

	const selectRole = (roleId, scrollToRole)=>{
		if(!roleList || !ROLE_CONFIG[roleId]) return;
		activeRoleId = roleId;
		sessionStorage.setItem('zeroniSelectedRole', roleId);
		roleList.querySelectorAll('.role-item').forEach((btn)=>btn.classList.toggle('is-active', btn.id === roleId));
		ensureRoleSession(roleId);
		renderRoleChat(roleId);
		if(chatTitle){
			chatTitle.textContent = `与 ${ROLE_CONFIG[roleId].name} 的专属对话`;
		}
		if(chatInput){
			chatInput.placeholder = `和 ${ROLE_CONFIG[roleId].name} 说点什么...`;
			chatInput.focus();
		}
		if(scrollToRole){
			document.getElementById(roleId)?.scrollIntoView({ behavior:'smooth', block:'center' });
		}
	};

	window.selectAiRoleById = selectRole;

	roleList?.querySelectorAll('.role-item').forEach((btn)=>{
		btn.addEventListener('click', ()=>{
			selectRole(btn.id, false);
		});
	});

	const sendCurrentMessage = async ()=>{
		const text = (chatInput?.value || '').trim();
		if(!text) return;
		ensureRoleSession(activeRoleId);
		roleChatStore[activeRoleId].push({ sender:'我', text });
		appendMsg('我', text, chatLog);
		if(chatInput) chatInput.value = '';

		const typingText = pickRandomText(ROLE_CONFIG[activeRoleId]?.typing, '角色正在回复...');
		appendMsg('角色', typingText, chatLog);
		const typingNode = chatLog?.lastElementChild;

		try{
			const resp = await fetch('/api/ai/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ prompt: text, roleName: ROLE_CONFIG[activeRoleId]?.name || 'ZERONI' })
			});
			const data = await resp.json();
			const reply = (data?.reply || '').trim() || '我在这儿，继续和我聊聊吧。';
			if(typingNode && typingNode.parentNode === chatLog){
				typingNode.remove();
			}
			roleChatStore[activeRoleId].push({ sender:'角色', text: reply });
			appendMsg('角色', reply, chatLog);
		}catch{
			if(typingNode && typingNode.parentNode === chatLog){
				typingNode.remove();
			}
			const fallback = '网络有点慢，但我一直在，试着再发一次吧。';
			roleChatStore[activeRoleId].push({ sender:'角色', text: fallback });
			appendMsg('角色', fallback, chatLog);
		}
	};

	sendBtn?.addEventListener('click', sendCurrentMessage);
	chatInput?.addEventListener('keydown', (event)=>{
		if(event.key === 'Enter' && !event.shiftKey){
			event.preventDefault();
			sendCurrentMessage();
		}
	});

	const preferredRole = sessionStorage.getItem('zeroniSelectedRole') || activeRoleId;
	selectRole(preferredRole, false);
}
// Wish page behavior
async function initWish(){
	const feed = document.getElementById('wishFeed');
	const hotWishes = document.getElementById('hotWishes');
	const submitBtn = document.getElementById('submitWish');
	const nickEl = document.getElementById('nick');
	const textEl = document.getElementById('wishText');
	const imgEl = document.getElementById('wishImage');
	const noteShapeEl = document.getElementById('noteShapeSelect');
	const noteToneEl = document.getElementById('noteToneSelect');
	const noteFontEl = document.getElementById('noteFontColorSelect');
	const commentModal = document.getElementById('wishCommentModal');
	const commentInput = document.getElementById('wishCommentInput');
	const commentSubmitBtn = document.getElementById('wishCommentSubmit');
	const commentCancelBtn = document.getElementById('wishCommentCancel');
	let detailModal = document.getElementById('wishDetailModal');

	const localNotes = [];
	const commentsById = new Map();
	const likesById = new Map();
	let activeCommentId = null;
	let noticeTimer = null;

	if(!feed || !textEl) return;

	const submitNotice = document.createElement('div');
	submitNotice.id = 'wishSubmitNotice';
	submitNotice.style.marginTop = '8px';
	submitNotice.style.fontSize = '.9rem';
	submitNotice.style.color = '#1b5dc4';
	submitNotice.style.minHeight = '1.2em';
	submitNotice.setAttribute('aria-live', 'polite');
	submitBtn?.insertAdjacentElement('afterend', submitNotice);

	function showSubmitNotice(message, isError){
		if(!submitNotice) return;
		submitNotice.textContent = message || '';
		submitNotice.style.color = isError ? '#c0392b' : '#1b5dc4';
		if(noticeTimer) clearTimeout(noticeTimer);
		noticeTimer = setTimeout(()=>{
			submitNotice.textContent = '';
		}, 2600);
	}

	function cardOffsetStyle(index){
		const rotate = ((index % 5) - 2) * 0.7;
		const dx = index % 3 === 0 ? -4 : index % 3 === 1 ? 3 : 0;
		const dy = index % 4 === 0 ? 2 : index % 4 === 2 ? -2 : 0;
		return `--rotate:${rotate}deg;--dx:${dx}px;--dy:${dy}px;`;
	}

	function getNoteId(it, index){
		return it.id || `local-${index}`;
	}

	function cardClass(it){
		const shape = it.shape || 'square';
		const tone = it.tone || 'soft-blue';
		const fontColor = it.fontColor || 'deep-blue';
		return `wish-card shape-${shape} tone-${tone} font-${fontColor}`;
	}

	function renderWishCard(it, index, allowActions){
		const noteId = getNoteId(it, index);
		const div = document.createElement('div');
		div.className = cardClass(it);
		div.dataset.noteId = String(noteId);
		div.dataset.noteNick = String(it.nick || '匿名');
		div.dataset.noteText = String(it.text || '');
		div.dataset.noteAuthor = String(it.author || '匿名');
		div.dataset.noteImg = String(it.img || '');
		div.dataset.noteStatus = String(it.status || (allowActions ? 'approved' : 'pending'));
		div.dataset.noteApproved = allowActions ? '1' : '0';
		div.style.cssText = cardOffsetStyle(index);
		div.innerHTML = `<strong>${it.nick || '匿名'}</strong><p>${it.text || ''}</p>`;
		if(it.img) div.innerHTML += `<img src="${it.img}" alt="wish image">`;
		const comments = commentsById.get(String(noteId)) || [];
		const likes = likesById.has(String(noteId)) ? Number(likesById.get(String(noteId))) : Number(it.likes || 0);
		if(allowActions){
			div.innerHTML += `<div class="wish-actions"><button class="wish-action-btn js-like-btn" type="button"><span>👍</span><span class="js-like-count">${likes}</span></button><button class="wish-action-btn js-comment-btn" type="button"><span>💬</span><span>${comments.length}</span></button></div>`;
		}
		div.innerHTML += `<div class="wish-meta">发布者：${it.author || '匿名'}${allowActions ? ` · 点赞 ${likes} · 评论 ${comments.length}` : ' · 审核中'}</div>`;
		if(allowActions && comments.length){
			div.innerHTML += `<div class="wish-comments">${comments.map(c=>`<div class="wish-comment-item">${c}</div>`).join('')}</div>`;
		}
		return div;
	}

	function ensureDetailModal(){
		if(detailModal) return detailModal;
		const wrap = document.createElement('div');
		wrap.id = 'wishDetailModal';
		wrap.className = 'wish-detail-modal is-hidden';
		wrap.setAttribute('aria-hidden', 'true');
		wrap.innerHTML = `
			<div class="wish-detail-card" role="dialog" aria-modal="true" aria-label="便利贴详情">
				<h4 id="wishDetailTitle">便利贴详情</h4>
				<div id="wishDetailBody" class="wish-detail-body"></div>
				<div class="wish-detail-actions">
					<button id="wishDetailClose" type="button">关闭</button>
				</div>
			</div>
		`;
		document.body.appendChild(wrap);
		detailModal = wrap;
		detailModal.addEventListener('click', (event)=>{
			if(event.target === detailModal) closeDetailModal();
		});
		detailModal.querySelector('#wishDetailClose')?.addEventListener('click', closeDetailModal);
		return detailModal;
	}

	function openDetailModal(card){
		const modal = ensureDetailModal();
		const title = modal.querySelector('#wishDetailTitle');
		const body = modal.querySelector('#wishDetailBody');
		const nick = card.dataset.noteNick || '匿名';
		const text = card.dataset.noteText || '';
		const author = card.dataset.noteAuthor || '匿名';
		const img = card.dataset.noteImg || '';
		const status = card.dataset.noteStatus === 'approved' ? '已审核通过' : '审核中';
		if(title) title.textContent = `${nick} 的便利贴`;
		if(body){
			body.innerHTML = `
				<p class="wish-detail-text">${text || '暂无内容'}</p>
				${img ? `<img src="${img}" alt="便利贴图片">` : ''}
				<div class="wish-detail-meta">发布者：${author} · 状态：${status}</div>
			`;
		}
		modal.classList.remove('is-hidden');
		modal.setAttribute('aria-hidden', 'false');
	}

	function closeDetailModal(){
		if(!detailModal) return;
		detailModal.classList.add('is-hidden');
		detailModal.setAttribute('aria-hidden', 'true');
	}

	function bindNoteActions(scope){
		scope.querySelectorAll('.wish-card').forEach((card)=>{
			if(card.dataset.detailBound === '1') return;
			card.dataset.detailBound = '1';
			card.addEventListener('click', (event)=>{
				if(event.target.closest('.wish-action-btn')) return;
				openDetailModal(card);
			});
		});

		scope.querySelectorAll('.js-like-btn').forEach((btn)=>{
			btn.addEventListener('click', ()=>{
				const card = btn.closest('.wish-card');
				if(!card || card.dataset.noteApproved !== '1') return;
				const id = String(card.dataset.noteId || '');
				const current = likesById.has(id) ? Number(likesById.get(id)) : Number(btn.querySelector('.js-like-count')?.textContent || '0');
				likesById.set(id, current + 1);
				loadFeed();
			});
		});

		scope.querySelectorAll('.js-comment-btn').forEach((btn)=>{
			btn.addEventListener('click', ()=>{
				const card = btn.closest('.wish-card');
				if(!card || card.dataset.noteApproved !== '1') return;
				activeCommentId = String(card.dataset.noteId || '');
				if(commentInput) commentInput.value = '';
				if(commentModal){
					commentModal.classList.remove('is-hidden');
					commentModal.setAttribute('aria-hidden', 'false');
				}
			});
		});
	}

	function closeCommentModal(){
		activeCommentId = null;
		if(commentModal){
			commentModal.classList.add('is-hidden');
			commentModal.setAttribute('aria-hidden', 'true');
		}
	}

	const loadFeed = async ()=>{
		const r = await fetch('/api/wish/feed');
		const d = await r.json();
		const approvedItems = Array.isArray(d.items) ? d.items : [];
		const user = getCurrentUser();
		const username = String(user?.username || '').trim();
		const myApprovedItems = approvedItems
			.filter((it)=>String(it.author || '').trim() === username)
			.map((it)=>({ ...it, status: 'approved' }));

		let myPendingItems = [];
		if(username){
			try{
				const subResp = await fetch(`/api/user/submissions?username=${encodeURIComponent(username)}`);
				const subData = await subResp.json();
				myPendingItems = (Array.isArray(subData.pending) ? subData.pending : [])
					.filter((it)=>it.type === 'wish' && it.status !== 'approved')
					.map((it)=>({
						id: `pending-${it.id}`,
						nick: it.payload?.nick || '匿名',
						text: it.payload?.text || '',
						img: it.payload?.img || null,
						author: username,
						likes: 0,
						comments: 0,
						status: 'pending'
					}));
			}catch{
				myPendingItems = [];
			}
		}

		const mergedMine = [...localNotes, ...myPendingItems, ...myApprovedItems];
		const dedupedMine = [];
		const seen = new Set();
		mergedMine.forEach((item)=>{
			const key = `${item.id || ''}|${item.author || ''}|${item.text || ''}|${item.img || ''}`;
			if(seen.has(key)) return;
			seen.add(key);
			dedupedMine.push(item);
		});

		feed.innerHTML = '';
		dedupedMine.forEach((it, index)=>{
			const allowActions = String(it.status || '') === 'approved' && !it.localPending;
			feed.appendChild(renderWishCard(it, index, allowActions));
		});
		bindNoteActions(feed);

		if(hotWishes){
			const hot = [...approvedItems].sort((a, b)=>{
				const aid = String(getNoteId(a, 0));
				const bid = String(getNoteId(b, 0));
				const alikes = likesById.has(aid) ? Number(likesById.get(aid)) : Number(a.likes || 0);
				const blikes = likesById.has(bid) ? Number(likesById.get(bid)) : Number(b.likes || 0);
				return blikes - alikes;
			}).slice(0, 4);
			hotWishes.innerHTML = '';
			hot.forEach((it, idx)=>{
				hotWishes.appendChild(renderWishCard({ ...it, tone: 'soft-blue', fontColor: 'deep-blue', shape: 'square' }, idx, true));
			});
			bindNoteActions(hotWishes);
		}
	};

	submitBtn?.addEventListener('click', async ()=>{
		const user = getCurrentUser();
		const nick = (nickEl.value || '').trim();
		const text = (textEl.value || '').trim();
		const shape = noteShapeEl?.value || 'square';
		const tone = noteToneEl?.value || 'soft-blue';
		const fontColor = noteFontEl?.value || 'deep-blue';
		if(!text){
			showSubmitNotice('先写下你的心愿内容再提交吧', true);
			return;
		}
		let imgData = null;
		if(imgEl?.files && imgEl.files[0]){
			imgData = await fileToBase64(imgEl.files[0]);
		}
		localNotes.unshift({
			id: `local-${Date.now()}`,
			nick: nick || '匿名',
			text,
			img: imgData,
			author: user?.username || nick || '匿名',
			likes: 0,
			comments: 0,
			shape,
			tone,
			fontColor,
			localPending: true
		});
		try{
			const r = await fetch('/api/wish/submit', {
				method: 'POST',
				headers: {'Content-Type': 'application/json'},
				body: JSON.stringify({nick, text, img: imgData, author: user?.username})
			});
			const result = await r.json();
			textEl.value = '';
			if(imgEl) imgEl.value = '';
			showSubmitNotice(result?.message || '便利贴已提交，等待审核中');
			loadFeed();
		}catch{
			showSubmitNotice('提交失败，请稍后再试', true);
		}
	});

	commentCancelBtn?.addEventListener('click', closeCommentModal);
	commentModal?.addEventListener('click', (e)=>{
		if(e.target === commentModal) closeCommentModal();
	});
	commentSubmitBtn?.addEventListener('click', ()=>{
		const text = (commentInput?.value || '').trim();
		if(!activeCommentId || !text) return;
		const current = commentsById.get(activeCommentId) || [];
		current.push(text);
		commentsById.set(activeCommentId, current);
		closeCommentModal();
		loadFeed();
	});

	function fileToBase64(file){
		return new Promise((res, rej)=>{
			const reader = new FileReader();
			reader.onload = ()=>res(reader.result);
			reader.onerror = rej;
			reader.readAsDataURL(file);
		});
	}

	loadFeed();
}

// Diary page behavior
async function initDiary(){
	const textEl = document.getElementById('diaryText');
	const imagesEl = document.getElementById('diaryImages');
	const timeline = document.getElementById('diaryTimeline');
	const saveBtn = document.getElementById('saveDiary');
	const charCount = document.getElementById('diaryCharCount');
	const MAX_DIARY_LEN = 500;
	const localPrivateDiaries = [];

	if(!timeline || !textEl) return;

	const updateCharCount = ()=>{
		const len = Math.min((textEl.value || '').length, MAX_DIARY_LEN);
		if((textEl.value || '').length > MAX_DIARY_LEN){
			textEl.value = textEl.value.slice(0, MAX_DIARY_LEN);
		}
		if(charCount) charCount.textContent = `${len}/${MAX_DIARY_LEN}`;
	};

	const renderTimeline = ()=>{
		if(!localPrivateDiaries.length){
			timeline.innerHTML = '<div class="diary-empty">哪怕结局已经注定，也要用力提笔写下我们限定的回忆。</div>';
			return;
		}
		timeline.innerHTML = localPrivateDiaries.map(item=>`
			<div class="diary-card" data-diary-id="${item.id}">
				<p>${item.text}</p>
				${(item.images || []).map(img=>`<img src="${img}" alt="diary image">`).join('')}
				<div class="diary-meta">发布时间：${item.createdAt}</div>
				<div class="diary-actions">
					<button class="js-edit-diary" type="button">编辑</button>
					<button class="js-delete-diary" type="button">删除</button>
				</div>
			</div>
		`).join('');

		timeline.querySelectorAll('.js-edit-diary').forEach((btn)=>{
			btn.addEventListener('click', ()=>{
				const card = btn.closest('.diary-card');
				if(!card) return;
				const id = card.getAttribute('data-diary-id');
				const target = localPrivateDiaries.find(d=>String(d.id) === String(id));
				if(!target) return;
				textEl.value = target.text || '';
				updateCharCount();
				localPrivateDiaries.splice(localPrivateDiaries.indexOf(target), 1);
				renderTimeline();
			});
		});

		timeline.querySelectorAll('.js-delete-diary').forEach((btn)=>{
			btn.addEventListener('click', ()=>{
				const card = btn.closest('.diary-card');
				if(!card) return;
				const id = card.getAttribute('data-diary-id');
				const idx = localPrivateDiaries.findIndex(d=>String(d.id) === String(id));
				if(idx >= 0){
					localPrivateDiaries.splice(idx, 1);
					renderTimeline();
				}
			});
		});
	};

	const loadTimeline = async ()=>{
		const r = await fetch('/api/diary/list');
		const d = await r.json();
		const user = getCurrentUser();
		const username = String(user?.username || '').trim();
		const list = Array.isArray(d.diaries) ? d.diaries : [];
		const myPrivate = list.filter(item=>item.privacy === 'private' && String(item.author || '').trim() === username).map((item)=>({
			id: item.id || `srv-${Date.now()}-${Math.random()}`,
			title: item.title || '我的日记',
			text: item.text || '',
			images: Array.isArray(item.images) ? item.images : [],
			createdAt: item.createdAt || new Date().toLocaleString()
		}));
		localPrivateDiaries.splice(0, localPrivateDiaries.length, ...myPrivate);
		renderTimeline();
	};

	loadTimeline();
	updateCharCount();
	textEl.addEventListener('input', updateCharCount);

	saveBtn?.addEventListener('click', async ()=>{
		const text = (textEl.value || '').trim();
		if(!text){
			alert('先写点内容再保存吧');
			return;
		}
		let images = [];
		if(imagesEl?.files && imagesEl.files.length){
			for(const file of imagesEl.files){
				images.push(await fileToBase64(file));
			}
		}
		const user = getCurrentUser();
		const payload = { text, privacy: 'private', images, author: user?.username };
		const localItem = {
			id: `local-${Date.now()}`,
			title: '我的日记',
			text,
			images,
			createdAt: new Date().toLocaleString()
		};
		localPrivateDiaries.unshift(localItem);
		renderTimeline();
		await fetch('/api/diary/save', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify(payload)
		});
		textEl.value = '';
		if(imagesEl) imagesEl.value = '';
		updateCharCount();
	});

	function fileToBase64(file){
		return new Promise((res, rej)=>{
			const reader = new FileReader();
			reader.onload = ()=>res(reader.result);
			reader.onerror = rej;
			reader.readAsDataURL(file);
		});
	}
}

async function initMusic(){
	const trackListEl = document.getElementById('musicTrackList');
	const audio = document.getElementById('audioPlayer');
	const mvPlayer = document.getElementById('mvPlayer');
	const nowTitle = document.getElementById('nowTitle');
	const lyricsPane = document.getElementById('lyricsPane');
	const cdDisc = document.getElementById('cdDisc');
	const cdCover = document.getElementById('cdCover');
	const modeLabel = document.getElementById('musicModeLabel');
	const cdModePanel = document.getElementById('cdModePanel');
	const mvModePanel = document.getElementById('mvModePanel');
	const prevBtn = document.getElementById('musicPrevBtn');
	const playPauseBtn = document.getElementById('musicPlayPauseBtn');
	const nextBtn = document.getElementById('musicNextBtn');
	const mvToggleBtn = document.getElementById('musicMvToggleBtn');

	if(!trackListEl || !audio || !nowTitle || !lyricsPane || !cdDisc || !cdCover || !modeLabel || !cdModePanel || !mvModePanel || !prevBtn || !playPauseBtn || !nextBtn || !mvToggleBtn || !mvPlayer) return;

	let tracks = [
		{ id: 1, title: 'In Bloom', artist: 'ZEROBASEONE', audio: '/assets/In Bloom.mp3', mv: '/assets/inbloom.MP4', cover: '/assets/in bloom.JPG' },
		{ id: 2, title: 'CRUSH (가시)', artist: 'ZEROBASEONE', audio: '/assets/CRUSH.mp3', mv: '/assets/crush.MP4', cover: '/assets/crush.JPG' },
		{ id: 3, title: 'Yura Yura', artist: 'ZEROBASEONE', audio: '/assets/YURA YURA.mp3', mv: '/assets/yurayura.MP4', cover: '/assets/yurayura.JPG' },
		{ id: 4, title: 'SWEAT', artist: 'ZEROBASEONE', audio: '/assets/SWEAT.mp3', mv: '/assets/sweat.MP4', cover: '/assets/sweat.JPG' },
		{ id: 5, title: 'Feel the Pop', artist: 'ZEROBASEONE', audio: '/assets/Feel the POP.mp3', mv: '/assets/Feel the pop.MP4', cover: '/assets/feel the pop.JPG' },
		{ id: 6, title: 'GOOD SO BAD', artist: 'ZEROBASEONE', audio: '/assets/GOOD SO BAD.mp3', mv: '/assets/good so bad.MP4', cover: '/assets/good so bad.JPG' },
		{ id: 7, title: 'NOW OR NEVER', artist: 'ZEROBASEONE', audio: '/assets/NOW OR NEVER.mp3', mv: '/assets/now or never.MP4', cover: '/assets/now or never.JPG' },
		{ id: 8, title: 'Doctor! Doctor!', artist: 'ZEROBASEONE', audio: '/assets/Doctor Doctor.mp3', mv: '/assets/doctor doctor.MP4', cover: '/assets/doctor doctor.JPG' },
		{ id: 9, title: 'BLUE', artist: 'ZEROBASEONE', audio: '/assets/BLUE.mp3', mv: '/assets/blue.MP4', cover: '/assets/blue.JPG' },
		{ id: 10, title: 'SLAM DUNK', artist: 'ZEROBASEONE', audio: '/assets/SLAM DUNK.mp3', mv: '/assets/slamdunk.MP4', cover: '/assets/slam dunk.jpg' },
		{ id: 11, title: 'ICONIK', artist: 'ZEROBASEONE', audio: '/assets/ICONIK.mp3', mv: '/assets/iconik.MP4', cover: '/assets/iconik.jpg' },
		{ id: 12, title: 'Running to Future', artist: 'ZEROBASEONE', audio: '/assets/Running to Future.mp3', mv: '/assets/running to future.MP4', cover: '/assets/running to future.jpg' }
	];
	const fallbackMv = '/assets/inbloom.MP4';
	let currentIndex = -1;
	let currentLyrics = [];
	let currentMode = 'cd';

	try{
		const libResp = await fetch('/api/music/library-detail');
		const libData = await libResp.json();
		if(Array.isArray(libData?.tracks) && libData.tracks.length){
			tracks = libData.tracks.map((item)=>({
				id: item.id,
				title: item.title,
				artist: item.artist,
				audio: item.audio || item.src || '',
				mv: item.mv || fallbackMv,
				cover: item.cover || '/images/char1.JPG',
				lyrics: Array.isArray(item.lyrics) ? item.lyrics : []
			}));
		}
	}catch{}

	const renderTrackList = ()=>{
		trackListEl.innerHTML = '';
		tracks.forEach((t, idx)=>{
			const div = document.createElement('div');
			div.className = 'music-track-item';
			div.innerHTML = `<div class="track-info"><strong>${t.title}</strong><br><small>${t.artist}</small></div><span>♪</span>`;
			div.addEventListener('click', ()=>playTrackByIndex(idx, true));
			trackListEl.appendChild(div);
		});
	};

	renderTrackList();

	function highlightLyric(lyrics, current){
		if(!lyricsPane) return;
		lyricsPane.innerHTML = '';
		lyrics.forEach((line,idx)=>{
			const div = document.createElement('div');
			div.textContent = line.text;
			if(current >= line.time){
				div.classList.add('line-active');
			}
			lyricsPane.appendChild(div);
		});
		lyricsPane.scrollTop = lyricsPane.scrollHeight;
	}

	function setMode(mode){
		currentMode = mode;
		const isMv = mode === 'mv';
		cdModePanel.classList.toggle('is-hidden', isMv);
		mvModePanel.classList.toggle('is-hidden', !isMv);
		modeLabel.textContent = isMv ? 'MV 全屏播放' : 'CD 单曲播放';
		mvToggleBtn.textContent = isMv ? '切回CD' : '切换MV';
		if(isMv){
			audio.pause();
			cdDisc.classList.remove('spinning');
			playPauseBtn.textContent = '播放';
			if(currentIndex >= 0){
				const currentTrack = tracks[currentIndex];
				mvPlayer.src = currentTrack.mv;
			}
			mvPlayer.play().catch(()=>{});
		}else{
			mvPlayer.pause();
		}
	}

	function setActiveTrackItem(index){
		trackListEl.querySelectorAll('.music-track-item').forEach((el, idx)=>{
			el.classList.toggle('active', idx === index);
		});
	}

	async function playTrackByIndex(index, autoPlay){
		if(index < 0 || index >= tracks.length) return;
		const target = tracks[index];
		currentIndex = index;
		setActiveTrackItem(index);
		audio.src = target.audio;
		nowTitle.textContent = `${target.title} - ${target.artist}`;
		currentLyrics = Array.isArray(target.lyrics) && target.lyrics.length
			? target.lyrics
			: [
				{ time: 0, text: `${target.title} 正在播放` },
				{ time: 12, text: '音乐室已按指定顺序整理完毕' },
				{ time: 24, text: '你可以继续切换上一首或下一首' }
			];
		cdCover.src = target.cover;
		if(currentMode === 'mv'){
			mvPlayer.src = target.mv;
		}
		if(autoPlay){
			audio.play().catch(()=>{});
			cdDisc.classList.add('spinning');
			playPauseBtn.textContent = '暂停';
		}
		highlightLyric(currentLyrics, 0);
	}

	audio.addEventListener('play', ()=>{
		cdDisc.classList.add('spinning');
		playPauseBtn.textContent = '暂停';
	});
	audio.addEventListener('pause', ()=>{
		cdDisc.classList.remove('spinning');
		playPauseBtn.textContent = '播放';
	});
	audio.addEventListener('ended', ()=>{
		if(tracks.length) playTrackByIndex((currentIndex + 1) % tracks.length, true);
	});

	audio.ontimeupdate = ()=>{
		const cur = audio.currentTime;
		highlightLyric(currentLyrics, cur);
	};

	prevBtn.addEventListener('click', ()=>{
		if(!tracks.length) return;
		const nextIndex = currentIndex <= 0 ? tracks.length - 1 : currentIndex - 1;
		playTrackByIndex(nextIndex, true);
	});
	nextBtn.addEventListener('click', ()=>{
		if(!tracks.length) return;
		const nextIndex = currentIndex >= tracks.length - 1 ? 0 : currentIndex + 1;
		playTrackByIndex(nextIndex, true);
	});
	playPauseBtn.addEventListener('click', ()=>{
		if(currentMode === 'mv'){
			if(mvPlayer.paused) mvPlayer.play().catch(()=>{});
			else mvPlayer.pause();
			return;
		}
		if(!audio.src && tracks.length){
			playTrackByIndex(0, true);
			return;
		}
		if(audio.paused) audio.play().catch(()=>{});
		else audio.pause();
	});
	mvToggleBtn.addEventListener('click', ()=>{
		setMode(currentMode === 'cd' ? 'mv' : 'cd');
	});

	if(tracks.length){
		playTrackByIndex(0, false);
	}

	setMode('cd');

	mvPlayer.addEventListener('play', ()=>{
		if(currentMode === 'mv') playPauseBtn.textContent = '暂停';
	});
	mvPlayer.addEventListener('pause', ()=>{
		if(currentMode === 'mv') playPauseBtn.textContent = '播放';
	});
	audio.addEventListener('error', ()=>{
		if(currentIndex < 0 || currentIndex >= tracks.length) return;
		const target = tracks[currentIndex];
		nowTitle.textContent = `${target.title} - ${target.artist}（音频文件缺失）`;
		currentLyrics = [
			{ time: 0, text: '当前歌曲音频暂缺，请切换下一首' }
		];
		highlightLyric(currentLyrics, 0);
		cdDisc.classList.remove('spinning');
		playPauseBtn.textContent = '播放';
	});
	mvPlayer.addEventListener('error', ()=>{
		if(mvPlayer.src.endsWith(fallbackMv)) return;
		mvPlayer.src = fallbackMv;
		if(currentMode === 'mv') mvPlayer.play().catch(()=>{});
	});

}

async function initSiteContent(){
	try{
		const resp = await fetch('/api/site/content');
		const data = await resp.json();
		const cfg = data?.config;
		if(!cfg) return;

		const navMap = new Map((Array.isArray(cfg.nav) ? cfg.nav : []).map((item)=>[String(item.key || ''), String(item.label || '')]));
		document.querySelectorAll('.tab-trigger').forEach((btn)=>{
			const key = btn.getAttribute('data-tab');
			if(navMap.has(key) && navMap.get(key)) btn.textContent = navMap.get(key);
		});

		const introTitle = document.querySelector('.site-intro h3');
		const introMain = document.querySelector('.site-intro .intro-main');
		const introSub = document.querySelector('.site-intro .intro-sub');
		if(introTitle && cfg.intro?.title) introTitle.textContent = cfg.intro.title;
		if(introMain && cfg.intro?.main) introMain.textContent = cfg.intro.main;
		if(introSub && cfg.intro?.sub) introSub.textContent = cfg.intro.sub;

		const homeVideo = document.getElementById('homeScreen2Video');
		if(homeVideo){
			if(cfg.homeVideo?.src) homeVideo.src = cfg.homeVideo.src;
			if(cfg.homeVideo?.poster) homeVideo.poster = cfg.homeVideo.poster;
		}

		const wishTab = document.getElementById('wish');
		const diaryTab = document.getElementById('diary');
		if(wishTab && cfg.theme?.wishBackground) wishTab.style.backgroundImage = `url('${cfg.theme.wishBackground}')`;
		if(diaryTab && cfg.theme?.diaryBackground) diaryTab.style.backgroundImage = `url('${cfg.theme.diaryBackground}')`;
		if(typeof cfg.shopUrl === 'string' && cfg.shopUrl.trim()) SHOP_EXTERNAL_URL = cfg.shopUrl.trim();
	}catch{}
}
// initialize pages when on page
document.addEventListener('DOMContentLoaded', ()=>{
	enableVideoFreeSeek();
	initSiteContent();
	initTabNavigation();
	initHomeInteractions();
	activateTab('home');
	initCarousel();
	initAI();
	initAiGalleryTools();
	initMusic();
	initWish();
	initDiary();
	initAccount();
	if(getCurrentUser() && typeof initProfile === 'function') initProfile();

});

