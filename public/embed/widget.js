(function(){
  const $ = id => document.getElementById(id);
  const log = x => ($('log').textContent = typeof x === 'string' ? x : JSON.stringify(x));
  const __urlLang = new URLSearchParams(location.search).get('lang');
  const lang = () => (__urlLang || ($('lang') && $('lang').value) || 'en');

  const API_BASE = location.origin;
  const jfetch = async (path, opts={}) => {
    const url = API_BASE + path + (path.includes('?') ? '&' : '?') + 'lang=' + lang();
    const r = await fetch(url, { headers:{'Content-Type':'application/json'}, ...opts });
    const data = await r.json().catch(()=>({}));
    if(!r.ok) throw data;
    return data;
  };

  async function search(){
    $('list').textContent='Loading…';
    try {
      const q = new URLSearchParams({
        o_lat: $('o_lat').value, o_lng: $('o_lng').value,
        d_lat: $('d_lat').value, d_lng: $('d_lng').value,
        start: $('start').value, end: $('end').value,
        parcel: String($('parcel').checked)
      });
      const r = await jfetch('/api/search?' + q.toString());
      render(r.journeys || []); log({ ok:true, count:r.count });
    } catch(e){ log(e); }
  }

  function render(arr){
    const list = $('list'); list.innerHTML = '';
    if(!arr.length){ list.textContent = 'No journeys found'; return; }
    for(const j of arr){
      const row = document.createElement('div'); row.className='row';
      row.innerHTML = `
        <div style="font-weight:600">${j.origin?.name||''} → ${j.destination?.name||''}</div>
        <div style="font-size:12px;color:#555">${j.startTime} → ${j.endTime} • seats left: ${j.seats-(j.reservedSeats||0)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">
          <input placeholder="Rider name" id="r_${j.id}">
          <input type="number" min="1" value="1" id="s_${j.id}" style="width:70px">
          <button class="primary" id="b_${j.id}">Book</button>

          <input placeholder="Sender" id="sn_${j.id}">
          <input placeholder="Recipient" id="rc_${j.id}">
          <input placeholder="+263…" id="ph_${j.id}">
          <input placeholder="Weight kg" id="wt_${j.id}" type="number" min="0" step="0.1" style="width:110px">
          <input placeholder="Description" id="ds_${j.id}">
          <button class="secondary" id="p_${j.id}">Send pkg</button>
        </div>`;
      list.append(row);

      $('b_'+j.id).onclick = async () => {
        try {
          const r = await jfetch('/api/bookings', {
            method:'POST',
            body: JSON.stringify({
              journey_id: j.id,
              rider_name: $('r_'+j.id).value || 'Guest',
              seats: Number($('s_'+j.id).value || 1)
            })
          });
          log(r);
        } catch(e){ log(e); }
      };

      $('p_'+j.id).onclick = async () => {
        try {
          const r = await jfetch('/api/packages', {
            method:'POST',
            body: JSON.stringify({
              journey_id: j.id,
              sender_name: $('sn_'+j.id).value || 'Sender',
              recipient_name: $('rc_'+j.id).value || 'Recipient',
              phone: $('ph_'+j.id).value || '',
              description: $('ds_'+j.id).value || '',
              weight_kg: parseFloat($('wt_'+j.id).value || '0')
            })
          });
          log(r);
        } catch(e){ log(e); }
      };
    }
  }

  async function stats(){ try{ log(await jfetch('/api/admin/stats')); }catch(e){ log(e); } }
  async function health(){ try{ log(await jfetch('/health')); }catch(e){ log(e); } }

  window.addEventListener('DOMContentLoaded', () => {
    $('searchBtn').onclick = search;
    $('statsBtn').onclick  = stats;
    health();
  });
})();
