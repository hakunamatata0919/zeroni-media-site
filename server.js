const express = require('./express');
const path = require('path');
const fs = require('fs');
let fetch = global.fetch;
try {
  fetch = require('node-fetch');
} catch (error) {
  if (!fetch) throw error;
}

const ARK_API_KEY = 'ark-c05611ae-4ca2-4491-b31d-a2482a1f1011-e47ca';
const ARK_MODEL_ID = 'doubao-seed-2-0-lite-260428';
const ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/responses';

const app = express();
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});
app.use(express.json());

const publicDir = path.join(__dirname, 'public');
const assetsDir = path.join(publicDir, 'assets');
app.use(express.static(publicDir));
app.use('/images', express.static(path.join(__dirname, 'images')));

const musicAudioCandidates = {
  1: ['ZEROBASEONE - In Bloom.mp3', 'ZEROBASEONE-In Bloom.mp3'],
  2: ['ZEROBASEONE - CRUSH (가시).mp3', 'ZEROBASEONE-CRUSH (가시).mp3'],
  3: ['ZEROBASEONE - YURA YURA (Korean Ver_).mp3', 'ZEROBASEONE-YURA YURA (Korean Ver_).mp3'],
  4: ['ZEROBASEONE - SWEAT.mp3', 'ZEROBASEONE-SWEAT.mp3'],
  5: ['ZEROBASEONE - Feel the POP.mp3', 'ZEROBASEONE-Feel the POP.mp3'],
  6: ['ZEROBASEONE - GOOD SO BAD.mp3', 'ZEROBASEONE-GOOD SO BAD.mp3'],
  7: ['ZEROBASEONE - NOW OR NEVER (Korean ver_).mp3', 'ZEROBASEONE-NOW OR NEVER (Korean ver_).mp3'],
  8: ['ZEROBASEONE - Doctor! Doctor!.mp3', 'ZEROBASEONE-Doctor! Doctor!.mp3'],
  9: ['ZEROBASEONE - BLUE.mp3', 'ZEROBASEONE-BLUE.mp3'],
  10: ['ZEROBASEONE - SLAM DUNK.mp3', 'ZEROBASEONE-SLAM DUNK.mp3'],
  11: ['ZEROBASEONE - ICONIK.mp3', 'ZEROBASEONE-ICONIK.mp3'],
  12: ['ZEROBASEONE - Running to Future.mp3', 'ZEROBASEONE-Running to Future.mp3']
};

const musicAudioKeywords = {
  1: ['in', 'bloom'],
  2: ['crush'],
  3: ['yura'],
  4: ['sweat'],
  5: ['feel', 'pop'],
  6: ['good', 'so', 'bad'],
  7: ['now', 'never'],
  8: ['doctor'],
  9: ['blue'],
  10: ['slam', 'dunk'],
  11: ['iconik'],
  12: ['running', 'future']
};

function normalizeForMatch(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, ' ')
    .trim();
}

app.get('/api/music/audio/:id', (req, res) => {
  const id = Number(req.params.id);
  const candidates = musicAudioCandidates[id] || [];
  for (const filename of candidates) {
    const fullPath = path.join(assetsDir, filename);
    if (fs.existsSync(fullPath) && fs.statSync(fullPath).isFile()) {
      return res.sendFile(fullPath);
    }
  }

  const keywords = musicAudioKeywords[id] || [];
  if (keywords.length) {
    const files = fs.readdirSync(assetsDir).filter((name) => /\.mp3$/i.test(name));
    const found = files.find((name) => {
      const normalized = normalizeForMatch(name);
      return keywords.every((kw) => normalized.includes(kw));
    });
    if (found) {
      return res.sendFile(path.join(assetsDir, found));
    }
  }

  return res.status(404).json({ error: 'audio not found' });
});

app.get('/api/music/audio-debug/:id', (req, res) => {
  const id = Number(req.params.id);
  const files = fs.readdirSync(assetsDir).filter((name) => /\.mp3$/i.test(name));
  const keywords = musicAudioKeywords[id] || [];
  const matched = files.filter((name) => {
    const normalized = normalizeForMatch(name);
    return keywords.every((kw) => normalized.includes(kw));
  });
  res.json({
    id,
    assetsDir,
    keywords,
    candidates: musicAudioCandidates[id] || [],
    files,
    matched
  });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

// API stubs
app.get('/api/status', (req, res) => {
  res.json({ status: 'ok', name: 'ZERONI 融媒体站点骨架' });
});

app.get('/api/tabs', (req, res) => {
  res.json({
    tabs: [
      '首页', 'AI伴侣互动', '官方音乐室', '心愿便利贴', '回忆日记', '购买渠道'
    ]
  });
});

// AI chat (Volcengine Ark Doubao)
app.post('/api/ai/chat', async (req, res) => {
  const { prompt, roleName } = req.body || {};

  if (!prompt || !String(prompt).trim()) {
    return res.json({ reply: '我在这里呢，想和我聊点什么呀？' });
  }

  const normalizedPrompt = String(prompt || '').toLowerCase();
  const blockedInputKeywords = Array.isArray(siteConfig?.aiParams?.blockedInputKeywords)
    ? siteConfig.aiParams.blockedInputKeywords
    : [];
  const hitBlockedInput = blockedInputKeywords.find((kw)=>kw && normalizedPrompt.includes(String(kw).toLowerCase()));
  if(hitBlockedInput){
    return res.json({ reply: '这类内容我不能继续聊，但我可以陪你聊些温柔、积极的话题。' });
  }

  const rolePersonaMap = siteConfig?.aiParams?.rolePersonas || {};
  const rolePersonaText = roleName && rolePersonaMap[roleName]
    ? `当前角色人设：${rolePersonaMap[roleName]}`
    : '';
  const styleText = siteConfig?.aiParams?.replyStyle || '简短、治愈、可爱、有陪伴感';
  const systemPrompt = `你是Zeroni's World里的软萌玩偶陪伴角色，面向ZEROBASEONE粉丝。回复风格：${styleText}。语气温柔，不要生硬说教。${rolePersonaText}`;
  const userPrompt = roleName
    ? `当前角色：${roleName}\n用户消息：${prompt}`
    : String(prompt);

  try {
    const arkRes = await fetch(ARK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ARK_API_KEY}`
      },
      body: JSON.stringify({
        model: ARK_MODEL_ID,
        input: [
          {
            role: 'system',
            content: [
              {
                type: 'input_text',
                text: systemPrompt
              }
            ]
          },
          {
            role: 'user',
            content: [
              {
                type: 'input_text',
                text: userPrompt
              }
            ]
          }
        ],
        temperature: 0.8,
        max_output_tokens: 512
      })
    });

    if (!arkRes.ok) {
      throw new Error(`Ark API error: ${arkRes.status}`);
    }

    const data = await arkRes.json();
    const outputItems = Array.isArray(data?.output) ? data.output : [];
    const contentItems = outputItems.flatMap((item) => Array.isArray(item?.content) ? item.content : []);
    const summaryItems = outputItems.flatMap((item) => Array.isArray(item?.summary) ? item.summary : []);
    const joinedContent = contentItems
      .map((item) => {
        if (typeof item?.text === 'string') return item.text;
        if (typeof item?.output_text === 'string') return item.output_text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
    const joinedSummary = summaryItems
      .map((item) => {
        if (typeof item?.text === 'string') return item.text;
        if (typeof item?.summary_text === 'string') return item.summary_text;
        return '';
      })
      .filter(Boolean)
      .join('\n');
    const content = data?.output_text
      || joinedContent
      || joinedSummary
      || data?.choices?.[0]?.message?.content;
    let reply = typeof content === 'string' && content.trim()
      ? content.trim()
      : '抱抱你，我一直都在。想继续和我说说吗？';

    const blockedOutputKeywords = Array.isArray(siteConfig?.aiParams?.blockedOutputKeywords)
      ? siteConfig.aiParams.blockedOutputKeywords
      : [];
    const lowerReply = reply.toLowerCase();
    const hitBlockedOutput = blockedOutputKeywords.find((kw)=>kw && lowerReply.includes(String(kw).toLowerCase()));
    if(hitBlockedOutput){
      reply = '这段内容不太合适，我们换个轻松温柔的话题继续聊吧。';
    }

    return res.json({ reply });
  } catch (error) {
    console.error('Ark chat error:', error?.message || error);
    return res.json({ reply: '今天网络有点小迷糊，但我会一直陪着你，我们再试一次好不好？' });
  }
});

app.post('/api/ai/gen-text', (req, res) => {
  const { prompt } = req.body || {};
  res.json({ text: `示例文案：关于 ${prompt} 的热情文案。` });
});

// User + Admin data stubs
const users = [
  { username:'fan1', password:'123456', avatar:'', nickname:'粉丝1', bio:'我是 zeroni 粉丝。', banned:false, records:['心愿贴x1','日记x2'] }
];

const auditItems = [
  { id:1, type:'wish', title:'祝ZERONI更强', author:'fan1', preview:'愿你们越来越优秀。', status:'pending', category:'心愿贴', payload:{nick:'粉丝1', text:'愿你们越来越优秀。', img:null} },
  { id:2, type:'diary', title:'回忆日记片段', author:'fan1', preview:'今天我与ZERONI一起经历了...', status:'pending', category:'回忆日记', payload:{text:'今天我与ZERONI一起经历了...', images:[], musicId:1, privacy:'public'} }
];

const wishItems = [
  {
    id:1,
    nick:'粉丝A',
    text:'祝 zeroni 万岁！',
    img:null,
    likes:5,
    comments:[
      { id:1, text:'一起冲！', author:'fanB', createdAt:'2026-07-10 12:00:00' },
      { id:2, text:'支持支持', author:'fanC', createdAt:'2026-07-10 12:02:00' }
    ],
    status:'approved',
    author:'fanA'
  }
];

const approvedDiaries = [
  { id:1, title:'示例日记', text:'这是示例回忆日记内容。', images:[], music:{title:'官方主题曲'}, privacy:'public', createdAt:'2026-07-04', author:'admin' }
];

const assets = [
  { id:1, type:'image', title:'官方海报', owner:'admin', status:'active', url:'/assets/banner1.jpg' },
  { id:2, type:'audio', title:'官方主题曲', owner:'admin', status:'active', url:'/assets/audio1.mp3' },
  { id:3, type:'ai', title:'AI封面图', owner:'fan1', status:'active', url:'/assets/ai1.png', prompt:'AI封面图' },
  { id:4, type:'video', title:'In Bloom MV', owner:'admin', status:'active', url:'/assets/inbloom.MP4' }
];

let musicTracks = [
  {
    id:1,
    title:'In Bloom',
    artist:'ZEROBASEONE',
    audio:'/assets/In Bloom.mp3',
    cover:'/assets/in bloom.JPG',
    mv:'/assets/inbloom.MP4',
    lyrics:[{ time:0, text:'In Bloom 正在播放' }, { time:12, text:'把今天点亮吧' }],
    status:'active'
  },
  {
    id:2,
    title:'CRUSH (가시)',
    artist:'ZEROBASEONE',
    audio:'/assets/CRUSH.mp3',
    cover:'/assets/crush.JPG',
    mv:'/assets/crush.MP4',
    lyrics:[{ time:0, text:'CRUSH 正在播放' }, { time:12, text:'继续加油' }],
    status:'active'
  },
  {
    id:3,
    title:'YURA YURA',
    artist:'ZEROBASEONE',
    audio:'/assets/YURA YURA.mp3',
    cover:'/assets/yurayura.JPG',
    mv:'/assets/yurayura.MP4',
    lyrics:[{ time:0, text:'YURA YURA 正在播放' }, { time:12, text:'跟着节奏摇摆' }],
    status:'active'
  },
  {
    id:4,
    title:'SWEAT',
    artist:'ZEROBASEONE',
    audio:'/assets/SWEAT.mp3',
    cover:'/assets/sweat.JPG',
    mv:'/assets/sweat.MP4',
    lyrics:[{ time:0, text:'SWEAT 正在播放' }, { time:12, text:'能量正在升温' }],
    status:'active'
  },
  {
    id:5,
    title:'Feel the POP',
    artist:'ZEROBASEONE',
    audio:'/assets/Feel the POP.mp3',
    cover:'/assets/feel the pop.JPG',
    mv:'/assets/feel the pop.MP4',
    lyrics:[{ time:0, text:'Feel the POP 正在播放' }, { time:12, text:'快乐值持续拉满' }],
    status:'active'
  },
  {
    id:6,
    title:'GOOD SO BAD',
    artist:'ZEROBASEONE',
    audio:'/assets/GOOD SO BAD.mp3',
    cover:'/assets/good so bad.JPG',
    mv:'/assets/goodsobad.MP4',
    lyrics:[{ time:0, text:'GOOD SO BAD 正在播放' }, { time:12, text:'把心情全部点亮' }],
    status:'active'
  },
  {
    id:7,
    title:'NOW OR NEVER',
    artist:'ZEROBASEONE',
    audio:'/assets/NOW OR NEVER.mp3',
    cover:'/assets/now or never.JPG',
    mv:'/assets/now or never.MP4',
    lyrics:[{ time:0, text:'NOW OR NEVER 正在播放' }, { time:12, text:'此刻就是最好的时刻' }],
    status:'active'
  },
  {
    id:8,
    title:'Doctor! Doctor!',
    artist:'ZEROBASEONE',
    audio:'/assets/Doctor Doctor.mp3',
    cover:'/assets/doctor doctor.JPG',
    mv:'/assets/doctor doctor.MP4',
    lyrics:[{ time:0, text:'Doctor! Doctor! 正在播放' }, { time:12, text:'节奏加速中' }],
    status:'active'
  },
  {
    id:9,
    title:'BLUE',
    artist:'ZEROBASEONE',
    audio:'/assets/BLUE.mp3',
    cover:'/assets/blue.JPG',
    mv:'/assets/blue.MP4',
    lyrics:[{ time:0, text:'BLUE 正在播放' }, { time:12, text:'把温柔留在耳边' }],
    status:'active'
  },
  {
    id:10,
    title:'SLAM DUNK',
    artist:'ZEROBASEONE',
    audio:'/assets/SLAM DUNK.mp3',
    cover:'/assets/slam dunk.jpg',
    mv:'/assets/slamdunk.MP4',
    lyrics:[{ time:0, text:'SLAM DUNK 正在播放' }, { time:12, text:'热血正在升温' }],
    status:'active'
  },
  {
    id:11,
    title:'ICONIK',
    artist:'ZEROBASEONE',
    audio:'/assets/ICONIK.mp3',
    cover:'/assets/iconik.jpg',
    mv:'/assets/iconik.MP4',
    lyrics:[{ time:0, text:'ICONIK 正在播放' }, { time:12, text:'舞台感正在拉满' }],
    status:'active'
  },
  {
    id:12,
    title:'Running to Future',
    artist:'ZEROBASEONE',
    audio:'/assets/Running to Future.mp3',
    cover:'/assets/running to future.jpg',
    mv:'/assets/running to future.MP4',
    lyrics:[{ time:0, text:'Running to Future 正在播放' }, { time:12, text:'向着未来奔跑' }],
    status:'active'
  }
];

let playlists = [
  { id:1, name:'默认歌单', tracks:[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
];

const siteConfig = {
  banners:[{url:'/assets/banner1.jpg',title:'欢迎来到 ZERONI'}],
  notice:'欢迎来到 Zeroni’s World。',
  nav:[
    { key:'home', label:'首页' },
    { key:'ai', label:'AI伴侣互动' },
    { key:'music', label:'官方音乐室' },
    { key:'wish', label:'心愿便利贴' },
    { key:'diary', label:'回忆日记' },
    { key:'shop', label:'购买渠道' },
    { key:'profile', label:'个人中心' }
  ],
  intro:{
    title:'ZERONI 站点简介',
    main:'Zeroni\'s World 是专属 ZEROBASEONE 衍生玩偶 ZERONI 的治愈陪伴网站。',
    sub:'在这里你能和9位专属娃娃开启沉浸式 AI 情感对话，记录心愿、留存珍贵回忆、聆听治愈音源，构筑专属于你与 ZERONI 的温柔虚拟小世界。'
  },
  homeVideo:{
    src:'/images/IMG_1616.MOV',
    poster:'/assets/poster1.jpg'
  },
  shopUrl:'https://linefriendssquare.com/en/collections/zerobaseone-zeroni',
  theme:{
    homeBackground:'/images/bg-main.jpg',
    wishBackground:'/images/bg4.jpg',
    diaryBackground:'/images/bg5.jpg'
  },
  aiParams:{
    voice:'普通话',
    responseMode:'友好',
    replyStyle:'简短、温柔、治愈、陪伴感强',
    rolePersonas:{
      BININI:'沉稳队长型，擅长给人安全感和坚定支持。',
      WOONGNINI:'运动热血风，鼓励感强，语气干脆。',
      HANINI:'细腻温柔，偏安抚与倾听。'
    },
    blockedInputKeywords:['自残','暴力袭击','仇恨辱骂'],
    blockedOutputKeywords:['违法教程','极端暴力']
  }
};

let adminInfo = { username:'admin', password:'123456' };

function toLyricsArray(raw){
  if(Array.isArray(raw)) return raw;
  const text = String(raw || '').trim();
  if(!text) return [];
  return text.split(/\r?\n/).map((line, index)=>({ time:index * 8, text:line.trim() })).filter((x)=>x.text);
}

function getTrackById(id){
  return musicTracks.find((track)=>String(track.id) === String(id));
}

function getWishComments(item){
  return Array.isArray(item.comments) ? item.comments : [];
}

function isAdminRequest(req) {
  const body = req.body || {};
  const query = req.query || {};
  return query.isAdmin === 'true' || query.isAdmin === true || body.isAdmin === true || body.isAdmin === 'true';
}

function adminAuth(req, res, next) {
  if (req.path === '/login' || req.path === '/api/admin/login') return next();
  if (isAdminRequest(req)) return next();
  return res.status(403).json({ ok:false, message:'无权限' });
}

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === adminInfo.username && password === adminInfo.password) {
    return res.json({ ok:true, message:'登录成功' });
  }
  return res.status(401).json({ ok:false, message:'账号或密码错误' });
});

app.use('/api/admin', adminAuth);

app.post('/api/user/register', (req, res) => {
  const { username, password, avatar } = req.body || {};
  if(!username || !password) return res.json({ ok:false, message:'用户名和密码不能为空' });
  if(users.find(u=>u.username===username)) return res.json({ ok:false, message:'用户名已存在' });
  users.push({ username, password, avatar, nickname: username, bio:'这是我的个人简介。', banned:false, records:[] });
  res.json({ ok:true });
});

app.post('/api/user/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = users.find(u=>u.username===username && u.password===password);
  if(!user) return res.json({ ok:false, message:'用户名或密码错误' });
  if(user.banned) return res.json({ ok:false, message:'账号已被封禁，请联系管理员' });
  res.json({ ok:true, user:{ username:user.username, avatar:user.avatar, nickname:user.nickname, bio:user.bio } });
});

app.post('/api/user/change-password', (req, res) => {
  const { username, oldPassword, newPassword } = req.body || {};
  const user = users.find(u=>u.username===username && u.password===oldPassword);
  if(!user) return res.json({ ok:false, message:'旧密码错误' });
  user.password = newPassword;
  res.json({ ok:true });
});

app.get('/api/admin/users', (req, res) => {
  const q = (req.query.query || '').toLowerCase();
  const list = users.filter(u => !q || u.username.toLowerCase().includes(q) || (u.nickname||'').toLowerCase().includes(q))
    .map(u => ({ username:u.username, nickname:u.nickname, bio:u.bio, avatar:u.avatar, banned:u.banned, records:u.records || [] }));
  res.json({ users:list });
});

app.post('/api/admin/users/:username/ban', (req, res) => {
  const user = users.find(u=>u.username===req.params.username);
  if(!user) return res.status(404).json({ ok:false, message:'用户不存在' });
  user.banned = true;
  res.json({ ok:true });
});

app.post('/api/admin/users/:username/unban', (req, res) => {
  const user = users.find(u=>u.username===req.params.username);
  if(!user) return res.status(404).json({ ok:false, message:'用户不存在' });
  user.banned = false;
  res.json({ ok:true });
});

app.post('/api/admin/users/:username/reset-password', (req, res) => {
  const user = users.find(u=>u.username===req.params.username);
  if(!user) return res.status(404).json({ ok:false, message:'用户不存在' });
  user.password = '123456';
  res.json({ ok:true, message:'已重置密码为123456' });
});

app.post('/api/admin/change-password', (req, res) => {
  const { oldPassword, newPassword } = req.body || {};
  if(!oldPassword || !newPassword){
    return res.status(400).json({ ok:false, message:'参数不完整' });
  }
  if(oldPassword !== adminInfo.password){
    return res.status(400).json({ ok:false, message:'旧密码错误' });
  }
  adminInfo = { ...adminInfo, password:newPassword };
  res.json({ ok:true, message:'管理员密码修改成功' });
});

app.get('/api/admin/audit/pending', (req, res) => {
  res.json({ items:auditItems.filter(i=>i.status==='pending' && i.type !== 'ai') });
});

app.get('/api/admin/wishes', (req, res) => {
  const rows = wishItems.map((item)=>{
    const comments = getWishComments(item);
    return {
      ...item,
      comments,
      commentsCount: comments.length,
      likes: Number(item.likes || 0)
    };
  });
  res.json({ items: rows });
});

app.delete('/api/admin/wishes/:id/comments/:commentId', (req, res) => {
  const wish = wishItems.find((item)=>String(item.id) === String(req.params.id));
  if(!wish) return res.status(404).json({ ok:false, message:'便利贴不存在' });
  const comments = getWishComments(wish);
  const idx = comments.findIndex((c)=>String(c.id) === String(req.params.commentId));
  if(idx < 0) return res.status(404).json({ ok:false, message:'评论不存在' });
  comments.splice(idx, 1);
  wish.comments = comments;
  res.json({ ok:true, message:'评论已删除' });
});

app.get('/api/admin/assets', (req, res) => {
  const type = req.query.type;
  const list = type && type !== 'all' ? assets.filter(a=>a.type===type) : assets;
  res.json({ assets:list });
});

app.post('/api/admin/assets/bulk-action', (req, res) => {
  const { ids, action } = req.body || {};
  if(!Array.isArray(ids)||!action) return res.status(400).json({ ok:false, message:'参数不全' });
  ids.forEach(id=>{
    const asset = assets.find(a=>a.id==id);
    if(asset){
      if(action==='off') asset.status='offline';
      if(action==='delete') asset.status='deleted';
    }
  });
  res.json({ ok:true });
});

app.get('/api/admin/config', (req, res) => {
  res.json({ config:siteConfig });
});

app.post('/api/admin/config', (req, res) => {
  const { banners, notice, nav, aiParams } = req.body || {};
  if(banners) siteConfig.banners = banners;
  if(typeof notice === 'string') siteConfig.notice = notice;
  if(nav) siteConfig.nav = nav;
  if(aiParams) siteConfig.aiParams = aiParams;
  res.json({ ok:true, config:siteConfig });
});

app.get('/api/admin/music/tracks', (req, res) => {
  res.json({ tracks: musicTracks, playlists });
});

app.post('/api/admin/music/tracks', (req, res) => {
  const { title, artist, audio, cover, mv, lyrics, status } = req.body || {};
  if(!title || !artist) return res.status(400).json({ ok:false, message:'标题和歌手必填' });
  const id = musicTracks.length ? Math.max(...musicTracks.map((x)=>Number(x.id))) + 1 : 1;
  const track = {
    id,
    title,
    artist,
    audio: audio || '',
    cover: cover || '',
    mv: mv || '',
    lyrics: toLyricsArray(lyrics),
    status: status || 'active'
  };
  musicTracks.push(track);
  assets.push({ id: assets.length + 1, type:'audio', title:`${title} 音频`, owner:'admin', status:'active', url:track.audio || '' });
  if(track.cover) assets.push({ id: assets.length + 1, type:'image', title:`${title} 封面`, owner:'admin', status:'active', url:track.cover });
  if(track.mv) assets.push({ id: assets.length + 1, type:'video', title:`${title} MV`, owner:'admin', status:'active', url:track.mv });
  playlists[0]?.tracks.push(id);
  res.json({ ok:true, track });
});

app.post('/api/admin/music/tracks/:id', (req, res) => {
  const track = getTrackById(req.params.id);
  if(!track) return res.status(404).json({ ok:false, message:'曲目不存在' });
  const { title, artist, audio, cover, mv, lyrics, status } = req.body || {};
  if(typeof title === 'string') track.title = title;
  if(typeof artist === 'string') track.artist = artist;
  if(typeof audio === 'string') track.audio = audio;
  if(typeof cover === 'string') track.cover = cover;
  if(typeof mv === 'string') track.mv = mv;
  if(typeof status === 'string') track.status = status;
  if(typeof lyrics !== 'undefined') track.lyrics = toLyricsArray(lyrics);
  res.json({ ok:true, track });
});

app.delete('/api/admin/music/tracks/:id', (req, res) => {
  const id = String(req.params.id);
  const idx = musicTracks.findIndex((item)=>String(item.id) === id);
  if(idx < 0) return res.status(404).json({ ok:false, message:'曲目不存在' });
  musicTracks.splice(idx, 1);
  playlists.forEach((list)=>{
    list.tracks = (list.tracks || []).filter((trackId)=>String(trackId) !== id);
  });
  res.json({ ok:true });
});

app.post('/api/admin/music/tracks/reorder', (req, res) => {
  const { ids } = req.body || {};
  if(!Array.isArray(ids) || !ids.length) return res.status(400).json({ ok:false, message:'参数错误' });
  const idSet = new Set(ids.map((id)=>String(id)));
  const ordered = ids.map((id)=>getTrackById(id)).filter(Boolean);
  const remain = musicTracks.filter((track)=>!idSet.has(String(track.id)));
  musicTracks = [...ordered, ...remain];
  if(playlists[0]) playlists[0].tracks = musicTracks.map((track)=>track.id);
  res.json({ ok:true, tracks: musicTracks });
});

app.get('/api/admin/ai-config', (req, res) => {
  res.json({ aiParams: siteConfig.aiParams });
});

app.post('/api/admin/ai-config', (req, res) => {
  const { replyStyle, rolePersonas, blockedInputKeywords, blockedOutputKeywords } = req.body || {};
  if(typeof replyStyle === 'string') siteConfig.aiParams.replyStyle = replyStyle;
  if(rolePersonas && typeof rolePersonas === 'object') siteConfig.aiParams.rolePersonas = rolePersonas;
  if(Array.isArray(blockedInputKeywords)) siteConfig.aiParams.blockedInputKeywords = blockedInputKeywords;
  if(Array.isArray(blockedOutputKeywords)) siteConfig.aiParams.blockedOutputKeywords = blockedOutputKeywords;
  res.json({ ok:true, aiParams: siteConfig.aiParams });
});

app.get('/api/admin/site-content', (req, res) => {
  res.json({ config: siteConfig });
});

app.post('/api/admin/site-content', (req, res) => {
  const { notice, nav, intro, homeVideo, theme, shopUrl } = req.body || {};
  if(typeof notice === 'string') siteConfig.notice = notice;
  if(Array.isArray(nav)) siteConfig.nav = nav;
  if(intro && typeof intro === 'object') siteConfig.intro = { ...siteConfig.intro, ...intro };
  if(homeVideo && typeof homeVideo === 'object') siteConfig.homeVideo = { ...siteConfig.homeVideo, ...homeVideo };
  if(theme && typeof theme === 'object') siteConfig.theme = { ...siteConfig.theme, ...theme };
  if(typeof shopUrl === 'string') siteConfig.shopUrl = shopUrl;
  res.json({ ok:true, config: siteConfig });
});

app.get('/api/music/library', (req, res) => {
  res.json({ tracks: musicTracks.filter((t)=>t.status !== 'offline').map(t=>({id:t.id,title:t.title,artist:t.artist})) });
});

app.get('/api/music/library-detail', (req, res) => {
  const tracks = musicTracks.filter((t)=>t.status !== 'offline');
  res.json({ tracks });
});

app.get('/api/music/track/:id', (req, res) => {
  const t = getTrackById(req.params.id);
  if(!t) return res.status(404).json({error:'not found'});
  res.json({ ...t, src: t.audio });
});

app.post('/api/music/like', (req, res) => { res.json({status:'ok'}); });
app.post('/api/music/comment', (req, res) => { res.json({status:'ok'}); });

app.post('/api/music/playlist', (req, res) => { const id = playlists.length+1; const p={id,name:req.body.name||'歌单'+id,tracks:[]}; playlists.push(p); res.json({id:p.id}); });
app.get('/api/music/playlists', (req, res) => { res.json({playlists}); });
app.post('/api/music/playlist/:id/add', (req, res) => { const p=playlists.find(x=>x.id==req.params.id); if(!p) return res.status(404).json({error:'no list'}); p.tracks.push(req.body.trackId); res.json({status:'ok'}); });

app.get('/api/site/content', (req, res) => {
  res.json({ config: siteConfig });
});

// Wish API stubs
app.get('/api/wish/feed', (req, res) => {
  const list = wishItems.filter(i=>i.status==='approved').map((item)=>(
    {
      ...item,
      comments: getWishComments(item).length
    }
  ));
  res.json({ items: list });
});

app.post('/api/wish/submit', (req, res) => {
  const { nick, text, img, author } = req.body || {};
  const id = auditItems.length + 1;
  const summary = text ? text.slice(0,80) : '无内容';
  auditItems.push({ id, type:'wish', title:'用户心愿', author:author||'guest', preview:summary, status:'pending', category:'心愿贴', payload:{nick,text,img} });
  res.json({ status:'submitted', id, message:'已提交审核，管理员通过后才会展示' });
});

app.get('/api/user/submissions', (req, res) => {
  const username = req.query.username;
  if(!username) return res.status(400).json({ ok:false, message:'缺少用户名' });
  const pending = auditItems.filter(i=>i.author===username).map(i=>({
    id:i.id,
    type:i.type,
    title:i.title,
    preview:i.preview,
    status:i.status,
    category:i.category,
    reason:i.reason || '',
    payload:i.payload || {}
  }));
  const approvedWish = wishItems.filter(i=>i.author===username && i.status==='approved').map(i=>({ id:i.id, type:'wish', text:i.text, img:i.img, status:i.status }));
  const approvedDiary = approvedDiaries.filter(d=>d.author===username).map(d=>({ id:d.id, type:'diary', title:d.title, text:d.text, privacy:d.privacy, status:'approved' }));
  const approvedAssets = [];
  res.json({ pending, approvedWish, approvedDiary, approvedAssets });
});

app.get('/api/diary/list', (req, res) => {
  const publicOnly = req.query.public === 'true';
  const list = publicOnly ? approvedDiaries.filter(d=>d.privacy==='public') : approvedDiaries;
  res.json({ diaries:list });
});

app.post('/api/diary/save', (req, res) => {
  const { text, privacy, images, musicId, author } = req.body || {};
  const id = auditItems.length + 1;
  const summary = text ? text.slice(0,80) : '无内容';
  auditItems.push({ id, type:'diary', title:'用户日记投稿', author:author||'guest', preview:summary, status:'pending', category:'回忆日记', payload:{text,privacy,images,musicId} });
  res.json({ status:'submitted', id, message:'日记已提交审核，审核通过后将公开展示' });
});

app.post('/api/assets/submit', (req, res) => {
  res.status(410).json({ ok:false, message:'AI作品投稿功能已下线' });
});

app.post('/api/admin/audit/:id/approve', (req, res) => {
  const item = auditItems.find(i=>i.id==req.params.id);
  if(!item) return res.status(404).json({ ok:false, message:'审核项不存在' });
  item.status='approved';
  if(item.type==='wish'){
    const { nick,text,img } = item.payload || {};
    wishItems.push({ id: wishItems.length+1, nick:nick||'匿名', text:text||'', img:img||null, likes:0, comments:[], status:'approved', author:item.author });
  }
  if(item.type==='diary'){
    const payload = item.payload || {};
    approvedDiaries.push({ id: approvedDiaries.length+1, title:item.title, text:payload.text||'', images:payload.images||[], music:{title:'官方主题曲'}, privacy:payload.privacy||'public', createdAt:new Date().toISOString().slice(0,10), author:item.author });
  }
  res.json({ ok:true });
});

app.post('/api/admin/audit/:id/reject', (req, res) => {
  const item = auditItems.find(i=>i.id==req.params.id);
  if(!item) return res.status(404).json({ ok:false, message:'审核项不存在' });
  item.status='rejected';
  item.reason = req.body.reason || '未填写理由';
  res.json({ ok:true });
});

app.delete('/api/admin/audit/:id', (req, res) => {
  const idx = auditItems.findIndex(i=>i.id==req.params.id);
  if(idx === -1) return res.status(404).json({ ok:false, message:'审核项不存在' });
  auditItems.splice(idx,1);
  res.json({ ok:true });
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(publicDir, 'admin', 'index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, ()=>{
  console.log(`网站运行在端口${port}`)
})
