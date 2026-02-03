import { PATIENT_LOGS } from '../data/mockData'

function PatientLogs() {
  return (
    <>
      <header className="page-header">
        <h1>Audit Logs</h1>
      </header>

      <section className="records">
        <div className="records-header stacked">
          <div>
            <h2>Patient Logs</h2>
            <div className="filters">
              <div className="search-box">
                <span className="search-icon" aria-hidden />
                <input type="text" placeholder="search by name" />
              </div>
              <label className="inline-field">
                Select Date:
                <input type="text" placeholder="Apr. 04, 2024" />
              </label>
              <label className="inline-field">
                Sort By:
                <select>
                  <option>Date Ascending</option>
                  <option>Date Descending</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        <div className="records-table logs-table">
          <div className="table-head">
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Date &amp; time</span>
            <span>Assigned dentist</span>
          </div>
          <div className="table-body">
            {PATIENT_LOGS.map((row) => (
              <div key={row.id} className="table-row">
                <span>{row.id}</span>
                <span>{row.name}</span>
                <span>{row.datetime}</span>
                <span>{row.dentist}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="records-footer">
          <span>Showing 10 of 10 entries</span>
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

export default PatientLogs
