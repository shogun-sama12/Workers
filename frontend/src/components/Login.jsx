import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function Login(){
  const [role, setRole] = useState('worker')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  async function submit(e){
    e.preventDefault()
    const creds = { email, password }
    const res = role === 'worker' ? await api.loginWorker(creds) : await api.loginCompany(creds)
    if (res && res.msg){
      navigate('/')
    } else {
      alert('Login failed')
    }
  }

  return (
    <div className="form-container">
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Role</label>
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="worker">Worker</option>
          <option value="company">Company</option>
        </select>
        <label>Email</label>
        <input value={email} onChange={e=>setEmail(e.target.value)} />
        <label>Password</label>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button type="submit">Login</button>
      </form>
    </div>
  )
}
