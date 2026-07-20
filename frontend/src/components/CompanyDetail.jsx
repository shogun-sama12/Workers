import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api'

export default function CompanyDetail(){
  const { id } = useParams()
  const [company, setCompany] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return

    api.getCompany(id)
      .then(data => setCompany(data))
      .catch(err => setError(err?.data?.msg || 'Unable to load company'))
  }, [id])

  if (error) {
    return (
      <div className="form-container">
        <h2>Company</h2>
        <p>{error}</p>
        <p><Link to="/jobs">Back to jobs</Link></p>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="form-container">
        <h2>Company</h2>
        <p>Loading company...</p>
      </div>
    )
  }

  const companyId = company.company_id ?? company.id ?? id
  const companyName = company.company_name ?? company.name ?? 'Company'
  const description = company.description ?? company.about ?? 'No company description provided yet.'
  const location = company.location ?? company.city ?? company.address ?? 'Not specified'
  const website = company.website ?? company.site ?? null
  const jobs = Array.isArray(company.jobs) ? company.jobs : []

  return (
    <div className="form-container">
      <h2>{companyName}</h2>
      <p><strong>Location:</strong> {location}</p>
      <p><strong>Description:</strong> {description}</p>
      {website && <p><strong>Website:</strong> <a href={website} target="_blank" rel="noreferrer">{website}</a></p>}
      <p><Link to="/jobs">Browse all jobs</Link></p>

      {jobs.length > 0 ? (
        <div>
          <h3>Open jobs</h3>
          <ul>
            {jobs.map(job => {
              const jobId = job.job_id ?? job.id ?? job._id
              const title = job.job_title ?? job.title ?? 'Open position'
              return (
                <li key={jobId ?? `${companyId}-${title}`}>
                  <Link to={`/jobs/${jobId}`}>{title}</Link>
                </li>
              )
            })}
          </ul>
        </div>
      ) : (
        <p>No open jobs are currently listed for this company.</p>
      )}
    </div>
  )
}
