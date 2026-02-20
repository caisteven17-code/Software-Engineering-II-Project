import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { LEGENDS, SERVICES } from '../data/mockData'
import dentalChart1 from '../assets/Dental Chart 1.png'
import dentalChart2 from '../assets/Dental Chart 2.png'

const HEALTH = [
  'Low Blood Pressure',
  'Severe Headaches',
  'High Blood Pressure',
  'Weight Loss',
  'Heart Disease',
  'Stroke',
  'Asthma',
  'Tuberculosis',
  'Diabetes',
  'Radiation Therapy',
  'Respiratory Problems',
  'Anemia/Blood Disease',
  'Hay Fever/Allergies',
  'Arthritis/Rheumatism',
  'Epilepsy/Convulsions',
  'Bleeding Problems',
  'Fainting/Seizures',
  'Heart Murmur',
  'Rheumatic Fever',
  'Kidney Disease',
  'Stomach Trouble/Ulcers',
  'Heart Surgery/Heart Attack',
  'Angina pectoris, chest pain',
  'Sexually Transmitted Disease',
  'Joint Replacement/Implant',
  'Hepatitis/Liver Disease',
  'Thyroid Problems',
  'Cancer/Tumors',
  'Head Injuries',
  'AIDS or HIV Infection',
]
const ALLERGENS = ['Local Anesthetic (ex. Lidocaine)', 'Penicillin/Antibiotics', 'Sulfa Drugs', 'Latex/Rubber', 'Aspirin']
const DQ = [
  { text: 'Do you feel pain in any of your teeth?' },
  { text: 'Are you under medical treatment now?', note: 'If so, what is the condition being treated?' },
  { text: 'Are your teeth sensitive to hot/cold liquids/food?' },
  { text: 'Are your teeth sensitive to sweet/sour liquids/food?' },
  { text: 'Do your gums bleed while brushing/flossing?' },
  { text: 'Do you have sores/lumps in/near your mouth?' },
  { text: 'Have you had orthodontic work in the past? (Braces, retainers, etc.)' },
  { text: 'Do you have any exposure to local anesthesia?' },
  { text: 'Have you had unfavorable reaction from anesthesia (eg. Lidocaine)?' },
  { text: 'Have you had problems after tooth extraction?' },
  { text: 'Have you had serious problems associated with dental treatment?' },
  { text: 'Have you had any head, neck or jaw injury?' },
  { text: 'Do you have any oral habit? (thumb sucking, mouth breathing, tongue thrusting, teeth clenching or grinding)' },
  { text: 'Do you have difficulty opening/closing your mouth?' },
  { text: 'Are you satisfied with the appearance of your teeth?' },
  { text: 'Have you had tooth bleaching/whitening done in the past?' },
  { text: 'Does dental treatment make you nervous?' },
  { text: 'Would you like to have regular recall appointments every 6 months?' },
]

const MQ = [
  { text: 'Are you in Good Health?' },
  { text: 'Are you under medical treatment now?', note: 'If so, what is the condition being treated?' },
  { text: 'Have you ever had serious illness or surgical operation?' },
  { text: 'Have you ever been hospitalized?', note: 'If so, when and why?' },
  { text: 'Are you taking any prescription/non-prescription medication?', note: 'If so, please specify:' },
  { text: 'Do you use tobacco products?' },
  { text: 'Do you use alcohol, cocaine or other dangerous drugs?' },
  { text: 'Are you pregnant?' },
  { text: 'Are you Breastfeeding?' },
  { text: 'Are you taking birth control pills?' },
]
const DENTAL_CHART_IMAGES = [
  { src: dentalChart1, alt: 'Dental chart 1' },
  { src: dentalChart2, alt: 'Dental chart 2' },
]
const PERIODONTAL = ['Gingivitis', 'Moderate Periodontitis', 'Early Periodontitis', 'Advanced Periodontitis']
const OCCLUSION = ['Class I molar', 'Overbite', 'Overjet', 'Midline Deviation']
const DENTISTS = ['Dr. Jowela Elaine Roxas', 'Dr. Adrian San Nicolas', 'Dr. Keith San Miguel']
const TOOTH_X_POSITIONS_BY_CHART = {
  chart1: [3.3, 10.7, 18.1, 24.0, 28.7, 36.1, 40.7, 45.5, 54.1, 59.1, 64.1, 71.5, 77.1, 82.8, 91.2, 97.2],
  chart2: [4.0, 11.9, 19.5, 25.9, 30.7, 38.1, 42.9, 47.7, 52.2, 57.1, 62.3, 68.3, 73.3, 80.9, 89.6, 96.4],
}
const createToothMap = () => Object.fromEntries(
  Array.from({ length: 32 }, (_, i) => i + 1).flatMap((tooth) => (
    [[`top-${tooth}`, '?'], [`bottom-${tooth}`, '?']]
  )),
)
const DEFAULT_DENTAL_RECORD = {
  toothMap: createToothMap(),
  periodontal: Object.fromEntries(PERIODONTAL.map((x) => [x, false])),
  occlusion: Object.fromEntries(OCCLUSION.map((x) => [x, false])),
  prescriptions: '',
  notes: '',
  dentist: DENTISTS[0],
}
const cloneDentalRecord = (record) => ({
  toothMap: { ...record.toothMap },
  periodontal: { ...record.periodontal },
  occlusion: { ...record.occlusion },
  prescriptions: record.prescriptions,
  notes: record.notes,
  dentist: record.dentist,
})
const createEmptyServiceLine = () => ({ service: '', amount: '' })
const isServiceLineEmpty = (line) => !line.service && `${line.amount ?? ''}`.trim() === ''
const toServiceAmount = (value) => Number(value || 0)

function PatientRecordDetails() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [tab, setTab] = useState('patient')
  const [modal, setModal] = useState(null)
  const [patient, setPatient] = useState({
    id: id || '1', lastName: 'Doe', firstName: 'John', middleName: '', suffix: '', address: 'Blk 27 Lot 23, Forbes Subdivision Caloocan City',
    mobile: '09213232131', civilStatus: 'Single', occupation: 'Government employee', officeAddress: 'Oracle, Pasay City', sex: 'Male', age: '21', birthdate: '2003-12-05',
  })
  const [health, setHealth] = useState(Object.fromEntries(HEALTH.map((x, i) => [x, i % 2 === 0])))
  const [allergens, setAllergens] = useState({ values: Object.fromEntries(ALLERGENS.map((x, i) => [x, i < 2])), others: '' })
  const [dental, setDental] = useState({
    previous: 'Dr. Adrian San Nicolas',
    lastExam: '2024-12-28',
    reason: 'Toothache',
    answers: Object.fromEntries(DQ.map((_, i) => [i, i % 8 === 0 ? 'NO' : 'YES'])),
    notes: { 1: 'Cleaning follow-up' },
  })
  const [medical, setMedical] = useState({
    physician: 'Dr. Keith San Miguel',
    specialty: 'Pediatrician',
    address: 'Blk 27 Lot 23, Forbes Subdivision Caloocan City',
    answers: Object.fromEntries(MQ.map((_, i) => [i, i % 3 === 2 ? 'NO' : 'YES'])),
    notes: { 1: 'Glutalipo', 3: '2020, Dengue confinement', 4: 'Sleeping Pills' },
  })
  const [serviceRows, setServiceRows] = useState([{ id: 1, date: '2024-12-12', service: SERVICES[0], amount: 800, by: 'Robert Smith' }])
  const [selectedService, setSelectedService] = useState(null)
  const [serviceForm, setServiceForm] = useState({ id: null, date: '2025-12-12', lines: [createEmptyServiceLine()] })
  const [dentalRecord, setDentalRecord] = useState(() => cloneDentalRecord(DEFAULT_DENTAL_RECORD))
  const [dentalRecordForm, setDentalRecordForm] = useState(() => cloneDentalRecord(DEFAULT_DENTAL_RECORD))
  const options = ['?', ...LEGENDS.map((x) => x.code)]
  const renderToothRow = (start, keyPrefix, rowType, positions, toothValues, onToothChange, disabled = false) => (
    <div className={`pr-drop-row ${rowType === 'top' ? 'pr-drop-row-top' : 'pr-drop-row-bottom'}`}>
      {Array.from({ length: 16 }, (_, i) => ({ tooth: i + start, left: positions[i] })).map(({ tooth, left }) => (
        <div key={`${keyPrefix}-${tooth}`} className="pr-drop-slot" style={{ left: `${left}%` }}>
          <select
            value={toothValues[`${rowType}-${tooth}`]}
            disabled={disabled}
            onChange={(e) => onToothChange(`${rowType}-${tooth}`, e.target.value)}
          >
            {options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      ))}
    </div>
  )
  const renderDentalSection = (chart, start, keyPrefix, positions, toothValues, onToothChange, disabled = false) => (
    <div key={keyPrefix} className="pr-dental-section">
      {renderToothRow(start, `${keyPrefix}-top`, 'top', positions, toothValues, onToothChange, disabled)}
      <img src={chart.src} alt={chart.alt} />
      {renderToothRow(start, `${keyPrefix}-bottom`, 'bottom', positions, toothValues, onToothChange, disabled)}
    </div>
  )

  const close = () => { setModal(null); setSelectedService(null); setDentalRecordForm(cloneDentalRecord(dentalRecord)) }
  const openDentalRecord = () => {
    setDentalRecordForm(cloneDentalRecord(dentalRecord))
    setModal('dental-record')
  }
  const openServiceEdit = (row = null) => {
    if (row) {
      setServiceForm({ id: row.id, date: row.date, lines: [{ service: row.service, amount: row.amount }, createEmptyServiceLine()] })
    } else {
      setServiceForm({ id: null, date: '2025-12-12', lines: [createEmptyServiceLine()] })
    }
    setModal('service-edit')
  }
  const updateServiceLine = (index, patch) => {
    setServiceForm((prev) => {
      const nextLines = prev.lines.map((line, i) => (i === index ? { ...line, ...patch } : line))
      return { ...prev, lines: nextLines }
    })
  }
  const saveService = () => {
    const filledLines = serviceForm.lines
      .filter((line) => line.service && `${line.amount ?? ''}`.trim() !== '')
      .map((line) => ({ service: line.service, amount: toServiceAmount(line.amount) }))

    if (!filledLines.length) {
      close()
      return
    }

    if (serviceForm.id) {
      const [first, ...extra] = filledLines
      setServiceRows((prev) => {
        const updated = prev.map((row) => (
          row.id === serviceForm.id ? { ...row, date: serviceForm.date, service: first.service, amount: first.amount } : row
        ))
        let nextId = updated.reduce((max, row) => Math.max(max, row.id), 0) + 1
        const extraRows = extra.map((line) => ({ id: nextId++, date: serviceForm.date, service: line.service, amount: line.amount, by: 'Robert Smith' }))
        return [...updated, ...extraRows]
      })
    } else {
      setServiceRows((prev) => {
        let nextId = prev.reduce((max, row) => Math.max(max, row.id), 0) + 1
        const newRows = filledLines.map((line) => ({ id: nextId++, date: serviceForm.date, service: line.service, amount: line.amount, by: 'Robert Smith' }))
        return [...prev, ...newRows]
      })
    }

    close()
  }
  const saveDentalRecord = () => {
    setDentalRecord(cloneDentalRecord(dentalRecordForm))
    close()
  }
  useEffect(() => {
    if (modal !== 'service-edit') return

    setServiceForm((prev) => {
      const lines = prev.lines.length ? prev.lines : [createEmptyServiceLine()]
      const lastLine = lines[lines.length - 1]
      const shouldAddBlank = !isServiceLineEmpty(lastLine)

      if (shouldAddBlank) {
        return { ...prev, lines: [...lines, createEmptyServiceLine()] }
      }

      let end = lines.length
      while (end > 1 && isServiceLineEmpty(lines[end - 1]) && isServiceLineEmpty(lines[end - 2])) {
        end -= 1
      }
      if (end !== lines.length) {
        return { ...prev, lines: lines.slice(0, end) }
      }

      if (lines !== prev.lines) {
        return { ...prev, lines }
      }
      return prev
    })
  }, [modal, serviceForm.lines])
  const serviceLedgerTotal = serviceForm.lines.reduce(
    (sum, line) => (line.service && `${line.amount ?? ''}`.trim() !== '' ? sum + toServiceAmount(line.amount) : sum),
    0,
  )

  return (
    <>
      <header className="page-header"><h1>Patient Records</h1></header>
      <section className="panel tabs-panel patient-details-page">
        <div className="panel-tabs add-patient-tabs patient-record-tabs">
          {['patient', 'dental', 'service'].map((key) => (
            <button key={key} type="button" className={`tab ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
              {key === 'patient' ? 'Patient Information' : key === 'dental' ? 'Dental Records' : 'Service Records'}
            </button>
          ))}
        </div>

        <div className="actions-row">
          {tab === 'patient' ? <button type="button" className="view">Export</button> : null}
          {tab === 'dental' ? <button type="button" className="primary" onClick={openDentalRecord}>+ Update Dental Record</button> : null}
          {tab === 'service' ? <button type="button" className="primary" onClick={() => openServiceEdit()}>+ Add Service Record</button> : null}
        </div>

        <div className="pr-banner"><div className="pr-avatar-wrap"><div className="pr-avatar-head" /><div className="pr-avatar-body" /></div><div className="pr-name"><small>Patient Name</small><h2>{patient.lastName}, {patient.firstName}</h2></div><div className="pr-id"><small>Patient ID</small><strong>{patient.id}</strong></div></div>

        {tab === 'patient' ? (
          <>
            <div className="pr-grid">
              <article className="pr-card">
                <div className="pr-card-head">
                  <h3>Details</h3>
                  <button type="button" className="mini-edit-btn" onClick={() => setModal('details')}>&#9998;</button>
                </div>
                <div className="pr-detail-list">
                  <div className="pr-detail-item pr-detail-item-wide"><span className="pr-detail-label">Address</span><span className="pr-detail-value">{patient.address}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Sex</span><span className="pr-detail-value">{patient.sex}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Age</span><span className="pr-detail-value">{patient.age}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Civil Status</span><span className="pr-detail-value">{patient.civilStatus}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Birthdate</span><span className="pr-detail-value">{patient.birthdate}</span></div>
                  <div className="pr-detail-item pr-detail-item-wide"><span className="pr-detail-label">Mobile Number</span><span className="pr-detail-value">{patient.mobile}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Occupation</span><span className="pr-detail-value">{patient.occupation}</span></div>
                  <div className="pr-detail-item"><span className="pr-detail-label">Office Address</span><span className="pr-detail-value">{patient.officeAddress}</span></div>
                </div>
              </article>
              <div className="pr-stack">
                <article className="pr-card"><div className="pr-card-head"><h3>Health Status</h3><button type="button" className="mini-edit-btn" onClick={() => setModal('health')}>&#9998;</button></div><div className="mini-check-grid three-col">{HEALTH.map((x) => <label key={x}><input type="checkbox" checked={health[x]} readOnly />{x}</label>)}</div></article>
                <article className="pr-card"><div className="pr-card-head"><h3>Allergen Information</h3><button type="button" className="mini-edit-btn" onClick={() => setModal('allergen')}>&#9998;</button></div><div className="mini-check-grid two-col">{ALLERGENS.map((x) => <label key={x}><input type="checkbox" checked={allergens.values[x]} readOnly />{x}</label>)}<label>Others, please specify:<input type="text" readOnly value={allergens.others} /></label></div></article>
              </div>
            </div>
            <div className="pr-grid second-row">
              <article className="pr-card"><div className="pr-card-head"><h3>Dental History</h3><button type="button" className="mini-edit-btn" onClick={() => setModal('dental-history')}>&#9998;</button></div><div className="two-field-line"><p><strong>Name of Physician/Medical Doctor</strong><span>{dental.previous}</span></p><p><strong>Date of last exam</strong><span>{dental.lastExam}</span></p></div><p className="single-field-line"><strong>What is the reason for Dental Consultation</strong><span>{dental.reason}</span></p><div className="history-answers">{DQ.map((q, i) => <p key={q.text}><span>{q.text}</span><strong className={dental.answers[i] === 'NO' ? 'is-no' : ''}>{dental.answers[i]}</strong></p>)}</div></article>
              <article className="pr-card"><div className="pr-card-head"><h3>Medical History</h3><button type="button" className="mini-edit-btn" onClick={() => setModal('medical-history')}>&#9998;</button></div><div className="two-field-line"><p><strong>Name of Physician/Medical Doctor</strong><span>{medical.physician}</span></p><p><strong>Specialty (if available)</strong><span>{medical.specialty}</span></p></div><p className="single-field-line"><strong>Address</strong><span>{medical.address}</span></p><div className="history-answers">{MQ.map((q, i) => <p key={q.text}><span>{q.text}</span><strong className={medical.answers[i] === 'NO' ? 'is-no' : ''}>{medical.answers[i]}</strong></p>)}</div></article>
            </div>
            <article className="pr-card pr-authorization"><h3>Authorization and Release</h3><p>I certify that I have read and understood the questionnaire and authorize records release.</p></article>
            <div className="pr-meta-row"><span>Date of last changes: May 5, 2025</span><span>Last changes by: Robert Smith</span></div>
          </>
        ) : null}

        {tab === 'dental' ? (
          <article className="pr-card pr-dental-layout pr-dental-prototype">
            <div className="pr-split-header">
              <article className="pr-screen-card">
                <h4>Periodontal Screening</h4>
                <div className="pr-option-grid">
                  {PERIODONTAL.map((item) => <label key={item}><input type="checkbox" checked={dentalRecord.periodontal[item]} readOnly />{item}</label>)}
                </div>
              </article>
              <article className="pr-screen-card">
                <h4>Occlusion</h4>
                <div className="pr-option-grid">
                  {OCCLUSION.map((item) => <label key={item}><input type="checkbox" checked={dentalRecord.occlusion[item]} readOnly />{item}</label>)}
                </div>
              </article>
            </div>

            <div className="pr-dentist-tag"><strong>Dentist:</strong> <span className="pr-dentist-name">{dentalRecord.dentist}</span></div>

            <section className="pr-dental-history-wrap">
              <h3>Dental History</h3>
              <div className="pr-dental-chart">{renderDentalSection(DENTAL_CHART_IMAGES[0], 1, 'chart-1', TOOTH_X_POSITIONS_BY_CHART.chart1, dentalRecord.toothMap, () => {}, true)}<div className="pr-dental-divider" />{renderDentalSection(DENTAL_CHART_IMAGES[1], 17, 'chart-2', TOOTH_X_POSITIONS_BY_CHART.chart2, dentalRecord.toothMap, () => {}, true)}</div>
            </section>

            <div className="pr-notes-grid">
              <label>Dental Prescriptions<textarea readOnly value={dentalRecord.prescriptions} placeholder="Add a title bit of body text" /></label>
              <label>Dental Notes<textarea readOnly value={dentalRecord.notes} placeholder="Add a title bit of body text" /></label>
            </div>

            <div className="pr-meta-row"><span>Date of last changes: May 5, 2025</span><span>Last changes by: Robert Smith</span></div>
          </article>
        ) : null}

        {tab === 'service' ? <article className="service-list-card"><div className="service-list-head"><h3>Service Records</h3><h3>Actions</h3></div>{serviceRows.map((r) => <div key={r.id} className="service-list-row"><span>{r.date}</span><button type="button" className="view" onClick={() => { setSelectedService(r); setModal('service-view') }}>View</button><button type="button" className="mini-edit-btn" onClick={() => openServiceEdit(r)}>&#9998;</button></div>)}</article> : null}

        <div className="panel-footer details-footer"><button type="button" className="ghost" onClick={() => navigate('/records')}>Back to Records</button></div>
      </section>

      {modal ? <div className="modal-backdrop" onClick={close} /> : null}
      {modal === 'details' ? <div className="pr-modal"><div className="pr-modal-head"><h2>Update Details</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body"><div className="history-top-grid"><label>Lastname*<input type="text" value={patient.lastName} onChange={(e) => setPatient((p) => ({ ...p, lastName: e.target.value }))} /></label><label>Firstname*<input type="text" value={patient.firstName} onChange={(e) => setPatient((p) => ({ ...p, firstName: e.target.value }))} /></label><label>Middle Name<input type="text" value={patient.middleName} onChange={(e) => setPatient((p) => ({ ...p, middleName: e.target.value }))} /></label><label>Suffix<input type="text" value={patient.suffix} onChange={(e) => setPatient((p) => ({ ...p, suffix: e.target.value }))} /></label><label className="span-2">Current Address*<input type="text" value={patient.address} onChange={(e) => setPatient((p) => ({ ...p, address: e.target.value }))} /></label><label>Mobile Number*<input type="text" value={patient.mobile} onChange={(e) => setPatient((p) => ({ ...p, mobile: e.target.value }))} /></label><label>Civil Status*<input type="text" value={patient.civilStatus} onChange={(e) => setPatient((p) => ({ ...p, civilStatus: e.target.value }))} /></label><label>Occupation*<input type="text" value={patient.occupation} onChange={(e) => setPatient((p) => ({ ...p, occupation: e.target.value }))} /></label><label className="span-2">Office Address<input type="text" value={patient.officeAddress} onChange={(e) => setPatient((p) => ({ ...p, officeAddress: e.target.value }))} /></label></div><div className="modal-actions"><button type="button" className="danger-btn" onClick={close}>Cancel</button><button type="button" className="success-btn" onClick={close}>Save</button></div></div></div> : null}
      {modal === 'health' ? <div className="pr-modal"><div className="pr-modal-head"><h2>Update Health Status</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body"><div className="mini-check-grid three-col">{HEALTH.map((x) => <label key={x}><input type="checkbox" checked={health[x]} onChange={() => setHealth((p) => ({ ...p, [x]: !p[x] }))} />{x}</label>)}</div><div className="modal-actions"><button type="button" className="danger-btn" onClick={close}>Cancel</button><button type="button" className="success-btn" onClick={close}>Save</button></div></div></div> : null}
      {modal === 'allergen' ? <div className="pr-modal"><div className="pr-modal-head"><h2>Update Allergen Information</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body"><div className="mini-check-grid two-col">{ALLERGENS.map((x) => <label key={x}><input type="checkbox" checked={allergens.values[x]} onChange={() => setAllergens((p) => ({ ...p, values: { ...p.values, [x]: !p.values[x] } }))} />{x}</label>)}<label>Others, please specify:<input type="text" value={allergens.others} onChange={(e) => setAllergens((p) => ({ ...p, others: e.target.value }))} /></label></div><div className="modal-actions"><button type="button" className="danger-btn" onClick={close}>Cancel</button><button type="button" className="success-btn" onClick={close}>Save</button></div></div></div> : null}
      {modal === 'dental-history' ? <div className="pr-modal"><div className="pr-modal-head"><h2>Update Dental History</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body pr-modal-scroll"><div className="history-top-grid"><label>Name of Previous Dentist<input type="text" value={dental.previous} onChange={(e) => setDental((p) => ({ ...p, previous: e.target.value }))} /></label><label>Date of last Exam<input type="date" value={dental.lastExam} onChange={(e) => setDental((p) => ({ ...p, lastExam: e.target.value }))} /></label><label className="span-2">What is the reason for Dental Consultation?<input type="text" value={dental.reason} onChange={(e) => setDental((p) => ({ ...p, reason: e.target.value }))} /></label></div><section className="history-block"><h3>Answer the Following Questions:</h3>{DQ.map((q, i) => <div key={q.text} className="yes-no-item"><p>{q.text}</p><div className="yes-no-row"><label><input type="radio" checked={dental.answers[i] === 'YES'} onChange={() => setDental((p) => ({ ...p, answers: { ...p.answers, [i]: 'YES' } }))} />Yes</label><label><input type="radio" checked={dental.answers[i] === 'NO'} onChange={() => setDental((p) => ({ ...p, answers: { ...p.answers, [i]: 'NO' } }))} />No</label>{q.note ? <label className="note-field"><span>{q.note}</span><input type="text" value={dental.notes?.[i] || ''} onChange={(e) => setDental((p) => ({ ...p, notes: { ...(p.notes || {}), [i]: e.target.value } }))} /></label> : null}</div></div>)}</section><div className="modal-actions"><button type="button" className="success-btn" onClick={close}>Save</button></div></div></div> : null}
      {modal === 'medical-history' ? <div className="pr-modal"><div className="pr-modal-head"><h2>Update Medical History</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body pr-modal-scroll"><div className="history-top-grid"><label>Name of Physician/Medical Doctor<input type="text" value={medical.physician} onChange={(e) => setMedical((p) => ({ ...p, physician: e.target.value }))} /></label><label>Specialty (if available)<input type="text" value={medical.specialty} onChange={(e) => setMedical((p) => ({ ...p, specialty: e.target.value }))} /></label><label className="span-2">Address<input type="text" value={medical.address} onChange={(e) => setMedical((p) => ({ ...p, address: e.target.value }))} /></label></div><section className="history-block"><h3>Answer the Following Questions:</h3>{MQ.map((q, i) => <div key={q.text} className="yes-no-item"><p>{q.text}</p><div className="yes-no-row"><label><input type="radio" checked={medical.answers[i] === 'YES'} onChange={() => setMedical((p) => ({ ...p, answers: { ...p.answers, [i]: 'YES' } }))} />Yes</label><label><input type="radio" checked={medical.answers[i] === 'NO'} onChange={() => setMedical((p) => ({ ...p, answers: { ...p.answers, [i]: 'NO' } }))} />No</label>{q.note ? <label className="note-field"><span>{q.note}</span><input type="text" value={medical.notes?.[i] || ''} onChange={(e) => setMedical((p) => ({ ...p, notes: { ...(p.notes || {}), [i]: e.target.value } }))} /></label> : null}</div></div>)}</section><div className="modal-actions"><button type="button" className="success-btn" onClick={close}>Save</button></div></div></div> : null}
      {modal === 'service-view' && selectedService ? <div className="pr-modal"><div className="pr-modal-head"><h2>View</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body"><div className="service-date-row"><strong>Date</strong><span>{selectedService.date}</span></div><div className="service-view-table"><div className="service-view-head"><span>Services</span><span>Amount (PHP)</span></div><div className="service-view-line"><span>{selectedService.service}</span><span>{selectedService.amount}</span></div></div><p className="service-total">Total <strong>{selectedService.amount}</strong></p><p className="service-last-change">Last Changes by: {selectedService.by}</p><div className="modal-actions center"><button type="button" className="view" onClick={close}>Done</button></div></div></div> : null}
      {modal === 'service-edit' ? <div className="pr-modal service-ledger-modal"><div className="pr-modal-head"><h2>{serviceForm.id ? 'Edit' : 'Add'} Service Record</h2><button type="button" onClick={close}>X</button></div><div className="pr-modal-body"><div className="service-ledger-date"><span className="service-ledger-date-label">Date</span><label className="service-ledger-date-field"><input type="date" value={serviceForm.date} onChange={(e) => setServiceForm((p) => ({ ...p, date: e.target.value }))} /></label></div><div className="service-ledger-table"><div className="service-ledger-head"><span>Services</span><span>Amount (PHP)</span></div><div className="service-ledger-rows">{serviceForm.lines.map((line, index) => <div key={`service-line-${index}`} className="service-ledger-row"><select value={line.service} onChange={(e) => updateServiceLine(index, { service: e.target.value })}><option value="">Select service</option>{SERVICES.map((s) => <option key={s}>{s}</option>)}</select><label className="service-ledger-amount"><span>&#8369;</span><input type="number" value={line.amount} min="0" step="0.01" onChange={(e) => updateServiceLine(index, { amount: e.target.value })} /></label></div>)}</div><div className="service-ledger-total"><strong>Total</strong><strong>&#8369; {serviceLedgerTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div></div><div className="modal-actions"><button type="button" className="danger-btn" onClick={close}>Cancel</button><button type="button" className="success-btn" onClick={saveService}>Save</button></div></div></div> : null}
      {modal === 'dental-record' ? (
        <div className="pr-modal">
          <div className="pr-modal-head"><h2>Update Dental Records</h2><button type="button" onClick={close}>X</button></div>
          <div className="pr-modal-body pr-modal-scroll pr-dental-record-modal">
            <div className="pr-modal-section-title">Check the Following</div>
            <div className="pr-dental-check-grid">
              <article className="pr-dental-check-card">
                <h4>Periodontal Screening</h4>
                <div className="pr-dental-check-options">
                  {PERIODONTAL.map((item) => (
                    <label key={`modal-periodontal-${item}`}>
                      <input
                        type="checkbox"
                        checked={dentalRecordForm.periodontal[item]}
                        onChange={() => setDentalRecordForm((p) => ({ ...p, periodontal: { ...p.periodontal, [item]: !p.periodontal[item] } }))}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </article>
              <article className="pr-dental-check-card">
                <h4>Occlusion</h4>
                <div className="pr-dental-check-options">
                  {OCCLUSION.map((item) => (
                    <label key={`modal-occlusion-${item}`}>
                      <input
                        type="checkbox"
                        checked={dentalRecordForm.occlusion[item]}
                        onChange={() => setDentalRecordForm((p) => ({ ...p, occlusion: { ...p.occlusion, [item]: !p.occlusion[item] } }))}
                      />
                      {item}
                    </label>
                  ))}
                </div>
              </article>
            </div>

            <div className="pr-modal-section-title">Dental Chart</div>
            <div className="pr-dental-chart">{renderDentalSection(DENTAL_CHART_IMAGES[0], 1, 'modal-chart-1', TOOTH_X_POSITIONS_BY_CHART.chart1, dentalRecordForm.toothMap, (tooth, value) => setDentalRecordForm((p) => ({ ...p, toothMap: { ...p.toothMap, [tooth]: value } })))}<div className="pr-dental-divider" />{renderDentalSection(DENTAL_CHART_IMAGES[1], 17, 'modal-chart-2', TOOTH_X_POSITIONS_BY_CHART.chart2, dentalRecordForm.toothMap, (tooth, value) => setDentalRecordForm((p) => ({ ...p, toothMap: { ...p.toothMap, [tooth]: value } })))}</div>

            <div className="pr-modal-section-title">Fill the Details</div>
            <div className="pr-dental-modal-notes">
              <label>Dental Prescriptions<textarea value={dentalRecordForm.prescriptions} onChange={(e) => setDentalRecordForm((p) => ({ ...p, prescriptions: e.target.value }))} placeholder="Add a little bit of body text" /></label>
              <label>Dental Notes<textarea value={dentalRecordForm.notes} onChange={(e) => setDentalRecordForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Add a little bit of body text" /></label>
            </div>
            <div className="pr-dental-modal-dentist">
              <label>
                Add Dentist
                <select value={dentalRecordForm.dentist} onChange={(e) => setDentalRecordForm((p) => ({ ...p, dentist: e.target.value }))}>
                  {DENTISTS.map((dentist) => <option key={dentist} value={dentist}>{dentist}</option>)}
                </select>
              </label>
            </div>

            <div className="modal-actions center"><button type="button" className="danger-btn" onClick={close}>Cancel</button><button type="button" className="success-btn" onClick={saveDentalRecord}>Save</button></div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default PatientRecordDetails
