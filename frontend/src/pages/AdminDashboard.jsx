import { useEffect, useState } from 'react'
import Loader from '../components/Loader'
import Pagination from '../components/Pagination'
import { postService } from '../services/postService'

export default function AdminDashboard() {
  const [posts, setPosts] = useState([])
  const [stats, setStats] = useState({ users: 0, posts: 0, enabled: 0 })
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [reload, setReload] = useState(0)
  const [error, setError] = useState('')

  useEffect(() => {
    let requestIsCurrent = true

    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const dashboardResponse = await postService.adminDashboard()
        const postsResponse = await postService.adminPosts({ search, status, page })

        if (!requestIsCurrent) return

        setStats(dashboardResponse.data.stats)
        setPosts(postsResponse.data.data)
        setLastPage(postsResponse.data.meta.last_page)
      } catch (requestError) {
        if (requestIsCurrent) {
          setPosts([])
          setError(requestError.response?.data?.message || 'Could not load the admin dashboard.')
        }
      } finally {
        if (requestIsCurrent) setLoading(false)
      }
    }

    loadDashboard()

    return () => {
      requestIsCurrent = false
    }
  }, [search, status, page, reload])

  const moderate = async (post) => {
    try {
      if (post.status === 'disabled') {
        await postService.enable(post.id)
      } else {
        await postService.disable(post.id)
      }
      setReload((currentReload) => currentReload + 1)
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to update post status.')
    }
  }

  return (
    <>
      <div className="dashboard-header"><div><span className="eyebrow">Administration</span><h1>Dashboard</h1></div></div>
      <div className="stats">
        <div className="stat-card"><strong>{stats.users || 0}</strong><span>Total users</span></div>
        <div className="stat-card"><strong>{stats.posts || 0}</strong><span>Total posts</span></div>
        <div className="stat-card"><strong>{stats.enabled || 0}</strong><span>Enabled posts</span></div>
      </div>
      <div className="toolbar">
        <input className="input" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search title or author" />
        <select className="select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }}>
          <option value="">All statuses</option><option value="enabled">Enabled</option><option value="disabled">Disabled</option>
        </select>
      </div>
      {loading ? <Loader /> : error ? (
        <div className="error">{error}</div>
      ) : (
        <>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Post</th><th>Author</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>{posts.map((post) => (
                <tr key={post.id}>
                  <td><strong>{post.title}</strong></td>
                  <td>{post.author?.name || post.user?.name || '-'}</td>
                  <td><span className={`status ${post.status}`}>{post.status}</span></td>
                  <td><div className="actions">
                    {post.status === 'disabled' ? <button className="btn btn-primary btn-sm" type="button" onClick={() => moderate(post)}>Enable</button> : <button className="btn btn-outline btn-sm" type="button" onClick={() => moderate(post)}>Disable</button>}
                  </div></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {!posts.length && <div className="empty">No posts match these filters.</div>}
          <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
        </>
      )}
    </>
  )
}
