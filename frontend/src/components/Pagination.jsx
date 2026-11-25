export default function Pagination({ page, lastPage, onPageChange }) {
  if (lastPage <= 1) return null
  const pages = Array.from({ length: lastPage }, (_, i) => i + 1)
  return (
    <nav className="pagination" aria-label="Pagination">
      {pages.map((number) => (
        <button className={number === page ? 'active' : ''} key={number} onClick={() => onPageChange(number)} type="button">
          {number}
        </button>
      ))}
    </nav>
  )
}
