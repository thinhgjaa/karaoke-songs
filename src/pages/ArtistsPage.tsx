import TagManager from '../components/TagManager'

export default function ArtistsPage() {
  return (
    <TagManager
      table="artists"
      pageTitle="Quản lý"
      gradientWord="Ca sĩ"
      hint="Ví dụ: Sơn Tùng M-TP, Mỹ Tâm, Đen Vâu…"
      accent="sky"
    />
  )
}
