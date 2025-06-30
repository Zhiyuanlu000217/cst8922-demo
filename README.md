# Part 2: Copilot code review

In this part, we introduce a new pipeline: code review pipeline at `.github/workflows/review.yml`.

The web app from part 1 is also updated, so that you will see the examples of how SQL injection works.

This pipeline will only trigger at current branch, when a new commit is made, it will check if it's either javascript file or html file in our case, and get the changes. The changes will be sent to LLM for coding guideline check, if it does not fit the guideline, it will automatically create an issue.