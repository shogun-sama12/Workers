import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { Link } from 'react-router-dom'

const EXPERIENCE_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' }
]

const WORK_FORMAT_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
]

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' }
]

export default function CompanyJobs(){
  const [jobs, setJobs] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState({})
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [cityError, setCityError] = useState(null)

  useEffect(() => {
    loadCompanyJobs(1, size)
    api.getCities()
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data)
        } else {
          setCities([])
        }
      })
      .catch(err => {
        console.error(err)
        setCityError('Unable to load city list')
      })
      .finally(() => setLoadingCities(false))
  }, [])

  async function loadCompanyJobs(p = 1, s = 10){
    setLoading(true)
    try {
      const res = await api.getJobOpeningsOfCompany(p, s)
      if (Array.isArray(res)) {
        setJobs(res)
        setPage(1)
        setPages(1)
        setTotal(res.length)
        setSize(s)
      } else if (res && typeof res === 'object') {
        const data = Array.isArray(res.data) ? res.data : []
        setJobs(data)
        setPage(res.page || p)
        setPages(res.pages || 1)
        setTotal(res.total || 0)
        setSize(res.size || s)
      } else {
        setJobs([])
      }
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Unable to load company jobs')
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  function startEdit(job){
    setEditingId(job.job_id ?? job.id ?? job._id)
    setEditData({
      title: job.job_title ?? job.title ?? '',
      description: job.description ?? job.job_description ?? '',
      experience: job.experience ?? '',
      salary_low: job.salary_low ?? job.salaryLow ?? '',
      salary_high: job.salary_high ?? job.salaryHigh ?? '',
      employment: job.employment ?? '',
      work_format: job.work_format ?? job.workFormat ?? '',
      location_id: job.location?.id ?? job.location_id ?? job.city_id ?? job.location?.city_id ?? ''
    })
  }

  function cancelEdit(){
    setEditingId(null)
    setEditData({})
  }

  async function submitEdit(e){
    e.preventDefault()
    if (!editingId) return
    if (!editData.title?.trim() || !editData.description?.trim() || !editData.experience || !editData.work_format || !editData.employment || !editData.location_id || editData.salary_low === '' || editData.salary_high === '') {
      alert('Please fill in all fields before saving.')
      return
    }
    try {
      const payload = {
        job_id: editingId,
        title: editData.title.trim(),
        experience: editData.experience,
        salary_low: Number(editData.salary_low),
        salary_high: Number(editData.salary_high),
        employment: editData.employment,
        work_format: editData.work_format,
        location_id: Number(editData.location_id),
        description: editData.description.trim()
      }
      await api.updateJob(editingId, payload)
      alert('Job updated')
      cancelEdit()
      loadCompanyJobs(page, size)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Failed to update job')
    }
  }

  async function removeJob(id){
    if (!confirm('Delete this job opening?')) return
    try {
      await api.deleteJob(id)
      alert('Job deleted')
      loadCompanyJobs(page, size)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Failed to delete job')
    }
  }

  async function toggleStatus(job){
    const id = job.job_id ?? job.id ?? job._id
    const current = job.active ?? job.status ?? job.is_active ?? false
    try {
      await api.updateJob(id, { active: !current })
      loadCompanyJobs(page, size)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Failed to change status')
    }
  }

  const companyName = (jobs && jobs.length > 0)
    ? (jobs[0].company_name ?? jobs[0].company?.name ?? 'My Company')
    : 'My Company'

  return (
    <div className="list">
      <h2>{companyName} — Job Openings</h2>
      <p><Link to="/add-job">Add new job</Link></p>
      {loading ? <p>Loading...</p> : (
        jobs.length === 0 ? <p>No job openings</p> : (
          <ul>
            {jobs.map(j => {
              const id = j.job_id ?? j.id ?? j._id
              const title = j.job_title ?? j.title ?? 'Untitled'
              const active = j.job_status ?? j.active ?? j.status ?? j.is_active ?? false

              return (
                <li key={id ?? title} style={{ marginBottom: 12 }}>
                  <div>
                    <strong>{title}</strong> {active ? <span style={{ color: 'green' }}>● Active</span> : <span style={{ color: '#888' }}>● Inactive</span>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button onClick={() => startEdit(j)}>Edit</button>
                    <button onClick={() => removeJob(id)}>Delete</button>
                    <button onClick={() => toggleStatus(j)}>{active ? 'Deactivate' : 'Activate'}</button>
                    <Link to={`/jobs/${id}`}>View</Link>
                  </div>

                  {editingId && editingId === id && (
                    <form onSubmit={submitEdit} style={{ marginTop: 8 }}>
                      <label>Title</label>
                      <input value={editData.title || ''} onChange={e => setEditData({ ...editData, title: e.target.value })} required />

                      <label>Description</label>
                      <textarea value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} style={{ width: '100%', height: 120 }} required />

                      <label>Experience</label>
                      <select value={editData.experience || ''} onChange={e => setEditData({ ...editData, experience: e.target.value })} required>
                        <option value="">Not selected</option>
                        {EXPERIENCE_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <label>Salary low</label>
                      <input type="number" value={editData.salary_low || ''} onChange={e => setEditData({ ...editData, salary_low: e.target.value })} required />

                      <label>Salary high</label>
                      <input type="number" value={editData.salary_high || ''} onChange={e => setEditData({ ...editData, salary_high: e.target.value })} required />

                      <label>Employment</label>
                      <select value={editData.employment || ''} onChange={e => setEditData({ ...editData, employment: e.target.value })} required>
                        <option value="">Not selected</option>
                        {EMPLOYMENT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <label>Work format</label>
                      <select value={editData.work_format || ''} onChange={e => setEditData({ ...editData, work_format: e.target.value })} required>
                        <option value="">Not selected</option>
                        {WORK_FORMAT_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>

                      <label>Location</label>
                      {loadingCities ? (
                        <p>Loading cities...</p>
                      ) : cityError ? (
                        <p>{cityError}</p>
                      ) : (
                        <select value={editData.location_id || ''} onChange={e => setEditData({ ...editData, location_id: e.target.value })} required>
                          <option value="">Not selected</option>
                          {cities.map(city => {
                            const id = city.id ?? city.city_id
                            const name = city.name ?? city.city_name ?? ''
                            return (
                              <option key={id ?? name} value={id}>
                                {name}
                              </option>
                            )
                          })}
                        </select>
                      )}

                      <div style={{ marginTop: 8 }}>
                        <button type="submit">Save</button>
                        <button type="button" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </form>
                  )}
                </li>
              )
            })}
          </ul>
        )
      )}

      {pages > 1 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { if (page>1) loadCompanyJobs(page-1, size) }} disabled={page<=1}>Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { if (p !== page) loadCompanyJobs(p, size) }}
              disabled={p === page}
              style={{ fontWeight: p === page ? 'bold' : 'normal' }}
            >
              {p}
            </button>
          ))}
          <button onClick={() => { if (page<pages) loadCompanyJobs(page+1, size) }} disabled={page>=pages}>Next</button>
          <div style={{ marginLeft: 12 }}>
            Page {page} of {pages} — {total} jobs
          </div>
        </div>
      )}
    </div>
  )
}
