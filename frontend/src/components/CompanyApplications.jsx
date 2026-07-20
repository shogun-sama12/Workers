import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'

export default function CompanyApplications(){
  const [applications, setApplications] = useState([])
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadApplications(1, size)
  }, [])

  async function loadApplications(p = 1, s = 10){
    setLoading(true)
    try {
      const res = await api.getCompanyApplications(p, s)
      const rows = Array.isArray(res)
        ? res
        : (res?.data || res?.applications || [])

      const list = Array.isArray(rows) ? rows : []
      const firstRow = list[0] || null
      const currentPage = firstRow?.page ?? res?.page ?? p
      const currentSize = firstRow?.size ?? res?.size ?? s
      const currentTotal = firstRow?.total ?? res?.total ?? list.length
      const totalPages = Math.max(1, Math.ceil(currentTotal / Math.max(currentSize, 1)))

      setApplications(list)
      setPage(currentPage)
      setSize(currentSize)
      setTotal(currentTotal)
      setPages(totalPages)
    } catch (err) {
      console.error(err)
      alert(err?.data?.msg || 'Unable to load applications')
      setApplications([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="list">
      <h2>Company Applications</h2>
      {loading ? <p>Loading...</p> : (
        applications.length === 0 ? <p>No applications found</p> : (
          <>
            <ul>
              {applications.map(app => {
                const id = app.application_id ?? app.id ?? app._id
                return (
                  <li key={id ?? `${app.application_title}-${app.applicant}`} style={{ marginBottom: 12 }}>
                    <div><strong>{app.application_title ?? 'Untitled application'}</strong></div>
                    <div>Applicant: {app.applicant ?? 'Unknown'}</div>
                    <div style={{ marginTop: 6 }}>
                      <button onClick={() => navigate(`/company/application/${id}`)}>View</button>
                    </div>
                  </li>
                )
              })}
            </ul>

            {pages > 1 && (
              <div style={{ marginTop: 12, display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={() => { if (page > 1) loadApplications(page - 1, size) }} disabled={page <= 1}>Prev</button>
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => { if (p !== page) loadApplications(p, size) }} disabled={p === page} style={{ fontWeight: p === page ? 'bold' : 'normal' }}>
                    {p}
                  </button>
                ))}
                <button onClick={() => { if (page < pages) loadApplications(page + 1, size) }} disabled={page >= pages}>Next</button>
                <div style={{ marginLeft: 12 }}>Page {page} of {pages} — {total} applications</div>
              </div>
            )}
          </>
        )
      )}
    </div>
  )
}
