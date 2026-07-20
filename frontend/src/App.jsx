import React, { useEffect, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Jobs from './components/Jobs'
import Applications from './components/Applications'
import Login from './components/Login'
import Register from './components/Register'
import AddJob from './components/AddJob'
import Profile from './components/Profile'
import JobDetail from './components/JobDetail'
import CompanyDetail from './components/CompanyDetail'
import CompanyJobs from './components/CompanyJobs'
import CompanyApplications from './components/CompanyApplications'
import CompanyApplicationDetail from './components/CompanyApplicationDetail'
import Landing from './components/Landing'
import { onLoadingChange } from './api'

export default function App(){
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => onLoadingChange(setIsLoading), [])

  return (
    <div className="app">
      <Navbar />
      {isLoading && (
        <div className="loading-overlay">
          <div className="spinner" aria-label="Loading"></div>
        </div>
      )}
      <main>
        <Routes>
          <Route path="/" element={<Landing/>} />
          <Route path="/jobs" element={<Jobs/>} />
          <Route path="/login" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/applications" element={<Applications/>} />
          <Route path="/add-job" element={<AddJob/>} />
          <Route path="/jobs/:id" element={<JobDetail/>} />
          <Route path="/companies/:id" element={<CompanyDetail/>} />
          <Route path="/company/jobs" element={<CompanyJobs/>} />
          <Route path="/company/applications" element={<CompanyApplications/>} />
          <Route path="/company/application/:id" element={<CompanyApplicationDetail/>} />
          <Route path="/profile" element={<Profile/>} />
        </Routes>
      </main>
    </div>
  )
}
