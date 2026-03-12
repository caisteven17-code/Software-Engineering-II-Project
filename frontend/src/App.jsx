import { useCallback, useEffect, useRef, useState } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import Sidebar from './components/Sidebar'
import Login from './pages/Login'
import Home from './pages/Home'
import PatientRecords from './pages/PatientRecords'
import PatientRecordDetails from './pages/PatientRecordDetails'
import AddPatient from './pages/AddPatient'
import Procedures from './pages/Procedures'
import PatientLogs from './pages/PatientLogs'
import Admin from './pages/Admin'
import ResetPassword from './pages/ResetPassword'
import { isAccessTokenExpired, missingSupabaseEnv, supabase } from './lib/supabaseClient'

const ADD_PATIENT_DRAFT_KEY = 'dent22.addPatientDraft.v1'

function LoginRoute({
  onLogin,
  form,
  error,
  showPassword,
  onChange,
  onTogglePassword,
  forgotUsername,
  forgotCode,
  forgotNewPassword,
  forgotConfirmPassword,
  forgotStep,
  forgotError,
  forgotSuccess,
  isVerifyingCode,
  isSendingReset,
  isResettingPassword,
  onForgotUsernameChange,
  onForgotCodeChange,
  onForgotNewPasswordChange,
  onForgotConfirmPasswordChange,
  onForgotSubmit,
  onForgotVerifyCode,
  onForgotResetPassword,
  onForgotClose,
}) {
  return (
    <Login
      form={form}
      error={error}
      showPassword={showPassword}
      onChange={onChange}
      onSubmit={onLogin}
      onTogglePassword={onTogglePassword}
      forgotUsername={forgotUsername}
      forgotCode={forgotCode}
      forgotNewPassword={forgotNewPassword}
      forgotConfirmPassword={forgotConfirmPassword}
      forgotStep={forgotStep}
      forgotError={forgotError}
      forgotSuccess={forgotSuccess}
      isVerifyingCode={isVerifyingCode}
      isSendingReset={isSendingReset}
      isResettingPassword={isResettingPassword}
      onForgotUsernameChange={onForgotUsernameChange}
      onForgotCodeChange={onForgotCodeChange}
      onForgotNewPasswordChange={onForgotNewPasswordChange}
      onForgotConfirmPasswordChange={onForgotConfirmPasswordChange}
      onForgotSubmit={onForgotSubmit}
      onForgotVerifyCode={onForgotVerifyCode}
      onForgotResetPassword={onForgotResetPassword}
      onForgotClose={onForgotClose}
    />
  )
}

function ProtectedLayout({ onLogout, navItems, role, profile }) {
  return (
    <div className="dashboard">
      <Sidebar onLogout={onLogout} navItems={navItems} />
      <main className="dashboard-main">
        <Routes>
          <Route path="/home" element={<Home currentProfile={profile} />} />
          <Route path="/records" element={<PatientRecords />} />
          <Route path="/records/:id" element={<PatientRecordDetails currentRole={role} currentProfile={profile} />} />
          <Route path="/add-patient" element={<AddPatient />} />
          <Route path="/procedure" element={<Procedures />} />
          <Route path="/logs" element={<PatientLogs />} />
          {role === 'admin' ? <Route path="/admin" element={<Admin currentProfile={profile} />} /> : <Route path="/admin" element={<Navigate to="/home" replace />} />}
          <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function AppRoutes() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [navItems, setNavItems] = useState([])
  const [isBootstrapping, setIsBootstrapping] = useState(() => Boolean(supabase))
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [form, setForm] = useState({ username: '', password: '' })
  const [forgotUsername, setForgotUsername] = useState('')
  const [forgotCode, setForgotCode] = useState('')
  const [forgotNewPassword, setForgotNewPassword] = useState('')
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('')
  const [forgotStep, setForgotStep] = useState('request')
  const [forgotError, setForgotError] = useState('')
  const [forgotSuccess, setForgotSuccess] = useState('')
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [isSendingReset, setIsSendingReset] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const [forgotAccessToken, setForgotAccessToken] = useState('')
  const [forgotRefreshToken, setForgotRefreshToken] = useState('')
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)
  const profileUserIdRef = useRef(null)
  const location = useLocation()
  const navigate = useNavigate()

  const loadAccessContext = useCallback(async (userId) => {
    if (!supabase) return false

    const { data: profileData, error: profileError } = await supabase
      .from('staff_profiles')
      .select('user_id, full_name, role, is_active')
      .eq('user_id', userId)
      .maybeSingle()

    if (profileError || !profileData || !profileData.is_active) {
      profileUserIdRef.current = null
      setProfile(null)
      setNavItems([])
      setError('Account is not provisioned for system access.')
      return false
    }

    const { data: navigationData, error: navigationError } = await supabase.rpc('allowed_navigation')
    if (navigationError) {
      profileUserIdRef.current = null
      setProfile(null)
      setNavItems([])
      setError('Unable to load role navigation.')
      return false
    }

    profileUserIdRef.current = profileData.user_id
    setProfile(profileData)
    setNavItems((navigationData ?? []).map((row) => ({
      id: row.item_key,
      label: row.label,
      path: row.path,
    })))
    setError('')
    return true
  }, [])

  useEffect(() => {
    if (!supabase) return undefined

    let isMounted = true

    const clearAuthState = () => {
      profileUserIdRef.current = null
      setSession(null)
      setProfile(null)
      setNavItems([])
      setForm({ username: '', password: '' })
      setShowPassword(false)
      setForgotUsername('')
      setForgotCode('')
      setForgotNewPassword('')
      setForgotConfirmPassword('')
      setForgotStep('request')
      setForgotError('')
      setForgotSuccess('')
      setIsVerifyingCode(false)
      setIsSendingReset(false)
      setIsResettingPassword(false)
      setForgotAccessToken('')
      setForgotRefreshToken('')
      setIsLogoutModalOpen(false)
      sessionStorage.removeItem(ADD_PATIENT_DRAFT_KEY)
    }

    const syncSession = async (
      nextSession,
      options = { showLoading: false, forceContextRefresh: false },
    ) => {
      if (!isMounted) return
      const { showLoading, forceContextRefresh } = options

      if (showLoading) setIsBootstrapping(true)

      if (!nextSession) {
        clearAuthState()
        if (isMounted) setIsBootstrapping(false)
        return
      }

      setSession(nextSession)

      const userId = nextSession.user.id
      const shouldRefreshAccessContext = forceContextRefresh || profileUserIdRef.current !== userId

      if (shouldRefreshAccessContext) {
        const hasAccess = await loadAccessContext(userId)
        if (!hasAccess) {
          if (showLoading && isMounted) setIsBootstrapping(false)
          clearAuthState()
          setError('Account is not provisioned for system access.')
          await supabase.auth.signOut()
          return
        }
      }

      if (isMounted && showLoading) {
        setIsBootstrapping(false)
      }
    }

    const initializeSession = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) {
        setError('Unable to initialize session.')
        setIsBootstrapping(false)
        return
      }
      await syncSession(data.session, { showLoading: true, forceContextRefresh: true })
    }

    void initializeSession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (!isMounted) return

      if (event === 'INITIAL_SESSION') return

      if (event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        setSession(nextSession)
        return
      }

      void syncSession(nextSession, {
        showLoading: false,
        forceContextRefresh: event === 'SIGNED_IN',
      })
    })

    return () => {
      isMounted = false
      listener.subscription.unsubscribe()
    }
  }, [loadAccessContext])

  useEffect(() => {
    if (!supabase || !session) return undefined

    let isMounted = true

    const validateSessionToken = async () => {
      if (document.visibilityState !== 'visible') return

      const { data, error: sessionError } = await supabase.auth.getSession()

      if (!isMounted) return

      if (sessionError) {
        setError('Session validation failed. Please login again.')
        await supabase.auth.signOut()
        return
      }

      const accessToken = data.session?.access_token
      if (!data.session || !accessToken || isAccessTokenExpired(accessToken)) {
        setError('Session token expired. Please login again.')
        await supabase.auth.signOut()
      }
    }

    const handleVisibilityChange = () => {
      void validateSessionToken()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    const tokenCheckTimer = window.setInterval(() => {
      void validateSessionToken()
    }, 60000)

    return () => {
      isMounted = false
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.clearInterval(tokenCheckTimer)
    }
  }, [session])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleForgotUsernameChange = (event) => {
    setForgotUsername(event.target.value)
    setForgotError('')
    setForgotSuccess('')
  }

  const handleForgotCodeChange = (event) => {
    setForgotCode(event.target.value)
    setForgotError('')
    setForgotSuccess('')
  }

  const handleForgotNewPasswordChange = (event) => {
    setForgotNewPassword(event.target.value)
    setForgotError('')
    setForgotSuccess('')
  }

  const handleForgotConfirmPasswordChange = (event) => {
    setForgotConfirmPassword(event.target.value)
    setForgotError('')
    setForgotSuccess('')
  }

  const handleForgotClose = () => {
    setForgotUsername('')
    setForgotCode('')
    setForgotNewPassword('')
    setForgotConfirmPassword('')
    setForgotStep('request')
    setForgotError('')
    setForgotSuccess('')
    setIsVerifyingCode(false)
    setIsSendingReset(false)
    setIsResettingPassword(false)
    setForgotAccessToken('')
    setForgotRefreshToken('')
  }

  const handleForgotSubmit = async (event) => {
    event.preventDefault()

    const username = forgotUsername.trim()
    if (!username) {
      setForgotError('Please enter your username.')
      setForgotSuccess('')
      return
    }

    setIsSendingReset(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const redirectTo = `${window.location.origin}/reset-password`
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: username,
          redirectTo,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setForgotError(payload?.error || 'Unable to send reset email. Please try again.')
        setIsSendingReset(false)
        return
      }

      setForgotStep('verify')
      setForgotSuccess('Verification code sent. Check your email inbox.')
      setIsSendingReset(false)
    } catch {
      setForgotError('Unable to send verification code. Please try again.')
      setIsSendingReset(false)
    }
  }

  const handleForgotVerifyCode = async (event) => {
    event.preventDefault()

    const username = forgotUsername.trim()
    const code = forgotCode.trim()

    if (!username || !code) {
      setForgotError('Enter your username/email and verification code.')
      return
    }

    setIsVerifyingCode(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const response = await fetch('/api/auth/verify-reset-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: username,
          code,
        }),
      })

      const payload = await response.json().catch(() => ({}))
      if (!response.ok) {
        setForgotError(payload?.error || 'Invalid or expired verification code.')
        setIsVerifyingCode(false)
        return
      }

      const accessToken = payload?.session?.access_token || ''
      const refreshToken = payload?.session?.refresh_token || ''
      if (!accessToken || !refreshToken) {
        setForgotError('Verification succeeded, but no active session was returned. Please request a new code.')
        setIsVerifyingCode(false)
        return
      }

      setForgotAccessToken(accessToken)
      setForgotRefreshToken(refreshToken)
      setForgotStep('reset')
      setForgotSuccess('Code verified. You can now set a new password.')
      setIsVerifyingCode(false)
    } catch {
      setForgotError('Unable to verify code. Please try again.')
      setIsVerifyingCode(false)
    }
  }

  const handleForgotResetPassword = async (event) => {
    event.preventDefault()

    const newPassword = forgotNewPassword.trim()
    const confirmPassword = forgotConfirmPassword.trim()

    if (!forgotAccessToken || !forgotRefreshToken) {
      setForgotError('Verification session expired. Please request a new code.')
      setForgotStep('request')
      return
    }

    if (!newPassword || !confirmPassword) {
      setForgotError('Please enter and confirm your new password.')
      return
    }

    if (newPassword.length < 8) {
      setForgotError('Password must be at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match.')
      return
    }

    setIsResettingPassword(true)
    setForgotError('')
    setForgotSuccess('')

    try {
      const updatePasswordWithToken = async (accessToken) => {
        const response = await fetch('/api/auth/update-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            newPassword,
          }),
        })
        const payload = await response.json().catch(() => ({}))
        return { response, payload }
      }

      let activeAccessToken = forgotAccessToken
      let { response, payload } = await updatePasswordWithToken(activeAccessToken)

      if (!response.ok && String(payload?.error || '').toLowerCase().includes('auth session missing')) {
        const refreshResponse = await fetch('/api/auth/refresh-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: forgotRefreshToken,
          }),
        })
        const refreshPayload = await refreshResponse.json().catch(() => ({}))
        if (refreshResponse.ok && refreshPayload?.session?.access_token && refreshPayload?.session?.refresh_token) {
          activeAccessToken = refreshPayload.session.access_token
          setForgotAccessToken(refreshPayload.session.access_token)
          setForgotRefreshToken(refreshPayload.session.refresh_token)
          ;({ response, payload } = await updatePasswordWithToken(activeAccessToken))
        }
      }

      if (!response.ok) {
        setForgotError(payload?.error || 'Unable to update password.')
        setIsResettingPassword(false)
        return
      }

      setForgotStep('done')
      setForgotCode('')
      setForgotNewPassword('')
      setForgotConfirmPassword('')
      setForgotAccessToken('')
      setForgotRefreshToken('')
      setForgotSuccess('Password updated successfully. You can now log in.')
      setIsResettingPassword(false)
    } catch {
      setForgotError('Unable to update password.')
      setIsResettingPassword(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!supabase) return

    const loginInput = form.username.trim()
    if (!loginInput || !form.password) {
      setError('Please enter username/email and password.')
      return
    }

    const { data: resolvedEmail, error: resolveError } = await supabase.rpc('resolve_login_email', {
      p_username: loginInput,
    })

    const fallbackEmail = loginInput.includes('@') ? loginInput : ''
    const emailForLogin = resolvedEmail || fallbackEmail

    if (resolveError && !emailForLogin) {
      setError('Unable to resolve login account.')
      return
    }

    if (!emailForLogin) {
      setError('Incorrect username or password.')
      return
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: emailForLogin,
      password: form.password,
    })

    if (signInError) {
      setError('Incorrect username or password.')
      return
    }

    setError('')
    navigate('/home', { replace: true })
  }

  const handleLogoutRequest = () => {
    setIsLogoutModalOpen(true)
  }

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false)
  }

  const handleLogoutConfirm = async () => {
    if (!supabase) return

    setIsLogoutModalOpen(false)

    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      setError(signOutError.message)
      return
    }

    setProfile(null)
    setNavItems([])
    setForm({ username: '', password: '' })
    setShowPassword(false)
    sessionStorage.removeItem(ADD_PATIENT_DRAFT_KEY)
    navigate('/login', { replace: true })
  }

  if (isBootstrapping) {
    return <div className="app-loading">Loading...</div>
  }

  if (!supabase) {
    return (
      <div className="app-loading">
        Missing frontend env vars: {missingSupabaseEnv.join(', ')}. Create `frontend/.env`.
      </div>
    )
  }

  const isAuthed = Boolean(session && profile?.is_active)
  const isResetPasswordRoute = location.pathname === '/reset-password'

  if (!isAuthed && location.pathname !== '/login' && !isResetPasswordRoute) {
    return <Navigate to="/login" replace />
  }

  if (isAuthed && location.pathname === '/login') {
    return <Navigate to="/home" replace />
  }

  return (
    <>
      <Routes>
        <Route
          path="/login"
          element={
            <LoginRoute
              onLogin={handleSubmit}
              form={form}
              error={error}
              showPassword={showPassword}
              onChange={handleChange}
              onTogglePassword={() => setShowPassword((prev) => !prev)}
              forgotUsername={forgotUsername}
              forgotCode={forgotCode}
              forgotNewPassword={forgotNewPassword}
              forgotConfirmPassword={forgotConfirmPassword}
              forgotStep={forgotStep}
              forgotError={forgotError}
              forgotSuccess={forgotSuccess}
              isVerifyingCode={isVerifyingCode}
              isSendingReset={isSendingReset}
              isResettingPassword={isResettingPassword}
              onForgotUsernameChange={handleForgotUsernameChange}
              onForgotCodeChange={handleForgotCodeChange}
              onForgotNewPasswordChange={handleForgotNewPasswordChange}
              onForgotConfirmPasswordChange={handleForgotConfirmPasswordChange}
              onForgotSubmit={handleForgotSubmit}
              onForgotVerifyCode={handleForgotVerifyCode}
              onForgotResetPassword={handleForgotResetPassword}
              onForgotClose={handleForgotClose}
            />
          }
        />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/*" element={<ProtectedLayout onLogout={handleLogoutRequest} navItems={navItems} role={profile?.role} profile={profile} />} />
      </Routes>

      {isLogoutModalOpen ? (
        <>
          <div className="modal-backdrop" onClick={closeLogoutModal} />
          <section className="logout-confirm-modal" role="dialog" aria-modal="true" aria-labelledby="logout-confirm-title">
            <div className="pr-modal-head"><h2 id="logout-confirm-title">Logout</h2></div>
            <div className="pr-modal-body">
              <p>Are you sure you want to logout?</p>
              <div className="modal-actions">
                <button type="button" className="danger-btn" onClick={closeLogoutModal}>Cancel</button>
                <button type="button" className="success-btn" onClick={() => { void handleLogoutConfirm() }}>Logout</button>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  )
}

export default App
