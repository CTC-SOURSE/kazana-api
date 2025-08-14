import { useEffect, useState } from 'react';
import { Kazana } from '../lib/kazana';
export default function Page(){
  const [health,setHealth]=useState<any>(); const [j,setJ]=useState<any>(); const [b,setB]=useState<any>(); const [p,setP]=useState<any>();
  useEffect(()=>{Kazana.health().then(setHealth).catch(setHealth)},[]);
  const create=async()=>setJ(await Kazana.createJourney({
    origin:{lat:-17.8249,lng:31.0530,name:'Harare'}, destination:{lat:-20.1596,lng:28.6040,name:'Bulawayo'},
    startTime:'2025-08-14T06:00:00.000Z', endTime:'2025-08-14T12:00:00.000Z',
    seats:12, price:25, allow_parcels:true, driver_name:'Tinashe', driver_phone:'+263771234567'}, 'en'));
  const book =async()=>setB(await Kazana.book({journey_id:j?.journey?.id,rider_name:'Chipo',seats:2},'sn'));
  const pack =async()=>setP(await Kazana.createPackage({journey_id:j?.journey?.id,sender_name:'Mai',recipient_name:'Baba',phone:'+263771234567',description:'Small parcel',weight_kg:2.5},'nd'));
  return (<main style={{padding:20,fontFamily:'ui-sans-serif'}}>
    <h1>Kazana ↔ API</h1>
    <pre>health: {JSON.stringify(health)}</pre>
    <button onClick={create} disabled={!health}>Create Journey</button>
    {j && <pre>{JSON.stringify(j,null,2)}</pre>}
    <button onClick={book} disabled={!j}>Book Seats</button>
    {b && <pre>{JSON.stringify(b,null,2)}</pre>}
    <button onClick={pack} disabled={!j}>Create Package</button>
    {p && <pre>{JSON.stringify(p,null,2)}</pre>}
  </main>);
}
