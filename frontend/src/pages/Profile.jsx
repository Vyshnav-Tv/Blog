import { useEffect, useState } from 'react'
import useAuth from '../context/useAuth'
import { profileService } from '../services/profileService'

export default function Profile() {
  const { user, saveUser } = useAuth()
  const [form, setForm] = useState({ name: user?.name || '', description: user?.description || '', profile_image: null })
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let requestIsCurrent = true

    async function loadProfile() {
      try {
        const response = await profileService.get()
        const profile = response.data.data

        if (requestIsCurrent) {
          setForm({
            name: profile.name || '',
            description: profile.description || '',
            profile_image: null,
          })
        }
      } catch (requestError) {
        if (requestIsCurrent) {
          setError(requestError.response?.data?.message || 'Could not load your profile.')
        }
      }
    }

    loadProfile()

    return () => {
      requestIsCurrent = false
    }
  }, [])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setSaved(false)

    try {
      const profileData = new FormData()
      profileData.append('_method', 'PUT')
      profileData.append('name', form.name)
      profileData.append('description', form.description || '')

      if (form.profile_image) {
        profileData.append('profile_image', form.profile_image)
      }

      const response = await profileService.update(profileData)
      const profile = response.data.data
      saveUser(profile)
      setSaved(true)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update profile.')
    }
  }

  return (
    <>
      <div className="dashboard-header"><div><span className="eyebrow">Account</span><h1>Profile</h1></div></div>
      <form className="profile-grid" onSubmit={submit}>
        <div><div className="avatar" aria-label="Profile image" /><input style={{ marginTop: 12 }} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, profile_image: e.target.files?.[0] || null })} /></div>
        <div className="auth-card" style={{ width: '100%' }}>
          {error && <div className="error">{error}</div>}
          {saved && <div style={{ color: '#404040', marginBottom: 14 }}>Profile updated successfully.</div>}
          <div className="form-group"><label htmlFor="profile-name">Name</label><input className="input" id="profile-name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="form-group"><label htmlFor="bio">Description / Bio</label><textarea className="textarea" id="bio" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <button className="btn btn-primary" type="submit">Save profile</button>
        </div>
      </form>
    </>
  )
}
