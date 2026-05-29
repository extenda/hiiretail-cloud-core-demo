import type { PageInfoDto } from '../api/client'

interface Props {
  page: PageInfoDto | undefined
  onPageChange: (skip: number) => void
}

export function Pagination({ page, onPageChange }: Props) {
  if (!page) return null
  const currentPage = Math.floor(page.skip / page.take) + 1
  const canPrev = page.skip > 0
  const canNext = page.hasMore

  return (
    <div className="flex items-center justify-between border-t border-slate-200 px-1 pt-3 text-sm">
      <span className="text-slate-500">
        Page {currentPage} · showing {page.take} per page
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={!canPrev}
          onClick={() => onPageChange(Math.max(0, page.skip - page.take))}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={!canNext}
          onClick={() => onPageChange(page.skip + page.take)}
          className="rounded-md border border-slate-300 px-3 py-1 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
