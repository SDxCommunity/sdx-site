# UCSD member applications: Tally → Notion

The UCSD chapter application is a Tally form (https://tally.so/r/eqJV5q).
Every "Join" button on the chapter (hero, bottom section, top bar) opens it
in a new tab. Tally writes each submission into the **Applications** database
in the SDxUCSD Core Documentation page in Notion (Dani's Space), under the
Applications heading at the bottom of that page. This replaced the Google
Form on 2026-09-09.

## What is wired up

- Tally integration "form submissions" on the form, connected to the
  Applications database. Every question maps to a property of the same
  meaning: First Name (title), Last Name, UCSD Email, Year (select), Topics,
  Technical Fields and Cool Stuff (multi-select), Resume (files), LinkedIn and
  Website (URL), Most Impressive Build, Company You Like, Anything Else (text).
- Review columns Tally does not fill: Status (New, Reviewing, Accepted,
  Rejected), Reviewer (person), Submitted (created time).
- Select and multi-select options are created by Notion the first time a
  value arrives, so new form options need no Notion change.

## If the form changes

1. Add the question in Tally.
2. Add a matching property to the Applications database in Notion.
3. In Tally, open Integrations → form submissions → edit, add a row under
   Map properties, and save.

## Site link

`UCSD_JOIN_FORM` in `app/chapters/ucsd/lib/links.ts` holds the share link.
Change it there if the form is ever replaced.
