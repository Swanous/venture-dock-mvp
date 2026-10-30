import React, { useEffect, useRef, useState } from 'react';
import './project-extras.css';
import { PublishedCard } from './publisher';
import { Bell, Check, ChevronRight, Clock3, Download, ExternalLink, FileText, Link2, Search, Sparkles, Trophy, Users, X } from 'lucide-react';

const startingNotifications = [
 {id:'poll',type:'投票',time:6,title:'组队方式投票已完成',summary:'你参与的投票已有结果，查看大家的选择。',detail:'「你更想参与哪种组队方式？」已结束，共 267 人参与。真实问题组队获得 150 票，跨学科组队获得 117 票。赛事组将参考结果安排现场组队环节。'},
 {id:'claimed',type:'共建',time:24,title:'有人认领了共建任务',summary:'薄荷汽水_ 认领了「赛事主视觉与传播物料」。',detail:'薄荷汽水_ 已加入 JK-05，负责社交媒体宣传图与现场指引。当前状态：进行中。下一步：在共建看板提交初稿并邀请伙伴反馈。'},
 {id:'done',type:'共建',time:58,title:'共建任务已完成',summary:'「确定赛事时间与场地」已更新为已完成。',detail:'JK-01 已完成。赛事定于 2026 年 12 月 5 日至 6 日在同济大厦 A 楼 1501 举行。成果摘要和场地安排已同步到共建看板。'},
 {id:'event',type:'活动',time:120,title:'VONA 发布了新活动',summary:'你关注的项目邀请你参加「跨语言产品体验夜」。',detail:'VONA 邀请开发、设计与内容伙伴一起体验跨语言交流原型，分享产品反馈。活动安排：2026 年 11 月 14 日 19:00，线上参与，开放 30 个名额。'},
 {id:'invite',type:'关联邀请',time:240,title:'VONA 向你发送了项目关联邀请',summary:'希望与济客松建立「赛事合作伙伴」关系。',detail:'关联说明：共同设计跨语言路演体验，支持赛事选手和导师交流。对方项目：VONA。拟建立关系：赛事合作伙伴。接受后将展示在双方合作项目列表中。'},
];
const categories=['全部','投票','共建','活动','关联邀请'];
export function NotificationCenter({onClose,navigate,onInviteAccepted}) {
 const ref=useRef(null);const [category,setCategory]=useState('全部'),[selected,setSelected]=useState(null),[read,setRead]=useState([]),[invite,setInvite]=useState('');
 useEffect(()=>{ref.current.showModal();},[]);
 const shown=startingNotifications.filter(n=>category==='全部'||n.type===category).sort((a,b)=>a.time-b.time);
 const open=n=>{setSelected(n);setRead(r=>[...new Set([...r,n.id])]);};
 return <dialog ref={ref} className="notification-dialog" aria-label="通知中心" onClose={onClose} onClick={e=>{if(e.target===ref.current)onClose();}}><header><div><h2>通知</h2><span>{startingNotifications.length-read.length} 条未读</span></div><button className="icon-button" aria-label="关闭通知" onClick={onClose}><X size={19}/></button></header><div className="notification-category-bar"><nav className="notification-filters">{categories.map(c=><button className={c===category?'active':''} key={c} onClick={()=>{setCategory(c);setSelected(null);}}>{c}</button>)}</nav><button className="notification-read-all" onClick={()=>setRead(startingNotifications.map(n=>n.id))}><Check size={13}/>全部标为已读</button></div>{selected?<div className="notification-detail"><button className="notification-back" onClick={()=>setSelected(null)}>‹ 返回通知列表</button><span className="notification-type">{selected.type}</span><h3>{selected.title}</h3><time>{selected.time<60?selected.time+' 分钟前':Math.round(selected.time/60)+' 小时前'} · 济客松项目空间</time><p>{selected.detail}</p>{selected.id==='poll'&&<div className="notification-results"><div><span>真实问题组队</span><b>56% · 150 票</b><i style={{width:'56%'}}/></div><div><span>跨学科组队</span><b>44% · 117 票</b><i style={{width:'44%'}}/></div><small>投票已结束 · 267 人参与</small></div>}{selected.id==='invite'?<div className="notification-invite">{invite?<p role="status">{invite}</p>:<><button className="outline-button" onClick={()=>setInvite('已婉拒本次关联邀请')}>婉拒</button><button className="primary-button" onClick={()=>{setInvite('已接受 · 赛事合作关系已确认');onInviteAccepted();}}>接受关联</button></>}<button className="notice-text-link" onClick={()=>{onClose();navigate('vona');}}>查看 VONA 项目<ChevronRight size={13}/></button></div>:<button className="primary-button" onClick={()=>{onClose();navigate(selected.type==='共建'?'board':selected.type==='活动'?'activities':'home');}}>{selected.type==='共建'?'前往共建看板':selected.type==='活动'?'查看活动与报名':'查看项目动态'}<ChevronRight size={14}/></button>}</div>:<div className="notification-list">{['时间顺序'].map(group=><section key={group}>{shown.map(n=><button className={'notification-item '+(read.includes(n.id)?'is-read':'')} onClick={()=>open(n)} key={n.id}><span className={'notification-icon notice-'+n.type}>{n.type==='投票'?<Trophy size={18}/>:n.type==='共建'?<Sparkles size={18}/>:n.type==='活动'?<Bell size={18}/>:<Link2 size={18}/>}</span><div><b>{n.title}</b><p>{n.summary}</p><small>{n.type} · {n.time<60?n.time+' 分钟前':Math.round(n.time/60)+' 小时前'}</small></div>{!read.includes(n.id)&&<i className="unread-dot"/>}</button>)}</section>)}</div>}</dialog>;
}

const events=[
 {id:'hackathon',group:'2026 · S1 赛季',kind:'48 小时创作挑战',title:'济客松 S1 · 48 小时创作挑战',label:'报名中',date:'2026 年 12 月 5–6 日',place:'同济大厦 A 楼 1501',summary:'带上一个你想解决的问题，和来自不同背景的伙伴一起，把想法做成可以现场演示的原型。',plan:['12 月 5 日 09:00 · 问题发布与跨学科组队','12 月 5 日 14:00 · 原型共创与导师交流','12 月 6 日 14:00 · 项目路演与成果展示'],limit:80,registered:46},
 {id:'voice-night',group:'主题活动 · 跨界交流',kind:'产品体验夜',title:'VONA × 济客松 · 跨语言产品体验夜',label:'开放报名',date:'2026 年 11 月 14 日 19:00',place:'线上 · 报名后获取会议入口',summary:'用一场轻松的体验交流，一起探索实时语音翻译在黑客松路演里的可能。欢迎带着好奇心和反馈参加。',plan:['19:00 · 产品介绍与场景演示','19:20 · 分组体验与跨语言交流','20:00 · 问题收集与共建讨论'],limit:30,registered:18},
];
const seasonProjects = [
  {name:'拾光地图',category:'校园生活',phase:'原型验证',summary:'把校园里被忽略的无障碍路线，变成人人都能用的出行地图。',image:'assets/community/visual-02.jpg',members:[0,2,4]},
  {name:'余量食堂',category:'可持续校园',phase:'用户调研',summary:'连接食堂与学生，让每日临近打烊的餐食找到更好的去处。',image:'assets/community/visual-05.jpg',members:[1,3,5]},
  {name:'声屿',category:'AI 创作工具',phase:'演示准备',summary:'为跨语言访谈生成可编辑的双语纪要，保留说话者原本的语气。',image:'assets/community/visual-08.jpg',members:[2,5,6]},
  {name:'课间 15 分钟',category:'校园生活',phase:'需求梳理',summary:'用一张实时地图，找到两节课之间刚好来得及去的空间和活动。',image:'assets/community/visual-12.jpg',members:[0,1,6]},
  {name:'旧物新生',category:'循环经济',phase:'原型验证',summary:'让毕业季闲置物品在校园里继续流转，而不是匆忙丢弃。',image:'assets/community/visual-17.jpg',members:[1,4,5]},
  {name:'光合角落',category:'校园空间',phase:'概念共创',summary:'记录校园里适合休息、阅读和晒太阳的小角落，邀请大家一起补全。',image:'assets/community/visual-23.jpg',members:[0,3,6]},
];

function SeasonProjectShowcase({eventId, PersonAvatar}) {
  if (eventId !== 'hackathon') return null;
  return <section className="season-projects" aria-labelledby="season-projects-title">
    <header className="season-projects-heading"><div><h2 id="season-projects-title">S1 参赛项目</h2><p>从校园里的真实问题出发，看看各组正在做什么。</p></div><span>{seasonProjects.length} 个项目</span></header>
    <div className="season-project-grid">{seasonProjects.map(project=><article className="season-project-card" key={project.name}>
      <img src={import.meta.env.BASE_URL + project.image} alt={project.name+'项目视觉'} />
      <div className="season-project-body"><div className="season-project-meta"><span>{project.category}</span><span>{project.phase}</span></div><h3>{project.name}</h3><p>{project.summary}</p>
        <footer><div className="season-project-avatars" aria-label={`${project.members.length} 位团队成员`}>{project.members.map(index=><PersonAvatar key={index} index={index}/>)}</div><span>{project.members.length} 位共创者</span></footer>
      </div>
    </article>)}</div>
  </section>;
}

export function ProjectActivities({members,PersonAvatar,onResume,onRegistration,publications=[]}) {
  const [eventId,setEventId]=useState('hackathon'),[registrations,setRegistrations]=useState({}),[form,setForm]=useState(false),[name,setName]=useState(''),[interest,setInterest]=useState('产品设计'),[query,setQuery]=useState(''),[eventLinks,setEventLinks]=useState({hackathon:'https://forms.google.com/','voice-night':'https://forms.google.com/'}),[linkEditing,setLinkEditing]=useState(false),[linkDraft,setLinkDraft]=useState('');
  const event=events.find(item=>item.id===eventId),registered=!!registrations[event.id];
  const participants=members.slice(0,7).map((member,index)=>({...member,index,education:['本科在读 · 设计学','硕士在读 · 软件工程','本科在读 · 新闻传播','本科毕业 · 工业设计','硕士在读 · 社会学','本科在读 · 文化产业管理','本科在读 · 心理学'][index],links:index===1?[{name:'GitHub',url:'https://github.com/'}]:index===3?[{name:'作品集',url:'https://www.behance.net/'}]:[],skill:['产品设计','前端开发','品牌传播','交互设计','社区运营','活动策划','用户研究'][index]}));
  const submit=event=>{event.preventDefault();if(!name.trim())return;setRegistrations({...registrations,[event.id]:{name:name.trim(),interest}});setForm(false);onRegistration(event.title);};
  const eventGroups=[...new Set(events.map(item=>item.group))];

  return <div className="activities-page">
    <header className="page-header"><div><h1>项目活动</h1></div><span className="activity-host">济客松 · 项目方发布</span></header>
    {publications.filter(item=>item.status==='published'&&item.type==='活动'&&item.project==='jikesong').map(item=><PublishedCard key={item.id} item={item}/>)}
    <section className="event-groups" aria-label="按赛季或主题浏览活动">{eventGroups.map(group=><div className="event-group" key={group}>
      <header><h2>{group}</h2><span>{events.filter(item=>item.group===group).length} 项活动</span></header>
      <div>{events.filter(item=>item.group===group).map(item=><button key={item.id} className={`event-choice ${event.id===item.id?'active':''}`} aria-pressed={event.id===item.id} onClick={()=>{setEventId(item.id);setForm(false);}}><b>{item.kind}</b><span>{item.title}</span><ChevronRight size={15}/></button>)}</div>
    </div>)}</section>
    <a className={'event-poster event-'+event.id} href={eventLinks[event.id]||undefined} target={eventLinks[event.id]?'_blank':undefined} rel="noopener noreferrer" aria-label="打开赛事方活动链接" onClick={e=>{if(!eventLinks[event.id]){e.preventDefault();setLinkEditing(true);setLinkDraft('');}}}>
      <img src={event.id==='hackathon'?import.meta.env.BASE_URL+'assets/jikesong-cover.jpg':import.meta.env.BASE_URL+'assets/vona-demo.jpg'} alt={event.title+'活动海报'}/><div><span>{event.label}</span><h2>{event.title}</h2><p>{event.summary}</p><b>{event.date}</b></div><span className="event-poster-link">前往报名 <ExternalLink size={14}/></span>
    </a>
    <button className="event-link-edit" onClick={()=>{setLinkDraft(eventLinks[event.id]||'');setLinkEditing(!linkEditing);}}>设置赛事方链接</button>
    {linkEditing&&<form className="event-link-form" onSubmit={event=>{event.preventDefault();try{const url=new URL(linkDraft);if(!['https:','http:'].includes(url.protocol))return;setEventLinks({...eventLinks,[event.id]:url.href});setLinkEditing(false);}catch{}}}><label>赛事方活动链接<input type="url" required value={linkDraft} onChange={event=>setLinkDraft(event.target.value)} placeholder="粘贴赛事方发布的活动链接"/></label><button className="primary-button">保存链接</button></form>}
    <div className="event-meta"><span><Clock3 size={15}/>{event.date}</span><span><Users size={15}/>{event.place}</span></div>
    <section className="event-description"><h3>活动安排</h3>{event.plan.map((item,index)=><div key={item}><i>{index+1}</i>{item}</div>)}</section>
    <SeasonProjectShowcase eventId={event.id} PersonAvatar={PersonAvatar}/>
    <section className="event-register"><div><h3>{registered?'报名成功，期待与你见面':'从一个问题出发，一起开始'}</h3><p>{registered?'可在下方查看你的报名信息，也可以取消报名。':'无需完整团队，有想法、有好奇心，就可以报名。'}</p></div><button className={registered?'outline-button':'primary-button'} onClick={()=>{if(registered)setRegistrations({...registrations,[event.id]:null});else setForm(!form);}}>{registered?'取消报名':'立即报名'}</button></section>
    {form&&<form className="event-signup-form" onSubmit={submit}><h3>填写报名信息</h3><label>称呼<input required maxLength={30} value={name} onChange={event=>setName(event.target.value)} placeholder="希望大家怎么称呼你？"/></label><label>感兴趣的方向<select value={interest} onChange={event=>setInterest(event.target.value)}>{['产品设计','技术开发','品牌传播','活动策划','还在探索'].map(item=><option key={item}>{item}</option>)}</select></label><p>本次报名仅用于演示，信息保留在当前页面。</p><button className="primary-button">确认报名</button></form>}
    <div className="participant-access-divider"><span>赛事管理区 · 仅赛事方及获授权成员可见</span></div>
    <section className="participant-section"><header><div><h2>选手信息</h2><p>找到兴趣相近或技能互补的伙伴</p></div><label><Search size={14}/><input aria-label="搜索选手" value={query} onChange={event=>setQuery(event.target.value)} placeholder="昵称或方向"/></label></header><div className="participant-list">{participants.filter(person=>(person.name+person.skill).includes(query)).map(person=><article key={person.name}><PersonAvatar index={person.index}/><div><b>{person.name}</b><span>{person.education}</span><span>从事方向：{person.skill}</span></div><div className="participant-links"><button className="resume-open" onClick={()=>onResume(person)}>简历</button>{person.links.map(link=><a href={link.url} key={link.name} target="_blank" rel="noopener noreferrer" title={link.name} aria-label={person.name+'的'+link.name}><Link2 size={14}/></a>)}</div></article>)}{registered&&<article><PersonAvatar index={0}/><div><b>{registrations[event.id].name} · 我</b><span>{registrations[event.id].interest} · 报名成功</span></div><Check size={17}/></article>}</div></section>
  </div>;
}

export function ResumeRail({person,onClose}) {
 const [fullscreen,setFullscreen]=useState(false),[zoom,setZoom]=useState(100);const dialog=useRef(null);
 useEffect(()=>{if(fullscreen)dialog.current.showModal();},[fullscreen]);
 useEffect(()=>{setZoom(100);},[person.index]);
 const src=import.meta.env.BASE_URL+'assets/resumes/member-'+String(person.index+1).padStart(2,'0')+'.pdf';
 const viewer=<><header className="resume-rail-heading"><div><FileText size={17}/><div><b>{person.name}</b></div></div><button className="icon-button" aria-label="关闭简历预览" onClick={onClose}><X size={17}/></button></header><div className="resume-toolbar"><button onClick={()=>setFullscreen(true)}><ExternalLink size={13}/>放大查看</button><a href={src} download><Download size={13}/>下载 PDF</a><button aria-label="重置简历缩放" onClick={()=>setZoom(100)}>{zoom}%</button></div><div className="resume-page-preview" onWheel={e=>{e.stopPropagation();setZoom(value=>Math.max(60,Math.min(240,value+(e.deltaY<0?10:-10))));}}><img style={{width:zoom+'%',maxWidth:'none'}} src={src.replace('.pdf','.png')} alt={person.name+'的简历 PDF 页面'}/></div><div className="resume-preview-note">查看选手资料，找到适合一起组队的伙伴。</div></>;
 return <><aside className="right-rail resume-rail" aria-label="灵活栏：选手简历">{viewer}</aside><div className="resume-mobile-view">{viewer}</div>{fullscreen&&<dialog ref={dialog} className="resume-fullscreen" aria-label="完整简历" onClose={()=>setFullscreen(false)}><header><b>{person.name} · 简历</b><button className="icon-button" aria-label="关闭完整简历" onClick={()=>setFullscreen(false)}><X size={20}/></button></header><iframe title="完整简历 PDF" src={src}/></dialog>}</>;
}


