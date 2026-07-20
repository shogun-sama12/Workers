import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

export default function CompanyApplicationDetail(){
  const { id } = useParams()
  const navigate = useNavigate()
  const [application, setApplication] = useState(null)
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    if (!id) return
    loadApplication(id)
  }, [id])

  async function loadApplication(applicationId){
    setLoading(true)
    try {
      const res = await api.getCompanyApplication(applicationId)
      const data = Array.isArray(res) ? res[0] : res
      setApplication(data || null)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Unable to load application details')
    } finally {
      setLoading(false)
    }
  }

  async function handleDecision(decision){
    if (!id) return
    if (!['hire', 'reject'].includes(decision)) {
      alert('Invalid decision')
      return
    }
    if (!window.confirm(`Are you sure you want to ${decision} this application?`)) return
    const parsedApplicationId = Number.parseInt(id, 10)
    if (!Number.isInteger(parsedApplicationId) || parsedApplicationId <= 0) {
      alert('Invalid application ID')
      return
    }
    setProcessing(true)
    try {
      await api.processCompanyApplication(parsedApplicationId, decision)
      alert(`Application ${decision}d`)
      navigate('/company/applications')
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || `Failed to ${decision} application`)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="list">
      <h2>Application Details</h2>
      {loading ? <p>Loading...</p> : !application ? <p>No application found</p> : (
        <div>
          <p><strong>Title:</strong> {application.application_title ?? 'Untitled'}</p>
          <p><strong>Applicant:</strong> {application.applicant ?? 'Unknown'}</p>
          <p><strong>Applicant ID:</strong> {application.applicant_id ?? 'N/A'}</p>

          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button onClick={() => handleDecision('hire')} disabled={processing}>Hire</button>
            <button onClick={() => handleDecision('reject')} disabled={processing}>Reject</button>
            <button onClick={() => navigate('/company/applications')}>Back</button>
          </div>
        </div>
      )}
    </div>
  )
}
