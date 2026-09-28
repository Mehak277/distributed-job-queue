import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({ page, totalPages, onPageChange }) {
  return <div className="pagination">
    <span>Page <strong>{page}</strong> of <strong>{totalPages}</strong></span>
    <div className="pagination-actions">
      <button className="button button-secondary" onClick={() => onPageChange(page - 1)} disabled={page <= 1}><ChevronLeft size={15} />Previous</button>
      <button className="button button-secondary" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages}>Next<ChevronRight size={15} /></button>
    </div>
  </div>;
}