function Home() {
  return (
    <>
      <div className="home-page">
        <section className="top-row">
          <div className="greeting-card">
            <p>Hello there,</p>
            <h1>Jowela Elaine</h1>
          </div>
          <div className="stat-card">
            <p>Patients This Week</p>
            <strong>180</strong>
          </div>
          <div className="stat-card">
            <p>Patients Today</p>
            <strong>15</strong>
          </div>
        </section>

        <section className="panel">
          <div className="panel-card wide">
            <h2>Patient Weekly Chart</h2>
            <p className="muted">October 2025</p>
            <div className="legend">
              <span className="legend-item male">Male</span>
              <span className="legend-item female">Female</span>
            </div>
            <div className="chart-placeholder">
              <div className="chart-grid" />
              <span className="chart-label-y">Number of Patients</span>
              <span className="chart-label-x">Date</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Home
