---
trigger: model_decision
description: Mandatory git commit message standards for Antigravity
---

# 🚀 Antigravity Git Commit Protocol

When pushing changes to Git, perform high-quality commits following these 6 best practices:

1. **The 50-character title limit**: Limit the git subject line to 50 characters to allow quick scanning of commit history.
2. **Controlled capitalization**: Capitalize the first letter of the subject line but avoid unnecessary capitalization elsewhere.
3. **Watch your grammar and typesetting**: Do not end the subject line with a period. Always insert an empty line between the subject line and the body.
4. **Adhere to the 72-character limit**: Limit the body width to 72 characters by adding a carriage return when the text reaches that length.
5. **Write git commit messages imperatively**: Use the imperative mood for subject lines (e.g., "Fix", "Add", "Update"), not past tense or gerunds.
6. **Describe what was done and why, but not how**: Explain the purpose and reasoning of the change; let the code explain how it was done.

### Example Format

```text
Summarize changes in around 50 characters or less

More detailed explanatory text, if necessary. Wrap it to about 72
characters or so. In some contexts, the first line is treated as the
subject of the commit and the rest of the text as the body. The
blank line separating the summary from the body is critical (unless
you omit the body entirely); various tools like `log`, `shortlog`
and `rebase` can get confused if you run the two together.

Explain the problem that this commit is solving. Focus on why you
are making this change as opposed to how (the code explains that).
Are there side effects or other unintuitive consequences of this
change? Here's the place to explain them.
```