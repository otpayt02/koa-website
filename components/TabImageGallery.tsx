import { CursorGlareImage } from "./ui/CursorGlareImage";

const labels = {
  about: ["Community planning", "Shared history", "A national network"],
  programs: ["Civic learning", "Language navigation", "Practical support"],
  stories: ["Oral history", "Family memory", "Community voice"],
  impact: ["Public voice", "Community feedback", "Knowledge carried forward"],
  contact: ["A navigator listens", "A welcoming door", "A direct connection"],
  build: ["Shape an idea", "Make it together", "Test what comes next"],
} as const;

export function TabImageGallery({ tab }: { tab: keyof typeof labels }) {
  return <section className={`tab-image-gallery tab-image-gallery--${tab}`} aria-label={`${tab} community scenes`}>
    {labels[tab].map((alt, index) => <CursorGlareImage key={alt} src={`/koa/generated/tab-images/${tab}-${String(index + 1).padStart(2, "0")}.webp`} alt={alt} />)}
  </section>;
}
