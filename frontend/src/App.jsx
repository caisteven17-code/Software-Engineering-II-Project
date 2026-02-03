import { useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Home from './pages/Home'
import PatientRecords from './pages/PatientRecords'
import PatientRecordDetails from './pages/PatientRecordDetails'
import AddPatient from './pages/AddPatient'
import Procedures from './pages/Procedures'
import PatientLogs from './pages/PatientLogs'
import Admin from './pages/Admin'

function LoginRoute({ onLogin, form, error, showPassword, onChange, onTogglePassword }) {
  return (
    <Login
      form={form}
      error={error}
      showPassword={showPassword}
      onChange={onChange}
      onSubmit={onLogin}
      onTogglePassword={onTogglePassword}
    />
  )
}

function ProtectedLayout({ onLogout }) {
  return (
    <div className="dashboard">
      <Sidebar onLogout={onLogout} />
      <main className="dashboard-main">
        <Routes>
          <Route path="/home" element={<Home />} />
          <Route path="/records" element={<PatientRecords />} />
          <Route path="/records/:id" element={<PatientRecordDetails />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/procedure" element={<Procedures />} />
          <Route path="/logs" element={<PatientLogs />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="*" element={<Navigate to="/records" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AppRoutes() {
  const [isAuthed, setIsAuthed] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const location = useLocation()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (form.username === 'admin' && form.password === 'admin123') {
      setIsAuthed(true)
      setError('')
      navigate('/records', { replace: true })
      return
    }

    setError('Incorrect username or password')
  }

  const handleLogout = () => {
    setIsAuthed(false)
    setForm({ username: '', password: '' })
    setShowPassword(false)
    navigate('/login', { replace: true })
  }

  if (!isAuthed && location.pathname !== '/login') {
    return <Navigate to="/login" replace />
  }

  if (isAuthed && location.pathname === '/login') {
    return <Navigate to="/records" replace />
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <LoginRoute
            onLogin={handleSubmit}
            form={form}
            error={error}
            showPassword={showPassword}
            onChange={handleChange}
            onTogglePassword={() => setShowPassword((prev) => !prev)}
          />
        }
      />
      <Route path="/*" element={<ProtectedLayout onLogout={handleLogout} />} />
    </Routes>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
