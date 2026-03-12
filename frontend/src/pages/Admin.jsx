import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const DEFAULT_PAGE_SIZE = 10
const ROWS_PER_PAGE_OPTIONS = [10, 20, 30, 40, 50, 60]

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'associate_dentist', label: 'Associate Dentist' },
  { value: 'receptionist', label: 'Receptionist' },
]

const ROLE_LABELS = Object.fromEntries(ROLE_OPTIONS.map((item) => [item.value, item.label]))
const ROLE_SORT_ORDER = ROLE_OPTIONS.reduce((accumulator, item, index) => {
  accumulator[item.value] = index
  return accumulator
}, {})
const MONTH_ABBR = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May.', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return `${MONTH_ABBR[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`
}

const calculateAge = (birthDate) => {
  if (!birthDate) return '-'
  const dob = new Date(birthDate)
  if (Number.isNaN(dob.getTime())) return '-'
  const now = new Date()
  let age = now.getFullYear() - dob.getFullYear()
  const monthDelta = now.getMonth() - dob.getMonth()
  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < dob.getDate())) age -= 1
  return age < 0 ? '-' : age
}

const formatPatientCode = (patientCode, patientId) => {
  const raw = `${patientCode || ''}`.trim()
  if (/^PT-\d{6}$/.test(raw)) return raw

  const digits = raw.replace(/\D/g, '')
  if (digits) return `PT-${digits.slice(-6).padStart(6, '0')}`

  const fallbackDigits = `${patientId || ''}`.replace(/\D/g, '').slice(-6)
  return `PT-${fallbackDigits.padStart(6, '0')}`
}

const formatStaffCode = (userId) => {
  const raw = `${userId || ''}`.trim()
  if (/^ST-\d{6}$/i.test(raw)) return raw.toUpperCase()

  const digits = raw.replace(/\D/g, '')
  if (digits) return `ST-${digits.slice(-6).padStart(6, '0')}`

  // Fallback for UUID-like values that may not produce enough numeric digits
  const alphanumerics = raw.replace(/[^a-zA-Z0-9]/g, '')
  const tail = alphanumerics.slice(-6).toUpperCase()
  return `ST-${tail.padStart(6, '0')}`
}

const patientCodeNumber = (row) => {
  const code = formatPatientCode(row.patient_code, row.id)
  const digits = Number(code.replace(/\D/g, ''))
  return Number.isFinite(digits) ? digits : 0
}

const staffCodeNumber = (row) => {
  const code = formatStaffCode(row.user_id)
  const digits = Number(code.replace(/\D/g, ''))
  return Number.isFinite(digits) ? digits : 0
}

const toTitleCase = (value) => {
  const raw = `${value ?? ''}`
  if (!raw.trim()) return raw
  return raw.toLowerCase().replace(/\b[a-z]/g, (match) => match.toUpperCase())
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i

function Admin() {
  const [tab, setTab] = useState('users')
  const [showAddUser, setShowAddUser] = useState(false)
  const [users, setUsers] = useState([])
  const [inactivePatients, setInactivePatients] = useState([])
  const [archivePatients, setArchivePatients] = useState([])
  const [archiveUsers, setArchiveUsers] = useState([])
  const [archiveServices, setArchiveServices] = useState([])
  const [archiveDentalConditions, setArchiveDentalConditions] = useState([])
  const [archiveType, setArchiveType] = useState('patients')
  const [usersPage, setUsersPage] = useState(1)
  const [inactivePage, setInactivePage] = useState(1)
  const [archivePage, setArchivePage] = useState(1)
  const [usersRowsPerPage, setUsersRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [inactiveRowsPerPage, setInactiveRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [archiveRowsPerPage, setArchiveRowsPerPage] = useState(DEFAULT_PAGE_SIZE)
  const [usersPageInput, setUsersPageInput] = useState('1')
  const [inactivePageInput, setInactivePageInput] = useState('1')
  const [archivePageInput, setArchivePageInput] = useState('1')
  const [usersSearchTerm, setUsersSearchTerm] = useState('')
  const [usersSortBy, setUsersSortBy] = useState('staffId')
  const [usersNameSortDirection, setUsersNameSortDirection] = useState('asc')
  const [usersStaffIdSortDirection, setUsersStaffIdSortDirection] = useState('desc')
  const [usersCreatedSortDirection, setUsersCreatedSortDirection] = useState('desc')
  const [usersRoleSortDirection, setUsersRoleSortDirection] = useState('asc')
  const [inactiveSearchTerm, setInactiveSearchTerm] = useState('')
  const [inactiveSortBy, setInactiveSortBy] = useState('patientId')
  const [inactiveNameSortDirection, setInactiveNameSortDirection] = useState('asc')
  const [inactivePatientIdSortDirection, setInactivePatientIdSortDirection] = useState('desc')
  const [inactiveDateSortDirection, setInactiveDateSortDirection] = useState('desc')
  const [archiveSearchTerm, setArchiveSearchTerm] = useState('')
  const [archiveSortBy, setArchiveSortBy] = useState('patientId')
  const [archiveNameSortDirection, setArchiveNameSortDirection] = useState('asc')
  const [archiveIdSortDirection, setArchiveIdSortDirection] = useState('desc')
  const [archiveDateSortDirection, setArchiveDateSortDirection] = useState('desc')
  const [modal, setModal] = useState(null)
  const [selected, setSelected] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [invalidAddUserFields, setInvalidAddUserFields] = useState({})
  const [addUserValidationMessage, setAddUserValidationMessage] = useState('')
  const [isTestingWelcomeEmail, setIsTestingWelcomeEmail] = useState(false)
  const [userForm, setUserForm] = useState({
    user_id: '',
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'receptionist',
    is_active: true,
  })

  const closeModal = () => {
    setModal(null)
    setSelected(null)
    setShowCurrentPassword(false)
  }

  const showSuccess = (message) => {
    setSuccessMessage(message)
    setModal('success')
  }

  const loadUsers = async () => {
    const { data, error: fetchError } = await supabase
      .from('staff_profiles')
      .select('user_id, full_name, email, username, role, is_active, created_at, updated_at')
      .eq('is_active', true)
      .order('created_at', { ascending: true })

    if (fetchError) throw fetchError
    setUsers(data ?? [])
  }

  const loadInactivePatients = async () => {
    const { data, error: fetchError } = await supabase
      .from('patients')
      .select('id, patient_code, first_name, last_name, sex, birth_date, archived_at, created_at')
      .eq('is_active', false)
      .is('archived_at', null)
      .order('updated_at', { ascending: false })

    if (fetchError) throw fetchError
    setInactivePatients(data ?? [])
  }

  const loadArchives = async () => {
    const [patientsRes, usersRes, servicesRes, dentalRes] = await Promise.all([
      supabase
        .from('patients')
        .select('id, patient_code, first_name, last_name, sex, birth_date, archived_at')
        .not('archived_at', 'is', null)
        .order('archived_at', { ascending: false }),
      supabase
        .from('staff_profiles')
        .select('user_id, full_name, email, username, role, is_active, updated_at')
        .eq('is_active', false)
        .order('updated_at', { ascending: false }),
      supabase
        .from('services')
        .select('id, service_name, is_active, updated_at')
        .eq('is_active', false)
        .order('updated_at', { ascending: false }),
      supabase
        .from('tooth_conditions')
        .select('id, code, condition_name, is_active, updated_at')
        .eq('is_active', false)
        .order('updated_at', { ascending: false }),
    ])

    if (patientsRes.error) throw patientsRes.error
    if (usersRes.error) throw usersRes.error
    if (servicesRes.error) throw servicesRes.error
    if (dentalRes.error) throw dentalRes.error

    setArchivePatients(patientsRes.data ?? [])
    setArchiveUsers(usersRes.data ?? [])
    setArchiveServices(servicesRes.data ?? [])
    setArchiveDentalConditions(dentalRes.data ?? [])
  }

  const loadAll = async () => {
    setLoading(true)
    setError('')
    try {
      await Promise.all([loadUsers(), loadInactivePatients(), loadArchives()])
    } catch (fetchError) {
      setError(fetchError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAll()
  }, [])

  useEffect(() => {
    if (archiveType === 'patients' && archiveSortBy === 'staffId') {
      setArchiveSortBy('patientId')
    }
    if (archiveType === 'users' && archiveSortBy === 'patientId') {
      setArchiveSortBy('staffId')
    }
    if ((archiveType === 'services' || archiveType === 'dentalCondition') && (archiveSortBy === 'patientId' || archiveSortBy === 'staffId')) {
      setArchiveSortBy('name')
    }
  }, [archiveSortBy, archiveType])

  const openConfirmArchive = (payload) => {
    setSelected(payload)
    setModal('confirm-archive')
  }

  const openConfirmRetrieve = (payload) => {
    setSelected(payload)
    setModal('confirm-retrieve')
  }

  const openEditUser = (user) => {
    setUserForm({
      user_id: user.user_id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      password: '',
      role: user.role,
      is_active: user.is_active,
    })
    setShowCurrentPassword(false)
    setSelected(user)
    setModal('edit-user')
  }

  const addUser = async () => {
    const fullName = userForm.full_name.trim()
    const email = userForm.email.trim()
    const username = userForm.username.trim()
    const password = userForm.password.trim()
    const role = userForm.role.trim()

    const nextInvalidFields = {}
    if (!fullName) {
      nextInvalidFields.full_name = true
    }
    if (!email) {
      nextInvalidFields.email = true
    }
    if (!username) {
      nextInvalidFields.username = true
    }
    if (!password) {
      nextInvalidFields.password = true
    }
    if (!role) {
      nextInvalidFields.role = true
    }
    setInvalidAddUserFields(nextInvalidFields)

    if (!fullName || !email || !username || !password || !role) {
      setAddUserValidationMessage('Please fill out required fields.')
      setModal('add-user-validation')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setInvalidAddUserFields((previous) => ({ ...previous, email: true }))
      setAddUserValidationMessage('Please enter a valid email address.')
      setModal('add-user-validation')
      return
    }

    const { error: createError } = await supabase.rpc('admin_create_user', {
      p_email: email,
      p_password: userForm.password,
      p_full_name: toTitleCase(fullName),
      p_username: username,
      p_role: role,
    })

    if (createError) {
      setError(createError.message)
      return
    }

    let addUserSuccessMessage = 'Added successfully.'
    try {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token || ''
      if (accessToken) {
        const response = await fetch('/api/auth/admin-send-user-welcome-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ email }),
        })
        const payload = await response.json().catch(() => ({}))

        if (response.ok) {
          addUserSuccessMessage = 'Added successfully. Welcome email sent.'
        } else {
          const reason = payload?.error || 'unknown reason'
          addUserSuccessMessage = `Added successfully, but welcome email was not sent (${reason}).`
        }
      } else {
        addUserSuccessMessage = 'Added successfully, but welcome email was not sent.'
      }
    } catch {
      addUserSuccessMessage = 'Added successfully, but welcome email was not sent.'
    }

    setShowAddUser(false)
    setInvalidAddUserFields({})
    setAddUserValidationMessage('')
    setUserForm({
      user_id: '',
      full_name: '',
      email: '',
      username: '',
      password: '',
      role: 'receptionist',
      is_active: true,
    })
    await loadAll()
    showSuccess(addUserSuccessMessage)
  }

  const sendWelcomeEmailTest = async () => {
    const email = userForm.email.trim().toLowerCase()

    if (!email) {
      setInvalidAddUserFields((previous) => ({ ...previous, email: true }))
      setAddUserValidationMessage('Please fill out required fields.')
      setModal('add-user-validation')
      return
    }

    if (!EMAIL_PATTERN.test(email)) {
      setInvalidAddUserFields((previous) => ({ ...previous, email: true }))
      setAddUserValidationMessage('Please enter a valid email address.')
      setModal('add-user-validation')
      return
    }

    try {
      setIsTestingWelcomeEmail(true)
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token || ''

      if (!accessToken) {
        setAddUserValidationMessage('Unable to verify your session. Please log in again.')
        setModal('add-user-validation')
        return
      }

      const response = await fetch('/api/auth/admin-send-user-welcome-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ email }),
      })
      const payload = await response.json().catch(() => ({}))

      if (!response.ok) {
        setAddUserValidationMessage(payload?.error || 'Unable to send welcome email.')
        setModal('add-user-validation')
        return
      }

      showSuccess(`Test email sent to ${email}.`)
    } catch {
      setAddUserValidationMessage('Unable to send welcome email.')
      setModal('add-user-validation')
    } finally {
      setIsTestingWelcomeEmail(false)
    }
  }

  const saveUserEdit = async () => {
    if (!selected) return
    const nextEmail = userForm.email.trim().toLowerCase()

    if (!nextEmail) {
      setError('Email is required.')
      return
    }

    try {
      const canProceed = await ensureNotLastActiveAdmin({
        targetUserId: selected.user_id,
        nextRole: userForm.role,
        nextIsActive: userForm.is_active,
      })

      if (!canProceed) {
        setError('Cannot deactivate/archive the last active admin account. Add or keep another active admin first.')
        return
      }
    } catch (guardError) {
      setError(guardError.message)
      return
    }

    const { error: updateError } = await supabase.rpc('admin_update_user_profile', {
      p_user_id: selected.user_id,
      p_full_name: toTitleCase(userForm.full_name.trim()),
      p_username: userForm.username.trim(),
      p_role: userForm.role,
      p_is_active: userForm.is_active,
    })

    if (updateError) {
      setError(updateError.message)
      return
    }

    if (nextEmail !== String(selected.email || '').trim().toLowerCase()) {
      const { data: sessionData } = await supabase.auth.getSession()
      const accessToken = sessionData?.session?.access_token || ''
      if (!accessToken) {
        setError('Unable to verify your session. Please log in again.')
        return
      }

      const response = await fetch('/api/auth/admin-update-user-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          userId: selected.user_id,
          email: nextEmail,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(payload?.error || 'Unable to update user email.')
        return
      }
    }

    await loadAll()
    closeModal()
    showSuccess('Updated successfully')
  }

  const confirmArchive = async () => {
    if (!selected) return

    if (selected.kind === 'user') {
      try {
        const canProceed = await ensureNotLastActiveAdmin({
          targetUserId: selected.user_id,
          nextRole: selected.role,
          nextIsActive: false,
        })

        if (!canProceed) {
          setError('Cannot archive the last active admin account. Add or keep another active admin first.')
          closeModal()
          return
        }
      } catch (guardError) {
        setError(guardError.message)
        closeModal()
        return
      }

      const { error: archiveError } = await supabase.rpc('admin_update_user_profile', {
        p_user_id: selected.user_id,
        p_full_name: selected.full_name,
        p_username: selected.username,
        p_role: selected.role,
        p_is_active: false,
      })

      if (archiveError) {
        setError(archiveError.message)
        return
      }

      await loadAll()
      closeModal()
      showSuccess('Archived successfully')
      return
    }

    const { data: authData } = await supabase.auth.getUser()
    const actorId = authData?.user?.id ?? null

    const { error: archiveError } = await supabase
      .from('patients')
      .update({
        is_active: false,
        archived_at: new Date().toISOString(),
        archived_by: actorId,
        updated_by: actorId,
      })
      .eq('id', selected.id)

    if (archiveError) {
      setError(archiveError.message)
      return
    }

    await loadAll()
    closeModal()
    showSuccess('Archived successfully')
  }

  const confirmRetrieve = async () => {
    if (!selected) return

    if (archiveType === 'patients') {
      const { data: authData } = await supabase.auth.getUser()
      const actorId = authData?.user?.id ?? null
      const { error: retrieveError } = await supabase
        .from('patients')
        .update({ is_active: true, archived_at: null, archived_by: null, updated_by: actorId })
        .eq('id', selected.id)

      if (retrieveError) {
        setError(retrieveError.message)
        return
      }
    } else if (archiveType === 'users') {
      const { error: retrieveError } = await supabase.rpc('admin_update_user_profile', {
        p_user_id: selected.user_id,
        p_full_name: selected.full_name,
        p_username: selected.username,
        p_role: selected.role,
        p_is_active: true,
      })

      if (retrieveError) {
        setError(retrieveError.message)
        return
      }
    } else if (archiveType === 'services') {
      const { data: authData } = await supabase.auth.getUser()
      const actorId = authData?.user?.id ?? null
      const { error: retrieveError } = await supabase
        .from('services')
        .update({ is_active: true, updated_by: actorId })
        .eq('id', selected.id)

      if (retrieveError) {
        setError(retrieveError.message)
        return
      }
    } else {
      const { data: authData } = await supabase.auth.getUser()
      const actorId = authData?.user?.id ?? null
      const { error: retrieveError } = await supabase
        .from('tooth_conditions')
        .update({ is_active: true, updated_by: actorId })
        .eq('id', selected.id)

      if (retrieveError) {
        setError(retrieveError.message)
        return
      }
    }

    await loadAll()
    closeModal()
    showSuccess('Retrieved successfully')
  }

  const archiveRows = useMemo(() => {
    if (archiveType === 'patients') return archivePatients
    if (archiveType === 'users') return archiveUsers
    if (archiveType === 'services') return archiveServices
    return archiveDentalConditions
  }, [archiveType, archivePatients, archiveUsers, archiveServices, archiveDentalConditions])

  const filteredUsers = useMemo(() => {
    const query = usersSearchTerm.trim().toLowerCase()
    const source = query
      ? users.filter((row) => (
        row.full_name?.toLowerCase().includes(query)
        || row.username?.toLowerCase().includes(query)
        || row.email?.toLowerCase().includes(query)
        || formatStaffCode(row.user_id).toLowerCase().includes(query)
      ))
      : [...users]

    if (usersSortBy === 'created') {
      const multiplier = usersCreatedSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * multiplier)
    }

    if (usersSortBy === 'staffId') {
      const multiplier = usersStaffIdSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (staffCodeNumber(a) - staffCodeNumber(b)) * multiplier)
    }

    if (usersSortBy === 'role') {
      const multiplier = usersRoleSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => {
        const aRole = ROLE_SORT_ORDER[a.role] ?? Number.MAX_SAFE_INTEGER
        const bRole = ROLE_SORT_ORDER[b.role] ?? Number.MAX_SAFE_INTEGER
        if (aRole !== bRole) return (aRole - bRole) * multiplier
        const aName = `${a.full_name || ''}`.toLowerCase()
        const bName = `${b.full_name || ''}`.toLowerCase()
        return aName.localeCompare(bName)
      })
    }

    return source.sort((a, b) => {
      const aName = `${a.full_name || ''}`.toLowerCase()
      const bName = `${b.full_name || ''}`.toLowerCase()
      return usersNameSortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
    })
  }, [users, usersCreatedSortDirection, usersNameSortDirection, usersRoleSortDirection, usersSearchTerm, usersSortBy, usersStaffIdSortDirection])

  const filteredInactivePatients = useMemo(() => {
    const query = inactiveSearchTerm.trim().toLowerCase()
    const source = query
      ? inactivePatients.filter((row) => (
        `${row.last_name || ''}, ${row.first_name || ''}`.toLowerCase().includes(query)
        || formatPatientCode(row.patient_code, row.id).toLowerCase().includes(query)
      ))
      : [...inactivePatients]

    if (inactiveSortBy === 'inactiveDate') {
      const multiplier = inactiveDateSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (
        (new Date(a.archived_at ?? a.created_at).getTime() - new Date(b.archived_at ?? b.created_at).getTime()) * multiplier
      ))
    }

    if (inactiveSortBy === 'patientId') {
      const multiplier = inactivePatientIdSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (patientCodeNumber(a) - patientCodeNumber(b)) * multiplier)
    }

    return source.sort((a, b) => {
      const aName = `${a.last_name || ''}, ${a.first_name || ''}`.toLowerCase()
      const bName = `${b.last_name || ''}, ${b.first_name || ''}`.toLowerCase()
      return inactiveNameSortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
    })
  }, [
    inactiveDateSortDirection,
    inactiveNameSortDirection,
    inactivePatientIdSortDirection,
    inactivePatients,
    inactiveSearchTerm,
    inactiveSortBy,
  ])

  const filteredArchiveRows = useMemo(() => {
    const query = archiveSearchTerm.trim().toLowerCase()
    const source = query
      ? archiveRows.filter((row) => {
        if (archiveType === 'patients') {
          return (
            `${row.last_name || ''}, ${row.first_name || ''}`.toLowerCase().includes(query)
            || formatPatientCode(row.patient_code, row.id).toLowerCase().includes(query)
          )
        }
        if (archiveType === 'users') {
          return (
            `${row.full_name || ''}`.toLowerCase().includes(query)
            || `${row.username || ''}`.toLowerCase().includes(query)
            || formatStaffCode(row.user_id).toLowerCase().includes(query)
          )
        }
        if (archiveType === 'services') {
          return `${row.service_name || ''}`.toLowerCase().includes(query)
        }
        return (
          `${row.code || ''}`.toLowerCase().includes(query)
          || `${row.condition_name || ''}`.toLowerCase().includes(query)
        )
      })
      : [...archiveRows]

    if (archiveSortBy === 'archiveDate') {
      const multiplier = archiveDateSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (new Date(a.updated_at ?? a.archived_at).getTime() - new Date(b.updated_at ?? b.archived_at).getTime()) * multiplier)
    }

    if (archiveSortBy === 'patientId' && archiveType === 'patients') {
      const multiplier = archiveIdSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (patientCodeNumber(a) - patientCodeNumber(b)) * multiplier)
    }

    if (archiveSortBy === 'staffId' && archiveType === 'users') {
      const multiplier = archiveIdSortDirection === 'asc' ? 1 : -1
      return source.sort((a, b) => (staffCodeNumber(a) - staffCodeNumber(b)) * multiplier)
    }

    return source.sort((a, b) => {
      const aName = archiveType === 'patients'
        ? `${a.last_name || ''}, ${a.first_name || ''}`.toLowerCase()
        : archiveType === 'users'
          ? `${a.full_name || ''}`.toLowerCase()
          : archiveType === 'services'
            ? `${a.service_name || ''}`.toLowerCase()
            : `${a.condition_name || ''}`.toLowerCase()
      const bName = archiveType === 'patients'
        ? `${b.last_name || ''}, ${b.first_name || ''}`.toLowerCase()
        : archiveType === 'users'
          ? `${b.full_name || ''}`.toLowerCase()
          : archiveType === 'services'
            ? `${b.service_name || ''}`.toLowerCase()
            : `${b.condition_name || ''}`.toLowerCase()
      return archiveNameSortDirection === 'asc' ? aName.localeCompare(bName) : bName.localeCompare(aName)
    })
  }, [archiveDateSortDirection, archiveIdSortDirection, archiveNameSortDirection, archiveRows, archiveSearchTerm, archiveSortBy, archiveType])
  const activeAdminCount = useMemo(
    () => users.filter((user) => user.is_active && user.role === 'admin').length,
    [users],
  )

  const ensureNotLastActiveAdmin = async ({ targetUserId, nextRole, nextIsActive }) => {
    const { data: targetUser, error: targetError } = await supabase
      .from('staff_profiles')
      .select('user_id, role, is_active')
      .eq('user_id', targetUserId)
      .maybeSingle()

    if (targetError) throw targetError
    if (!targetUser) return true

    const isCurrentlyActiveAdmin = targetUser.is_active && targetUser.role === 'admin'
    const willRemainActiveAdmin = nextIsActive && nextRole === 'admin'
    if (!isCurrentlyActiveAdmin || willRemainActiveAdmin) return true

    const { count, error: countError } = await supabase
      .from('staff_profiles')
      .select('user_id', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('role', 'admin')

    if (countError) throw countError
    return (count ?? 0) > 1
  }

  const paginateRows = (rows, page, pageSize) => {
    const totalPages = Math.max(1, Math.ceil(rows.length / pageSize))
    const safePage = Math.min(page, totalPages)
    const startIndex = (safePage - 1) * pageSize
    return {
      totalPages,
      safePage,
      startIndex,
      visibleStart: rows.length === 0 ? 0 : startIndex + 1,
      visibleEnd: rows.length === 0 ? 0 : Math.min(startIndex + pageSize, rows.length),
      pageRows: rows.slice(startIndex, startIndex + pageSize),
      pageNumbers: Array.from({ length: totalPages }, (_, index) => index + 1),
    }
  }

  const usersPaging = paginateRows(filteredUsers, usersPage, usersRowsPerPage)
  const inactivePaging = paginateRows(filteredInactivePatients, inactivePage, inactiveRowsPerPage)
  const archivePaging = paginateRows(filteredArchiveRows, archivePage, archiveRowsPerPage)

  const handlePageJump = ({ pageInput, setPageInput, setPage, totalPages, fallbackPage }) => {
    const parsedPage = Number.parseInt(pageInput, 10)
    if (!Number.isFinite(parsedPage)) {
      setPageInput(`${fallbackPage}`)
      return
    }

    const nextPage = Math.min(Math.max(parsedPage, 1), totalPages)
    setPage(nextPage)
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

  const renderPaginationControls = ({ paging, rowsPerPage, setRowsPerPage, setPage, pageInput, setPageInput }) => {
    const pageItems = getVisiblePageItems(paging.safePage, paging.totalPages)

    return (
      <div className="pagination">
      <div className="pagination-group pagination-size-group">
        <label className="page-size-control">
          Rows
          <select
            value={rowsPerPage}
            onChange={(event) => {
              const nextPageSize = Number(event.target.value)
              setRowsPerPage(nextPageSize)
              setPage(1)
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
        <button
          type="button"
          disabled={paging.safePage <= 1}
          onClick={() => {
            const nextPage = Math.max(1, paging.safePage - 1)
            setPage(nextPage)
            setPageInput(`${nextPage}`)
          }}
        >
          Previous
        </button>
        {pageItems.map((item) => (
          typeof item === 'number'
            ? (
              <button
                key={`page-${item}`}
                type="button"
                className={item === paging.safePage ? 'active' : ''}
                onClick={() => {
                  setPage(item)
                  setPageInput(`${item}`)
                }}
              >
                {item}
              </button>
            )
            : <span key={item} className="pagination-ellipsis">...</span>
        ))}
        <button
          type="button"
          disabled={paging.safePage >= paging.totalPages}
          onClick={() => {
            const nextPage = Math.min(paging.totalPages, paging.safePage + 1)
            setPage(nextPage)
            setPageInput(`${nextPage}`)
          }}
        >
          Next
        </button>
      </div>
      <div className="pagination-group pagination-jump-group">
        <form
          className="page-jump-form"
          onSubmit={(event) => {
            event.preventDefault()
            handlePageJump({
              pageInput,
              setPageInput,
              setPage,
              totalPages: paging.totalPages,
              fallbackPage: paging.safePage,
            })
          }}
        >
          <label>
            Page
            <input
              type="number"
              min="1"
              max={paging.totalPages}
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
            />
          </label>
          <button type="submit">Go</button>
        </form>
      </div>
    </div>
    )
  }

  return (
    <>
      <header className="page-header">
        <h1>Admin</h1>
      </header>

      <section className={`panel tabs-panel admin-panel v2 ${showAddUser ? '' : 'fixed-table-page'}`}>
        <div className="panel-tabs large add-patient-tabs compact-tabs admin-tabs">
          <button type="button" className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => { setTab('users'); setShowAddUser(false); setUsersPage(1); setUsersPageInput('1') }}>
            Manage Users
          </button>
          <button type="button" className={`tab ${tab === 'inactive' ? 'active' : ''}`} onClick={() => { setTab('inactive'); setShowAddUser(false); setInactivePage(1); setInactivePageInput('1') }}>
            Inactive List
          </button>
          <button type="button" className={`tab ${tab === 'archive' ? 'active' : ''}`} onClick={() => { setTab('archive'); setShowAddUser(false); setArchivePage(1); setArchivePageInput('1') }}>
            Archive List
          </button>
        </div>

        {error ? <p className="error">{error}</p> : null}
        {loading ? <p>Loading admin data...</p> : null}

        {tab === 'users' && !showAddUser ? (
          <div className="records">
            <div className="records-header">
              <div>
                <h2>Users</h2>
                <div className="records-toolbar">
                  <div className="search-box">
                    <span className="search-icon" aria-hidden />
                    <input
                      type="text"
                      placeholder="Search by Name"
                      value={usersSearchTerm}
                      onChange={(event) => {
                        setUsersSearchTerm(event.target.value)
                        setUsersPage(1)
                        setUsersPageInput('1')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <div className="sorter">
                  <label htmlFor="admin-users-sort">Sort by:</label>
                  <select
                    id="admin-users-sort"
                    value={usersSortBy}
                    onChange={(event) => {
                      setUsersSortBy(event.target.value)
                      setUsersPage(1)
                      setUsersPageInput('1')
                    }}
                  >
                    <option value="name">Name</option>
                    <option value="staffId">Staff ID</option>
                    <option value="role">Role</option>
                    <option value="created">Date Created</option>
                  </select>
                  <button
                    type="button"
                    className="ghost sort-direction-btn"
                    aria-label="Toggle sort direction"
                    onClick={() => {
                      if (usersSortBy === 'created') {
                        setUsersCreatedSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else if (usersSortBy === 'staffId') {
                        setUsersStaffIdSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else if (usersSortBy === 'role') {
                        setUsersRoleSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else {
                        setUsersNameSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      }
                      setUsersPage(1)
                      setUsersPageInput('1')
                    }}
                  >
                    <span className="sort-direction-icon" aria-hidden="true">
                      <span
                        className={`sort-direction-arrow up ${
                          (usersSortBy === 'created'
                            ? usersCreatedSortDirection
                            : usersSortBy === 'staffId'
                              ? usersStaffIdSortDirection
                              : usersSortBy === 'role'
                                ? usersRoleSortDirection
                                : usersNameSortDirection) === 'asc'
                            ? 'active'
                            : ''
                        }`}
                      />
                      <span
                        className={`sort-direction-arrow down ${
                          (usersSortBy === 'created'
                            ? usersCreatedSortDirection
                            : usersSortBy === 'staffId'
                              ? usersStaffIdSortDirection
                              : usersSortBy === 'role'
                                ? usersRoleSortDirection
                                : usersNameSortDirection) === 'desc'
                            ? 'active'
                            : ''
                        }`}
                      />
                    </span>
                  </button>
                </div>
                <button type="button" className="primary" onClick={() => setShowAddUser(true)}>Add User</button>
              </div>
            </div>

            <div className="records-table users-table">
              <div className="table-head">
                <span>Staff ID</span>
                <span>Name</span>
                <span>Username</span>
                <span>Email</span>
                <span>Role</span>
                <span>Date Created</span>
                <span />
              </div>
              <div className="table-body">
                {usersPaging.pageRows.map((row) => (
                  <div key={row.user_id} className="table-row">
                    <span>{formatStaffCode(row.user_id)}</span>
                    <span>{row.full_name}</span>
                    <span>{row.username}</span>
                    <span>{row.email}</span>
                    <span>{ROLE_LABELS[row.role] ?? row.role}</span>
                    <span>{formatDate(row.created_at)}</span>
                    <span className="row-actions">
                      <button type="button" className="icon-btn" onClick={() => openEditUser(row)}>&#9998;</button>
                      {row.is_active ? (
                        <button
                          type="button"
                          className="icon-btn danger"
                          onClick={() => openConfirmArchive({ ...row, kind: 'user' })}
                          disabled={row.role === 'admin' && activeAdminCount <= 1}
                          title={row.role === 'admin' && activeAdminCount <= 1 ? 'At least one active admin must remain.' : 'Archive user'}
                        >
                          &#8681;
                        </button>
                      ) : null}
                    </span>
                  </div>
                ))}
                {!loading && filteredUsers.length === 0 ? <p>No users found.</p> : null}
              </div>
            </div>
            <div className="records-footer">
              <span>Showing {usersPaging.visibleStart}-{usersPaging.visibleEnd} of {filteredUsers.length} entries</span>
              {renderPaginationControls({
                paging: usersPaging,
                rowsPerPage: usersRowsPerPage,
                setRowsPerPage: setUsersRowsPerPage,
                setPage: setUsersPage,
                pageInput: usersPageInput,
                setPageInput: setUsersPageInput,
              })}
            </div>
          </div>
        ) : null}

        {tab === 'users' && showAddUser ? (
          <div className="records add-user-card">
            <div className="records-header">
              <button
                type="button"
                className="ghost"
                onClick={() => {
                  setShowAddUser(false)
                  setInvalidAddUserFields({})
                  setAddUserValidationMessage('')
                }}
              >
                &larr; Back
              </button>
            </div>
            <h2>Add User</h2>
            <form
              noValidate
              onSubmit={(event) => {
                event.preventDefault()
                void addUser()
              }}
            >
              <div className="history-top-grid">
                <label><span className="required-label">Full name<span className="required-asterisk">*</span></span><input className={invalidAddUserFields.full_name ? 'input-error' : ''} type="text" value={userForm.full_name} onChange={(e) => {
                  const nextValue = toTitleCase(e.target.value)
                  setUserForm((p) => ({ ...p, full_name: nextValue }))
                  if (nextValue.trim()) setInvalidAddUserFields((p) => ({ ...p, full_name: false }))
                }} /></label>
                <label><span className="required-label">Email<span className="required-asterisk">*</span></span><input className={invalidAddUserFields.email ? 'input-error' : ''} type="email" value={userForm.email} onChange={(e) => {
                  const nextValue = e.target.value
                  setUserForm((p) => ({ ...p, email: nextValue }))
                  if (EMAIL_PATTERN.test(nextValue.trim())) setInvalidAddUserFields((p) => ({ ...p, email: false }))
                }} /></label>
                <label><span className="required-label">Username<span className="required-asterisk">*</span></span><input className={invalidAddUserFields.username ? 'input-error' : ''} type="text" value={userForm.username} onChange={(e) => {
                  const nextValue = e.target.value
                  setUserForm((p) => ({ ...p, username: nextValue }))
                  if (nextValue.trim()) setInvalidAddUserFields((p) => ({ ...p, username: false }))
                }} /></label>
                <label><span className="required-label">Password<span className="required-asterisk">*</span></span><input className={invalidAddUserFields.password ? 'input-error' : ''} type="password" value={userForm.password} onChange={(e) => {
                  const nextValue = e.target.value
                  setUserForm((p) => ({ ...p, password: nextValue }))
                  if (nextValue.trim()) setInvalidAddUserFields((p) => ({ ...p, password: false }))
                }} /></label>
                <label><span className="required-label">Role<span className="required-asterisk">*</span></span><select className={invalidAddUserFields.role ? 'input-error' : ''} value={userForm.role} onChange={(e) => {
                  const nextValue = e.target.value
                  setUserForm((p) => ({ ...p, role: nextValue }))
                  if (nextValue.trim()) setInvalidAddUserFields((p) => ({ ...p, role: false }))
                }}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
              </div>
              <div className="panel-footer">
                <button type="button" className="ghost wide" onClick={() => { void sendWelcomeEmailTest() }} disabled={isTestingWelcomeEmail}>
                  {isTestingWelcomeEmail ? 'Sending...' : 'Test Email'}
                </button>
                <button type="submit" className="primary wide">Add</button>
              </div>
            </form>
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
                    <input
                      type="text"
                      placeholder="Search by Name"
                      value={inactiveSearchTerm}
                      onChange={(event) => {
                        setInactiveSearchTerm(event.target.value)
                        setInactivePage(1)
                        setInactivePageInput('1')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <div className="sorter">
                  <label htmlFor="admin-inactive-sort">Sort by:</label>
                  <select
                    id="admin-inactive-sort"
                    value={inactiveSortBy}
                    onChange={(event) => {
                      setInactiveSortBy(event.target.value)
                      setInactivePage(1)
                      setInactivePageInput('1')
                    }}
                  >
                    <option value="name">Name</option>
                    <option value="patientId">Patient ID</option>
                    <option value="inactiveDate">Inactive Date</option>
                  </select>
                  <button
                    type="button"
                    className="ghost sort-direction-btn"
                    aria-label="Toggle sort direction"
                    onClick={() => {
                      if (inactiveSortBy === 'inactiveDate') {
                        setInactiveDateSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else if (inactiveSortBy === 'patientId') {
                        setInactivePatientIdSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else {
                        setInactiveNameSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      }
                      setInactivePage(1)
                      setInactivePageInput('1')
                    }}
                  >
                    <span className="sort-direction-icon" aria-hidden="true">
                      <span
                        className={`sort-direction-arrow up ${
                          (inactiveSortBy === 'inactiveDate'
                            ? inactiveDateSortDirection
                            : inactiveSortBy === 'patientId'
                              ? inactivePatientIdSortDirection
                              : inactiveNameSortDirection) === 'asc'
                            ? 'active'
                            : ''
                        }`}
                      />
                      <span
                        className={`sort-direction-arrow down ${
                          (inactiveSortBy === 'inactiveDate'
                            ? inactiveDateSortDirection
                            : inactiveSortBy === 'patientId'
                              ? inactivePatientIdSortDirection
                              : inactiveNameSortDirection) === 'desc'
                            ? 'active'
                            : ''
                        }`}
                      />
                    </span>
                  </button>
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
                {inactivePaging.pageRows.map((row) => (
                  <div key={row.id} className="table-row">
                    <span>{formatPatientCode(row.patient_code, row.id)}</span>
                    <span>{`${row.last_name}, ${row.first_name}`}</span>
                    <span>{row.sex === 'Male' ? 'M' : row.sex === 'Female' ? 'F' : row.sex}</span>
                    <span>{calculateAge(row.birth_date)}</span>
                    <span>{formatDate(row.archived_at ?? row.created_at)}</span>
                    <span><button type="button" className="icon-btn danger" onClick={() => openConfirmArchive({ ...row, kind: 'patient' })}>&#8681;</button></span>
                  </div>
                ))}
                {!loading && filteredInactivePatients.length === 0 ? <p>No inactive patients found.</p> : null}
              </div>
            </div>
            <div className="records-footer">
              <span>Showing {inactivePaging.visibleStart}-{inactivePaging.visibleEnd} of {filteredInactivePatients.length} entries</span>
              {renderPaginationControls({
                paging: inactivePaging,
                rowsPerPage: inactiveRowsPerPage,
                setRowsPerPage: setInactiveRowsPerPage,
                setPage: setInactivePage,
                pageInput: inactivePageInput,
                setPageInput: setInactivePageInput,
              })}
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
                      placeholder="Search by Name"
                      value={archiveSearchTerm}
                      onChange={(event) => {
                        setArchiveSearchTerm(event.target.value)
                        setArchivePage(1)
                        setArchivePageInput('1')
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="records-actions">
                <div className="sorter">
                  <label htmlFor="admin-archive-sort">Sort by:</label>
                  <select
                    id="admin-archive-sort"
                    value={archiveSortBy}
                    onChange={(event) => {
                      setArchiveSortBy(event.target.value)
                      setArchivePage(1)
                      setArchivePageInput('1')
                    }}
                  >
                    <option value="name">Name</option>
                    {archiveType === 'patients' ? <option value="patientId">Patient ID</option> : null}
                    {archiveType === 'users' ? <option value="staffId">Staff ID</option> : null}
                    <option value="archiveDate">Archive Date</option>
                  </select>
                  <button
                    type="button"
                    className="ghost sort-direction-btn"
                    aria-label="Toggle sort direction"
                    onClick={() => {
                      if (archiveSortBy === 'archiveDate') {
                        setArchiveDateSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else if (archiveSortBy === 'patientId' || archiveSortBy === 'staffId') {
                        setArchiveIdSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      } else {
                        setArchiveNameSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'))
                      }
                      setArchivePage(1)
                      setArchivePageInput('1')
                    }}
                  >
                    <span className="sort-direction-icon" aria-hidden="true">
                      <span
                        className={`sort-direction-arrow up ${
                          (archiveSortBy === 'archiveDate'
                            ? archiveDateSortDirection
                            : (archiveSortBy === 'patientId' || archiveSortBy === 'staffId')
                              ? archiveIdSortDirection
                              : archiveNameSortDirection) === 'asc'
                            ? 'active'
                            : ''
                        }`}
                      />
                      <span
                        className={`sort-direction-arrow down ${
                          (archiveSortBy === 'archiveDate'
                            ? archiveDateSortDirection
                            : (archiveSortBy === 'patientId' || archiveSortBy === 'staffId')
                              ? archiveIdSortDirection
                              : archiveNameSortDirection) === 'desc'
                            ? 'active'
                            : ''
                        }`}
                      />
                    </span>
                  </button>
                </div>
                <div className="sorter inline">
                  <label htmlFor="archive-type">Type:</label>
                  <select
                    id="archive-type"
                    value={archiveType}
                    onChange={(e) => {
                      const nextType = e.target.value
                      setArchiveType(nextType)
                      setArchiveSortBy(nextType === 'users' ? 'staffId' : nextType === 'patients' ? 'patientId' : 'name')
                      setArchivePage(1)
                      setArchivePageInput('1')
                    }}
                  >
                    <option value="patients">Patients</option>
                    <option value="users">Users</option>
                    <option value="services">Services</option>
                    <option value="dentalCondition">Dental Condition</option>
                  </select>
                </div>
              </div>
            </div>

            <div
              className={`records-table archive-table ${
                archiveType === 'users' ? 'archive-table-users' : ''
              } ${
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
                    <span>{archiveType === 'patients' ? 'Sex' : 'Username'}</span>
                    <span>{archiveType === 'patients' ? 'Age' : 'Role'}</span>
                    <span>Archive Date</span>
                    <span>Action</span>
                  </>
                ) : null}
              </div>
              <div className="table-body">
                {archivePaging.pageRows.map((row) => (
                  <div key={archiveType === 'users' ? row.user_id : row.id} className="table-row">
                    {archiveType === 'services' ? (
                      <>
                        <span>{row.service_name}</span>
                        <span>{formatDate(row.updated_at)}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                    {archiveType === 'dentalCondition' ? (
                      <>
                        <span>{row.code}</span>
                        <span>{row.condition_name}</span>
                        <span>{formatDate(row.updated_at)}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                    {(archiveType === 'patients' || archiveType === 'users') ? (
                      <>
                        <span>{archiveType === 'patients' ? formatPatientCode(row.patient_code, row.id) : formatStaffCode(row.user_id)}</span>
                        <span>{archiveType === 'patients' ? `${row.last_name}, ${row.first_name}` : row.full_name}</span>
                        <span>{archiveType === 'patients' ? (row.sex === 'Male' ? 'M' : row.sex === 'Female' ? 'F' : row.sex) : row.username}</span>
                        <span>{archiveType === 'patients' ? calculateAge(row.birth_date) : (ROLE_LABELS[row.role] ?? row.role)}</span>
                        <span>{formatDate(archiveType === 'patients' ? row.archived_at : row.updated_at)}</span>
                        <span><button type="button" className="view" onClick={() => openConfirmRetrieve(row)}>Retrieve</button></span>
                      </>
                    ) : null}
                  </div>
                ))}
                {!loading && filteredArchiveRows.length === 0 ? <p>No archived entries found.</p> : null}
              </div>
            </div>
            <div className="records-footer">
              <span>Showing {archivePaging.visibleStart}-{archivePaging.visibleEnd} of {filteredArchiveRows.length} entries</span>
              {renderPaginationControls({
                paging: archivePaging,
                rowsPerPage: archiveRowsPerPage,
                setRowsPerPage: setArchiveRowsPerPage,
                setPage: setArchivePage,
                pageInput: archivePageInput,
                setPageInput: setArchivePageInput,
              })}
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
              <label>Name<input type="text" value={userForm.full_name} onChange={(e) => setUserForm((p) => ({ ...p, full_name: toTitleCase(e.target.value) }))} /></label>
              <label>Email<input type="email" value={userForm.email} onChange={(e) => setUserForm((p) => ({ ...p, email: e.target.value }))} /></label>
              <label>Username<input type="text" value={userForm.username} onChange={(e) => setUserForm((p) => ({ ...p, username: e.target.value }))} /></label>
              <label>
                Current Password
                <div className="admin-current-password-wrap">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={showCurrentPassword ? 'Current password is not available' : '********'}
                    readOnly
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowCurrentPassword((previous) => !previous)}
                    aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                    title={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  >
                    &#128065;
                  </button>
                </div>
              </label>
              <label>Role<select value={userForm.role} onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value }))}>{ROLE_OPTIONS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</select></label>
              <label>Active<select value={userForm.is_active ? 'yes' : 'no'} onChange={(e) => setUserForm((p) => ({ ...p, is_active: e.target.value === 'yes' }))}><option value="yes">Yes</option><option value="no">No</option></select></label>
            </div>
            <div className="modal-actions">
              <button type="button" className="danger-btn" onClick={closeModal}>Cancel</button>
              <button type="button" className="success-btn" onClick={() => { void saveUserEdit() }}>Update</button>
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
              <button type="button" className="success-btn" onClick={() => { void confirmArchive() }}>Yes</button>
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
              <button type="button" className="success-btn" onClick={() => { void confirmRetrieve() }}>Yes</button>
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

      {modal === 'add-user-validation' ? (
        <div className="pr-modal procedures-modal procedures-error-modal add-user-validation-modal">
          <div className="pr-modal-head"><h2>Notice</h2></div>
          <div className="pr-modal-body">
            <p>{addUserValidationMessage || 'Please fill out required fields.'}</p>
            <div className="modal-actions center">
              <button type="button" className="success-btn" onClick={closeModal}>OK</button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default Admin
