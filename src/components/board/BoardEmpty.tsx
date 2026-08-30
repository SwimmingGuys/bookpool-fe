import EmptyState from '@/components/ui/EmptyState'
import { getDateBasisLabel, type DateBasis } from '@/lib/dateBasis'

interface BoardEmptyProps {
  query: string
  favoritesOnly: boolean
  // 달력에서 날짜를 고른 경우에만 넘어온다.
  selectedDate?: string | null
  dateBasis?: DateBasis
}

/** 왜 비었는지를 조건에 맞춰 알려준다. '결과 없음' 한 줄로 뭉뚱그리지 않는다. */
export default function BoardEmpty({
  query,
  favoritesOnly,
  selectedDate,
  dateBasis,
}: BoardEmptyProps) {
  let title = '조건에 맞는 공고가 없습니다.'
  if (selectedDate && dateBasis) {
    title = `${selectedDate}이(가) ${getDateBasisLabel(dateBasis)}인 공고가 없습니다.`
  } else if (favoritesOnly) {
    title = '즐겨찾기한 공고가 없습니다.'
  } else if (query) {
    title = `"${query}"에 대한 검색 결과가 없습니다.`
  }

  return (
    <EmptyState
      title={title}
      description="필터나 검색어를 변경해 다시 시도해 보세요."
    />
  )
}
