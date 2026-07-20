import React, { useEffect, useState } from 'react'
import { api } from '../api'
import { useNavigate } from 'react-router-dom'

const EMPLOYMENT_OPTIONS = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'internship', label: 'Internship' }
]

const WORK_FORMAT_OPTIONS = [
  { value: 'office', label: 'Office' },
  { value: 'remote', label: 'Remote' },
  { value: 'hybrid', label: 'Hybrid' }
]

const EXPERIENCE_OPTIONS = [
  { value: 'junior', label: 'Junior' },
  { value: 'middle', label: 'Middle' },
  { value: 'senior', label: 'Senior' }
]

export default function AddJob(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [experience, setExperience] = useState('')
  const [salaryLow, setSalaryLow] = useState('')
  const [salaryHigh, setSalaryHigh] = useState('')
  const [employment, setEmployment] = useState('')
  const [workFormat, setWorkFormat] = useState('')
  const [locationId, setLocationId] = useState('')
  const [cities, setCities] = useState([])
  const [loadingCities, setLoadingCities] = useState(true)
  const [cityError, setCityError] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
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

  async function submit(e){
    e.preventDefault()
    if (!title.trim() || !description.trim() || !experience || !salaryLow || !salaryHigh || !employment || !workFormat || !locationId) {
      alert('Please fill in every field and select all categories.')
      return
    }
    try {
      await api.addJob({
        title,
        experience,
        description,
        salary_low: Number(salaryLow),
        salary_high: Number(salaryHigh),
        employment: employment,
        work_format: workFormat,
        location_id: Number(locationId)
      })
      alert('Job added')
      navigate('/company/jobs')
    } catch (err) {
      if (err?.status === 403) {
        alert('Only companies can post a job.')
      } else {
        console.error(err)
        alert(err?.data?.msg || 'Failed to add job')
      }
    }
  }

  return (
    <div className="form-container">
      <h2>Add Job</h2>
      <form onSubmit={submit}>
        <label>Title</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          maxLength={40}
          minLength={3}
          placeholder="Job title, 3-40 characters"
          required
        />

        <label>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the job responsibilities and requirements"
          style={{ width: '100%', height: '150px', resize: 'none' }}
          required
        />

        <label>Experience</label>
        <select value={experience} onChange={e => setExperience(e.target.value)} required>
          <option value="">Not selected</option>
          {EXPERIENCE_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label>Salary Low</label>
        <input
          type="number"
          value={salaryLow}
          onChange={e => setSalaryLow(e.target.value)}
          placeholder="Minimum salary in whole units"
          required
        />

        <label>Salary High</label>
        <input
          type="number"
          value={salaryHigh}
          onChange={e => setSalaryHigh(e.target.value)}
          placeholder="Maximum salary in whole units"
          required
        />

        <label>Employment</label>
        <select value={employment} onChange={e => setEmployment(e.target.value)} required>
          <option value="">Not selected</option>
          {EMPLOYMENT_OPTIONS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label>Work Format</label>
        <select value={workFormat} onChange={e => setWorkFormat(e.target.value)} required>
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
          <select value={locationId} onChange={e => setLocationId(e.target.value)} required>
            <option value="">Not selected</option>
            {cities.map(city => {
              const id = city.id ?? city.city_id
              const name = city.name ?? city.city_name
              return (
                <option key={id} value={id}>
                  {name}
                </option>
              )
            })}
          </select>
        )}

        <button type="submit" disabled={loadingCities || !locationId}>Add</button>
      </form>
    </div>
  )
}
