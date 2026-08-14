import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createCard } from '../lib/api'

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown']

function TagInput({ label, placeholder, tags, setTags, accentBorder = false }) {
  const [input, setInput] = useState('')

  function handleKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  function addTag() {
    const value = input.trim()
    if (value && !tags.includes(value)) {
      setTags([...tags, value])
      setInput('')
    }
  }

  function removeTag(index) {
    setTags(tags.filter((_, i) => i !== index))
  }

  return (
    <div>
      <label className="block text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-primary mb-2">{label}</label>
      <div className={`flex items-center bg-surface-bright border border-outline-variant rounded focus-within:border-primary focus-within:ring-1 focus-within:ring-primary p-2 ${accentBorder ? 'border-l-4 border-l-secondary' : ''}`}>
        <input
          className="flex-grow h-8 px-2 bg-transparent border-none focus:outline-none focus:ring-0 text-[16px] leading-[24px] text-primary placeholder:text-outline"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={addTag}
          className="material-symbols-outlined text-on-surface-variant hover:text-primary p-1"
        >
          add_circle
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {tags.map((tag, i) => (
            <span
              key={i}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] leading-[16px] font-medium ${
                accentBorder
                  ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                  : 'bg-surface-container-high text-on-surface'
              }`}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(i)}
                className="material-symbols-outlined text-[16px] leading-none hover:text-secondary focus:outline-none"
              >
                close
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

function ContactCard({ contact, index, onChange, onRemove, canRemove }) {
  return (
    <div className="bg-surface-bright border border-outline-variant rounded p-4 relative group">
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 material-symbols-outlined text-outline hover:text-secondary transition-colors"
          title="Remove Contact"
        >
          delete
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[12px] leading-[16px] font-medium text-on-surface-variant mb-1">Name <span className="text-secondary">*</span></label>
          <input
            type="text"
            placeholder="Contact Name"
            value={contact.name}
            onChange={(e) => onChange(index, 'name', e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-[16px] leading-[24px] text-primary placeholder:text-outline"
          />
        </div>
        <div>
          <label className="block text-[12px] leading-[16px] font-medium text-on-surface-variant mb-1">Relationship</label>
          <input
            type="text"
            placeholder="e.g., Spouse, Parent"
            value={contact.relationship}
            onChange={(e) => onChange(index, 'relationship', e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-[16px] leading-[24px] text-primary placeholder:text-outline"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-[12px] leading-[16px] font-medium text-on-surface-variant mb-1">Phone Number <span className="text-secondary">*</span></label>
          <input
            type="tel"
            placeholder="+63 XXX XXX XXXX"
            value={contact.phone}
            onChange={(e) => onChange(index, 'phone', e.target.value)}
            className="w-full h-10 px-3 bg-surface-container-lowest border border-outline-variant rounded focus:outline-none focus:border-primary text-[16px] leading-[24px] text-primary placeholder:text-outline"
          />
        </div>
      </div>
    </div>
  )
}

export default function IntakeForm() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [bloodType, setBloodType] = useState('Unknown')
  const [allergies, setAllergies] = useState([])
  const [conditions, setConditions] = useState([])
  const [medications, setMedications] = useState([])
  const [notes, setNotes] = useState('')
  const [contacts, setContacts] = useState([{ name: '', relationship: '', phone: '' }])
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [apiError, setApiError] = useState('')

  function addContact() {
    if (contacts.length < 3) {
      setContacts([...contacts, { name: '', relationship: '', phone: '' }])
    }
  }

  function removeContact(index) {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  function updateContact(index, field, value) {
    const updated = [...contacts]
    updated[index] = { ...updated[index], [field]: value }
    setContacts(updated)
  }

  function validate() {
    const errs = {}
    if (!fullName.trim()) errs.fullName = 'Full name is required'
    if (!bloodType || bloodType === '') errs.bloodType = 'Blood type is required'
    const validContacts = contacts.filter((c) => c.name.trim() && c.phone.trim())
    if (validContacts.length === 0) errs.contacts = 'At least 1 emergency contact with name and phone is required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setSubmitting(true)
    try {
      const card = await createCard({
        fullName: fullName.trim(),
        bloodType,
        allergies,
        conditions,
        medications,
        emergencyContacts: contacts
          .filter((c) => c.name.trim() && c.phone.trim())
          .map((c) => ({
            name: c.name.trim(),
            relationship: c.relationship.trim(),
            phone: c.phone.trim(),
          })),
        notes: notes.trim(),
      })
      navigate(`/result/${card.id}`)
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex-grow max-w-[800px] mx-auto px-[--spacing-margin-mobile] md:px-[--spacing-margin-desktop] py-8 md:py-12 w-full">
      <div className="mb-[--spacing-section-gap]">
        <h1 className="text-[24px] leading-[32px] font-bold md:text-[32px] md:leading-[40px] md:tracking-[-0.02em] md:font-bold text-primary mb-2">
          Create your living emergency medical card
        </h1>
        <p className="text-[16px] leading-[24px] text-on-surface-variant">
          Fill out the essential information below. This data will be rapidly accessible via your personalized Emergency QR.
        </p>
      </div>

      {apiError && (
        <div className="mb-6 p-4 bg-error-container border border-error rounded-lg text-on-error-container text-[14px] leading-[20px] font-semibold">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-[--spacing-section-gap]">
        {/* Personal Info */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-[20px] leading-[28px] font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">person</span>
              Personal Information
            </h2>
          </div>
          <div className="space-y-[--spacing-component-gap]">
            <div>
              <label htmlFor="fullName" className="block text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-primary mb-2">
                Full Name <span className="text-secondary">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="e.g., Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-12 px-4 bg-surface-bright border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[16px] leading-[24px] text-primary placeholder:text-outline transition-colors"
              />
              {errors.fullName && <p className="text-secondary text-[12px] leading-[16px] font-medium mt-1">{errors.fullName}</p>}
            </div>
            <div>
              <label className="block text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-primary mb-2">
                Blood Type <span className="text-secondary">*</span>
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {BLOOD_TYPES.map((bt) => (
                  <label key={bt} className={`cursor-pointer ${bt === 'Unknown' ? 'sm:col-span-2' : ''}`}>
                    <input
                      type="radio"
                      name="bloodType"
                      value={bt}
                      checked={bloodType === bt}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="peer sr-only"
                    />
                    <div className="px-4 py-2 border border-outline-variant rounded-full text-center text-[14px] leading-[20px] font-semibold tracking-[0.05em] text-on-surface-variant peer-checked:bg-secondary peer-checked:text-on-secondary peer-checked:border-secondary hover:bg-surface-container-low transition-colors">
                      {bt}
                    </div>
                  </label>
                ))}
              </div>
              {errors.bloodType && <p className="text-secondary text-[12px] leading-[16px] font-medium mt-1">{errors.bloodType}</p>}
            </div>
          </div>
        </section>

        {/* Medical Details */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-[20px] leading-[28px] font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">monitor_heart</span>
              Medical Details
            </h2>
          </div>
          <div className="space-y-[--spacing-component-gap]">
            <TagInput
              label="Allergies"
              placeholder="Type allergy and press Enter..."
              tags={allergies}
              setTags={setAllergies}
              accentBorder
            />
            <hr className="border-t border-surface-variant" />
            <TagInput
              label="Medical Conditions"
              placeholder="Type condition and press Enter..."
              tags={conditions}
              setTags={setConditions}
            />
            <hr className="border-t border-surface-variant" />
            <TagInput
              label="Medications"
              placeholder="Type medication and press Enter..."
              tags={medications}
              setTags={setMedications}
            />
          </div>
        </section>

        {/* Emergency Contacts */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-[20px] leading-[28px] font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">contact_phone</span>
              Emergency Contacts
            </h2>
          </div>
          <div className="space-y-[--spacing-component-gap]">
            {contacts.map((contact, i) => (
              <ContactCard
                key={i}
                contact={contact}
                index={i}
                onChange={updateContact}
                onRemove={() => removeContact(i)}
                canRemove={contacts.length > 1}
              />
            ))}
          </div>
          {errors.contacts && <p className="text-secondary text-[12px] leading-[16px] font-medium mt-2">{errors.contacts}</p>}
          {contacts.length < 3 && (
            <button
              type="button"
              onClick={addContact}
              className="mt-4 flex items-center justify-center gap-2 w-full h-12 border-2 border-dashed border-outline-variant rounded text-on-surface-variant hover:border-primary hover:text-primary hover:bg-surface-container-low transition-colors text-[14px] leading-[20px] font-semibold tracking-[0.05em]"
            >
              <span className="material-symbols-outlined">add</span>
              Add another contact
            </button>
          )}
        </section>

        {/* Additional Notes */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-6">
          <div className="border-b border-outline-variant pb-4 mb-6">
            <h2 className="text-[20px] leading-[28px] font-semibold text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-on-surface-variant">note_alt</span>
              Additional Notes
            </h2>
          </div>
          <textarea
            placeholder="Any other vital information responders should know? (e.g., Pacemaker, Organ Donor, specific instructions)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-surface-bright border border-outline-variant rounded focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-[16px] leading-[24px] text-primary placeholder:text-outline transition-colors resize-y"
          />
        </section>

        {/* Submit */}
        <div className="pt-8 pb-12 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="w-full md:w-auto px-8 py-4 bg-primary text-on-primary text-[14px] leading-[20px] font-semibold tracking-[0.05em] rounded-lg flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>qr_code_2</span>
                Generate Emergency QR & Card
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  )
}
