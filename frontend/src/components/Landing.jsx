import React from 'react'
import { Link } from 'react-router-dom'

export default function Landing(){
  return (
    <section className="form-container" style={{ maxWidth: 900, lineHeight: 1.6 }}>
      <h2>Find your next opportunity</h2>
      <p>
        Workers is a simple hiring platform where job seekers can discover openings, apply to jobs,
        and companies can publish vacancies and manage their hiring flow.
      </p>
      <p>
        Browse current openings, explore companies, and start your application journey in just a few clicks.
      </p>

      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
        <Link to="/jobs" className="nav-link">Browse job openings</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Create an account</Link>
      </div>

      <div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
        <h3>Why Workers?</h3>
        <ul>
          <li>Fast access to fresh job opportunities</li>
          <li>Simple company and job detail pages</li>
          <li>Built for both candidates and employers</li>
        </ul>
      </div>
    </section>
  )
}
