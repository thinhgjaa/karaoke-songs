import TagManager from '../components/TagManager'

export default function MoodsPage() {
  return (
    <TagManager
      table="moods"
      pageTitle="Quản lý"
      gradientWord="Tâm trạng"
      hint="Ví dụ: Sôi động, Trầm lắng, Tình cảm, Vui nhộn…"
      accent="pink"
    />
  )
}
