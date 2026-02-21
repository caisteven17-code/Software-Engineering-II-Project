import { useMemo, useState } from 'react'
import { ARCHIVE_PATIENTS, INACTIVE_PATIENTS, USERS } from '../data/mockData'

const ARCHIVE_USERS = [
  { id: 11, name: 'Hanna Cruz', sex: 'F', age: 29, date: 'Mar 2, 2021' },
  { id: 12, name: 'Kenneth Dela Cruz', sex: 'M', age: 35, date: 'Sep 10, 2022' },
]
const ARCHIVE_SERVICES = [
  { id: 1, service: 'Pasta', date: 'Apr 25, 2017' },
  { id: 2, service: 'Braces', date: 'Jul 25, 2023' },
  { id: 3, service: 'Root Canal', date: 'Jan 3, 2024' },
]
const ARCHIVE_DENTAL_CONDITIONS = [
  { id: 1, legend: 'ABR', condition: 'Abrasions', date: 'Apr 7, 2019' },
  { id: 2, legend: 'X', condition: 'Missing', date: 'Nov 11, 2023' },
  { id: 3, legend: 'I', condition: 'Impacted', date: 'Oct 10, 2025' },
]

function Admin() {
  const [tab, setTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [users, setUsers] = useState(USERS)
  const [inactivePatients, setInactivePatients] = useState(INACTIVE_PATIENTS)
  const [archivePatients, setArchivePatients] = useState(ARCHIVE_PATIENTS)
  const [archiveUsers, setArchiveUsers] = useState(ARCHIVE_USERS)
  const [archiveServices, setArchiveServices] = useState(ARCHIVE_SERVICES)
  const [archiveDentalConditions, setArchiveDentalConditions] = useState(ARCHIVE_DENTAL_CONDITIONS)
  const [archiveType, setArchiveType] = useState('patients')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    username: '',
    password: '',
    role: 'Receptionist',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
  })

  const closeModal = () => {
    setModal(null)
    setSelected(null)
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setModal('success')
  }

  const openConfirmArchive = (payload) => {
    setSelected(payload)
    setModal('confirm-archive')
  }

  const openConfirmRetrieve = (payload) => {
    setSelected(payload)
    setModal('confirm-retrieve')
  }

  const openEditUser = (user) => {
    setUserForm(user)
    setSelected(user)
    setModal('edit-user')
  }

  const saveUserEdit = () => {
    setUsers((prev) => prev.map((item) => (item.id === selected.id ? { ...item, ...userForm } : item)))
    closeModal()
    showSuccess('Updated successfully')
  }

  const addUser = () => {
    if (!userForm.name.trim() || !userForm.username.trim() || !userForm.password.trim()) return
    setUsers((prev) => [
      ...prev,
      {
        ...userForm,
        id: prev.length + 1,
      },
    ])
    setShowAddUser(false)
    setUserForm({
      id: '',
      name: '',
      username: '',
      password: '',
      role: 'Receptionist',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    })
    showSuccess('Added successfully')
  }

  const confirmArchive = () => {
    if (!selected) return

    if (selected.kind === 'user') {
      setUsers((prev) => prev.filter((row) => row.id !== selected.id))
      setArchiveUsers((prev) => [...prev, { id: selected.id, name: selected.name, sex: '-', age: '-', date: 'Feb 2, 2026' }])
      closeModal()
      showSuccess('Archived successfully')
      return
    }

    setInactivePatients((prev) => prev.filter((row) => row.id !== selected.id))
    setArchivePatients((prev) => [...prev, selected])
    closeModal()
    showSuccess('Archived successfully')
  }

  const confirmRetrieve = () => {
    if (!selected) return

    if (archiveType === 'patients') {
      setArchivePatients((prev) => prev.filter((row) => row.id !== selected.id))
      showSuccess('Retrieved successfully')
      closeModal()
      return
    }
    if (archiveType === 'users') {
      setArchiveUsers((prev) => prev.filter((row) => row.id !== selected.id))
      showSuccess('Retrieved successfully')
      closeModal()
      return
    }
    if (archiveType === 'services') {
      setArchiveServices((prev) => prev.filter((row) => row.id !== selected.id))
      showSuccess('Retrieved successfully')
      closeModal()
      return
    }

    setArchiveDentalConditions((prev) => prev.filter((row) => row.id !== selected.id))
    showSuccess('Retrieved successfully')
    closeModal()
  }

  const archiveRows = useMemo(() => {
    if (archiveType === 'patients') return archivePatients
    if (archiveType === 'users') return archiveUsers
    if (archiveType === 'services') return archiveServices
    return archiveDentalConditions
  }, [archiveType, archivePatients, archiveUsers, archiveServices, archiveDentalConditions])

  return (
    <>
      <header className="page-header">
        <h1>Admin</h1>
      </header>

      <section className="panel tabs-panel admin-panel v2">
        <div className="panel-tabs large add-patient-tabs compact-tabs admin-tabs">
          <button type="button" className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setShowAddUser(false) }}>
            Manage Users
          </button>
          <button type="button" className={`tab ${tab === 'inactive' ? 'active' : ''}`} onClick={() => { setTab('inactive'); setShowAddUser(false) }}>
            Inactive List
          </button>
          <button type="button" className={`tab ${tab === 'archive' ? 'active' : ''}`} onClick={() => { setTab('archive'); setShowAddUser(false) }}>
            Archive List
          </button>
        </div>

        {tab === 'users' && !showAddUser ? (
          <div className="records">
            <div className="records-header">
              <div>
                <h2>Users</h2>
                <div className="records-toolbar">
                  <div className="search-box">
                    <span className="search-icon" aria-hidden />
                    <input type="text" placeholder="Search by name" />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <button type="button" className="primary" onClick={() => setShowAddUser(true)}>Add User</button>
                <div className="sorter inline">
                  <span>Date:</span>
                  <label><input type="radio" name="sort-users" />Newest</label>
                  <label><input type="radio" name="sort-users" defaultChecked />Oldest</label>
                </div>
              </div>
            </div>

            <div className="records-table users-table">
              <div className="table-head">
                <span>Staff ID</span>
                <span>Name</span>
                <span>Username</span>
                <span>Password</span>
                <span>Role</span>
                <span>Date Created</span>
                <span />
              </div>
              <div className="table-body">
                {users.map((row) => (
                  <div key={row.id} className="table-row">
                    <span>{row.id}</span>
                    <span>{row.name}</span>
                    <span>{row.username}</span>
                    <span>{row.password}</span>
                    <span>{row.role}</span>
                    <span>{row.date}</span>
                    <span className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEditUser(row)}>&#9998;</button>
                      <button type="button" className="icon-btn danger" onClick={() => openConfirmArchive({ ...row, kind: 'user' })}>&#8681;</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="records-footer">
              <span>Showing {users.length} of {users.length} entries</span>
              <div className="pagination">
                <button type="button">Previous</button>
                <button type="button" className="active">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <button type="button">Next</button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'users' && showAddUser ? (
          <div className="records add-user-card">
            <div className="records-header">
              <button type="button" className="ghost" onClick={() => setShowAddUser(false)}>&larr; Back</button>
            </div>
            <h2>Add User</h2>
            <div className="history-top-grid">
              <label>Lastname*<input type="text" value={userForm.name.split(' ')[0] || ''} onChange={(e) => setUserForm((p) => ({ ...p, name: `${e.target.value} ${p.name.split(' ').slice(1).join(' ')}`.trim() }))} /></label>
              <label>Firstname*<input type="text" value={userForm.name.split(' ').slice(1).join(' ')} onChange={(e) => setUserForm((p) => ({ ...p, name: `${p.name.split(' ')[0] || ''} ${e.target.value}`.trim() }))} /></label>
              <label>Middle name<input type="text" /></label>
              <label>Suffix<select><option> </option><option>Jr.</option><option>Sr.</option></select></label>
              <label>Username*<input type="text" value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} /></label>
              <label>Password*<input type="text" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} /></label>
              <label>Role*<select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}><option>Admin</option><option>Associate Dentist</option><option>Receptionist</option></select></label>
            </div>
            <div className="panel-footer">
              <button type="button" className="primary wide" onClick={addUser}>Add</button>
            </div>
          </div>
        ) : null}

        {tab === 'inactive' ? (
          <div className="records">
            <div className="records-header">
              <div>
                <h2>Inactive List</h2>
                <div className="records-toolbar">
                  <div className="search-box">
                    <span className="search-icon" aria-hidden />
                    <input type="text" placeholder="Search by name" />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <div className="sorter">
                  <label htmlFor="sort-inactive">Sort by:</label>
                  <select id="sort-inactive"><option>Name</option><option>Date</option></select>
                </div>
              </div>
            </div>

            <div className="records-table inactive-table">
              <div className="table-head">
                <span>Patient ID</span>
                <span>Full Name</span>
                <span>Sex</span>
                <span>Age</span>
                <span>Inactive Date</span>
                <span>Action</span>
              </div>
              <div className="table-body">
                {inactivePatients.map((row) => (
                  <div key={row.id} className="table-row">
                    <span>{row.id}</span>
                    <span>{row.name}</span>
                    <span>{row.sex}</span>
                    <span>{row.age}</span>
                    <span>{row.date}</span>
                    <span><button type="button" className="icon-btn danger" onClick={() => openConfirmArchive({ ...row, kind: 'patient' })}>&#8681;</button></span>
                  </div>
                ))}
              </div>
            </div>

            <div className="records-footer">
              <span>Showing {inactivePatients.length} of {inactivePatients.length} entries</span>
              <div className="pagination">
                <button type="button">Previous</button>
                <button type="button" className="active">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <button type="button">Next</button>
              </div>
            </div>
          </div>
        ) : null}

        {tab === 'archive' ? (
          <div className="records archive-records">
            <div className="records-header">
              <div>
                <h2>Archive List</h2>
                <div className="records-toolbar">
                  <div className="search-box">
                    <span className="search-icon" aria-hidden />
                    <input
                      type="text"
                      placeholder={
                        archiveType === 'services'
                          ? 'Search by services'
                          : archiveType === 'dentalCondition'
                            ? 'Search by Tooth Condition'
                            : 'Search by name'
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <div className="sorter">
                  <select value={archiveType} onChange={(e) => setArchiveType(e.target.value)}>
                    <option value="patients">Patients</option>
                    <option value="users">Users</option>
                    <option value="services">Services</option>
                    <option value="dentalCondition">Dental Condition</option>
                  </select>
                </div>
                <div className="sorter">
                  <label htmlFor="sort-archive">Sort by:</label>
                  <select id="sort-archive"><option>Name</option><option>Date</option></select>
                </div>
              </div>
            </div>

            <div
              className={`records-table archive-table ${
                archiveType === 'services' ? 'archive-table-services' : ''
              } ${archiveType === 'dentalCondition' ? 'archive-table-dental' : ''}`}
            >
              <div className="table-head">
                {archiveType === 'services' ? (
                  <>
                    <span>Service</span>
                    <span>Archived date</span>
                    <span>Action</span>
                  </>
                ) : null}
                {archiveType === 'dentalCondition' ? (
                  <>
                    <span>Legend</span>
                    <span>Tooth Condition</span>
                    <span>Archived date</span>
                    <span>Action</span>
                  </>
                ) : null}
                {(archiveType === 'patients' || archiveType === 'users') ? (
                  <>
                    <span>{archiveType === 'patients' ? 'Patient ID' : 'Staff ID'}</span>
                    <span>Full Name</span>
                    <span>Sex</span>
                    <span>Age</span>
                    <span>Archive Date</span>
                    <span>Action</span>
                  </>
                ) : null}
              </div>
              <div className="table-body">
                {archiveRows.map((row) => (
                  <div key={row.id} className="table-row">
                    {archiveType === 'services' ? (
                      <>
                        <span>{row.service}</span>
                        <span>{row.date}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                    {archiveType === 'dentalCondition' ? (
                      <>
                        <span>{row.legend}</span>
                        <span>{row.condition}</span>
                        <span>{row.date}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                    {(archiveType === 'patients' || archiveType === 'users') ? (
                      <>
                        <span>{row.id}</span>
                        <span>{row.name}</span>
                        <span>{row.sex}</span>
                        <span>{row.age}</span>
                        <span>{row.date}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="records-footer">
              <span>Showing {archiveRows.length} of {archiveRows.length} entries</span>
              <div className="pagination">
                <button type="button">Previous</button>
                <button type="button" className="active">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <button type="button">Next</button>
              </div>
            </div>
          </div>
        ) : null}
      </section>

      {modal ? <div className="modal-backdrop" onClick={closeModal} /> : null}

      {modal === 'edit-user' ? (
        <div className="pr-modal procedures-modal">
          <div className="pr-modal-head"><h2>Update User</h2><button type="button" onClick={closeModal}>X</button></div>
          <div className="pr-modal-body">
            <div className="history-top-grid">
              <label>Name<input type="text" value={userForm.name} onChange={(e) => setUserForm((p) => ({ ...p, name: e.target.value }))} /></label>
              <label>Username<input type="text" value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} /></label>
              <label>Password<input type="text" value={userForm.password} onChange={(e) => setUserForm((p) => ({ ...p, password: e.target.value }))} /></label>
              <label>Role<select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}><option>Admin</option><option>Associate Dentist</option><option>Receptionist</option></select></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>Cancel</button>
              <button type="button" className="success-btn" onClick={saveUserEdit}>Update</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'confirm-archive' ? (
        <div className="pr-modal procedures-modal archive-modal">
          <div className="pr-modal-head"><h2>Archive</h2></div>
          <div className="pr-modal-body">
            <p>
              {selected?.kind === 'user'
                ? 'Are you sure you want to archive this user?'
                : 'Are you sure you want to archive this patient?'}
            </p>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>No</button>
              <button type="button" className="success-btn" onClick={confirmArchive}>Yes</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'confirm-retrieve' ? (
        <div className="pr-modal procedures-modal archive-modal">
          <div className="pr-modal-head"><h2>Retrieve</h2></div>
          <div className="pr-modal-body">
            <p>
              {archiveType === 'patients'
                ? 'Are you sure you want to retrieve this patient?'
                : archiveType === 'users'
                  ? 'Are you sure you want to retrieve this user?'
                  : archiveType === 'services'
                    ? 'Are you sure you want to retrieve this service?'
                    : 'Are you sure you want to retrieve this dental condition?'}
            </p>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>No</button>
              <button type="button" className="success-btn" onClick={confirmRetrieve}>Yes</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'success' ? (
        <div className="pr-modal procedures-modal success-modal">
          <div className="pr-modal-head"><h2>&nbsp;</h2></div>
          <div className="pr-modal-body">
            <p>{successMessage}</p>
            <div className="modal-actions center">
              <button type="button" className="success-btn" onClick={closeModal}>Done</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Admin
