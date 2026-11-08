(() => {
  const data = window.WEIGHT_DATA;
  const peopleHost = document.querySelector('#people');
  const metric = document.querySelector('#metric');
  const rows = document.querySelector('#rows');
  const colors = ['#438675', '#d58b61', '#7188b2'];
  const fmt = v => v == null ? '—' : `${Number(v).toFixed(1)}${v.interpolated ? ' *' : ''}`;
  const dateLabel = d => `${Number(d.slice(5,7))}.${Number(d.slice(8,10))}`;

  function interpolate(series) {
    const out = series.map(x => ({...x}));
    for (let i=0;i<out.length;i++) if (out[i].value == null) {
      let a=i-1,b=i+1;
      while(a>=0&&out[a].value==null)a--;
      while(b<out.length&&out[b].value==null)b++;
      if(a>=0&&b<out.length){out[i].value=out[a].value+(out[b].value-out[a].value)*(i-a)/(b-a);out[i].interpolated=true;}
    }
    return out;
  }

  function render() {
    const records = [...data.records].sort((a,b)=>a.date.localeCompare(b.date));
    peopleHost.innerHTML = data.people.map((p,i)=>{
      const own=records.filter(r=>r.person===p), latest=own.at(-1), color=colors[i%colors.length];
      const morning=latest?.morning??null, evening=latest?.evening??null;
      const delta=morning==null||evening==null?null:evening-morning;
      return `<article class="person-card" style="--accent:${color}">
        <header class="person-head"><div class="person-id"><span class="avatar">${p.slice(0,1)}</span><div><h3>${p}</h3><p>${latest?dateLabel(latest.date)+' 最近记录':'等待第一条记录'}</p></div></div><span class="unit">kg</span></header>
        <div class="weight-pair"><div><span>早上</span><strong>${fmt(morning)}</strong></div><div><span>晚上</span><strong>${fmt(evening)}</strong></div><div class="change ${delta>0?'up':delta<0?'down':'same'}"><span>早晚差</span><strong>${delta==null?'—':`${delta>0?'+':''}${delta.toFixed(1)}`}</strong></div></div>
        <div class="chart-heading"><span>${metric.options[metric.selectedIndex].text}趋势</span><span class="series-legend"><i class="morning-key"></i>${metric.value==='evening'?'晚上':metric.value==='change'?'早晚差':'早上'}${metric.value==='both'?'':''}</span>${metric.value==='both'?'<span class="series-legend"><i class="evening-key"></i>晚上</span>':''}</div>
        <div class="chart-wrap"><svg data-chart="${i}" role="img" aria-label="${p}体重趋势图" viewBox="0 0 360 154" preserveAspectRatio="none"></svg></div>
      </article>`;
    }).join('');
    rows.innerHTML = records.slice().reverse().map(r=>{const diff=r.morning==null||r.evening==null?null:r.evening-r.morning,i=data.people.indexOf(r.person);return `<tr><td>${dateLabel(r.date)}</td><td><span class="person-dot" style="--dot:${colors[i%colors.length]}"></span>${r.person}</td><td>${fmt(r.morning)}</td><td>${fmt(r.evening)}</td><td>${diff==null?'—':`<span class="delta ${diff>0?'up':diff<0?'down':'same'}">${diff>0?'+':''}${diff.toFixed(1)}</span>`}</td></tr>`}).join('');
    document.querySelector('#recordCount').textContent = `${records.length} 条记录`;
    data.people.forEach((p,i)=>draw(i,p,records.filter(r=>r.person===p)));
  }

  function draw(index,p,records) {
    const svg=document.querySelector(`[data-chart="${index}"]`),mode=metric.value;
    const NS='http://www.w3.org/2000/svg';
    const el=(tag,attrs={},txt='')=>{const n=document.createElementNS(NS,tag);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);n.textContent=txt;svg.append(n);return n;};
    const dates=[...new Set(records.map(r=>r.date))].sort();
    const keys=mode==='morning'?['morning']:mode==='evening'?['evening']:mode==='change'?['change']:['morning','evening'];
    const all=keys.flatMap(k=>records.map(r=>k==='change'?(r.morning!=null&&r.evening!=null?r.evening-r.morning:null):r[k]).filter(v=>v!=null));
    if(!dates.length||!all.length){el('text',{x:180,y:78,'text-anchor':'middle',class:'empty-label'},'记录后会显示趋势');return;}
    let min=Math.min(...all),max=Math.max(...all);if(mode==='change'){min=Math.min(min,-1);max=Math.max(max,1);}const pad=Math.max((max-min)*.3,1);min-=pad;max+=pad;
    const W=360,H=154,L=34,R=7,T=9,B=24,X=i=>L+(dates.length===1?(W-L-R)/2:i*(W-L-R)/(dates.length-1)),Y=v=>T+(max-v)/(max-min)*(H-T-B),color=colors[index%colors.length];
    for(let n=0;n<3;n++){const v=min+(max-min)*n/2,y=Y(v);el('line',{x1:L,y1:y,x2:W-R,y2:y,class:'grid'});el('text',{x:L-5,y:y+3,'text-anchor':'end',class:'axis-label'},v.toFixed(0));}
    dates.forEach((d,i)=>el('text',{x:X(i),y:H-5,'text-anchor':'middle',class:'axis-label'},dateLabel(d)));
    keys.forEach((k,ki)=>{
      const pts=interpolate(dates.map(date=>{const r=records.find(x=>x.date===date);return{value:k==='change'?(r&&r.morning!=null&&r.evening!=null?r.evening-r.morning:null):r?.[k]??null};}));
      const c=k==='evening'?'#c9a16f':color;
      let path='';pts.forEach((pt,i)=>{if(pt.value==null)return;path+=`${path?' L':'M'} ${X(i)} ${Y(pt.value)}`;});
      if(path)el('path',{d:path,fill:'none',stroke:c,'stroke-width':2.6,'stroke-linecap':'round','stroke-linejoin':'round','stroke-dasharray':pts.some(x=>x.interpolated)?'5 4':''});
      pts.forEach((pt,i)=>{if(pt.value==null)return;el('circle',{cx:X(i),cy:Y(pt.value),r:pt.interpolated?4:3.3,fill:pt.interpolated?'white':c,stroke:c,'stroke-width':1.8});});
    });
  }

  metric.addEventListener('change',render);
  render();
})();
