import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import { postService } from '../services/postService'

export default function UserDashboard() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)

  useEffect(() => {
    let requestIsCurrent = true

    async function loadPosts() {
      setLoading(true)
      setError('')

      try {
        const response = await postService.myPosts({ search, page })
        if (!requestIsCurrent) return

        setPosts(response.data.data)
        setLastPage(response.data.meta.last_page)
      } catch (requestError) {
        if (requestIsCurrent) {
          setPosts([])
          setError(requestError.response?.data?.message || 'Could not load your posts.')
        }
      } finally {
        if (requestIsCurrent) setLoading(false)
      }
    }

    loadPosts()

    return () => {
      requestIsCurrent = false
    }
  }, [search, page])

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return

    try {
      await postService.remove(id)
      setPosts((currentPosts) => currentPosts.filter((post) => post.id !== id))
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Could not delete the post.')
    }
  }

  return (
    <>
      <div className="dashboard-header"><div><span className="eyebrow">Workspace</span><h1>My posts</h1></div><Link className="btn btn-primary" to="/dashboard/posts/new">New post</Link></div>
      <div className="toolbar"><input className="input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search your posts" /></div>
      {loading ? <Loader /> : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          {posts.length ? (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead>
                <tbody>{posts.map((post) => (
                  <tr key={post.id}>
                    <td><strong>{post.title}</strong></td>
                    <td><span className={`status ${post.status}`}>{post.status || 'enabled'}</span></td>
                    <td>{post.updated_at ? new Date(post.updated_at).toLocaleDateString() : '-'}</td>
                    <td><div className="actions"><Link className="btn btn-outline btn-sm" to={`/dashboard/posts/${post.id}/edit`}>Edit</Link><button className="btn btn-danger btn-sm" type="button" onClick={() => remove(post.id)}>Delete</button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : <div className="empty">You have no posts yet. <Link to="/dashboard/posts/new">Create one</Link>.</div>}
          <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
        </>
      )}
    </>
  )
}
