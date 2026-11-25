import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Loader from '../components/Loader'
import { postService } from '../services/postService'

export default function PostDetails() {
  const { slug } = useParams()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let requestIsCurrent = true

    async function loadPost() {
      setLoading(true)
      setError('')

      try {
        const response = await postService.publicDetail(slug)
        if (requestIsCurrent) setPost(response.data.data)
      } catch (requestError) {
        if (requestIsCurrent) {
          setPost(null)
          setError(requestError.response?.data?.message || 'This story is unavailable or has been disabled.')
        }
      } finally {
        if (requestIsCurrent) setLoading(false)
      }
    }

    loadPost()

    return () => {
      requestIsCurrent = false
    }
  }, [slug])

  if (loading) return <Loader />
  if (!post) return <div className="empty">{error || 'This story is unavailable or has been disabled.'}</div>
  return (
    <article className="post-detail">
      <span className="eyebrow">Essay</span>
      <h1>{post.title}</h1>
      <div className="post-meta">
        <span>By {post.author?.name || post.user?.name || 'Guest writer'}</span>
        <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : ''}</span>
      </div>
      {post.featured_image && <img className="post-detail-image" src={post.featured_image} alt="" />}
      <div className="post-content">{post.content}</div>
    </article>
  )
}
