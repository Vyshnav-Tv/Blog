import { Link } from 'react-router-dom'

export default function PostCard({ post }) {
  const excerpt = post.content?.replace(/<[^>]*>/g, '').slice(0, 140)
  return (
    <article className="post-card">
      {post.featured_image ? (
        <img className="post-card-image" src={post.featured_image} alt="" />
      ) : (
        <div className="post-card-image" aria-hidden="true" />
      )}
      <div className="post-card-body">
        <div className="post-meta">
          <span>{post.author?.name || post.user?.name || 'Guest writer'}</span>
          <span>{post.created_at ? new Date(post.created_at).toLocaleDateString() : 'Today'}</span>
        </div>
        <h3><Link to={`/posts/${post.slug}`} style={{ textDecoration: 'none' }}>{post.title}</Link></h3>
        <p>{excerpt}{excerpt?.length >= 140 ? '...' : ''}</p>
      </div>
    </article>
  )
}
