(() => {
  const data=window.WEIGHT_DATA, colors=['#438675','#d58b61','#7188b2'];
  const metric=document.querySelector('#metric'), tabs=document.querySelector('#personTabs'), detail=document.querySelector('#detail');
  const fmt=v=>v==null?'—':`${Number(v).toFixed(1)}`;
  const dateLabel=d=>`${Number(d.slice(5,7))}.${Number(d.slice(8,10))}`;
  const today=new Date(), todayISO=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
  const personStorageKey='healthy-weight-selected-person';
  let savedPerson=null;
  try{savedPerson=localStorage.getItem(personStorageKey);}catch{}
  let selected=data.people.includes(savedPerson)?savedPerson:(data.people.includes('丢丢')?'丢丢':data.people[0]);
  document.querySelector('#todayDate').textContent=`${today.getMonth()+1}月${today.getDate()}日`;

  function interpolate(series){const out=series.map(x=>({...x}));for(let i=0;i<out.length;i++)if(out[i].value==null){let a=i-1,b=i+1;while(a>=0&&out[a].value==null)a--;while(b<out.length&&out[b].value==null)b++;if(a>=0&&b<out.length){out[i].value=out[a].value+(out[b].value-out[a].value)*(i-a)/(b-a);out[i].interpolated=true;}}return out;}

  function renderToday(records){
    const hasToday=records.some(r=>r.date===todayISO&&r.person===selected&&(r.morning!=null||r.evening!=null));
    document.querySelector('#todayHeading').textContent=`${selected} · ${hasToday?'今日状态':'昨日状态'}`;
    document.querySelector('#todayLabel').textContent=hasToday?'TODAY':'LATEST';
    document.querySelector('#todayBadge').textContent=hasToday?'今日体重':'最近体重';
    const i=data.people.indexOf(selected),p=selected,own=records.filter(x=>x.person===p&&x.date<=todayISO),todays=own.find(x=>x.date===todayISO),hasTodayValue=todays&&(todays.morning!=null||todays.evening!=null),r=hasTodayValue?todays:own.filter(x=>x.date<todayISO&&(x.morning!=null||x.evening!=null)).at(-1),isToday=!!hasTodayValue,delta=r?.morning!=null&&r?.evening!=null?r.evening-r.morning:null;
    const prevDate=r?new Date(`${r.date}T00:00:00`):null;
    if(prevDate)prevDate.setDate(prevDate.getDate()-1);
    const prevISO=prevDate?`${prevDate.getFullYear()}-${String(prevDate.getMonth()+1).padStart(2,'0')}-${String(prevDate.getDate()).padStart(2,'0')}`:null;
    const prevMorning=own.find(x=>x.date===prevISO)?.morning;
    const morningDelta=r?.morning!=null&&prevMorning!=null?(r.morning-prevMorning)/2:null;
    document.querySelector('#today').innerHTML=`<article class="today-card" style="--accent:${colors[i%3]}"><div class="today-person"><span class="avatar">${p.slice(0,1)}</span><b>${p}</b><span class="today-record-date">${r?(isToday?'今日':'最近 · '+dateLabel(r.date)):'暂无记录'}</span></div><div class="today-values"><div><span>早上 · 斤</span><strong>${fmt(r?.morning)}</strong><small class="morning-delta ${morningDelta>0?'up':morningDelta<0?'down':''}">较昨日 ${morningDelta==null?'—':`${morningDelta>0?'+':''}${morningDelta.toFixed(1)} kg`}</small></div><div><span>晚上 · 斤</span><strong>${fmt(r?.evening)}</strong></div></div><div class="today-delta ${delta>0?'up':delta<0?'down':''}">${delta==null?'早晚差 —':`${isToday?'今日':'当日'}变化 ${delta>0?'+':''}${(delta/2).toFixed(1)} kg`}</div></article>`;
  }

  function render(){
    const records=[...data.records].sort((a,b)=>a.date.localeCompare(b.date));
    renderToday(records);
    const personalRecords=records.filter(r=>r.person===selected);
    document.querySelector('#rows').innerHTML=personalRecords.slice().reverse().map(r=>{const diff=r.morning==null||r.evening==null?null:(r.evening-r.morning)/2;return `<tr class="record-row" data-person="${r.person}" tabindex="0"><td>${dateLabel(r.date)}</td><td>${fmt(r.morning)}</td><td>${fmt(r.evening)}</td><td>${diff==null?'—':`<span class="delta ${diff>0?'up':diff<0?'down':'same'}">${diff>0?'+':''}${diff.toFixed(1)}</span>`}</td></tr>`;}).join('');
    document.querySelector('#recordCount').textContent=`${personalRecords.length} 条 · ${selected}`;
    tabs.innerHTML=data.people.map((p,i)=>`<button type="button" class="person-tab ${p===selected?'active':''}" data-person="${p}" style="--accent:${colors[i%3]}">${p}</button>`).join('');
    drawDetail(records);
  }

  function drawDetail(records){
    const selectedIndex=data.people.indexOf(selected), color=colors[selectedIndex%3], own=records.filter(r=>r.person===selected);
    const days=[];for(let n=9;n>=0;n--){const d=new Date(today);d.setDate(today.getDate()-n);days.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);}
    detail.innerHTML=`<div class="detail-chart-head"><b>${selected} · ${metric.options[metric.selectedIndex].text}趋势</b><span>${dateLabel(days[0])} — ${dateLabel(days[9])} · ${metric.value==='change'?'kg':'斤'}</span><span class="series-legend"><i></i>早上</span>${metric.value==='both'?'<span class="series-legend"><i class="evening-key"></i>晚上</span>':''}<span class="interpolation-key"><i></i>插值估算</span><span id="chartTip" class="chart-tip" aria-live="polite">点击折线查看数据</span></div><div class="detail-chart"><svg id="detailChart" role="img" aria-label="近10天体重趋势" viewBox="0 0 760 220" preserveAspectRatio="none"></svg></div>`;
    drawChart(own,days,color);
  }

  function drawChart(records,days,color){
    const svg=document.querySelector('#detailChart'),mode=metric.value,NS='http://www.w3.org/2000/svg';
    const el=(tag,attrs={},txt='')=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=txt;svg.append(n);return n;};
    const keys=mode==='morning'?['morning']:mode==='evening'?['evening']:mode==='change'?['change']:['morning','evening'];
    const vals=keys.flatMap(k=>records.map(r=>k==='change'?(r.morning!=null&&r.evening!=null?(r.evening-r.morning)/2:null):r[k]).filter(v=>v!=null));
    if(!vals.length){el('text',{x:380,y:110,'text-anchor':'middle',class:'empty-label'},'还没有体重数据');return;}
    let min=Math.min(...vals),max=Math.max(...vals);if(mode==='change'){min=Math.min(min,-1);max=Math.max(max,1);}const pad=Math.max((max-min)*.24,1);min-=pad;max+=pad;
    const W=760,H=220,L=48,R=12,T=14,B=31,box=svg.getBoundingClientRect(),scaleX=box.width/W,scaleY=box.height/H,dotX=4.2/scaleX,dotY=4.2/scaleY,hitX=12/scaleX,hitY=12/scaleY,X=i=>L+i*(W-L-R)/(days.length-1),Y=v=>T+(max-v)/(max-min)*(H-T-B);
    for(let n=0;n<4;n++){const v=min+(max-min)*n/3,y=Y(v);el('line',{x1:L,y1:y,x2:W-R,y2:y,class:'grid'});el('text',{x:L-8,y:y+4,'text-anchor':'end',class:'axis-label'},v.toFixed(1));}
    const dateTicks=[0,3,6,9];
    dateTicks.forEach(i=>el('text',{x:X(i),y:H-7,'text-anchor':'middle',class:'axis-label'},dateLabel(days[i])));
    keys.forEach(k=>{const pts=interpolate(days.map(date=>{const r=records.find(x=>x.date===date);return{date,value:k==='change'?(r&&r.morning!=null&&r.evening!=null?(r.evening-r.morning)/2:null):r?.[k]??null};}));const c=k==='evening'?'#c9a16f':color;let path='';pts.forEach((p,i)=>{if(p.value!=null)path+=`${path?' L':'M'} ${X(i)} ${Y(p.value)}`;});if(path)el('path',{d:path,fill:'none',stroke:c,'stroke-width':3,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':pts.some(x=>x.interpolated)?'6 5':''});pts.forEach((p,i)=>{if(p.value!=null){const attrs={'cx':X(i),'cy':Y(p.value),'data-date':p.date,'data-value':p.value.toFixed(1),'data-series':k,'data-estimated':p.interpolated?'true':'false'};el('ellipse',{...attrs,rx:p.interpolated?dotX*1.2:dotX,ry:p.interpolated?dotY*1.2:dotY,fill:p.interpolated?'white':c,stroke:c,'stroke-width':2,'pointer-events':'none'});const hit=el('ellipse',{...attrs,rx:hitX,ry:hitY,fill:'transparent',stroke:'transparent',class:'chart-point'});hit.style.touchAction='none';}});});
    let holdTimer,held=false;
    const tip=document.querySelector('#chartTip');
    const showPoint=point=>{const isDiff=point.dataset.series==='change',label=point.dataset.series==='morning'?'早上':point.dataset.series==='evening'?'晚上':'早晚差';tip.textContent=`${dateLabel(point.dataset.date)} · ${label} ${point.dataset.value} ${isDiff?'kg':'斤'}${point.dataset.estimated==='true'?'（插值估算）':''}`;tip.classList.add('visible');};
    svg.onpointerdown=e=>{const point=e.target.closest('.chart-point');if(!point)return;held=false;holdTimer=setTimeout(()=>{held=true;showPoint(point);},450);};
    svg.onpointerup=svg.onpointerleave=()=>clearTimeout(holdTimer);
    svg.onpointercancel=()=>clearTimeout(holdTimer);
    svg.onclick=e=>{const point=e.target.closest('.chart-point');if(!point)return;if(!held)showPoint(point);held=false;};
  }

  document.querySelector('#rows').addEventListener('click',e=>{const row=e.target.closest('[data-person]');if(row){selected=row.dataset.person;render();document.querySelector('#detail').scrollIntoView({behavior:'smooth',block:'start'});}});
  tabs.addEventListener('click',e=>{const btn=e.target.closest('[data-person]');if(btn){selected=btn.dataset.person;try{localStorage.setItem(personStorageKey,selected);}catch{}render();}});
  metric.addEventListener('change',render);
  render();
})();
