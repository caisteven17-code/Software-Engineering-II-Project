import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const DEFAULT_PAGE_SIZE = 10
const ROWS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50, 60]
const MONTH_ABBR = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']

const formatDateTime = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  const dateLabel = `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
  const timeLabel = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
  return `${dateLabel} ${timeLabel}`
}

const formatPatientCode = (patientCode, patientId) => {
  const raw = `${patientCode || ''}`.trim()
  if (/^PT-\d{6}$/.test(raw)) return raw

  const digits = raw.replace(/\D/g, '')
  if (digits) return `PT-${digits.slice(-6).padStart(6, '0')}`

  const fallbackDigits = `${patientId || ''}`.replace(/\D/g, '').slice(-6)
  return `PT-${fallbackDigits.padStart(6, '0')}`
}

function PatientLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [pageInput, setPageInput] = useState('1')

  const loadLogs = async () => {
    setLoading(true)
    setError('')

    const { data, error: fetchError } = await supabase.rpc('list_patient_logs')
    if (fetchError) {
      setError(fetchError.message)
      setLogs([])
      setLoading(false)
      return
    }

    setLogs(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    const bootstrapTimer = setTimeout(() => {
      void loadLogs()
    }, 0)

    return () => clearTimeout(bootstrapTimer)
  }, [])

  const filteredLogs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    const hasDateFilter = Boolean(dateFilter)

    const attendanceRows = (logs ?? []).filter((row) => `${row.action ?? ''}`.trim().toLowerCase() === 'service_update')

    const rows = attendanceRows.filter((row) => {
      if (query && !`${row.patient_name}`.toLowerCase().includes(query)) return false
      if (!hasDateFilter) return true

      const rowDate = new Date(row.logged_at)
      if (Number.isNaN(rowDate.getTime())) return false
      const normalized = rowDate.toISOString().slice(0, 10)
      return normalized === dateFilter
    })

    return rows.sort((a, b) => {
      const aTime = new Date(a.logged_at).getTime()
      const bTime = new Date(b.logged_at).getTime()
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime
    })
  }, [logs, searchTerm, dateFilter, sortOrder])

  const handlePageJump = (totalPages) => {
    const parsedPage = Number.parseInt(pageInput, 10)
    if (!Number.isFinite(parsedPage)) {
      setPageInput(`${currentPage}`)
      return
    }

    const nextPage = Math.min(Math.max(parsedPage, 1), totalPages)
    setCurrentPage(nextPage)
    setPageInput(`${nextPage}`)
  }

  const getVisiblePageItems = (safePage, totalPages) => {
    if (totalPages <= 5) return Array.from({ length: totalPages }, (_, index) => index + 1)

    const startPage = Math.max(1, Math.min(safePage - 2, totalPages - 4))
    const endPage = startPage + 4
    const items = []

    if (startPage > 1) items.push('start-ellipsis')
    for (let page = startPage; page <= endPage; page += 1) items.push(page)
    if (endPage < totalPages) items.push('end-ellipsis')

    return items
  }

  return (
    <>
      <header className="page-header">
        <h1>Patient Logs</h1>
      </header>

      <section className="records fixed-table-page patient-logs-page">
        <div className="records-header stacked">
          <div>
            <h2>Patient Logs</h2>
            <div className="filters">
              <div className="search-box">
                <span className="search-icon" aria-hidden />
                <input
                  type="text"
                  placeholder="search by name"
                  value={searchTerm}
                  onChange={(event) => {
                    setSearchTerm(event.target.value)
                    setCurrentPage(1)
                    setPageInput('1')
                  }}
                />
              </div>
              <label className="inline-field">
                Select Date:
                <input
                  type="date"
                  value={dateFilter}
                  onChange={(event) => {
                    setDateFilter(event.target.value)
                    setCurrentPage(1)
                    setPageInput('1')
                  }}
                />
              </label>
              <label className="inline-field">
                Sort By:
                <select
                  value={sortOrder}
                  onChange={(event) => {
                    setSortOrder(event.target.value)
                    setCurrentPage(1)
                    setPageInput('1')
                  }}
                >
                  <option value="asc">Date ▲</option>
                  <option value="desc">Date ▼</option>
                </select>
              </label>
            </div>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {loading ? <p>Loading patient logs...</p> : null}

        {(() => {
          const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage))
          const safePage = Math.min(currentPage, totalPages)
          const pageStart = (safePage - 1) * rowsPerPage
          const pagedLogs = filteredLogs.slice(pageStart, pageStart + rowsPerPage)
          const pageItems = getVisiblePageItems(safePage, totalPages)
          const visibleStart = filteredLogs.length === 0 ? 0 : pageStart + 1
          const visibleEnd = filteredLogs.length === 0 ? 0 : Math.min(pageStart + rowsPerPage, filteredLogs.length)

          return (
            <>
        <div className="records-table logs-table">
          <div className="table-head">
            <span>Patient ID</span>
            <span>Patient Name</span>
            <span>Date &amp; time</span>
            <span>Assigned dentist</span>
          </div>
          <div className="table-body">
            {pagedLogs.map((row) => (
              <div key={row.id} className="table-row">
                <span>{formatPatientCode(row.patient_code, row.patient_id)}</span>
                <span>{row.patient_name}</span>
                <span>{formatDateTime(row.logged_at)}</span>
                <span>{row.actor_name}</span>
              </div>
            ))}
            {!loading && filteredLogs.length === 0 ? <p>No logs found.</p> : null}
          </div>
        </div>

        <div className="records-footer">
          <span>Showing {visibleStart}-{visibleEnd} of {filteredLogs.length} entries</span>
          <div className="pagination">
            <div className="pagination-group pagination-size-group">
              <label className="page-size-control">
                Rows
                <select
                  value={rowsPerPage}
                  onChange={(event) => {
                    const nextPageSize = Number(event.target.value)
                    setRowsPerPage(nextPageSize)
                    setCurrentPage(1)
                    setPageInput('1')
                  }}
                >
                  {ROWS_PER_PAGE_OPTIONS.map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </label>
            </div>
            <div className="pagination-group pagination-nav-group">
              <button type="button" disabled={safePage <= 1} onClick={() => { const nextPage = Math.max(1, safePage - 1); setCurrentPage(nextPage); setPageInput(`${nextPage}`) }}>Previous</button>
              {pageItems.map((item) => (
                typeof item === 'number'
                  ? (
                    <button key={item} type="button" className={item === safePage ? 'active' : ''} onClick={() => { setCurrentPage(item); setPageInput(`${item}`) }}>
                      {item}
                    </button>
                  )
                  : <span key={item} className="pagination-ellipsis">...</span>
              ))}
              <button type="button" disabled={safePage >= totalPages} onClick={() => { const nextPage = Math.min(totalPages, safePage + 1); setCurrentPage(nextPage); setPageInput(`${nextPage}`) }}>Next</button>
            </div>
            <div className="pagination-group pagination-jump-group">
              <form
                className="page-jump-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  handlePageJump(totalPages)
                }}
              >
                <label>
                  Page
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value)}
                  />
                </label>
                <button type="submit">Go</button>
              </form>
            </div>
          </div>
        </div>
            </>
          )
        })()}
      </section>
    </>
  )
}

export default PatientLogs
