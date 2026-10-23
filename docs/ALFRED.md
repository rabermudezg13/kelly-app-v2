# Alfred — web Stream Deck

Shared lazy React panel in all seven role dashboards. Inspired by the user's
rabermudezg13/treamdeck repository, reviewed at commit
63a17278d7da5859c82c7e50d925b771a42857db (KeyForge, index.html).
Reimplemented as scoped React/CSS rather than running imported HTML/scripts.

Buttons have a label, emoji and exactly two actions: copy text to the clipboard
or open an http(s) link in a separate tab with noopener/noreferrer. No commands
or scripts execute. Clipboard failure exposes selectable text. Users can create,
edit/delete buttons, create/rename/delete groups, search, and choose 3–6 desktop
columns (responsive 3/2 on smaller screens). Native dialogs support Escape,
focus trapping/return; edits are visible and keyboard accessible.

Preferences live under kelly:alfred:v1:<encoded user ID>, with normalized email
only when ID is unavailable. No shared anonymous key. This is browser-local
preference isolation, not server authorization or encrypted storage. Clearing
site data removes preferences. No automatic cross-device sync. Do not store
passwords or candidate records. The only external navigation is a user-clicked
link; Alfred makes no data API calls and requires no installation.

Export downloads alfred-backup.json. Import accepts Alfred v1 and legacy
KeyForge backups, validates the complete file before confirmation/replacement,
and converts legacy script entries to ordinary copy text. Unknown versions,
invalid URLs/credentials, duplicate IDs and invalid types are rejected. Limits:
1 MB per workspace/backup, 20 groups, 100 slots per group, 60-character labels,
40-character group names and 10,000-character content. Empty legacy slots remain
compatible. Content renders as React text, never raw HTML. Corrupt storage is
not automatically overwritten; importing a valid backup can replace it after
confirmation. Storage failures leave changes in memory and instruct export.

Panel unmounts when leaving Alfred; saved changes reload on reopening. Unsaved
editor drafts and in-memory-only changes do not survive unmount. Existing NHO,
Smart Capture, tracker and Text Talents data flows remain independent.

Verification: npm run test:alfred and full scripts/verify.py; browser with synthetic
users only: all seven roles, create/edit/copy/reload, group rename/create, search,
backup export/import, URL action and 390px layout. Production checks tracked in
memory.md / CHANGELOG.md; do not equate local mocked roles with real production
sessions. Original global single-letter shortcuts were intentionally omitted to
avoid interfering with dashboard fields and browser shortcuts.
