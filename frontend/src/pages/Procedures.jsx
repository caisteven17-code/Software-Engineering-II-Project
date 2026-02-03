import { useState } from 'react'
import { LEGENDS, SERVICES } from '../data/mockData'

function Procedures() {
  const [tab, setTab] = useState('services')
  const [services, setServices] = useState(SERVICES)
  const [legends, setLegends] = useState(LEGENDS)
  const [addServiceName, setAddServiceName] = useState('')
  const [addConditionName, setAddConditionName] = useState('')
  const [addLegendCode, setAddLegendCode] = useState('')
  const [modal, setModal] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)
  const [editServiceName, setEditServiceName] = useState('')
  const [editCondition, setEditCondition] = useState('')
  const [editLegendCode, setEditLegendCode] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const closeModal = () => {
    setModal(null)
    setSelectedItem(null)
  }

  const openEdit = (item) => {
    setSelectedItem(item)
    if (tab === 'services') {
      setEditServiceName(item)
      setModal('edit-service')
      return
    }
    setEditCondition(item.label)
    setEditLegendCode(item.code)
    setModal('edit-legend')
  }

  const openArchive = (item) => {
    setSelectedItem(item)
    setModal('archive')
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setModal('success')
  }

  const addService = () => {
    if (!addServiceName.trim()) return
    setServices((prev) => [...prev, addServiceName.trim()])
    setAddServiceName('')
    showSuccess('Added successfully')
  }

  const handleAddCondition = () => {
    if (!addConditionName.trim() || !addLegendCode.trim()) return
    setLegends((prev) => [...prev, { code: addLegendCode.trim(), label: addConditionName.trim() }])
    setAddConditionName('')
    setAddLegendCode('')
    showSuccess('Added successfully')
  }

  const updateSelected = () => {
    if (tab === 'services') {
      const old = selectedItem
      const next = editServiceName.trim()
      if (!next) return
      setServices((prev) => prev.map((row) => (row === old ? next : row)))
      closeModal()
      showSuccess('Updated successfully')
      return
    }

    const oldCode = selectedItem.code
    setLegends((prev) =>
      prev.map((row) =>
        row.code === oldCode
          ? { ...row, code: editLegendCode.trim() || row.code, label: editCondition.trim() || row.label }
          : row,
      ),
    )
    closeModal()
    showSuccess('Updated successfully')
  }

  const confirmArchive = () => {
    if (tab === 'services') {
      setServices((prev) => prev.filter((row) => row !== selectedItem))
      closeModal()
      showSuccess('Archived successfully')
      return
    }
    setLegends((prev) => prev.filter((row) => row.code !== selectedItem.code))
    closeModal()
    showSuccess('Archived successfully')
  }

  return (
    <>
      <header className="page-header">
        <h1>Procedures</h1>
      </header>

      <section className="panel tabs-panel procedures-panel">
        <div className="panel-tabs large add-patient-tabs compact-tabs">
          <button type="button" className={`tab ${tab === 'services' ? 'active' : ''}`} onClick={() => setTab('services')}>
            Services
          </button>
          <button type="button" className={`tab ${tab === 'legend' ? 'active' : ''}`} onClick={() => setTab('legend')}>
            Dental Chart Legend
          </button>
        </div>

        <div className="grid-two procedures-grid">
          <div className="panel-card procedures-list-card">
            <h2>{tab === 'services' ? 'List of Services' : 'Dental Chart Legends'}</h2>
            <div className="simple-table">
              <div className="simple-head">
                <span>{tab === 'services' ? 'Service name' : 'Legend'}</span>
                <span>{tab === 'services' ? 'Actions' : 'Tooth Condition'}</span>
                <span />
              </div>
              <div className="simple-body">
                {(tab === 'services' ? services : legends).map((item) => (
                  <div key={tab === 'services' ? item : item.code} className="simple-row">
                    <span>{tab === 'services' ? item : item.code}</span>
                    <span>{tab === 'services' ? '' : item.label}</span>
                    <span className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEdit(item)}>&#9998;</button>
                      <button type="button" className="icon-btn danger" onClick={() => openArchive(item)}>&#8681;</button>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="records-footer">
              <span />
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

          <div className="panel-card procedures-form-card">
            <h2>{tab === 'services' ? 'Add Service' : 'Add a Condition'}</h2>
            <div className="stack">
              <label>
                {tab === 'services' ? 'Service Name' : 'Tooth condition'}
                <input
                  type="text"
                  value={tab === 'services' ? addServiceName : addConditionName}
                  onChange={(event) =>
                    tab === 'services'
                      ? setAddServiceName(event.target.value)
                      : setAddConditionName(event.target.value)
                  }
                />
              </label>
              {tab === 'legend' ? (
                <label>
                  Legend
                  <input type="text" value={addLegendCode} onChange={(event) => setAddLegendCode(event.target.value)} />
                </label>
              ) : null}
              <button type="button" className="primary wide" onClick={() => (tab === 'services' ? addService() : handleAddCondition())}>
                Add
              </button>
            </div>
          </div>
        </div>
      </section>

      {modal ? <div className="modal-backdrop" onClick={closeModal} /> : null}

      {modal === 'edit-service' ? (
        <div className="pr-modal procedures-modal">
          <div className="pr-modal-head"><h2>Update</h2><button type="button" onClick={closeModal}>X</button></div>
          <div className="pr-modal-body">
            <div className="stack">
              <label>Service Name<input type="text" value={editServiceName} onChange={(e) => setEditServiceName(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>Cancel</button>
              <button type="button" className="success-btn" onClick={updateSelected}>Update</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'edit-legend' ? (
        <div className="pr-modal procedures-modal">
          <div className="pr-modal-head"><h2>Update</h2><button type="button" onClick={closeModal}>X</button></div>
          <div className="pr-modal-body">
            <div className="stack">
              <label>Tooth Condition<input type="text" value={editCondition} onChange={(e) => setEditCondition(e.target.value)} /></label>
              <label>Legend<input type="text" value={editLegendCode} onChange={(e) => setEditLegendCode(e.target.value)} /></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>Cancel</button>
              <button type="button" className="success-btn" onClick={updateSelected}>Update</button>
            </div>
          </div>
        </div>
      ) : null}

      {modal === 'archive' ? (
        <div className="pr-modal procedures-modal archive-modal">
          <div className="pr-modal-head"><h2>Archive</h2></div>
          <div className="pr-modal-body">
            <p>
              {tab === 'services'
                ? 'Are you sure you want to archive this service?'
                : 'Are you sure you want to archive this tooth condition?'}
            </p>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>No</button>
              <button type="button" className="success-btn" onClick={confirmArchive}>Yes</button>
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

export default Procedures
