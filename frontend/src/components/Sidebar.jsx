import { useState } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { NAV_ITEMS } from '../data/mockData'
import navbarLogo from '../assets/navbar_logo.png'
import homeIcon from '../assets/icon/Home.png'
import patientRecordsIcon from '../assets/icon/Patient Records.png'
import addPatientIcon from '../assets/icon/Add patient.png'
import procedureIcon from '../assets/icon/Procedure.png'
import patientLogsIcon from '../assets/icon/Patient logs.png'
import adminIcon from '../assets/icon/Admin.png'
import logoutIcon from '../assets/icon/Logout.png'

const NAV_ICONS = {
  home: homeIcon,
  records: patientRecordsIcon,
  'add-patient': addPatientIcon,
  procedure: procedureIcon,
  logs: patientLogsIcon,
  admin: adminIcon,
}
const NAVIGATION_PASSWORD = 'admin123'

function Sidebar({ onLogout }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [pendingPath, setPendingPath] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const handleNavClick = (event, destinationPath) => {
    const isOnAddPatientPage = location.pathname === '/add-patient'
    const isLeavingAddPatient = isOnAddPatientPage && destinationPath !== '/add-patient'

    if (!isLeavingAddPatient) return

    event.preventDefault()
    setPendingPath(destinationPath)
    setPasswordInput('')
    setPasswordError('')
    setIsPasswordModalOpen(true)
  }

  const closePasswordModal = () => {
    setIsPasswordModalOpen(false)
    setPendingPath('')
    setPasswordInput('')
    setPasswordError('')
  }

  const submitPassword = (event) => {
    event.preventDefault()
    if (passwordInput !== NAVIGATION_PASSWORD) {
      setPasswordError('Incorrect password. Please try again.')
      return
    }

    const destination = pendingPath
    closePasswordModal()
    if (destination) {
      navigate(destination)
    }
  }

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <img className="sidebar-logo" src={navbarLogo} alt="Smiles Dental Hub logo" />
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.id} to={item.path} className="nav-item" onClick={(event) => handleNavClick(event, item.path)}>
              <img className="nav-icon image" src={NAV_ICONS[item.id]} alt="" aria-hidden="true" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button type="button" className="logout" onClick={onLogout}>
          <img className="nav-icon image" src={logoutIcon} alt="" aria-hidden="true" />
          Logout
        </button>
      </aside>

      {isPasswordModalOpen ? (
        <>
          <div className="modal-backdrop" onClick={closePasswordModal} />
          <div className="nav-password-modal">
            <div className="nav-password-modal-head" />
            <form className="nav-password-modal-body" onSubmit={submitPassword}>
              <label htmlFor="nav-password-input">Enter password:</label>
              <input
                id="nav-password-input"
                type="password"
                value={passwordInput}
                autoFocus
                onChange={(event) => {
                  setPasswordInput(event.target.value)
                  if (passwordError) setPasswordError('')
                }}
              />
              {passwordError ? <p className="nav-password-error">{passwordError}</p> : null}
              <div className="nav-password-actions">
                <button type="button" className="danger-btn" onClick={closePasswordModal}>Cancel</button>
                <button type="submit" className="success-btn">Enter</button>
              </div>
            </form>
          </div>
        </>
      ) : null}
    </>
  )
}

export default Sidebar
