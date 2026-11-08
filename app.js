(() => {
  const data=window.WEIGHT_DATA, colors=['#438675','#d58b61','#7188b2'];
  const metric=document.querySelector('#metric'), tabs=document.querySelector('#personTabs'), detail=document.querySelector('#detail');
  const fmt=v=>v==null?'—':`${Number(v).toFixed(1)}`;
  const dateLabel=d=>`${Number(d.slice(5,7))}.${Number(d.slice(8,10))}`;
  const today=new Date(), todayISO=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  let selected=data.people[0];
  document.querySelector('#todayDate').textContent=`${today.getMonth()+1}月${today.getDate()}日`;

  function interpolate(series){const out=series.map(x=>({...x}));for(let i=0;i<out.length;i++)if(out[i].value==null){let a=i-1,b=i+1;while(a>=0&&out[a].value==null)a--;while(b<out.length&&out[b].value==null)b++;if(a>=0&&b<out.length){out[i].value=out[a].value+(out[b].value-out[a].value)*(i-a)/(b-a);out[i].interpolated=true;}}return out;}

  function renderToday(records){
    const todays=records.filter(r=>r.date===todayISO);
    document.querySelector('#today').innerHTML=data.people.map((p,i)=>{const r=todays.find(x=>x.person===p),delta=r?.morning!=null&&r?.evening!=null?r.evening-r.morning:null;return `<article class="today-card" style="--accent:${colors[i%3]}"><div class="today-person"><span class="avatar">${p.slice(0,1)}</span><b>${p}</b></div><div class="today-values"><div><span>早上</span><strong>${fmt(r?.morning)}</strong></div><div><span>晚上</span><strong>${fmt(r?.evening)}</strong></div></div><div class="today-delta ${delta>0?'up':delta<0?'down':''}">${delta==null?'等待今日记录':`今日变化 ${delta>0?'+':''}${delta.toFixed(1)} kg`}</div></article>`;}).join('');
  }

  function render(){
    const records=[...data.records].sort((a,b)=>a.date.localeCompare(b.date));
    renderToday(records);
    document.querySelector('#rows').innerHTML=records.slice().reverse().map(r=>{const diff=r.morning==null||r.evening==null?null:r.evening-r.morning,i=data.people.indexOf(r.person);return `<tr class="record-row ${r.person===selected?'selected':''}" data-person="${r.person}" tabindex="0"><td>${dateLabel(r.date)}</td><td><span class="person-dot" style="--dot:${colors[i%3]}"></span>${r.person}</td><td>${fmt(r.morning)}</td><td>${fmt(r.evening)}</td><td>${diff==null?'—':`<span class="delta ${diff>0?'up':diff<0?'down':'same'}">${diff>0?'+':''}${diff.toFixed(1)}</span>`}</td></tr>`;}).join('');
    document.querySelector('#recordCount').textContent=`${records.length} 条记录 · 点选记录查看伙伴`;
    tabs.innerHTML=data.people.map((p,i)=>`<button type="button" class="person-tab ${p===selected?'active':''}" data-person="${p}" style="--accent:${colors[i%3]}">${p}</button>`).join('');
    drawDetail(records);
  }

  function drawDetail(records){
    const i=data.people.indexOf(selected), color=colors[i%3], own=records.filter(r=>r.person===selected), latest=own.at(-1);
    const morning=latest?.morning??null,evening=latest?.evening??null,diff=morning==null||evening==null?null:evening-morning;
    const days=[];for(let n=9;n>=0;n--){const d=new Date(today);d.setDate(today.getDate()-n);days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);}
    detail.innerHTML=`<div class="detail-top" style="--accent:${color}"><div class="detail-name"><span class="avatar">${selected.slice(0,1)}</span><div><h3>${selected}</h3><p>近 10 天 · 每个人单独统计</p></div></div><div class="detail-latest"><span>最近记录 ${latest?dateLabel(latest.date):'—'}</span><strong>${fmt(morning)} <small>/</small> ${fmt(evening)} <em>kg</em></strong></div></div><div class="detail-stats"><div><span>早上</span><strong>${fmt(morning)} <small>kg</small></strong></div><div><span>晚上</span><strong>${fmt(evening)} <small>kg</small></strong></div><div class="stat-delta ${diff>0?'up':diff<0?'down':''}"><span>早晚差</span><strong>${diff==null?'—':`${diff>0?'+':''}${diff.toFixed(1)}`} <small>kg</small></strong></div></div><div class="detail-chart-head"><b>${metric.options[metric.selectedIndex].text}趋势</b><span>${dateLabel(days[0])} — ${dateLabel(days[9])}</span><span class="series-legend"><i></i>早上</span>${metric.value==='both'?'<span class="series-legend"><i class="evening-key"></i>晚上</span>':''}</div><div class="detail-chart"><svg id="detailChart" role="img" aria-label="近10天体重趋势" viewBox="0 0 760 220" preserveAspectRatio="none"></svg></div>`;
    drawChart(own,days,color);
  }

  function drawChart(records,days,color){
    const svg=document.querySelector('#detailChart'),mode=metric.value,NS='http://www.w3.org/2000/svg';
    const el=(tag,attrs={},txt='')=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=txt;svg.append(n);return n;};
    const keys=mode==='morning'?['morning']:mode==='evening'?['evening']:mode==='change'?['change']:['morning','evening'];
    const vals=keys.flatMap(k=>records.map(r=>k==='change'?(r.morning!=null&&r.evening!=null?r.evening-r.morning:null):r[k]).filter(v=>v!=null));
    if(!vals.length){el('text',{x:380,y:110,'text-anchor':'middle',class:'empty-label'},'还没有体重数据');return;}
    let min=Math.min(...vals),max=Math.max(...vals);if(mode==='change'){min=Math.min(min,-1);max=Math.max(max,1);}const pad=Math.max((max-min)*.24,1);min-=pad;max+=pad;
    const W=760,H=220,L=48,R=12,T=14,B=31,X=i=>L+i*(W-L-R)/(days.length-1),Y=v=>T+(max-v)/(max-min)*(H-T-B);
    for(let n=0;n<4;n++){const v=min+(max-min)*n/3,y=Y(v);el('line',{x1:L,y1:y,x2:W-R,y2:y,class:'grid'});el('text',{x:L-8,y:y+4,'text-anchor':'end',class:'axis-label'},v.toFixed(1));}
    days.forEach((d,i)=>{if(i%2===0||i===9)el('text',{x:X(i),y:H-7,'text-anchor':'middle',class:'axis-label'},dateLabel(d));});
    keys.forEach(k=>{const pts=interpolate(days.map(date=>{const r=records.find(x=>x.date===date);return{value:k==='change'?(r&&r.morning!=null&&r.evening!=null?r.evening-r.morning:null):r?.[k]??null};}));const c=k==='evening'?'#c9a16f':color;let path='';pts.forEach((p,i)=>{if(p.value!=null)path+=`${path?' L':'M'} ${X(i)} ${Y(p.value)}`;});if(path)el('path',{d:path,fill:'none',stroke:c,'stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':pts.some(x=>x.interpolated)?'6 5':''});pts.forEach((p,i)=>{if(p.value!=null)el('circle',{cx:X(i),cy:Y(p.value),r:p.interpolated?5:4,fill:p.interpolated?'white':c,stroke:c,'stroke-width':2});});});
  }

  document.querySelector('#rows').addEventListener('click',e=>{const row=e.target.closest('[data-person]');if(row){selected=row.dataset.person;render();document.querySelector('#detail').scrollIntoView({behavior:'smooth',block:'start'});}});
  tabs.addEventListener('click',e=>{const btn=e.target.closest('[data-person]');if(btn){selected=btn.dataset.person;render();}});
  metric.addEventListener('change',render);
  render();
})();
