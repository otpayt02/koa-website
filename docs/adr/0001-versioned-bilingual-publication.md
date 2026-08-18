# Preserve published bilingual content with immutable revisions

KOA will store bilingual edits as append-only revisions and keep an explicit pointer to each counterpart's Published Revision. Drafts remain private, an Authoring Session publishes its selected verified pairs atomically, and public readers continue seeing the last verified pair while replacements are edited; this adds storage and publication complexity but prevents unfinished work from overwriting public content and provides reliable history, rollback, conflict detection, backup, and clean-corpus generation.
