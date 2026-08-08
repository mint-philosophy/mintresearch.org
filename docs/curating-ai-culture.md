# Curating AI in Literature & Popular Culture

The public collection lives at `public/ai-culture/index.html`. Its entries are
defined in `public/assets/collections/ai-culture.js`; book-cover files live in
`public/assets/ai-culture/covers/`.

Every public description must remain a short quotation from the linked human
source: a publisher, author, studio, named critic, or other identifiable
editorial source. Keep each quotation under 25 words, preserve its wording, and
link directly to the page it came from. Do not replace these with generated
synopses.

## Adding Seth's comments

`public/assets/collections/ai-culture-notes.json` is the editorial note layer.
Its keys match entry IDs in `ai-culture.js`. Replace an empty string with a
short comment:

```json
{
  "daemon": "A short comment goes here."
}
```

Only non-empty values are rendered. They appear below the relevant entry under
the label `Seth's note`; the bibliography remains unchanged if the notes file
cannot be loaded. Comments should be entered from Seth's own supplied text, not
generated or voice-matched on his behalf.

## Visitor suggestions

The form at the bottom submits suggestions to the existing MINT website form
endpoint. Suggestions are moderated and never appear on the site automatically.
Review the source, excerpt, cover, and tags before adding a new entry.
