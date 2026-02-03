import { PATIENT_RECORDS } from '../data/mockData'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

function PatientRecords() {
  const navigate = useNavigate()
  const [records, setRecords] = useState(PATIENT_RECORDS)

  const activeCount = useMemo(() => records.filter((row) => row.active).length, [records])

  const toggleRecord = (id) => {
    setRecords((prev) =>
      prev.map((row) => (row.id === id ? { ...row, active: !row.active } : row)),
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Patient Records</h1>
      </header>

      <section className="records">
        <div className="records-header">
          <div>
            <h2>Records</h2>
            <div className="records-toolbar">
              <div className="search-box">
                <span className="search-icon" aria-hidden />
                <input type="text" placeholder="Search by Name" />
              </div>
            </div>
          </div>
          <div className="records-actions">
            <button type="button" className="primary" onClick={() => navigate('/add-patient')}>
              Add New Patient
            </button>
            <div className="sorter">
              <label htmlFor="sort">Sort by:</label>
              <select id="sort">
                <option>Name</option>
                <option>Date Registered</option>
              </select>
            </div>
          </div>
        </div>

        <div className="records-table">
          <div className="table-head">
            <span>Patient ID</span>
            <span>Full Name</span>
            <span>Sex</span>
            <span>Age</span>
            <span>Date Registered</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="table-body">
            {records.map((row) => (
              <div key={row.id} className={`table-row ${row.active ? '' : 'inactive-row'}`}>
                <span>{row.id}</span>
                <span>{row.name}</span>
                <span>{row.sex}</span>
                <span>{row.age}</span>
                <span>{row.date}</span>
                <span>
                  <button
                    type="button"
                    className={`status ${row.active ? 'on' : 'off'}`}
                    aria-label={`Set ${row.name} as ${row.active ? 'inactive' : 'active'}`}
                    onClick={() => toggleRecord(row.id)}
                  />
                </span>
                <span>
                  <button
                    type="button"
                    className="view"
                    onClick={() => navigate(`/records/${row.id}`)}
                  >
                    View
                  </button>
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="records-footer">
          <span>
            Showing {records.length} entries ({activeCount} active / {records.length - activeCount} inactive)
          </span>
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
      </section>
    </>
  )
}

export default PatientRecords
