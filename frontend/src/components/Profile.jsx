import React, { useEffect, useState } from 'react'
import { api } from '../api'

export default function Profile(){
  const [profile, setProfile] = useState(null)
  const [error, setError] = useState(null)

  useEffect(()=>{
    let mounted = true
    api.getProfile()
      .then(data => {
        if (mounted) setProfile(data)
      })
      .catch(err => {
        if (mounted) setError(err?.data?.msg || 'Unable to load profile')
      })
    return () => { mounted = false }
  },[])

  if (error) {
    return (
      <div className="form-container">
        <h2>Profile</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="form-container">
        <h2>Profile</h2>
        <p>Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="form-container">
      <h2>Profile</h2>
      <p><strong>Name:</strong> {profile.name}</p>
      <p><strong>Email:</strong> {profile.email}</p>
      <p><strong>Role:</strong> {profile.role || profile.type || 'Unknown'}</p>
    </div>
  )
}
