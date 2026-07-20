import TagManager from '../components/TagManager'

export default function GenresPage() {
  return (
    <TagManager
      table="genres"
      pageTitle="Quản lý"
      gradientWord="Thể loại"
      hint="Ví dụ: Nhạc trẻ, Bolero, Nhạc vàng, Remix, Rap…"
      accent="violet"
    />
  )
}
