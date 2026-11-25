import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { postService } from '../services/postService'

export default function CreatePost() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', featured_image: null })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (event) => {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const postData = new FormData()
      postData.append('title', form.title)
      postData.append('content', form.content)

      if (form.featured_image) {
        postData.append('featured_image', form.featured_image)
      }

      await postService.create(postData)
      navigate('/dashboard')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to create the post.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <div className="dashboard-header"><div><span className="eyebrow">New story</span><h1>Create post</h1></div></div>
      <form className="auth-card" style={{ width: '100%', maxWidth: 760 }} onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <div className="form-group"><label htmlFor="title">Title</label><input className="input" id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="content">Content</label><textarea className="textarea" id="content" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="image">Featured image</label><input id="image" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setForm({ ...form, featured_image: e.target.files?.[0] || null })} /></div>
        <div className="form-actions"><button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'Publishing...' : 'Publish post'}</button><button className="btn btn-outline" type="button" onClick={() => navigate('/dashboard')}>Cancel</button></div>
      </form>
    </>
  )
}
