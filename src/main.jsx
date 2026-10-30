import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import {
  Activity, Bell, BellOff, Bookmark, Check, ChevronDown, ChevronRight, CircleDot, Clock3, Code2, Compass,
  ExternalLink, GitFork, Github, Hash, Heart, Home, Link2, MessageCircle, MoreHorizontal,
  Megaphone, Pencil, Pin, Plus, Repeat2, Reply, Search, Send, Share2, Smile, Sparkles, Star, Trophy, Users, Video, X
} from 'lucide-react';
import './styles.css';
import { communityFeed, communityAds } from './community-content';
import { NotificationCenter, ProjectActivities, ResumeRail } from './project-extras';
import './refinements.css';
import { Publisher, PublishedCard, usePublications } from './publisher';
import { ChannelSidebar, channelDirectory, isInternalChannel, useChannelPreferences } from './channel-navigation';
import { gsap } from 'gsap';

const assets = {
  jikesong: import.meta.env.BASE_URL + 'assets/jikesong-cover.jpg',
  vona: import.meta.env.BASE_URL + 'assets/vona-demo.jpg',
};

const projects = {
  jikesong: {
    key: 'jikesong', name: '济客松', fullName: '济客松 · 同济大学黑客松', handle: '@jikesong', mark: '济',
    cover: assets.jikesong, category: '赛事 · 校园创新',
    tagline: '让创造被世界看见', headlineColor: '#CECDCD', typeLabel: '赛事',
    bio: '同济大学创业黑客松，48 小时围绕真实问题组队并完成可演示原型。面向同济学生、校友与共建伙伴。',
    date: '2026 年 12 月 5–6 日', place: '同济大厦 A 楼 1501', followers: '126', related: '1', participants: '80',
  },
  vona: {
    key: 'vona', name: 'VONA', fullName: 'VONA · 亲口说出全球话', handle: '@vona_voice', mark: 'V',
    cover: assets.vona, category: '语音科技 · 人工智能',
    tagline: '亲口说出全球话', headlineColor: '#FFFFFF', typeLabel: '人工智能',
    bio: '实时语音翻译与零样本音色迁移，让跨语言交流保留说话者熟悉的声音与表达方式。',
    followers: '2.4k', related: '1',
  },
};

const updates = [
  {
    id: 'announce', author: '济客松', mark: '济', time: '置顶 · 2 小时前',
    text: '济客松正式定档 12 月 5–6 日。我们邀请同学与校友围绕真实问题组队，在 48 小时内做出能讲清楚、能现场演示的产品原型。',
    image: assets.jikesong, imageAlt: '济客松赛事视觉', likes: 38, replies: 12, views: '1.2k', type: 'image',
  },
  {
    id: 'vona', author: 'VONA', mark: 'V', time: '与济客松合作 · 3 天前', repost: true,
    text: '合作伙伴 VONA 将带来实时语音翻译体验：边听边译，并尽可能保留说话人的音色与表达。现场演示素材来自 VONA 项目方案。',
    image: assets.vona, imageAlt: 'VONA 实时语音翻译演示视频封面', likes: 24, replies: 6, views: '860', type: 'video',
  },
];

const channels = channelDirectory.map(item => item.name);
const feedTabs = ['项目动态', '评论', '转帖', '投票', '视频'];

function App() {
  const {records:publications,save:savePublication,remove:removePublication} = usePublications();
  const [page, setPage] = useState('home');
  const [activeProject,setActiveProject] = useState('jikesong');
  const [notificationOpen,setNotificationOpen] = useState(false);
  const [resume,setResume] = useState(null);
  const [activeFilter, setActiveFilter] = useState('全部');
  const [query, setQuery] = useState('');
  const [following, setFollowing] = useState(false);
  const [liked, setLiked] = useState({});
  const [voted, setVoted] = useState('');
  const [toast, setToast] = useState('');
  const [channel, setChannel] = useState(channels[0]);
  const [joinedTasks, setJoinedTasks] = useState([]);
  const [feedTab, setFeedTab] = useState('项目动态');
  const channelPreferences = useChannelPreferences(activeProject);
  const followedChannels = channelPreferences.followed;
  const setFollowedChannels = channelPreferences.setFollowed;
  const openChannel = name => {setChannel(name);channelPreferences.read(name);navigate('channels');};
  const [projectLinks, setProjectLinks] = useState({ jikesong: { website: '', github: '', socials: [{platform:'微信公众号',name:'济客松',url:''}] }, vona: { website: '', github: '', socials: [] } });
  const [notices, setNotices] = useState({
    jikesong: { title: '济客松 · 赛事安排', body: '12 月 5 日 09:00 — 12 月 6 日 16:00\n同济大厦 A 楼 1501 会议室\n预计 80 位参与者\n\n48 小时，从真实问题出发，和伙伴一起完成可演示的产品原型。', image: true },
    vona: { title: '一起探索跨语言交流', body: 'VONA 与济客松建立赛事合作关系，正在共创跨语言路演体验。\n\n欢迎设计、开发与内容伙伴参与体验讨论。', image: true },
  });
  const shellRef = useRef(null);
  const previousView = useRef(null);
  useEffect(() => {
    const view = `${page}:${activeProject}`;
    if (previousView.current === null) { previousView.current = view; return; }
    if (previousView.current === view) return;
    previousView.current = view;
    if (!shellRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    gsap.fromTo(shellRef.current.querySelector('.main-column'), { opacity: 0.82, x: 10 }, { opacity: 1, x: 0, duration: 0.24, ease: 'power2.out', clearProps: 'transform,opacity', overwrite: 'auto' });
  }, [page, activeProject]);

  const navigate = (next) => {
    const mvpRoutes = ['home', 'vona', 'channels', 'collaborations', 'activities'];
    if (!mvpRoutes.includes(next)) next = 'home';
    if(next === 'vona' || next === 'home') setActiveProject(next === 'vona' ? 'vona' : 'jikesong');
    setPage(next);
    setResume(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const notify = (text) => {
    setToast(text);
    window.setTimeout(() => setToast(''), 1800);
  };

  return <div ref={shellRef} className={`app-shell mvp-mode ${resume ? 'has-resume' : ''} ${page === 'channels' ? 'channel-layout' : page === 'board' ? 'board-layout' : page === 'discover' ? 'discover-layout' : ''}`}>
    <GlobalNav activeProject={activeProject} page={page} navigate={navigate} onNotifications={() => setNotificationOpen(true)} notificationOpen={notificationOpen} />
    <WorkspaceNav activeProject={activeProject} page={page} navigate={navigate} channel={channel} openChannel={openChannel} preferences={channelPreferences} />
    <main className="main-column">
      <MobileWorkspaceNav page={page} navigate={navigate} channel={channel} setChannel={openChannel} followedChannels={followedChannels} />
      {page === 'home' && <ProjectHome publications={publications} project={projects.jikesong} navigate={navigate} following={following} setFollowing={setFollowing} liked={liked} setLiked={setLiked} voted={voted} setVoted={setVoted} notify={notify} feedTab={feedTab} setFeedTab={setFeedTab} links={projectLinks.jikesong} onSaveLinks={(links) => setProjectLinks({ ...projectLinks, jikesong: links })} />}
      {page === 'collaborations' && <ProjectGrid title="关联项目" subtitle="项目方维护的其他项目入口，点击即可进入对应项目主页" items={activeProject === 'vona' ? [projects.jikesong] : [projects.vona]} owner={projects[activeProject]} navigate={navigate} mode="collaborations" />}
      {/* Discover, notifications, board and event-management views are intentionally out of the MVP surface. */}
      {page === 'vona' && <ProjectHome publications={publications} project={projects.vona} navigate={navigate} following={following} setFollowing={setFollowing} liked={liked} setLiked={setLiked} voted={voted} setVoted={setVoted} notify={notify} links={projectLinks.vona} onSaveLinks={(links) => setProjectLinks({ ...projectLinks, vona: links })} isVona />}
      {page === 'activities' && <ProjectActivities publications={publications} members={projectMembers} PersonAvatar={PersonAvatar} onResume={setResume} onRegistration={() => notify('报名成功，期待与你见面')} />}
    {page === 'board' && <ContributionBoard navigate={navigate} joinedTasks={joinedTasks} setJoinedTasks={setJoinedTasks} notify={notify} />}
      {page === 'channels' && <ChannelDiscussion channel={channel} followedChannels={followedChannels} setFollowedChannels={setFollowedChannels} pinned={channelPreferences.pinned} togglePin={channelPreferences.togglePin} notify={notify} />}
    </main>
    {resume && <ResumeRail person={resume} onClose={() => setResume(null)} />}
    {notificationOpen && <NotificationCenter onClose={() => setNotificationOpen(false)} navigate={navigate} onInviteAccepted={() => notify('已接受 VONA 的关联邀请')} />}
    <Publisher page={page} project={activeProject} records={publications} onSave={savePublication} onRemove={removePublication} notify={notify} />
    {toast && <div className="toast" role="status"><Check size={16} />{toast}</div>}
  </div>;
}

function GlobalNav({ page, activeProject, navigate, onNotifications, notificationOpen }) {
  const joinedProjects = [
    {id:'jikesong',page:'home',name:'济客松',mark:'济'},
    {id:'vona',page:'vona',name:'VONA',mark:'V'},
  ];
  const followedProjects = [].filter(project => !joinedProjects.some(joined => joined.id === project.id));
  return <nav className="global-nav" aria-label="主导航">
    <button className="brand-mark" onClick={() => navigate('home')} aria-label="问场主页">问</button>
    <div className="global-links" aria-label="MVP 固定入口" />
    <div className="joined-projects" aria-label="我参与的项目">{joinedProjects.map(project => <button key={project.id} className={'joined-project '+(page !== 'discover' && activeProject === project.id ? 'is-active' : '')} onClick={() => navigate(project.page)} title={project.name+' · 我参与的项目'} aria-label={project.name+'项目空间'} aria-current={page !== 'discover' && activeProject === project.id ? 'page' : undefined}><span className={'mini-mark '+(project.id==='vona'?'vona-avatar':'')}>{project.mark}</span></button>)}</div>
    <div className="nav-project-shortcuts" aria-label="关注的项目">{followedProjects.map(project => <button key={project.id} onClick={() => navigate(project.page)} title={project.name}><span className="mini-mark">{project.mark}</span></button>)}</div>
    <button className="create-round" onClick={() => navigate('home')} title="返回项目主页"><Home size={20} /></button>
    <button className="user-badge" onClick={() => navigate('home')} title="个人空间"><PersonAvatar index={0} /></button>
  </nav>;
}

function WorkspaceNav({ activeProject, page, navigate, channel, openChannel, preferences }) {
  if (page === 'discover') return null;
  return <aside className="workspace-nav">
    <div className="workspace-current"><span className="mini-mark">{activeProject === 'vona' ? 'V' : '济'}</span>{activeProject === 'vona' ? 'VONA' : '济客松'}</div>
    <div className="side-section-label">项目空间</div>
    <button className={`side-item ${page === 'home' || page === 'vona' ? 'active' : ''}`} onClick={() => navigate(activeProject === 'vona' ? 'vona' : 'home')}><Hash size={16} /> 项目动态</button>
    <button className={`side-item ${page === 'activities' ? 'active' : ''}`} onClick={() => navigate('activities')}><Trophy size={16} /> 项目活动</button>
    <div className="side-divider" />
    <ChannelSidebar page={page} channel={channel} onOpen={openChannel} followed={preferences.followed} pinned={preferences.pinned} unread={preferences.unread} onPin={preferences.togglePin} mvpOnly />
  </aside>;
}

function MobileWorkspaceNav({ page, navigate, channel, setChannel, followedChannels }) {
  if (page === 'discover') return null;
  const orderedChannels = [...channels].sort((a, b) => Number(!!followedChannels[b]) - Number(!!followedChannels[a]));
  return <div className="mobile-workspace"><label>项目空间<select aria-label="项目空间导航" value={page === 'vona' ? 'vona' : page} onChange={(event) => event.target.value === 'channels' ? setChannel(channel) : navigate(event.target.value)}><option value={page === 'vona' ? 'vona' : 'home'}>项目动态</option><option value="activities">项目活动</option><option value="channels">频道</option></select></label>{page === 'channels' && <label>频道<select aria-label="主题频道" value={channel} onChange={(event) => setChannel(event.target.value)}>{orderedChannels.filter(name=>!isInternalChannel(name)).map(name=><option key={name} value={name}>{followedChannels[name]?`已关注 · ${name}`:name}</option>)}</select></label>}</div>;
}

function PageHeader({ title, sub, trailing }) {
  return <header className="page-header"><div><h1>{title}</h1>{sub && <p>{sub}</p>}</div>{trailing}</header>;
}

function ProjectHome({ publications = [], project, navigate, following, setFollowing, liked, setLiked, voted, setVoted, notify, feedTab = '项目动态', setFeedTab, links, onSaveLinks, isVona = false }) {
  const CategoryIcon = isVona ? Sparkles : Trophy;
  const [filterOpen, setFilterOpen] = useState(false);
  const filterTabs = feedTabs.filter(tab => tab !== '项目动态');
  const stream = updates.filter((post) => feedTab === '项目动态' || (feedTab === '转帖' && post.repost) || (feedTab === '视频' && post.type === 'video'));
  return <>
    <div className="profile-cover" style={{ backgroundImage: `url(${project.cover})` }}><div className="cover-copy" style={{ color: project.headlineColor }}>{project.tagline}</div></div>
    <section className="profile-info">
      <div className={`profile-avatar ${isVona ? 'vona-avatar' : ''}`}>{project.mark}</div>
      <div className="profile-actions"><button className={`primary-button ${following ? 'following' : ''}`} onClick={() => setFollowing(!following)}>{following ? '已关注' : '关注'}</button></div>
      <h1>{project.name}</h1><div className="handle">{project.handle}</div>
      <p className="bio">{project.bio}</p>
      <div className="profile-meta">
        <span><CategoryIcon size={15} />{project.typeLabel}</span>
        <ProjectLinks links={links} onSave={onSaveLinks} />
      </div>
      <ProjectMembers navigate={navigate} />
      <div className="profile-stats"><span><b>{project.followers}</b> 位关注者</span><button onClick={() => navigate('collaborations')}><b>{project.related}</b> 个关联项目</button></div>
    </section>
    <div className="published-project-feed">{publications.filter(item=>item.status==='published' && item.project===project.key && (feedTab==='项目动态'||(feedTab==='投票'&&item.type==='投票'))).map(item=><PublishedCard key={item.id} item={item}/>)}</div>
    {!isVona && <div className="feed-filter" role="tablist" aria-label="动态内容筛选"><button className="feed-filter-toggle" aria-expanded={filterOpen} onClick={() => setFilterOpen(!filterOpen)}><ChevronDown size={14} className={filterOpen ? 'filter-open' : ''} />{feedTab === '项目动态' ? '筛选' : feedTab}</button>{filterOpen && <div className="feed-filter-menu">{filterTabs.map(tab => <button key={tab} role="tab" id={`feed-tab-${tab}`} aria-controls="project-feed" aria-selected={feedTab === tab} className={feedTab === tab ? 'active' : ''} onClick={() => {setFeedTab(tab);setFilterOpen(false);}}>{tab}</button>)}</div>}</div>}
    {!isVona && <>
      <div id="project-feed" role="tabpanel" aria-labelledby={`feed-tab-${feedTab}`}>
      {stream.map((post) => <UpdateCard key={post.id} post={post} navigate={navigate} liked={!!liked[post.id]} onLike={() => setLiked({ ...liked, [post.id]: !liked[post.id] })} notify={notify} />)}
      {(feedTab === '项目动态' || feedTab === '评论') && <ProjectComment navigate={navigate} />}
      {feedTab === '项目动态' && <PollCard voted={voted} setVoted={setVoted} />}
      </div>
    </>}
    {isVona && <div className="empty-project"><div className="empty-icon"><Sparkles size={20} /></div><h3>VONA 项目空间</h3><p>这里展示项目介绍与项目方维护的关联项目链接。详细项目动态以济客松为原型示例。</p><button className="outline-button" onClick={() => navigate('collaborations')}>查看关联项目 <ChevronRight size={15} /></button></div>}
  </>;
}

const projectMembers = [
  { name: '耳机焊在头上', mark: '林', role: 'CEO', bio: '设计在读，喜欢把脑洞做成能用的小东西，偶尔熬夜赶原型。', projects: 'VONA · 联合发起人', target: 'vona' },
  { name: '鳄鱼不加班', mark: '陈', role: '赛事负责人', bio: '黑客松常驻选手，最近在张罗一场大家都能玩起来的比赛。', projects: '济客松 · 发起人', target: 'home' },
  { name: '派大星在想了', mark: '可', role: '品牌与传播', bio: '写文案、画海报，也负责在群里提醒大家交稿。', projects: 'VONA · 品牌共创', target: 'vona' },
  { name: '默认昵称改天改', mark: '周', role: '技术负责人', bio: '前端开发，热衷开源小工具。代码能跑的时候心情最好。', projects: 'VONA · 技术共建', target: 'vona' },
  { name: '香蕉有点忙', mark: '南', role: '社区共建者', bio: '喜欢认识有趣的人，正在收集校园里值得被解决的小问题。', projects: '济客松 · 社区伙伴', target: 'home' },
  { name: '企鹅先冷静', mark: 'L', role: '活动策划', bio: '负责把活动排期变成现实，也负责现场的临时救火。', projects: 'VONA · 活动合作', target: 'vona' },
  { name: '爱吃香菜的云', mark: '云', role: '产品共建者', bio: '从用户访谈开始学产品，随身带着一本记脑洞的本子。', projects: '济客松 · 体验共创', target: 'home' },
  { name: '今天也没睡醒', mark: '许', role: '体验设计', bio: '交互设计练习生，喜欢研究为什么这个按钮就是找不到。', projects: 'VONA · 体验设计', target: 'vona' },
  { name: '薄荷汽水_', mark: '薄', role: '视觉设计', bio: '喜欢亮色、字体和奇怪的贴纸，最近在做动态海报。', projects: '济客松 · 视觉共建', target: 'home' },
  { name: '兔子暂停营业', mark: '兔', role: '社区运营', bio: '工作日整理共建进度，周末只想瘫着看电影。', projects: 'VONA · 社区伙伴', target: 'vona' },
  { name: '小椰今天出门吗', mark: '椰', role: '内容记录', bio: '用照片和文字记录创作现场，希望每个好点子都有人看见。', projects: '济客松 · 内容共创', target: 'home' },
];
const avatarPath = index => `${import.meta.env.BASE_URL}assets/avatars/person-${String(index + 1).padStart(2, '0')}.jpg`;
function personIndex(mark) { const index = projectMembers.findIndex(person => person.mark === mark || person.name === mark); return index < 0 ? 0 : index; }
function PersonAvatar({ person, index, className = '' }) {
  const resolved = index ?? personIndex(person);
  return <img className={'person-photo ' + className} src={avatarPath(resolved)} alt={projectMembers[resolved].name + '的头像'} />;
}
const nicknameFor = mark => projectMembers[personIndex(mark)].name;

function ProjectMembers({ navigate, contributors = false }) {
  const rail = useRef(null), timer = useRef(null);
  const [hovered, setHovered] = useState(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const group = useRef(null);
  const members = contributors ? projectMembers.map((member,index) => ({...member,index,role:'共建者',score: [0,72,196,184,168,146,128,112,96,84,76][index]})).filter(member => member.index > 1).sort((a,b) => b.score-a.score) : projectMembers.slice(0,7).map((member,index) => ({...member,index}));
  useEffect(() => { const close = event => {if(group.current && !group.current.contains(event.target))setMoreOpen(false);}; document.addEventListener('pointerdown',close);return () => document.removeEventListener('pointerdown',close); },[]);
  const keep = () => clearTimeout(timer.current);
  const dismiss = () => { keep(); timer.current = setTimeout(() => setHovered(null), 180); };
  const show = (member, index, element) => {
    keep();
    const rect = element.getBoundingClientRect();
    setHovered({ member, index, left: Math.max(10, Math.min(rect.left, window.innerWidth - 282)), top: Math.max(8, Math.min(rect.bottom + 8, window.innerHeight - 250)) });
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  const memberButton = member => <button className={contributors ? 'contributor-avatar' : 'member-tile'} key={member.name} aria-label={member.name + ' 项目成员'} onMouseEnter={event => show(member,member.index,event.currentTarget)} onMouseLeave={dismiss} onFocus={event => show(member,member.index,event.currentTarget)} onBlur={dismiss} onClick={event => show(member,member.index,event.currentTarget)}><PersonAvatar index={member.index} />{!contributors && <span>{member.name}</span>}</button>;
  return <div className={'project-members ' + (contributors ? 'contributor-members' : '')} ref={group}>
    {contributors ? <><div className="contributor-title"><strong>活跃贡献者</strong><small>按贡献排名</small></div><div className="contributor-avatars">{members.slice(0,6).map(memberButton)}<button className="contributor-more" aria-label="查看其余贡献者" aria-expanded={moreOpen} onClick={() => {setHovered(null);setMoreOpen(!moreOpen);}}>+{members.length-6}</button></div>{moreOpen && <div className="contributor-list" role="dialog" aria-label="更多贡献者"><div className="contributor-list-title"><b>更多贡献者</b><button aria-label="关闭贡献者列表" onClick={() => setMoreOpen(false)}><X size={15} /></button></div><p>按本阶段贡献积分排序</p>{members.slice(6).map((member,index) => <div className="contributor-list-row" key={member.name}><span className="contributor-rank">{index+7}</span>{memberButton(member)}<div><b>{member.name}</b><RoleBadge /><span>{member.score} 贡献积分</span></div></div>)}</div>}</> : <><div className="member-strip-heading"><span className="member-label">项目成员</span><span>7 位成员</span></div><div className="member-scroll" ref={rail} onScroll={() => setHovered(null)}>{members.map(memberButton)}</div></>}
    {hovered && createPortal(<div className="member-profile-popover" role="dialog" aria-label={hovered.member.name + '的简介'} style={{left:hovered.left,top:hovered.top}} onMouseEnter={keep} onMouseLeave={dismiss} onFocus={keep} onBlur={event => {if(!event.currentTarget.contains(event.relatedTarget)) dismiss();}} onKeyDown={event => {if(event.key === 'Escape')setHovered(null);}}><div className="member-profile-heading"><PersonAvatar index={hovered.index} /><div><b>{hovered.member.name}</b><RoleBadge founder={!contributors && hovered.index === 0} /><span>{contributors ? hovered.member.score + ' 贡献积分' : hovered.member.role}</span></div></div><p>{hovered.member.bio}</p><small>参与的项目</small><a href={'#' + hovered.member.target} onClick={event => {event.preventDefault();setHovered(null);navigate(hovered.member.target);}}>{hovered.member.projects}<ChevronRight size={14} /></a></div>, document.body)}</div>;
}

function RoleBadge({ founder = false }) { return <span className={'identity-badge ' + (founder ? 'badge-founder' : 'badge-contributor')}>{founder ? <Star size={10} fill="currentColor" /> : <Sparkles size={10} />}{founder ? 'Founder' : '共建者'}</span>; }

function ProjectFeedSearch() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  return <div className={`project-feed-search ${open ? 'is-open' : ''}`}><button className="icon-button" aria-label="搜索项目动态" aria-expanded={open} onClick={() => setOpen(!open)}><Search size={16} /></button>{open && <label><Search size={15} /><input autoFocus placeholder="搜索济客松发布过的内容" value={value} onChange={(event) => setValue(event.target.value)} /><button aria-label="关闭搜索" onClick={() => { setOpen(false); setValue(''); }}><X size={14} /></button></label>}</div>;
}

function WechatMark() {return <svg width="17" height="17" viewBox="0 0 24 24" aria-hidden="true"><path fill="#07b75b" d="M9.4 3C4.8 3 1 6 1 9.7c0 2.1 1.2 4 3.1 5.2L3.3 18l3.5-1.8c.8.2 1.7.3 2.6.3h.7a6.6 6.6 0 0 1-.5-2.5c0-3.6 3.6-6.6 8-6.6h.2C16.6 4.8 13.3 3 9.4 3Z"/><path fill="#07b75b" d="M23 14c0-3-3-5.5-6.6-5.5S10 11 10 14s2.8 5.4 6.4 5.4c.8 0 1.5-.1 2.1-.3l2.8 1.5-.6-2.5A5 5 0 0 0 23 14Z"/><g fill="white"><circle cx="6.5" cy="8" r="1"/><circle cx="12" cy="8" r="1"/><circle cx="14" cy="13" r=".8"/><circle cx="18.7" cy="13" r=".8"/></g></svg>;}
function ProjectLinks({ links, onSave }) {
 const [editing,setEditing]=useState(false);
 return <><div className="profile-links">{links.website&&<a href={links.website} target="_blank" rel="noopener noreferrer"><Link2 size={15}/>{new URL(links.website).hostname}</a>}{links.github&&<a href={links.github} target="_blank" rel="noopener noreferrer"><Github size={15}/>GitHub</a>}<button aria-label="编辑项目链接与社交账号" onClick={()=>setEditing(true)}><Link2 size={15}/>{links.website||links.github?'编辑链接':'添加项目链接'}</button>{(links.socials||[]).map((social,i)=>social.url?<a key={i} href={social.url} target="_blank" rel="noopener noreferrer">{social.platform==='微信公众号'?<WechatMark/>:<Link2 size={15}/>}<span>{social.name}</span></a>:<button key={i} className="social-account" onClick={()=>setEditing(true)} title={social.platform+' · '+social.name}>{social.platform==='微信公众号'?<WechatMark/>:<Link2 size={15}/>}<span>{social.name}</span></button>)}</div>{editing&&<ProjectLinkEditor initial={links} onClose={()=>setEditing(false)} onSave={value=>{onSave(value);setEditing(false);}}/>}</>;
}
function ProjectLinkEditor({initial,onSave,onClose}) {
 const dialog=useRef(null);const [website,setWebsite]=useState(initial.website),[github,setGithub]=useState(initial.github),[socials,setSocials]=useState(initial.socials||[]),[error,setError]=useState('');
 useEffect(()=>{dialog.current.showModal();},[]);
 const update=(i,key,value)=>setSocials(socials.map((s,j)=>i===j?{...s,[key]:value}:s));
 const save=e=>{e.preventDefault();try{[website,github,...socials.map(s=>s.url)].filter(Boolean).forEach(url=>{if(!['http:','https:'].includes(new URL(url).protocol))throw Error();});onSave({website:website.trim(),github:github.trim(),socials:socials.filter(s=>s.name.trim()).map(s=>({...s,name:s.name.trim(),url:s.url.trim()}))});}catch{setError('链接需使用完整的 https:// 或 http:// 地址');}};
 return <dialog ref={dialog} className="task-dialog notice-editor" aria-label="项目链接与社交账号" onClose={onClose}><form onSubmit={save}><div className="dialog-heading"><h2>项目链接与社交账号</h2><button type="button" className="icon-button" aria-label="关闭项目链接编辑" onClick={onClose}><X size={18}/></button></div><label>项目官网<input type="url" value={website} onChange={e=>setWebsite(e.target.value)}/></label><label>GitHub 链接<input type="url" value={github} onChange={e=>setGithub(e.target.value)}/></label>{socials.map((s,i)=><fieldset className="social-editor-row" key={i}><legend>运营账号 {i+1}</legend><select aria-label={'账号平台 '+(i+1)} value={s.platform} onChange={e=>update(i,'platform',e.target.value)}>{['微信公众号','小红书','B站','即刻','其他平台'].map(p=><option key={p}>{p}</option>)}</select><input aria-label={'账号名称 '+(i+1)} placeholder="账号名称" value={s.name} onChange={e=>update(i,'name',e.target.value)}/><input type="url" aria-label={'账号链接 '+(i+1)} placeholder="平台链接（可留空）" value={s.url} onChange={e=>update(i,'url',e.target.value)}/><button type="button" onClick={()=>setSocials(socials.filter((_,j)=>i!==j))}>移除</button></fieldset>)}<button type="button" className="notice-text-link" onClick={()=>setSocials([...socials,{platform:'微信公众号',name:'',url:''}])}><Plus size={13}/>添加平台账号</button>{error&&<p className="form-error">{error}</p>}<div className="dialog-actions"><span>链接或账号名由项目方填写</span><button className="primary-button">保存链接</button></div></form></dialog>;
}

function ProjectComment({ navigate }) {
  return <article className="update-card"><div className="post-context"><MessageCircle size={13} />济客松在其他项目动态中的评论</div><div className="post-top"><div className="avatar avatar-blue">济</div><div className="post-author"><b>济客松</b><span>@jikesong · 1 天前</span></div></div><p className="post-copy">期待一起把跨语言交流带到赛事现场！我们可以在路演环节安排体验，让不同背景的选手更自然地交流。</p><button className="quoted-post" onClick={() => navigate('vona')}><b>VONA <span>@vona_voice</span></b><p>准备开放实时语音翻译体验，欢迎赛事与社区一起共创使用场景。</p><span>查看原项目 <ChevronRight size={13} /></span></button></article>;
}

function UpdateCard({ post, navigate, liked, onLike, notify }) {
  return <article className="update-card">{post.repost && <div className="post-context"><Repeat2 size={13} />济客松转帖</div>}<div className="post-top"><div className={`avatar ${post.mark === 'V' ? 'avatar-dark' : 'avatar-blue'}`}>{post.mark}</div><div className="post-author"><b>{post.author}</b><span>{post.mark === 'V' && <Check size={13} />}{post.mark === 'V' ? '@vona_voice' : '@jikesong'} · {post.time}</span></div><button className="icon-button subtle" aria-label="更多动态操作" onClick={() => notify('更多操作仅作演示')}><MoreHorizontal size={18} /></button></div>
    <p className="post-copy">{post.text}</p>
    <button className="media-card" onClick={() => post.type === 'video' ? notify('视频播放仅作演示') : navigate('home')} aria-label={post.type === 'video' ? '播放视频示例' : '查看赛事图片'}>
      <img src={post.image} alt={post.imageAlt} />
      {post.type === 'image' ? <div className="media-caption"><span>JI KESONG · 2026</span><b>让项目从赛事现场继续生长</b><small>同济大厦 A 楼 1501 · 预计 80 位参与者</small></div> : <><div className="play-button"><Video size={19} fill="currentColor" /></div><div className="video-caption"><span>VONA LIVE DEMO</span><b>边听边译，保留说话人的声音</b><small>原声识别 → 目标语言生成 → 音色迁移</small></div></>}
    </button>
    <div className="post-actions"><button onClick={() => notify('评论区仅作原型演示')}><MessageCircle size={17} />{post.replies} 条讨论</button><button className={liked ? 'liked' : ''} onClick={onLike}><Heart size={17} fill={liked ? 'currentColor' : 'none'} />{post.likes + (liked ? 1 : 0)}</button><button onClick={() => notify('分享链接已复制（演示）')}><Share2 size={17} />分享</button><button onClick={() => notify('已加入收藏（演示）')}><Bookmark size={16} />{post.views}</button></div>
    {post.mark === 'V' && <button className="inline-project-link" onClick={() => navigate('vona')}>查看 VONA 项目主页 <ExternalLink size={14} /></button>}
  </article>;
}

function PollCard({ voted, setVoted, compact = false }) {
  const options = ['真实问题组队 · 观察用户后共创方案', '跨学科组队 · 1+1+1 角色共同完成原型'];
  const percentages = voted === options[0] ? [57, 43] : voted ? [55, 45] : [56, 44];
  return <article className={`update-card poll-card ${compact ? 'compact-poll' : ''}`}>{!compact && <div className="post-top"><div className="avatar avatar-blue">济</div><div className="post-author"><b>济客松</b><span>@jikesong · 筹备讨论 · 投票示例</span></div></div>}<p className="post-copy">你更想参与哪种组队方式？</p><div className="poll-options">{options.map((option, index) => <button aria-pressed={voted === option} className={`poll-option ${voted === option ? 'chosen' : ''}`} onClick={() => setVoted(option)} key={option}><span>{option}</span><b>{percentages[index]}%</b><i style={{ width: `${percentages[index]}%` }} /></button>)}</div><div className="poll-foot">{voted ? '已记录你的选择 · ' : ''}{voted ? 268 : 267} 人参与 · 还剩 2 天</div></article>;
}

const contributionTasks = [
  { id: 'JK-08', status: '待开展', channel: '选手反馈', title: '一起设计选手反馈问卷', tag: '用户研究', people: ['可', '林'], version: 'v0.1', summary: '整理报名、组队与现场体验的问题，邀请选手一起完善反馈路径。', result: '目标产出：一份可在赛前与赛后使用的反馈问卷。', resource: '问卷草稿' },
  { id: 'JK-09', status: '待开展', channel: '赛事执行', title: '报名页移动端适配', tag: '技术开发', people: ['周'], version: 'v0.1', summary: '完善手机端的报名表单、错误提示与提交反馈。欢迎前端同学参与。', result: '目标产出：可在手机上完成的报名流程。', resource: 'GitHub Issue', technical: true },
  { id: 'JK-05', status: '进行中', channel: '品牌宣传', title: '赛事主视觉与传播物料', tag: '品牌设计', people: ['林', '陈'], version: 'v0.2', summary: '围绕「深海跃迁·轮廓微光」延展海报、社交媒体配图与现场指引。', result: '当前进展：主视觉已确定，正在制作各渠道尺寸。', resource: '主视觉预览', image: assets.jikesong },
  { id: 'JK-06', status: '进行中', channel: '核心协作', title: 'VONA 跨语言路演体验联调', tag: '合作共创', people: ['V', '周'], version: 'v0.2', summary: '与 VONA 协作梳理现场输入、字幕展示和音频播放的体验流程。', result: '当前进展：演示流程已整理，等待接入测试与体验反馈。', resource: 'GitHub PR', technical: true },
  { id: 'JK-01', status: '已完成', channel: '活动策划', title: '确定赛事时间与场地', tag: '活动策划', people: ['可', '陈'], version: 'v1.0', summary: '完成首轮赛事安排与场地信息梳理，供后续策划和传播使用。', result: '成果：12 月 5–6 日，同济大厦 A 楼 1501；预计 80 人参与。', resource: '成果摘要' },
];

function ContributionBoard({ joinedTasks, setJoinedTasks, notify, navigate }) {
  const [selectedTask, setSelectedTask] = useState(null);
  const [sourceChannel, setSourceChannel] = useState('全部');
  const sourceChannels = [...new Set(contributionTasks.map(task => task.channel))];
  const visibleTasks = contributionTasks.filter(task => sourceChannel === '全部' || task.channel === sourceChannel);
  return <div className="board-page"><PageHeader title="共建看板" sub="找到你感兴趣的任务，查看进展与成果，随时加入。" />
    <section className="recent-activity"><header><h2><Activity size={18} />最近动态</h2><button onClick={() => notify('全部动态仅作演示')}>查看全部动态 <ChevronRight size={15} /></button></header>{[{mark:'陈',name:'鳄鱼不加班',time:'2 小时前',icon:MessageCircle,text:'评论了 #42 实现项目包管理界面'}, {mark:'可',name:'派大星在想了',time:'4 小时前',icon:Clock3,text:'提交了 3.0 小时的劳动'}, {mark:'南',name:'香蕉有点忙',time:'6 小时前',icon:GitFork,text:'将任务状态从 进行中 移动到 已完成'}, {mark:'周',name:'企鹅先冷静',time:'8 小时前',icon:Code2,text:'提交了代码 feat: add event signup flow'}, {mark:'L',name:'企鹅先冷静',time:'12 小时前',icon:Plus,text:'创建了新任务 #31 实现劳动记录功能'}].slice(0, 3).map((item) => { const ItemIcon = item.icon; return <div className="activity-row" key={item.time}><span className="activity-avatar"><PersonAvatar person={item.mark} /></span><b>{nicknameFor(item.mark)}</b><time>{item.time}</time><ItemIcon size={18} /><span>{item.text}</span></div>; })}</section>
    <nav className="task-source-filters" aria-label="按来源频道筛选任务">{['全部',...sourceChannels].map(source=><button key={source} className={sourceChannel===source?'active':''} aria-pressed={sourceChannel===source} onClick={()=>setSourceChannel(source)}>{source}<span>{source==='全部'?contributionTasks.length:contributionTasks.filter(task=>task.channel===source).length}</span></button>)}</nav>
    <div className="board-scroll"><div className="board-columns">{['待开展', '进行中', '已完成'].map((status, index) => {const tasks=visibleTasks.filter(task=>task.status===status);return <section className="board-column" key={status} aria-label={status}><h2><i className={`status-dot status-${index}`} />{status}<span>{tasks.length}</span></h2><div className="board-task-list" tabIndex={0} role="region" aria-label={`${status}任务列表`}>{tasks.map((task) => <button key={task.id} className="task-card" onClick={() => setSelectedTask(task)}><div className="task-meta"><span>{task.id}</span><span>{task.channel}</span><span>{task.version}</span></div><h3>{task.title}</h3><span className="task-tag">{task.tag}</span>{task.image && <img src={task.image} alt="济客松主视觉进展" />}<p>{task.result}</p><div className="task-resource">{task.technical && <ExternalLink size={12} />}{task.resource}{task.technical && ' · 待关联'}</div><div className="task-footer"><div className="task-people">{task.people.map((person) => <span key={person}><PersonAvatar person={person} /></span>)}{joinedTasks.includes(task.id) && <span><PersonAvatar index={0} /></span>}</div><span>{joinedTasks.includes(task.id) ? '已参与' : '查看详情'}<ChevronRight size={12} /></span></div></button>)}</div></section>})}</div></div>
    {selectedTask && <TaskDetail task={selectedTask} joined={joinedTasks.includes(selectedTask.id)} onJoin={() => setJoinedTasks(joinedTasks.includes(selectedTask.id) ? joinedTasks.filter((id) => id !== selectedTask.id) : [...joinedTasks, selectedTask.id])} onClose={() => setSelectedTask(null)} notify={notify} />}
  </div>;
}

function TaskDetail({ task, joined, onJoin, onClose, notify }) {
  const dialog = useRef(null);
  useEffect(() => { dialog.current.showModal(); }, []);
  return <dialog className="task-dialog" ref={dialog} aria-labelledby="task-title" onClose={onClose} onClick={(event) => { if (event.target === dialog.current) onClose(); }}><div className="dialog-heading"><span>{task.id} · {task.status} · {task.version}</span><button className="icon-button" aria-label="关闭任务详情" onClick={onClose}><X size={18} /></button></div><h2 id="task-title">{task.title}</h2><span className="task-tag">{task.tag}</span><p>{task.summary}</p>{task.image && <img className="task-detail-image" src={task.image} alt="济客松主视觉成果" />}<div className="task-result"><h3>{task.status === '已完成' ? '成果摘要' : '进展与预期成果'}</h3><p>{task.result}</p></div><div className="task-detail-resource"><b>共建资料</b><span>{task.resource}{task.technical ? ' · 尚未绑定仓库链接' : ' · 查看以上成果内容'}</span>{task.technical && <button className="outline-button" onClick={() => notify('这是关联入口演示，尚未配置真实 GitHub Issue / PR 链接')}>关联 {task.resource}<ExternalLink size={13} /></button>}</div><div className="dialog-actions"><span>{task.people.length + (joined ? 1 : 0)} 人参与{joined ? ' · 你已加入' : ''}</span>{task.status !== '已完成' && <button className={`primary-button ${joined ? 'following' : ''}`} onClick={onJoin}>{joined ? '退出参与' : '参与这项共建'}</button>}</div></dialog>;
}

const channelMessages = {
  '日常讨论': [{ name: '派大星在想了', mark: '可', time: '09:30', text: '欢迎来到济客松项目空间！大家可以在这里交流想法，也欢迎聊聊你最关心的真实问题。' }, { name: '耳机焊在头上', mark: '林', time: '09:42', text: '我想参与主视觉的延展设计，已经在共建看板里找到对应任务了。' }],
  '活动策划': [{ name: '鳄鱼不加班', mark: '陈', time: '10:05', text: '本周一起梳理 48 小时的赛事流程。大家对组队、导师交流和最终路演有什么建议？' }, { name: '派大星在想了', mark: '可', time: '10:18', text: '可以留一段跨学科组队交流时间，让大家先分享问题，再找到互补的伙伴。' }],
  '品牌宣传': [{ name: '耳机焊在头上', mark: '林', time: '11:10', text: '新一版「深海跃迁·轮廓微光」视觉已放进共建看板，欢迎一起完善传播物料。', image: assets.jikesong }],
  '选手反馈': [{ name: '默认昵称改天改', mark: '周', time: '14:20', text: '报名和组队时，有哪些信息是你最想提前知道的？欢迎把你的建议留在这里。' }, { name: '今天也没睡醒', mark: '许', time: '14:36', text: '希望可以先了解其他队友的兴趣和技能，也想知道没有开发经验能参与哪些工作。' }],
  '灵感分享': [{name:'薄荷汽水_',mark:'周',time:'13:20',text:'分享一个把旧物变成新产品的想法：给校园里的闲置物品做一张流转地图，大家觉得如何？'}],
  '组队大厅': [{name:'今天也没睡醒',mark:'许',time:'12:08',text:'寻找一起做校园工具的伙伴！我可以负责前端，希望认识对产品和交互感兴趣的朋友。'}],
  '核心协作': [{name:'耳机焊在头上',mark:'林',time:'09:10',text:'本周任务已经整理到共建看板。请大家确认各自负责的事项，需要协助随时在这里说。'}],
  '赛事执行': [{name:'鳄鱼不加班',mark:'陈',time:'08:45',text:'场地与物料清单等待确认。今天先核对签到动线、设备借用和志愿者排班。'}],
};

function ChannelDiscussion({ channel, followedChannels, setFollowedChannels, pinned, togglePin, notify }) {
  const [drafts, setDrafts] = useState({});
  const [replies, setReplies] = useState({});
  const [search, setSearch] = useState('');
  const [muted, setMuted] = useState(false);
  const [popover, setPopover] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [reactions, setReactions] = useState({});
  const [attachment, setAttachment] = useState(null);
  const end = useRef(null);
  const fileInput = useRef(null);
  const input = useRef(null);
  const objectUrls = useRef([]);
  const draft = drafts[channel] || '';
  const internal = isInternalChannel(channel);
  const followed = internal ? !!pinned[channel] : !!followedChannels[channel];
  const setDraft = (text) => setDrafts((previous) => ({ ...previous, [channel]: text }));
  const messages = [...channelMessages[channel], ...(replies[channel] || [])];
  const visibleMessages = messages.filter((message) => `${message.name} ${message.text}`.includes(search.trim()));
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [channel, replies]);
  useEffect(() => { setReplyTo(null); setSearch(''); setPopover(''); setAttachment(null); }, [channel]);
  useEffect(() => () => objectUrls.current.forEach((url) => URL.revokeObjectURL(url)), []);
  const send = (event) => {
    event.preventDefault();
    if (!draft.trim() && !attachment) return;
    setReplies({ ...replies, [channel]: [...(replies[channel] || []), { name: '你', mark: 'H', time: '刚刚', text: draft.trim(), image: attachment?.url, replyTo }] });
    setDraft('');
    setReplyTo(null);
    setAttachment(null);
    setSearch('');
  };
  const addImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) { notify('请选择 10 MB 以内的图片'); return; }
    const url = URL.createObjectURL(file);
    objectUrls.current.push(url);
    setAttachment({ url, name: file.name });
    event.target.value = '';
  };
  return <section className="discussion-page" aria-label={internal?'内部频道':'公开频道'}>
    <header className="chat-toolbar"><Hash size={23} className="chat-hash" /><h1 className="channel-name">{channel}</h1><button className={`channel-follow ${followed ? 'is-followed' : ''}`} aria-pressed={followed} onClick={() => internal ? togglePin(channel) : setFollowedChannels({ ...followedChannels, [channel]: !followed })}>{followed ? <Check size={13} /> : internal ? <Pin size={13}/> : <Plus size={13} />}{internal ? (followed?'已置顶':'置顶频道') : (followed?'已关注':'关注频道')}</button><div className="chat-tools"><button aria-label={muted ? '开启频道通知' : '静音频道通知'} aria-pressed={muted} onClick={() => setMuted(!muted)}>{muted ? <BellOff size={18} /> : <Bell size={18} />}</button><button aria-label="查看置顶消息" aria-expanded={popover === 'pinned'} onClick={() => setPopover(popover === 'pinned' ? '' : 'pinned')}><Pin size={19} /></button><button aria-label="查看频道成员" aria-expanded={popover === 'members'} onClick={() => setPopover(popover === 'members' ? '' : 'members')}><Users size={19} /></button></div><label className="chat-search"><input aria-label="搜索频道消息" placeholder="搜索" value={search} onChange={(event) => setSearch(event.target.value)} /><Search size={14} /></label></header>
    {(popover === 'pinned' || popover === 'members') && <div className="chat-popover">{popover === 'pinned' ? <><h3>置顶消息</h3><p>{channelMessages[channel][0].text}</p></> : <><h3>频道成员</h3>{[...new Set(messages.map((message) => message.name))].map((name) => <div className="chat-member" key={name}><PersonAvatar person={name} /><i />{name}</div>)}</>}</div>}
    <div className="channel-messages" role="log" aria-label={`${channel}消息`} aria-live="polite"><div className="chat-history"><div className="chat-date"><span>{search ? `找到 ${visibleMessages.length} 条消息` : '频道交流'}</span></div>{visibleMessages.map((message) => { const index = messages.indexOf(message); const reactionKey = `${channel}-${index}`; return <article className="channel-message" key={index}><div className={`avatar ${message.mark === 'H' ? 'chat-self-avatar' : 'avatar-blue'}`}><PersonAvatar person={message.mark} /></div><div className="message-content">{message.replyTo && <div className="message-reply-context"><Reply size={12} /><b>@{nicknameFor(message.replyTo.mark)}</b><span>{message.replyTo.text}</span></div>}<div className="message-meta"><b>{nicknameFor(message.mark)}</b>{message.mark !== 'H' && <RoleBadge founder={message.mark === '林'} />}<time>{message.time}</time></div>{message.text && <p>{message.text}</p>}{message.image && <img src={message.image} alt={message.mark === 'H' ? '发送的图片' : '济客松品牌宣传主视觉'} />}{reactions[reactionKey] && <button className="message-reaction" aria-label="取消回应" onClick={() => setReactions({ ...reactions, [reactionKey]: false })}>🙌 1</button>}</div><div className="message-tools"><button aria-label={`回应${message.name}的消息`} onClick={() => setReactions({ ...reactions, [reactionKey]: !reactions[reactionKey] })}><Smile size={16} /></button><button aria-label={`回复${message.name}`} onClick={() => { setReplyTo(message); input.current.focus(); }}><Reply size={17} /></button></div></article>; })}<div ref={end} /></div></div>
    <div className="chat-composer-area">{replyTo && <div className="composer-reply-to"><span>正在回复 <b>{replyTo.name}</b></span><button aria-label="取消回复" onClick={() => setReplyTo(null)}><X size={14} /></button></div>}{attachment && <div className="attachment-preview"><img src={attachment.url} alt="待发送图片" /><span>{attachment.name}</span><button aria-label="移除附件" onClick={() => setAttachment(null)}><X size={15} /></button></div>}<form className="channel-reply" onSubmit={send}><input ref={fileInput} type="file" accept="image/*" hidden onChange={addImage} /><button className="attach-button" type="button" aria-label="添加图片附件" onClick={() => fileInput.current.click()}><Plus size={22} /></button><textarea ref={input} aria-label={`给 #${channel} 发消息`} value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) send(event); }} placeholder={`给 #${channel} 发消息`} rows={1} maxLength={2000} /><button type="button" aria-label="插入表情" onClick={() => { setDraft(`${draft} 😊`); input.current.focus(); }}><Smile size={21} /></button><button className="chat-send" disabled={!draft.trim() && !attachment} type="submit" aria-label="发送消息"><Send size={19} /></button></form><div className="chat-input-help"><span>{muted ? '频道通知已静音' : 'Enter 发送 · Shift + Enter 换行'}</span><span>本地演示</span></div></div>
  </section>;
}

function ProjectGrid({ title, subtitle, items, navigate, mode, owner = projects.jikesong }) {
  const [collaborationCategory, setCollaborationCategory] = useState('S1 赛季');
  const collaborationCategories = ['全部', 'S1 赛季'];
  const filteredItems = mode === 'collaborations' && collaborationCategory !== '全部' ? items : items;
  return <div className="listing-page"><PageHeader title={title} sub={subtitle} trailing={mode === 'collaborations' && <button className="outline-button back-button" onClick={() => navigate(owner.key === 'vona' ? 'vona' : 'home')}>← 返回{owner.name}主页</button>} />
    {mode === 'discover' && <div className="filter-row">{['全部', '赛事活动', '人工智能', '校园项目'].map((tag) => <button key={tag} className={`filter-chip ${tag === '全部' ? 'on' : ''}`}>{tag}</button>)}</div>}
    <div className="grid-heading"><h2>{mode === 'discover' ? '精选项目' : '项目主页入口'}</h2><span>{items.length} 个项目</span></div>
    {mode === 'collaborations' && <div className="collaboration-categories" aria-label="项目链接分类"><span>项目链接分类</span>{collaborationCategories.map((category) => <button key={category} className={collaborationCategory === category ? 'active' : ''} aria-pressed={collaborationCategory === category} onClick={() => setCollaborationCategory(category)}>{category}</button>)}</div>}
    <div className="project-grid">{filteredItems.map((project) => <ProjectCard key={project.key} project={project} navigate={navigate} mode={mode} />)}</div>
    {mode === 'collaborations' && <div className="relationship-note"><Link2 size={16} /><span>以下内容是项目方维护的其他项目主页入口</span><span className="note-line" /><button onClick={() => navigate(owner.key === 'vona' ? 'vona' : 'home')}>返回项目动态</button></div>}
  </div>;
}

function ProjectCard({ project, navigate, mode }) {
  return <article className="project-card"><button className="project-cover" onClick={() => navigate(project.key === 'vona' ? 'vona' : 'home')} style={{ backgroundImage: `url(${project.cover})` }} aria-label={`打开${project.name}项目主页`}>
    <span className="cover-tag">{project.category}</span><div className="cover-title">{project.key === 'vona' ? '亲口说出全球话' : '48 小时，把真实问题做成原型'}</div><span className={`project-avatar ${project.key === 'vona' ? 'vona-avatar' : ''}`}>{project.mark}</span>
  </button><div className="project-card-body"><div className="project-name-row"><h3>{project.fullName}</h3>{mode === 'collaborations' && <span className="relation-badge">项目主页入口</span>}</div><p>{project.bio}</p><div className="project-card-bottom"><span>{project.key === 'vona' ? '语音科技 · 外部项目主页' : `${project.date} · 项目主页`}</span><button className="card-open" onClick={() => navigate(project.key === 'vona' ? 'vona' : 'home')}>进入项目主页 <ChevronRight size={15} /></button></div></div></article>;
}

function Discover({ publications = [], activeFilter, setActiveFilter, query, setQuery, navigate }) {
  const [section, setSection] = useState('精选');
  const [selectedItem, setSelectedItem] = useState(null);
  const [adIndex, setAdIndex] = useState(1);
  const [paused, setPaused] = useState(false);
  const [animate,setAnimate] = useState(true);
  const moving = useRef(false);
  const total = communityAds.length;
  const slides = [communityAds[total-1],...communityAds,communityAds[0]];
  const move = step => {if(moving.current)return;moving.current=true;setAnimate(true);setAdIndex(index=>index+step);};
  useEffect(() => {
    if (paused || selectedItem) return;
    const timer = setInterval(() => move(1), 6000);
    return () => clearInterval(timer);
  }, [paused, selectedItem]);
  const finish = () => {moving.current=false;if(adIndex===0 || adIndex===total+1){setAnimate(false);setAdIndex(adIndex===0?total:1);}};
  const shown = communityFeed.filter(item => (section === '精选' || item.type === ({'精选项目':'项目','活动广场':'活动','招募':'招募','帖子':'帖子'}[section])) && (activeFilter === '全部' || item.category === activeFilter || item.tag === activeFilter || (activeFilter === '校园项目' && item.category === '校园创新')) && (item.title + item.copy + item.name + item.tag).toLowerCase().includes(query.toLowerCase()));
  return <div className="listing-page discover-page">
    <label className="discover-search"><Search size={18} /><input aria-label="搜索发现内容" placeholder="搜索项目、活动、帖子或招募" value={query} onChange={e => setQuery(e.target.value)} /></label>
    <section className="discovery-carousel" aria-label="发现推荐广告" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="carousel-track" style={{transform:`translateX(-${adIndex*100}%)`,transition:animate?'transform 700ms cubic-bezier(.22,.68,.2,1)':'none'}} onTransitionEnd={finish}>{slides.map((ad,i)=><button key={ad.id+'-'+i} className="carousel-slide" tabIndex={i===adIndex?0:-1} aria-hidden={i!==adIndex} onClick={()=>setSelectedItem(ad)}><div className="carousel-copy"><span>{ad.tag} · {ad.name}</span><h2>{ad.title}</h2><p>{ad.copy}</p><b>立即参与 <ChevronRight size={15}/></b></div><img src={ad.image} alt={ad.name+'推荐视觉'}/></button>)}</div>
      <div className="carousel-controls"><button aria-label="上一张广告" onClick={()=>move(-1)}>‹</button><div>{communityAds.map((item,i)=><button key={item.id} className={(adIndex-1+total)%total===i?'active':''} aria-label={'广告 '+(i+1)} aria-pressed={(adIndex-1+total)%total===i} onClick={()=>{moving.current=false;setAnimate(true);setAdIndex(i+1);}}/>)}</div><button aria-label="下一张广告" onClick={()=>move(1)}>›</button></div>
    </section>
    <nav className="discover-tabs" aria-label="发现内容分类">{['精选','精选项目','活动广场','招募','帖子'].map(tag => <button key={tag} className={section === tag ? 'active' : ''} onClick={() => {setSection(tag);setActiveFilter('全部');}}>{tag}</button>)}</nav>
    {section !== '精选' && <div className="filter-row">{['全部','赛事活动','人工智能','校园项目'].map(tag => <button key={tag} className={'filter-chip ' + (activeFilter === tag ? 'on' : '')} onClick={() => setActiveFilter(tag)}>{tag}</button>)}</div>}
    {activeFilter !== '全部' && <div className="discovery-filter-state">{activeFilter} · {shown.length} 条内容 <button onClick={() => setActiveFilter('全部')}>清除分类</button></div>}
    <div className="discover-feed">{publications.filter(item=>item.status==='published'&&item.scope==='discover'&&(section==='精选'||item.type===({'精选项目':'项目','活动广场':'活动','招募':'招募','帖子':'帖子'}[section]))&&(activeFilter==='全部')&&(item.title+item.body).toLowerCase().includes(query.toLowerCase())).map(item=><PublishedCard key={item.id} item={item}/>)}{shown.map(item => <CommunityCard key={item.id} item={item} onOpen={() => setSelectedItem(item)} />)}</div>
    {!shown.length && <div className="no-results">没有匹配内容，试试其他分类或关键词。</div>}
    {selectedItem && <DiscoverDetail item={selectedItem} onClose={() => setSelectedItem(null)} navigate={navigate} />}
  </div>;
}
function CommunityCard({ item, onOpen }) {
  const n = Number(item.id.split('-').at(-1));
  return <article className={'community-card community-' + item.type}><button className="community-card-open" onClick={onOpen}>
    <div className="community-card-media"><img src={item.image} alt={item.title} loading="lazy" /><span className="community-type">{item.type}</span>{item.type === '招募' && <span className="community-recruit-flag">开放共建</span>}</div>
    <div className="community-card-content"><div className="community-author"><PersonAvatar index={(n-1)%11} />{item.type === '帖子' ? projectMembers[(n-1)%11].name : item.name}</div><h2>{item.title}</h2><p>{item.copy}</p><span className="community-tag"># {item.tag}</span>
    {item.type === '帖子' && <div className="community-foot"><span>♡ {28+n*9}</span><span>◌ {3+n}</span><time>{n%8+1} 小时前</time></div>}
    {item.type === '项目' && <div className="community-foot"><span>{8+n} 位共建者</span><ChevronRight size={13} /></div>}
    {item.type === '活动' && <div className="community-foot"><span>查看活动安排</span><ChevronRight size={13} /></div>}
    {item.type === '招募' && <div className="community-recruit-action">查看招募要求 <ChevronRight size={13} /></div>}</div>
  </button></article>;
}
function DiscoverDetail({ item, onClose, navigate }) {
  const ref = useRef(null);
  const [liked,setLiked] = useState(false), [saved,setSaved] = useState(false);
  const [draft,setDraft] = useState(''), [comments,setComments] = useState([]);
  useEffect(() => {ref.current.showModal();},[]);
  return <dialog ref={ref} className={'task-dialog discover-detail detail-' + item.type} aria-labelledby="discover-detail-title" onClose={onClose} onClick={e => {if(e.target === ref.current) onClose();}}>
    <div className="dialog-heading"><span>{item.type} · {item.tag}</span><button className="icon-button" aria-label="关闭内容详情" onClick={onClose}><X size={18} /></button></div>
    <img className="community-detail-image" src={item.image} alt={item.title} /><h2 id="discover-detail-title">{item.title}</h2><div className="detail-source">{item.name} · {item.meta || '社区推荐'}</div><p>{item.detail}</p>
    <div className="detail-actions"><button className="outline-button" aria-pressed={liked} onClick={() => setLiked(!liked)}><Heart size={14} fill={liked?'currentColor':'none'} />{liked?'已喜欢':'喜欢'}</button><button className="outline-button" aria-pressed={saved} onClick={() => setSaved(!saved)}><Bookmark size={14} />{saved?'已收藏':'收藏'}</button>{item.type === '招募' && <button className="primary-button" onClick={() => {onClose();navigate('board');}}>查看共建看板</button>}</div>
    <section className="discovery-comments"><h3>讨论 · {comments.length}</h3>{comments.map((text,i) => <p key={i}><PersonAvatar index={0} /><b>我：</b>{text}</p>)}<form onSubmit={e => {e.preventDefault();if(draft.trim()){setComments([...comments,draft.trim()]);setDraft('');}}}><input aria-label="写下评论" placeholder="分享你的想法…" value={draft} onChange={e => setDraft(e.target.value)} /><button className="primary-button" disabled={!draft.trim()}>发送</button></form></section>
  </dialog>;
}

function RightRail({ page, navigate, activeFilter, setActiveFilter, voted, setVoted, notices, setNotices, joinedTasks = [], onViewPoll }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const project = page === 'vona' ? projects.vona : projects.jikesong;
  if(page === 'board') return <BoardInfoRail navigate={navigate} joinedTasks={joinedTasks} />;
  const showPoll = () => { setOpen(false); onViewPoll(); };
  const content = <ProjectAnnouncements project={project} notice={notices[project.key]} voted={voted} setVoted={setVoted} onEdit={() => setEditing({ key: project.key, ...notices[project.key] })} onViewPoll={showPoll} onBoard={() => { setOpen(false); navigate('board'); }} />;
  if (page === 'discover') return null;
  return <><aside className="right-rail" aria-label="项目公告"><SearchBox />{content}</aside><button className="announcement-trigger" aria-label="打开项目公告" onClick={() => setOpen(true)}><Megaphone size={17} /><span>项目公告</span></button>{open && <AnnouncementDialog onClose={() => setOpen(false)}>{content}</AnnouncementDialog>}{editing && <NoticeEditor initial={editing} onClose={() => setEditing(null)} onSave={(notice) => { setNotices({ ...notices, [editing.key]: notice }); setEditing(null); }} />}</>;
}

function BoardInfoRail({navigate, joinedTasks}) {
  const active=contributionTasks.filter(task=>task.status==='进行中').length;
  const completed=contributionTasks.filter(task=>task.status==='已完成').length;
  return <aside className="right-rail board-info-rail" aria-label="项目共建信息">
    <section className="rail-section board-about"><span className="eyebrow">ABOUT THIS PROJECT</span><h2>关于济客松</h2><p>让开源的工作流与劳动价值被看见，构建更透明、更有温度的开源协作社区。</p><div className="board-topic-tags"><span>hackathon</span><span>open-source</span><span>community</span><span>校园共创</span></div><dl><div><dt><Users size={16}/>成员</dt><dd>24</dd></div><div><dt><Link2 size={16}/>相关链接</dt><dd>2</dd></div><div><dt><CircleDot size={16}/>进行中的任务</dt><dd>{active}</dd></div><div><dt><Check size={16}/>已完成任务</dt><dd>{completed}</dd></div></dl><div className="board-rail-links"><button onClick={()=>navigate('home')}>项目主页<ChevronRight size={13}/></button><button onClick={()=>navigate('collaborations')}>合作项目<ChevronRight size={13}/></button></div></section>
    <section className="rail-section board-active-rail"><header><div><h2>活跃成员</h2><span>按贡献排名</span></div><button onClick={()=>document.querySelector('.contributor-more')?.click()}>查看全部 <ChevronRight size={14}/></button></header><ProjectMembers navigate={navigate} contributors /></section>
  </aside>;
}

function ProjectAnnouncements({ project, notice, onEdit }) {
  return <div className="project-announcements"><div className="announcements-heading"><div><Megaphone size={16} /><h2>项目公告</h2></div><span>由项目方发布</span></div><section className="rail-section announcement-card"><div className="notice-topline"><span><Pin size={12} />公告</span><button aria-label="编辑项目公告" onClick={onEdit}><Pencil size={14} /></button></div><h3>{notice.title}</h3>{notice.image && <img className="announcement-image" src={project.cover} alt={`${project.name}公告配图`} />}<p className="notice-body">{notice.body}</p><div className="notice-signature"><span className="mini-mark">{project.mark}</span>{project.name} 项目组</div></section></div>;
}

function AnnouncementDialog({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="announcement-dialog task-dialog" aria-label="项目公告" onClose={onClose}><div className="announcement-dialog-close"><button className="icon-button" aria-label="关闭项目公告" onClick={onClose}><X size={18} /></button></div>{children}</dialog>;
}

function NoticeEditor({ initial, onSave, onClose }) {
  const ref = useRef(null);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [image, setImage] = useState(initial.image);
  useEffect(() => { ref.current.showModal(); }, []);
  return <dialog ref={ref} className="task-dialog notice-editor" aria-labelledby="notice-editor-title" onClose={onClose}><form onSubmit={(event) => { event.preventDefault(); if (title.trim() && body.trim()) onSave({ title: title.trim(), body: body.trim(), image }); }}><div className="dialog-heading"><h2 id="notice-editor-title">编辑项目公告</h2><button type="button" className="icon-button" aria-label="关闭公告编辑" onClick={onClose}><X size={18} /></button></div><label>公告标题<input required maxLength={60} value={title} onChange={(event) => setTitle(event.target.value)} /></label><label>公告内容<textarea required rows={7} maxLength={2000} value={body} onChange={(event) => setBody(event.target.value)} /></label><label className="notice-image-toggle"><input type="checkbox" checked={image} onChange={(event) => setImage(event.target.checked)} />附上项目背景图</label><div className="dialog-actions"><span>保存到当前原型演示会话</span><button type="submit" className="primary-button" disabled={!title.trim() || !body.trim()}>保存公告</button></div></form></dialog>;
}

function SearchBox() { return <label className="rail-search"><Search size={16} /><input placeholder="搜索项目与动态" aria-label="搜索项目与动态" /></label>; }

createRoot(document.getElementById('root')).render(<App />);
