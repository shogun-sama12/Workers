import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Applications(){
  const [apps, setApps] = useState([])

  useEffect(()=>{
    api.getApplications().then(r=>{
      if(Array.isArray(r)) setApps(r)
      else setApps([])
    }).catch(()=>setApps([]))
  },[])

  return (
    <div className="list">
      <h2>My Applications</h2>
      {apps.length===0 ? <p>No applications</p> : (
        <ul>
          {apps.map((a, i)=> (
            <li key={i}><strong>{a.title}</strong> — {a.company} — {a.status}</li>
          ))}
        </ul>
      )}
    </div>
  )
}
