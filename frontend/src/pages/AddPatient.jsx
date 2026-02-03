import { useState } from 'react'

const STEPS = ['Patient Information', 'Medical History', 'Dental History', 'Authorization']

const MEDICAL_QUESTIONS = [
  { text: 'Are you in a good health?' },
  { text: 'Are you under medical treatment now?', note: 'If so, what is the condition being treated?' },
  { text: 'Have you ever had serious illness or surgical operation?' },
  { text: 'Have you ever been hospitalized?', note: 'If so, when and why?' },
  { text: 'Are you taking any prescription/non-prescription medication?', note: 'If so, please specify:' },
  { text: 'Do you use tobacco products?' },
  { text: 'Do you use alcohol, cocaine or other dangerous drugs?' },
  { text: 'Are you pregnant?' },
  { text: 'Are you breastfeeding?' },
  { text: 'Are you taking birth control pills?' },
]

const DENTAL_QUESTIONS = [
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

const CHECKBOX_CONDITIONS = [
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
  'Hepatitis/Liver Disease',
  'AIDS or HIV Infection',
  'Thyroid Problems',
  'Joint Replacement/Implant',
  'Cancer/Tumors',
  'Hospitalization/Illness',
  'Psychiatric Treatment',
  'Allergy to Latex',
  'Others',
]

function YesNoQuestion({ index, item, prefix }) {
  const fieldName = `${prefix}-${index}`

  return (
    <div className="yes-no-item">
      <p>{item.text}</p>
      <div className="yes-no-row">
        <label>
          <input type="radio" name={fieldName} />
          Yes
        </label>
        <label>
          <input type="radio" name={fieldName} />
          No
        </label>
        {item.note ? (
          <label className="note-field">
            <span>{item.note}</span>
            <input type="text" />
          </label>
        ) : null}
      </div>
    </div>
  )
}

function AddPatient() {
  const [activeStep, setActiveStep] = useState(0)

  const nextStep = () => {
    setActiveStep((prev) => Math.min(prev + 1, STEPS.length - 1))
  }

  return (
    <>
      <header className="page-header">
        <h1>Add Patient Record</h1>
      </header>

      <section className="panel tabs-panel add-patient-prototype">
        <div className="panel-tabs add-patient-tabs">
          {STEPS.map((step, index) => (
            <button
              key={step}
              type="button"
              className={`tab ${activeStep === index ? 'active' : ''}`}
              onClick={() => setActiveStep(index)}
            >
              {step}
            </button>
          ))}
        </div>

        {activeStep === 0 ? (
          <>
            <h2 className="panel-title">Patient Information</h2>

            <div className="form-grid">
              <label>
                Last Name*
                <input type="text" />
              </label>
              <label>
                First Name*
                <input type="text" />
              </label>
              <label>
                Middle Name
                <input type="text" />
              </label>
              <label>
                Suffix
                <input type="text" />
              </label>
              <label>
                Birthdate*
                <input type="text" />
              </label>
              <label>
                Sex*
                <input type="text" />
              </label>
              <label>
                Age*
                <input type="text" />
              </label>
              <label>
                Nickname
                <input type="text" />
              </label>
              <label className="span-2">
                Email Address
                <input type="text" />
              </label>
              <label>
                Civil Status*
                <input type="text" />
              </label>
              <label className="span-2">
                Current Address*
                <input type="text" />
              </label>
              <label>
                Mobile Number*
                <input type="text" />
              </label>
              <label>
                Occupation*
                <input type="text" />
              </label>
              <label className="span-2">
                Office Address
                <input type="text" />
              </label>
            </div>

            <div className="minor-block">
              <p>FOR MINORS (Visible when age &lt; 18)</p>
              <div className="form-grid">
                <label className="span-2">
                  Parent/Guardian Name*
                  <input type="text" />
                </label>
                <label>
                  Mobile Number*
                  <input type="text" />
                </label>
                <label>
                  Occupation*
                  <input type="text" />
                </label>
                <label className="span-2">
                  Office Address
                  <input type="text" />
                </label>
              </div>
            </div>
          </>
        ) : null}

        {activeStep === 1 ? (
          <div className="history-wrapper">
            <h2 className="panel-title">Medical History</h2>

            <div className="history-top-grid">
              <label>
                Name of Physician/Medical Doctor
                <input type="text" />
              </label>
              <label>
                Specialty (if available)
                <input type="text" />
              </label>
              <label className="span-2">
                Address
                <input type="text" />
              </label>
            </div>

            <section className="history-block">
              <h3>Answer the Following Questions:</h3>
              {MEDICAL_QUESTIONS.map((item, index) => (
                <YesNoQuestion key={item.text} item={item} index={index} prefix="medical" />
              ))}
            </section>

            <section className="history-block allergen-block">
              <h3>Allergen Information</h3>
              <div className="check-group">
                <p>Are you allergic to any of the following?</p>
                <div className="checkbox-grid two-col">
                  <label><input type="checkbox" />Local Anesthetic (ex. Lidocaine)</label>
                  <label><input type="checkbox" />Penicillin/Antibiotics</label>
                  <label><input type="checkbox" />Sulfa Drugs</label>
                  <label><input type="checkbox" />Others, please specify:</label>
                  <label><input type="checkbox" />Latex/Rubber</label>
                  <label className="other-field"><input type="text" /></label>
                  <label><input type="checkbox" />Aspirin</label>
                </div>
              </div>
            </section>

            <section className="history-block">
              <h3>Check Which Apply:</h3>
              <div className="checkbox-grid four-col">
                {CHECKBOX_CONDITIONS.map((item) => (
                  <label key={item}>
                    <input type="checkbox" />
                    {item}
                  </label>
                ))}
              </div>
            </section>
          </div>
        ) : null}

        {activeStep === 2 ? (
          <div className="history-wrapper">
            <h2 className="panel-title">Dental History</h2>

            <div className="history-top-grid">
              <label>
                Name of Previous Dentist
                <input type="text" />
              </label>
              <label>
                Date of Last Exam
                <input type="text" />
              </label>
              <label className="span-2">
                What is the reason for Dental Consultation?
                <input type="text" />
              </label>
            </div>

            <section className="history-block">
              <h3>Answer the Following Questions:</h3>
              {DENTAL_QUESTIONS.map((item, index) => (
                <YesNoQuestion key={item.text} item={item} index={index} prefix="dental" />
              ))}
            </section>
          </div>
        ) : null}

        {activeStep === 3 ? (
          <section className="authorization-wrap">
            <h2>Authorization and Release</h2>
            <div className="authorization-card">
              <p>
                I certify that I have read and understood the questionnaire to the best of my
                knowledge. I will seek help from the dental staff if questions are difficult to
                read or understand. I agree to disclose all previous illnesses, medical and dental
                history. I understand that providing incorrect information regarding medication,
                allergies or illnesses can be dangerous to my health.
              </p>
              <p>
                If I ever have changes in my health, I will inform the dentist/dental staff at the
                next appointment. I authorize the dentist to release any information including the
                diagnosis and records of any treatment or examination rendered to myself or my
                child during the period of dental care to third party payers, HMOs or health
                practitioners.
              </p>
              <label className="agree-line">
                <input type="radio" name="authorization" />
                I have read, understood, and <strong>agree</strong> to the terms stated above.
              </label>
            </div>
          </section>
        ) : null}

        <div className="panel-footer add-patient-footer">
          {activeStep < STEPS.length - 1 ? (
            <button type="button" className="submit step-btn" onClick={nextStep}>
              Next
            </button>
          ) : (
            <button type="button" className="submit final-submit">
              Submit
            </button>
          )}
        </div>
      </section>
    </>
  )
}

export default AddPatient
