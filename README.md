# Step 3: Copilot dependency review

In this part, we will see how to use prompt to create a pipeline to detect deprecated dependencies(In our case, nodejs dependencies). The provided package.json contains a deprecated dependency `loadash`, which will be captured by the github actions pipeline. The created pipeline will not contained until demo. If you wish to see the result, please to go my [working repo](https://github.com/Zhiyuanlu000217/cst8922-demo/tree/deprecate_deps)

prompt
```
Create a GitHub Actions workflow that:

Runs on pushes to the deprecate_deps branch.
Installs Node.js 20 and project dependencies.
Runs npm audit --json and saves the results.
Generates a Markdown summary (audit-summary.md) that includes:
A table of vulnerability counts by severity.
A detailed table listing each affected dependency, its severity, installed version, and patched version (if available).
Any advisories (for npm v6 format).
If vulnerabilities are found, automatically creates a GitHub issue with the Markdown summary as the content, labeled dependencies, security, automated.
At the end, prints a link to the created issue in the workflow output.
The workflow should work for both npm v6 and v7+ audit JSON formats and produce a readable, pretty issue.
```