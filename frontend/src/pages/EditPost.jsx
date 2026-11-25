import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { postService } from '../services/postService'
import getRequestErrorMessage from '../utils/getRequestErrorMessage'

export default function EditPost() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState(null)
  const [featuredImage, setFeaturedImage] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let requestIsCurrent = true

    async function loadPost() {
      try {
        const response = await postService.myPost(id)
        if (requestIsCurrent) setForm(response.data.data)
      } catch (requestError) {
        if (requestIsCurrent) {
          setError(requestError.response?.data?.message || 'Could not load this post.')
        }
      }
    }

    loadPost()

    return () => {
      requestIsCurrent = false
    }
  }, [id])

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setBusy(true)

    try {
      const postData = new FormData()
      postData.append('_method', 'PUT')
      postData.append('title', form.title)
      postData.append('content', form.content)

      if (featuredImage) {
        postData.append('featured_image', featuredImage)
      }

      await postService.update(id, postData)
      navigate('/dashboard')
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to update the post.'))
    } finally {
      setBusy(false)
    }
  }

  if (!form) {
    if (error) return <div className="error">{error}</div>
    return <Loader />
  }
  return (
    <>
      <div className="dashboard-header"><div><span className="eyebrow">Edit story</span><h1>Update post</h1></div></div>
      <form className="auth-card" style={{ width: '100%', maxWidth: 760 }} onSubmit={submit}>
        {error && <div className="error">{error}</div>}
        <div className="form-group"><label htmlFor="title">Title</label><input className="input" id="title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div className="form-group"><label htmlFor="content">Content</label><textarea className="textarea" id="content" required value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
        {form.featured_image && (
          <div className="form-group">
            <label>Current featured image</label>
            <img className="post-card-image" src={form.featured_image} alt="Current featured image" />
          </div>
        )}
        <div className="form-group">
          <label htmlFor="featured-image">Replace featured image</label>
          <input
            id="featured-image"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => setFeaturedImage(event.target.files?.[0] || null)}
          />
        </div>
        <div className="form-actions"><button className="btn btn-primary" disabled={busy} type="submit">{busy ? 'Saving...' : 'Save changes'}</button><button className="btn btn-outline" type="button" onClick={() => navigate('/dashboard')}>Cancel</button></div>
      </form>
    </>
  )
}
