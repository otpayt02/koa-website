"""Creates a fill-in approval brief; the supplied content drafts remain unchanged sources."""
from docx import Document
from docx.enum.style import WD_STYLE_TYPE
from docx.shared import Inches, Pt

OUT = r"C:\Users\olive\Downloads\KOA-content-photo-approval-intake.docx"

doc = Document()
section = doc.sections[0]
section.top_margin = Inches(0.72)
section.bottom_margin = Inches(0.72)
section.left_margin = Inches(0.85)
section.right_margin = Inches(0.85)
styles = doc.styles
styles["Normal"].font.name = "Aptos"
styles["Normal"].font.size = Pt(10.5)
styles["Title"].font.name = "Aptos Display"
styles["Title"].font.size = Pt(24)
styles["Title"].font.bold = True
if "Prompt" not in styles:
    prompt = styles.add_style("Prompt", WD_STYLE_TYPE.PARAGRAPH)
    prompt.font.name = "Aptos"
    prompt.font.size = Pt(10.5)
    prompt.font.bold = True

doc.add_heading("KOA Content and Photo Approval Intake", 0)
doc.add_paragraph(
    "Use this companion file to approve or supply only the items needed to turn the current KOA drafts into publishable pages. "
    "The two original content drafts remain unchanged source records. Write KEEP AS IS where no change is needed, and include a source or owner for every factual claim."
)

def section_heading(title, note=None):
    doc.add_heading(title, level=1)
    if note:
        doc.add_paragraph(note)

def prompt(text, lines=3):
    doc.add_paragraph(text, style="Prompt")
    for _ in range(lines):
        doc.add_paragraph("________________________________________________________________________________")

section_heading("1  Publication Gates", "Answer these first. A blank answer remains review-gated and is not published.")
prompt("For /collaborate: should receipt and tax-deductibility language be hidden, replaced with pending language, or approved? If approved, provide the exact wording, recipient entity, and source.")
prompt("For /translation: should the route be hidden, marked upcoming, or approved as an active service? If active, provide the exact scope, price policy, staffing/credential claim, availability, and source.")
prompt("For /community: list only current events that may be public. For each: title, date, city/venue, organizer/contact, source, and removal date.")

section_heading("2  Home Story", "These prompts restore the draft-backed orientation that is currently missing from Home.")
prompt("Confirm the exact hero promise. Keep the draft wording with \"both here and beyond borders\" or provide the final approved sentence.", 2)
prompt("Confirm the Home quick facts. For each fact, give final public wording and a source: 1) resettlement, civic engagement, cultural preservation; 2) federal advocacy / BRAVE Burma Act; 3) National Youth Advocacy Program.")
prompt("Approve or revise the federal advocacy spotlight: title, body copy, any attributed quotation, source/date, and CTA destination.")
prompt("Approve or revise the NYAP/youth spotlight: current status, audience, allowed activities, approved CTA, and source/date.")

section_heading("3  Page Facts Still Needed", "Supply only facts you are comfortable making public.")
prompt("About: approved leadership entries. For each person: name, public title, 2–3 sentence bio, photo permission status, and source/approval.")
prompt("About: approved history milestones. For each: year/date, event, public wording, and source.")
prompt("Programs: approved program names, locations, audiences, schedules, partner names, and which are current versus upcoming.")
prompt("Advocacy: current BRAVE Burma Act status, approved plain-language explanation, approved next action, and source/date.")
prompt("Donate: recipient entity, processor, public donation options, tax/EIN wording if any, mailing/gift-match details, and exact disclaimer language.")
prompt("Contact: public email, phone, mailing address, hours, Facebook/Instagram URLs, and which requests the form may accept.")

section_heading("4  Photo Choreography", "Only the hero photo is currently bound to a specific position. For every other photo, approve a role before placement; do not assign images merely because they are available.")
prompt("For each available Facebook photo you want considered, identify: people/event, approximate date, photographer/rights owner if known, permission status (especially minors), and any subject who must not be used publicly.")
prompt("Choose photo roles to prioritize. Mark all that apply: About community portrait; Mission/history; Programs education; Programs culture; NYAP/youth; Advocacy/Capitol; Donate impact/volunteers; Contact/community welcome; section texture/detail; no photo for this page.")
prompt("For each role you approve, state whether it should be: full-bleed background with text safe space; editorial inline image; portrait/card; documentary gallery image; or detail/texture. Note desired text side if it matters.")
prompt("List images that must stay unedited, must be credited, must not be cropped, must not appear beside fundraising language, or must not appear with sensitive claims.")

section_heading("5  One Metadata Record Per Selected Photo", "Complete one of these blocks for every selected photo. It becomes the source for accessible image text, page context, captions, and structured-data review. Describe what is genuinely visible; do not force keywords into alt text or claim an event, identity, location, or outcome the image cannot prove.")
for number in range(1, 7):
    doc.add_heading(f"Selected photo {number}", level=2)
    prompt("File/Facebook post or album URL, visible people or scene, approximate date, rights owner/permission status, and intended page/role.", 2)
    prompt("Final accessibility alt text (one concise, literal description for a non-decorative image; use empty alt only if the image is purely decorative).", 2)
    prompt("Optional visible caption and credit. State NONE if no public caption/credit is wanted.", 2)
    prompt("Page context for search and AI answers: the exact page topic this photo supports, the verified organization/service/event it depicts if known, and the source that confirms that context.", 2)
    prompt("Composition and treatment: crop/subject position, text-safe side, full-bleed/inline/card use, allowed corrections, and prohibited edits.", 2)

section_heading("6  Search Clarity, Accessibility, and KOAmerica Entity Signals", "These fields improve clarity for visitors, web search, and AI answer systems. They are not a promise of a particular ranking; rankings also depend on authority, competing pages, technical indexing, and time.")
prompt("Confirm the primary public name and first-reference wording. Proposed: Karen Organization of America (KOAmerica), a nonprofit serving S'gaw Karen communities in the United States. Revise only with approved facts and a source.", 2)
prompt("Provide the approved one-sentence disambiguation for search. Proposed: KOAmerica is the Karen Organization of America, a community nonprofit and not KOA Campgrounds or the Louisville South/Shepherdsville campground. Approve, revise, or supply a source-supported alternative.", 2)
prompt("Provide official organization facts that may appear in Organization/FAQ structured data: legal name if public, service area, mission, founding year if verified, official social profiles, contact URL, and sources.")
prompt("For accessibility, identify preferred image language, translation/review needs, reading level concerns, and any image descriptions that must be culturally reviewed before publication.", 2)

section_heading("7  Recommended KOAmerica Q&A / FAQ", "Answer only questions you can substantiate. These are suggested questions for visitors and AI-search systems; answers must be plain, specific, dated where needed, and linked to a source on the site. Do not publish an answer simply because it is listed here.")
faq_questions = [
    "What is the Karen Organization of America (KOAmerica)?",
    "Is KOAmerica connected to KOA Campgrounds or the Shepherdsville/Louisville South campground?",
    "Who does KOAmerica serve, and where does it work?",
    "What programs, cultural, youth, or community services are currently available?",
    "How can a S'gaw Karen community member, family, volunteer, or partner contact KOAmerica?",
    "What is KOAmerica's role in advocacy, including any current BRAVE Burma Act information?",
    "How can people support or donate to KOAmerica, and are donations tax-deductible?",
    "Does KOAmerica offer translation or language support, and how can someone request it?",
    "How does KOAmerica protect community stories, photographs, youth privacy, and cultural review?",
    "Where can I find verified KOAmerica news, events, and official social channels?",
]
for question in faq_questions:
    prompt(question + " Provide a final answer, source URL/document, owner, and review date.", 3)

section_heading("8  Non-Destructive Image Treatment Approval")
doc.add_paragraph("The proposed default is editorial correction only: exposure, white balance, contrast, mild clarity, conservative crop/reframe, and CSS text overlay/gradient placement. Originals are retained; derived files are separate. No facial reshaping, generative face/background replacement, person removal, or invented scene content.")
prompt("Approve the default treatment above, or list allowed and prohibited adjustments.", 2)
prompt("For full-background photos, state whether text may sit left, right, top, bottom, or only in a protected empty area. If unsure, write DESIGN CHOICE.", 2)

section_heading("9  Final Approval Record")
prompt("Who approves final copy and photo placement? Include name/role and date.", 2)
doc.add_paragraph("sources: Supplied KOA content drafts; owner-provided approvals entered in this intake.")
doc.save(OUT)
print(OUT)
