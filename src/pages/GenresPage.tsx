import TagManager from '../components/TagManager'

export default function GenresPage() {
  return (
    <TagManager
      table="genres"
      pageTitle="Quản lý"
      gradientWord="Thể loại"
      hint="Ví dụ: Nhạc Trẻ, Bolero, Nhạc Vàng, Remix, Rap…"
      accent="violet"
    />
  )
}
