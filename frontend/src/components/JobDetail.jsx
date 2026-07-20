import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, onAuthChange } from '../api'

export default function JobDetail(){
  const { id } = useParams()
  const [job, setJob] = useState(null)
  const [error, setError] = useState(null)
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    const unsubscribe = onAuthChange(setProfile)
    api.getProfile().catch(() => {})

    if (!id) return
    api.getJob(id)
      .then(data => setJob(data))
      .catch(err => setError(err?.data?.msg || 'Unable to load job'))

    return unsubscribe
  }, [id])

  if (error) {
    return (
      <div className="form-container">
        <h2>Job Details</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="form-container">
        <h2>Job Details</h2>
        <p>Loading job...</p>
      </div>
    )
  }

  const title = job.job_title ?? job.title ?? 'Untitled position'
  const description = job.job_description ?? job.description ?? 'No description provided.'
  const experience = job.experience ?? 'Not specified'
  const workFormat = job.work_format ?? job.workFormat ?? 'Not specified'
  const employment = job.employment ?? 'Not specified'
  const location = typeof job.location === 'string'
    ? job.location
    : job.location?.city ?? job.location?.name ?? job.location?.address ?? job.city ?? 'Not specified'
  const currency = job.salary_currency ?? job.currency ?? ''
  const salaryLow = job.salary_low ?? job.salaryLow ?? ''
  const salaryHigh = job.salary_high ?? job.salaryHigh ?? ''
  const salaryRange = (salaryLow || salaryHigh)
    ? `${currency ? `${currency} ` : ''}${salaryLow || ''}${salaryLow && salaryHigh ? ' - ' : ''}${salaryHigh || ''}`.trim()
    : 'Not specified'
  const companyName = job.company_name ?? job.company?.name ?? job.company ?? 'Company'
  const companyId = job.company_id ?? job.company?.id ?? job.company?.company_id
  const role = profile?.role ?? profile?.type ?? null

  async function handleApply(){
    if (!id) {
      alert('Job ID is missing')
      return
    }

    try {
      const res = await api.applyToJob(id)
      if (res && res.message) alert(res.message)
      else alert('Applied successfully')
    } catch (err) {
      if (err?.status === 409) {
        alert('You have already applied to this job.')
      } else {
        console.error(err)
        alert(err?.data?.msg || 'Failed to apply to job')
      }
    }
  }

  return (
    <div className="form-container">
      <h2>{title}</h2>
      <p>
        <strong>Company:</strong>{' '}
        {companyId ? <Link to={`/companies/${companyId}`}>{companyName}</Link> : companyName}
      </p>
      <p><strong>Experience:</strong> {experience}</p>
      <p><strong>Work format:</strong> {workFormat}</p>
      <p><strong>Employment:</strong> {employment}</p>
      <p><strong>Salary:</strong> {salaryRange}</p>
      <p><strong>Description:</strong> {description}</p>
      <p><strong>Location:</strong> {location}</p>
      {role === 'worker' && (
        <button type="button" onClick={handleApply} style={{ marginTop: 12 }}>
          Apply
        </button>
      )}
      {companyId && <p><Link to={`/companies/${companyId}`}>Open company page</Link></p>}
    </div>
  )
}
