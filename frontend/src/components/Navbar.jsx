import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api, onAuthChange } from '../api'

export default function Navbar(){
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()

  useEffect(()=>{
    const unsubscribe = onAuthChange(setProfile)
    api.getProfile().catch(()=>{})
    return unsubscribe
  },[])

  async function handleLogout(){
    await api.logout()
    navigate('/login')
  }
  const role = profile?.role ?? profile?.type ?? null

  return (
    <nav className="nav">
      <div className="brand"><Link to="/">Workers</Link></div>
      <div className="links">
        <Link to="/jobs">Jobs</Link>

        {!profile && (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}

        {profile && role === 'company' && (
          <>
            <Link to="/company/jobs">Job Openings</Link>
            <Link to="/company/applications">Applications</Link>
            <Link to="/add-job">Add Job</Link>
            <Link to="/profile" className="profile-link">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}

        {profile && role === 'worker' && (
          <>
            <Link to="/applications">My applications</Link>
            <Link to="/jobs">Apply to Job</Link>
            <Link to="/profile" className="profile-link">Profile</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  )
}
