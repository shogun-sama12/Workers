import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'

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

export default function Jobs(){
  const [jobs, setJobs] = useState([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [size, setSize] = useState(10)
  const [experience, setExperience] = useState('')
  const [workFormat, setWorkFormat] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [location, setLocation] = useState('')
  const [salaryLow, setSalaryLow] = useState('')
  const [salaryHigh, setSalaryHigh] = useState('')
  const [cities, setCities] = useState([])
  const [cityError, setCityError] = useState(null)
  const [loadingCities, setLoadingCities] = useState(true)

  function resolveJobId(job){
    if (!job || typeof job !== 'object') return undefined
    const id = job.job_id ?? job.jobId ?? job.id ?? job._id
    if (id) return id
    if (job._id && typeof job._id === 'object' && job._id.$oid) return job._id.$oid
    if (job.job && typeof job.job === 'object') return resolveJobId(job.job)
    return undefined
  }

  useEffect(() => {
    loadJobs()
    loadCities()
  }, [])

  async function loadJobs(requestPage = 1, requestLimit = 10){
    try {
      const r = await api.getJobs(requestPage, requestLimit)
      if (Array.isArray(r)) {
        setJobs(r)
        setPage(1)
        setPages(1)
        setTotal(r.length)
        setSize(requestLimit)
      } else if (r && typeof r === 'object') {
        setJobs(Array.isArray(r.data) ? r.data : [])
        setPage(r.page || requestPage)
        setPages(r.pages || 1)
        setTotal(r.total || 0)
        setSize(r.size || requestLimit)
      } else {
        setJobs([])
      }
    } catch (err) {
      console.error(err)
      setJobs([])
    }
  }

  async function loadCities(){
    try {
      const data = await api.getCities()
      setCities(Array.isArray(data) ? data : [])
    } catch (err) {
      console.error(err)
      setCityError('Unable to load cities')
      setCities([])
    } finally {
      setLoadingCities(false)
    }
  }

  function resetFilters(){
    setExperience('')
    setLocation('')
    setSalaryLow('')
    setSalaryHigh('')
    setWorkFormat('')
    setEmploymentType('')
    setPage(1)
    loadJobs(1, size)
  }

  async function handleSearch(e){
    e.preventDefault()
    try {
      const low = salaryLow ? Number(salaryLow) : undefined
      const high = salaryHigh ? Number(salaryHigh) : undefined
      const filters = {
        experience: experience || undefined,
        work_format: workFormat || undefined,
        employment_type: employmentType || undefined,
        city_id: location ? Number(location) : undefined,
        salary_low: Number.isFinite(low) ? low : undefined,
        salary_high: Number.isFinite(high) ? high : undefined
      }

      const result = await api.searchJobs(filters)
      setJobs(Array.isArray(result) ? result : [])
      setPage(1)
      setPages(1)
      setTotal(Array.isArray(result) ? result.length : 0)
      setSize(10)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Search failed')
    }
  }

  async function apply(job_id){
    if (!job_id) {
      alert('Job ID is missing')
      return
    }

    try {
      const res = await api.applyToJob(job_id)
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
    <div className="list">
      <h2>Jobs</h2>
      <form onSubmit={handleSearch} style={{ marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
          <label>
            <div>Experience</div>
            <select value={experience} onChange={e => setExperience(e.target.value)}>
              <option value="">Any</option>
              {EXPERIENCE_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <div>Work format</div>
            <select value={workFormat} onChange={e => setWorkFormat(e.target.value)}>
              <option value="">Any</option>
              {WORK_FORMAT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <div>Employment type</div>
            <select value={employmentType} onChange={e => setEmploymentType(e.target.value)}>
              <option value="">Any</option>
              {EMPLOYMENT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label>
            <div>Location</div>
            {loadingCities ? (
              <p>Loading cities...</p>
            ) : cityError ? (
              <p>{cityError}</p>
            ) : (
              <select value={location} onChange={e => setLocation(e.target.value)}>
                <option value="">Any</option>
                {cities.map(city => {
                  const cityId = city.id ?? city.city_id
                  const cityName = city.name ?? city.city_name
                  return <option key={cityId ?? cityName} value={String(cityId)}>{cityName}</option>
                })}
              </select>
            )}
          </label>
          <label>
            <div>Salary min</div>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={salaryLow}
              onChange={e => setSalaryLow(e.target.value)}
            />
          </label>
          <label>
            <div>Salary max</div>
            <input
              type="number"
              min="0"
              placeholder="Any"
              value={salaryHigh}
              onChange={e => setSalaryHigh(e.target.value)}
            />
          </label>
        </div>
        <div style={{ marginTop: 10 }}>
          <button type="submit">Search</button>
          <button type="button" onClick={resetFilters}>Reset</button>
        </div>
      </form>
      {jobs.length===0 ? <p>No jobs</p> : (
        <ul>
          {jobs.map((j)=> {
            const job_id = resolveJobId(j)
            const title = j.job_title ?? j.title ?? 'Untitled position'
            const companyId = j.company_id ?? j.company?.id ?? j.company?.company_id
            const companyName = j.company_name ?? j.company?.name ?? j.company ?? 'Company'
            const currency = j.salary_currency ?? j.currency ?? j.curreny ?? ''
            const salaryLow = j.salary_low ?? j.salaryLow ?? ''
            const salaryHigh = j.salary_high ?? j.salaryHigh ?? ''
            const location = j.location?.city ?? j.location ?? ''
            const jobStatus = j.job_status ?? j.active ?? j.status ?? j.is_active
            const showJobStatus = jobStatus !== undefined

            return (
              <li key={job_id ?? title}>
                <div>
                  <strong><Link to={`/jobs/${job_id}`}>{title}</Link></strong>
                  {showJobStatus && (
                    <span style={{ marginLeft: 8, color: jobStatus ? 'green' : '#888' }}>
                      ● {jobStatus ? 'Open' : 'Closed'}
                    </span>
                  )}
                  {' '}— {companyId ? <Link to={`/companies/${companyId}`}>{companyName}</Link> : companyName}
                </div>
                <div>
                  {j.experience && <span>{j.experience}</span>}
                  {j.employment && <span> · {j.employment}</span>}
                  {j.work_format && <span> · {j.work_format}</span>}
                  {location && <span> · {location}</span>}
                </div>
                <div>
                  {(salaryLow || salaryHigh) && (
                    <span>
                      Salary: {salaryLow ? `${currency} ${salaryLow}` : '—'}
                      {salaryHigh ? ` – ${currency} ${salaryHigh}` : ''}
                    </span>
                  )}
                </div>
                <div>
                  <Link to={`/jobs/${job_id}`}>View</Link>
                  <button onClick={() => apply(job_id)}>Apply</button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {pages > 1 && (
        <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => { if (page>1) loadJobs(page-1, size) }} disabled={page<=1}>Prev</button>
          {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => { if (p !== page) loadJobs(p, size) }}
              disabled={p === page}
              style={{ fontWeight: p === page ? 'bold' : 'normal' }}
            >
              {p}
            </button>
          ))}
          <button onClick={() => { if (page<pages) loadJobs(page+1, size) }} disabled={page>=pages}>Next</button>
          <div style={{ marginLeft: 12 }}>
            Page {page} of {pages} — {total} jobs
          </div>
        </div>
      )}
    </div>
  )
}
