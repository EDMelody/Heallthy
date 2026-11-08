(() => {
  const data = window.WEIGHT_DATA;
  const person = document.querySelector('#person');
  const metric = document.querySelector('#metric');
  const rows = document.querySelector('#rows');
  const colors = ['#275e52', '#d27a53', '#657da7'];
  person.innerHTML = '<option value="all">所有伙伴</option>' + data.people.map(p => `<option>${p}</option>`).join('');
  const fmt = v => v == null ? '—' : `${Number(v).toFixed(1)}${v.interpolated ? ' *' : ''}`;
  const dateLabel = d => `${Number(d.slice(5,7))}.${Number(d.slice(8,10))}`;
  function interpolate(series) {
    const out = series.map(x => ({...x}));
    for (let i=0;i<out.length;i++) if (out[i].value == null) {
      let a=i-1,b=i+1; while(a>=0&&out[a].value==null)a--; while(b<out.length&&out[b].value==null)b++;
      if(a>=0&&b<out.length){ out[i].value=out[a].value+(out[b].value-out[a].value)*(i-a)/(b-a); out[i].interpolated=true; }
    }
    return out;
  }
  function render() {
    const people = person.value === 'all' ? data.people : [person.value];
    const records = data.records.filter(r=>people.includes(r.person)).sort((a,b)=>a.date.localeCompare(b.date));
    rows.innerHTML = records.slice().reverse().map(r=>`<tr><td>${dateLabel(r.date)}</td><td><span class="person-dot" style="--dot:${colors[data.people.indexOf(r.person)]}"></span>${r.person}</td><td>${fmt(r.morning)}</td><td>${fmt(r.evening)}</td><td>${r.morning==null||r.evening==null?'—':`${(r.evening-r.morning>0?'+':'')}${(r.evening-r.morning).toFixed(1)}`}</td></tr>`).join('');
    document.querySelector('#recordCount').textContent = `${records.length} 条记录`;
    const latest = records.at(-1);
    document.querySelector('#summary').innerHTML = people.map((p,i)=>{const r=records.filter(x=>x.person===p).at(-1);return `<article class="stat" style="--accent:${colors[data.people.indexOf(p)]}"><span>${p} · 最近记录</span><strong>${r?fmt(r.morning):'—'} <small>/</small> ${r?fmt(r.evening):'—'}</strong><small>${r?dateLabel(r.date):'暂无数据'} · 早 / 晚</small></article>`}).join('');
    draw(people, records);
  }
  function draw(people, records) {
    const svg=document.querySelector('#chart'), mode=metric.value; svg.innerHTML='';
    const NS='http://www.w3.org/2000/svg', el=(tag,attrs={},txt='')=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=txt;svg.append(n);return n;};
    const dates=[...new Set(records.map(r=>r.date))].sort(); if(!dates.length){el('text',{x:380,y:150,'text-anchor':'middle',class:'axis-label'},'还没有记录');return;}
    let vals=records.flatMap(r=>mode==='change'?[r.morning!=null&&r.evening!=null?r.evening-r.morning:null]:mode==='morning'?[r.morning]:mode==='evening'?[r.evening]:[r.morning,r.evening]).filter(v=>v!=null);
    if(!vals.length)return; let min=Math.min(...vals),max=Math.max(...vals); if(mode==='change'){min=Math.min(min,-1);max=Math.max(max,1);} const pad=Math.max((max-min)*.22,1);min-=pad;max+=pad;
    const L=48,R=12,T=18,B=34,W=760,H=300, X=i=>L+(dates.length===1?(W-L-R)/2:i*(W-L-R)/(dates.length-1)),Y=v=>T+(max-v)/(max-min)*(H-T-B);
    for(let i=0;i<4;i++){const v=min+(max-min)*i/3,y=Y(v);el('line',{x1:L,y1:y,x2:W-R,y2:y,class:'grid'});el('text',{x:L-8,y:y+4,'text-anchor':'end',class:'axis-label'},v.toFixed(1));}
    dates.forEach((d,i)=>el('text',{x:X(i),y:H-8,'text-anchor':'middle',class:'axis-label'},dateLabel(d)));
    const series=[]; for(const p of people) for(const k of (mode==='morning'?['morning']:mode==='evening'?['evening']:mode==='change'?['change']:['morning','evening'])){
      const src=dates.map(date=>{const r=records.find(x=>x.date===date&&x.person===p);return {date,value:k==='change'?(r&&r.morning!=null&&r.evening!=null?r.evening-r.morning:null):r?.[k]??null,actual:!!(r&&(k==='change'?r.morning!=null&&r.evening!=null:r[k]!=null))};});
      series.push({p,k,pts:interpolate(src)});
    }
    const legend=[]; series.forEach((s,si)=>{const color=colors[data.people.indexOf(s.p)], dash=s.pts.some(p=>p.interpolated); const valid=s.pts.map((p,i)=>p.value==null?null:`${X(i)},${Y(p.value)}`).filter(Boolean);if(valid.length>1)el('polyline',{points:valid.join(' '),fill:'none',stroke:color,'stroke-width':2.5,'stroke-dasharray':dash?'6 5':''}); s.pts.forEach((p,i)=>{if(p.value==null)return;el('circle',{cx:X(i),cy:Y(p.value),r:p.interpolated?5:4,fill:p.interpolated?'white':color,stroke:color,'stroke-width':2});}); legend.push(`<span><i style="--dot:${color}"></i>${s.p}${s.k==='morning'?' 早':s.k==='evening'?' 晚':s.k==='change'?' 早晚差':''}</span>`);});
    document.querySelector('#legend').innerHTML=legend.join(''); document.querySelector('#chartTitle').textContent=mode==='change'?'早晚体重变化':mode==='morning'?'早上体重趋势':mode==='evening'?'晚上体重趋势':'早晚体重趋势';
  }
  person.addEventListener('change',render);metric.addEventListener('change',render);render();
})();
