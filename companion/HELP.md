## Jomboy Confidence Monitor

Triggers reads in the teleprompter's Script Library from Companion, and reflects which read is
currently live back onto your buttons.

**Config:** set Topic to match the Topic field in Confidence Monitor's Teleprompter card
(`adread` by default). Both must match or nothing will line up.

**Actions**
- *Trigger read (pick from library)* — dropdown of read names, refreshed live as the library changes.
- *Trigger read (type exact name)* — for a read not yet cached, or if you'd rather type it. Matched
  case-insensitively.

**Feedback**
- *Read is LIVE* — true while the selected read is the one currently on the prompter. Give it a
  bright `bgcolor` to turn a button green while its read is live.

**Variables**
- `live_read_name` — name of whichever read is currently live.
- `read_count` — how many reads are in the library.
