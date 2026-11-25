import { useEffect, useState } from 'react'
import PostCard from '../components/PostCard'
import Pagination from '../components/Pagination'
import Loader from '../components/Loader'
import { postService } from '../services/postService'

export default function Home() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
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
        const response = await postService.publicList({ search, page })
        if (!requestIsCurrent) return

        setPosts(response.data.data)
        setLastPage(response.data.meta.last_page)
      } catch (requestError) {
        if (requestIsCurrent) {
          setPosts([])
          setError(requestError.response?.data?.message || 'Could not load stories.')
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

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="eyebrow">Ideas, culture, and craft</span>
          <h1>Stories worth your attention.</h1>
          <form className="search-row" onSubmit={(event) => { event.preventDefault(); setPage(1) }}>
            <input className="input" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search stories" aria-label="Search stories" />
            <button className="btn btn-primary" type="submit">Search</button>
          </form>
        </div>
      </section>
      <section className="posts-section">
        <div className="container">
          <div className="section-heading"><h2>Latest stories</h2><span className="eyebrow">{posts.length} articles</span></div>
          {loading ? <Loader /> : error ? (
            <div className="error">{error}</div>
          ) : posts.length ? (
            <>
              <div className="post-grid">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
              <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
            </>
          ) : <div className="empty">No stories found.</div>}
        </div>
      </section>
    </>
  )
}
