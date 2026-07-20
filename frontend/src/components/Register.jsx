import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Register(){
  const [role, setRole] = useState('worker')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [extra, setExtra] = useState('')
  const [experienceYears, setExperienceYears] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    if(role === 'worker'){
      const parsed = experienceYears !== '' ? Number(experienceYears) : undefined
      const experienceValue = Number.isFinite(parsed) ? parsed : undefined
      const payload = { name, work: extra, experience: experienceValue, email, password }
      const res = await api.registerWorker(payload)
      if (res && res.worker_id) navigate('/login')
      else alert('Registration failed')
    } else {
      const payload = { name, description: extra, website: "", email, password }
      const res = await api.registerCompany(payload)
      if (res && res.company_id) navigate('/login')
      else alert('Registration failed')
    }
  }

  return (
    <div className="form-container">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="worker">Worker</option>
          <option value="company">Company</option>
        </select>
        <label>Name</label>
        <input value={name} onChange={e=>setName(e.target.value)} />
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <label>{role === 'worker' ? 'Work' : 'Description'}</label>
        <input value={extra} onChange={e=>setExtra(e.target.value)} />
        {role === 'worker' && (
          <>
            <label>Experience in years</label>
            <input
              type="number"
              min="0"
              value={experienceYears}
              onChange={e => setExperienceYears(e.target.value)}
              placeholder="e.g. 3"
            />
          </>
        )}
        <button type="submit">Register</button>
      </form>
    </div>
  )
}
