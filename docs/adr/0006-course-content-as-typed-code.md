# 0006. Course content as typed TypeScript, validated by tests

Status: Accepted

## Context

The courses (English and Chinese, 6 units each) are the product. They need to be
reviewable in a pull request, refactorable, and impossible to ship broken, for
example an exercise with no correct option or a lesson that references a word
that does not exist.

## Decision

Content is declared in `src/content/en.ts` and `zh.ts` as typed data: word
tuples, sentences and a unit/lesson tree. The exercise builders in
`builders.ts` (`choiceNew`, `wordbank`, `tone`, ...) turn that data into
exercises, so a lesson is a few lines rather than hand-written JSON.
`content.test.ts` walks both courses and asserts structural invariants.

Content is compiled into the bundle and not stored in the database. The
database holds only learner state (`LessonProgress`, `SrsItem`, ...), keyed by
stable string ids from the content.

## Alternatives considered

- **Content in the database with an admin UI.** More flexible, but it adds an
  editor, versioning and migrations of content, for a catalogue that changes
  rarely.
- **JSON or YAML files.** Loses type checking and builder functions.

## Consequences

- Adding a unit is a code change and a deploy. That is the intended workflow.
- Ids are a public contract: renaming one orphans learner progress and SRS
  rows. Treat content ids as immutable.
