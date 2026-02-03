import { NavLink } from 'react-router-dom'
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

function Sidebar({ onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <img className="sidebar-logo" src={navbarLogo} alt="Smiles Dental Hub logo" />
      </div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink key={item.id} to={item.path} className="nav-item">
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
  )
}

export default Sidebar
