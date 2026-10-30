import React, { useEffect, useRef, useState } from 'react';
import { Hash, LockKeyhole, MessageCircle, Pin } from 'lucide-react';
import './channel-navigation.css';

export const channelDirectory = [
  {name:'日常讨论', preview:'欢迎分享你正在关注的真实问题', time:'09:42', recent:4},
  {name:'选手反馈', preview:'没有开发经验可以参与哪些工作？', time:'14:36', recent:8},
  {name:'灵感分享', preview:'分享一个把旧物变成新产品的想法', time:'13:20', recent:7},
  {name:'组队大厅', preview:'寻找一起做校园工具的伙伴', time:'12:08', recent:6},
  {name:'活动策划', internal:true, preview:'一起确认跨学科组队交流时间', time:'10:18', recent:3},
  {name:'品牌宣传', internal:true, preview:'新一版主视觉已更新，欢迎反馈', time:'11:10', recent:5},
  {name:'核心协作', internal:true, preview:'本周任务已整理，大家来认领吧', time:'09:10', recent:2},
  {name:'赛事执行', internal:true, preview:'场地与物料清单等待确认', time:'08:45', recent:1},
];
export const isInternalChannel = name => !!channelDirectory.find(item => item.name === name)?.internal;
export function useChannelPreferences(project) {
  const [preferences,setPreferences] = useState(() => {
    try {return JSON.parse(localStorage.getItem('channel-preferences-v1')) || {};} catch {return {};}
  });
  useEffect(() => {localStorage.setItem('channel-preferences-v1',JSON.stringify(preferences));},[preferences]);
  const current = preferences[project] || {};
  const unread = current.unread || {'选手反馈':true,'灵感分享':true,'品牌宣传':true,'赛事执行':true};
  const pinned = current.pinned || {'活动策划':true};
  const followed = current.followed || {'日常讨论':true};
  const update = values => setPreferences(previous => ({...previous,[project]:{...(previous[project] || {}),...values}}));
  return {unread,pinned,followed,read:name=>update({unread:{...unread,[name]:false}}),
    setFollowed:followed=>update({followed}),togglePin:name=>update({pinned:{...pinned,[name]:!pinned[name]}})};
}

export function ChannelSidebar({page,channel,onOpen,followed,pinned,unread,onPin,mvpOnly=false}) {
  const container = useRef(null);
  const [ratio,setRatio] = useState(() => {
    const value = Number(localStorage.getItem('channel-split-v1'));
    return value >= 25 && value <= 75 ? value : 53;
  });
  const resize = value => {const next = Math.min(75,Math.max(25,value));setRatio(next);localStorage.setItem('channel-split-v1',String(next));};
  const adjust = event => {
    const bounds = container.current.getBoundingClientRect();
    resize((event.clientY - bounds.top) / bounds.height * 100);
  };
  const ordered = internal => channelDirectory.filter(item => !!item.internal === internal).sort((a,b) => Number(!!(internal?pinned:followed)[b.name])-Number(!!(internal?pinned:followed)[a.name]) || b.recent-a.recent);
  const row = item => <div key={item.name} className={'channel-entry '+(page==='channels'&&channel===item.name?'selected':'')} style={item.internal?{position:'relative'}:undefined}>
    <button className="channel-entry-open" onClick={()=>onOpen(item.name)} aria-current={page==='channels'&&channel===item.name?'page':undefined} aria-label={item.name+(unread[item.name]?'，有未读消息':'')}>
      {item.internal?<LockKeyhole size={13}/>:<Hash size={14}/>}
      <span className="channel-entry-copy"><span className="channel-entry-name">{item.name}{!item.internal&&followed[item.name]&&<span className="channel-follow-label">关注</span>}</span></span>
    </button>
    {item.internal&&<button className={'channel-pin '+(pinned[item.name]?'pinned':'')} onClick={()=>onPin(item.name)} aria-pressed={!!pinned[item.name]} aria-label={(pinned[item.name]?'取消置顶':'置顶')+item.name}><Pin size={12}/></button>}
    {unread[item.name]&&<i className="channel-unread" aria-label="未读消息"/>}
  </div>;
  if (mvpOnly) return <section className="workspace-channels" aria-label="频道"><div className="channels-title"><MessageCircle size={16}/><h2>频道</h2></div><div className="channel-pane channel-pane-public-only"><div className="channel-pane-scroll" tabIndex={0} aria-label="频道列表">{ordered(false).map(row)}</div></div></section>;
  return <section className="workspace-channels" aria-label="频道">
    <div className="channels-title"><MessageCircle size={16}/><h2>频道</h2></div>
    <div className="channel-split" ref={container} style={{gridTemplateRows:`minmax(0,${ratio}fr) 16px minmax(0,${100-ratio}fr)`}}>
      <section className="channel-pane" aria-label="公开频道"><header><Hash size={12}/>公开频道<span>{ordered(false).length}</span></header><div className="channel-pane-scroll" tabIndex={0} aria-label="公开频道列表">{ordered(false).map(row)}</div></section>
      <div className="channel-resizer" role="separator" tabIndex={0} aria-label="调整公开频道和内部频道高度" aria-orientation="horizontal" aria-valuemin={25} aria-valuemax={75} aria-valuenow={Math.round(ratio)} onPointerDown={event=>{event.preventDefault();event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))adjust(event);}} onPointerUp={event=>{if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);}} onKeyDown={event=>{if(['ArrowUp','ArrowDown','Home','End'].includes(event.key)){event.preventDefault();resize(event.key==='Home'?25:event.key==='End'?75:ratio+(event.key==='ArrowUp'?-5:5));}}}><span/></div>
      <section className="channel-pane" aria-label="内部频道"><header><LockKeyhole size={12}/>内部频道<span>{ordered(true).length}</span></header><div className="channel-pane-scroll" tabIndex={0} aria-label="内部频道列表">{ordered(true).map(row)}</div></section>
    </div>
  </section>;
}
