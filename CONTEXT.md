# KOA Bilingual Content

The language used to describe KOA's English and S'gaw Karen website content and the private workflow for maintaining bilingual counterparts.

## Language

**Bilingual Entry**:
A pair of corresponding English and S'gaw Karen values for one piece of website content. Either counterpart may be edited by an administrator.
_Avoid_: Placeholder, translation row

**English Counterpart**:
The English half of a Bilingual Entry.
_Avoid_: English source

**Karen Counterpart**:
The S'gaw Karen half of a Bilingual Entry, presented to readers as `ကညီကျိာ်`.
_Avoid_: Korean counterpart, Koa language

**Content Key**:
The permanent identity of one meaningful website content unit. It is generated once from the unit's location, semantic role, and original English wording, then remains unchanged when either counterpart is edited.
_Avoid_: Current English text, mutable text hash

**Language Toggle**:
The public, reader-facing control that switches between English and S'gaw Karen without exposing authoring controls.
_Avoid_: Translation editor, KOA language

**Locked Entry**:
A saved Bilingual Entry displayed read-only until an administrator deliberately reopens it for editing. Locking is reversible and does not by itself signify linguistic approval.
_Avoid_: Published translation, approved translation

**Draft Entry**:
A saved Bilingual Entry that remains private to administrators until it is explicitly verified and published. Locking a Draft Entry does not publish it.
_Avoid_: Public entry, verified entry

**Translation Authoring Mode**:
The private beta experience in which an administrator fills, edits, saves, and reopens Bilingual Entries.
_Avoid_: Public language toggle

**Translation Studio**:
The dedicated interface for Translation Authoring Mode, organized into meaningful website content units and paired English and S'gaw Karen values.
_Avoid_: Inline public editor

**Administrator**:
An authenticated person whose server-verified user ID or email is included in KOA's administrator allowlist.
_Avoid_: Visitor with a client-side secret, unauthenticated editor

**Unverified Entry**:
A Bilingual Entry whose counterparts have not yet been confirmed by the administrator. Existing Karen content enters the Translation Studio in this state.
_Avoid_: Approved translation, training-ready entry

**Verified Entry**:
A completed Bilingual Entry whose English and S'gaw Karen counterparts have been explicitly confirmed and published by an administrator for public reading and downstream language-agent use.
_Avoid_: Merely saved entry, merely locked entry

**Published Revision**:
The most recently verified version of a counterpart shown to public readers. Creating or editing a draft does not replace it.
_Avoid_: Current draft, latest edit

**Authoring Session**:
The collection of Bilingual Entries changed by an administrator during one Translation Studio working session and reviewed together before publication.
_Avoid_: Browser login session, automatically published edits

**Missing Counterpart**:
An unset half of a Bilingual Entry. A missing Karen Counterpart produces an English Fallback for readers without deleting the Bilingual Entry.
_Avoid_: Deleted entry, public placeholder

**Authored Content**:
Website copy intentionally produced or curated by KOA, including interface labels, stories, and events that are eligible for bilingual counterparts.
_Avoid_: Personal names, URLs, dates, form values, unreviewed visitor submissions

**English Fallback**:
The English Counterpart shown to readers on the Karen route when its Karen Counterpart is empty.
_Avoid_: Empty public placeholder

**Backup Export**:
A restorable representation of every Bilingual Entry, including incomplete and unverified work.
_Avoid_: Training corpus

**Clean Corpus Export**:
A parallel-text dataset containing only completed, verified Bilingual Entries selected for downstream language-agent use.
_Avoid_: Full backup, unfiltered export
