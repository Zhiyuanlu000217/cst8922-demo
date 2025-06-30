// This script parses npm audit JSON (v6 and v7+), generates a Markdown summary, and saves it as audit-summary.md
const fs = require('fs');

const auditFile = 'audit.json';
const outputFile = 'audit-summary.md';

function getSeverityCounts(vulnerabilities) {
  const counts = { critical: 0, high: 0, moderate: 0, low: 0 };
  for (const vuln of vulnerabilities) {
    if (counts[vuln.severity] !== undefined) {
      counts[vuln.severity]++;
    }
  }
  return counts;
}

function getVulnTableRows(vulnerabilities) {
  return vulnerabilities.map(vuln => {
    const patched = vuln.patched_versions || (vuln.fixAvailable && vuln.fixAvailable.name ? vuln.fixAvailable.version : 'N/A');
    return `| ${vuln.name} | ${vuln.severity} | ${vuln.installed} | ${patched} |`;
  }).join('\n');
}

function getAdvisoriesTableRows(advisories) {
  return Object.values(advisories).map(a => {
    return `| ${a.module_name} | ${a.severity} | ${a.findings[0].version} | ${a.patched_versions} |`;
  }).join('\n');
}

function parseAudit(json) {
  // npm v7+ format
  if (json.vulnerabilities) {
    const vulnerabilities = [];
    for (const [name, vuln] of Object.entries(json.vulnerabilities)) {
      if (vuln.via && Array.isArray(vuln.via)) {
        for (const via of vuln.via) {
          if (typeof via === 'object') {
            vulnerabilities.push({
              name,
              severity: via.severity || 'unknown',
              installed: vuln.installed || 'unknown',
              patched_versions: via.fixAvailable ? via.fixAvailable.version : 'N/A',
              fixAvailable: via.fixAvailable || null
            });
          }
        }
      }
    }
    return { vulnerabilities };
  }
  // npm v6 format
  if (json.advisories) {
    const advisories = Object.values(json.advisories).map(a => ({
      name: a.module_name,
      severity: a.severity,
      installed: a.findings[0].version,
      patched_versions: a.patched_versions,
      fixAvailable: null
    }));
    return { vulnerabilities: advisories, advisories: json.advisories };
  }
  return { vulnerabilities: [] };
}

function main() {
  if (!fs.existsSync(auditFile)) {
    fs.writeFileSync(outputFile, '# NPM Audit\nNo audit file found.');
    return;
  }
  const auditData = JSON.parse(fs.readFileSync(auditFile, 'utf8'));
  const { vulnerabilities, advisories } = parseAudit(auditData);
  if (!vulnerabilities || vulnerabilities.length === 0) {
    fs.writeFileSync(outputFile, '# NPM Audit\nNo vulnerabilities found.');
    return;
  }
  const counts = getSeverityCounts(vulnerabilities);
  let md = '## Vulnerabilities found\n';
  md += '\n| Severity | Count |\n|---|---|\n';
  for (const sev of ['critical', 'high', 'moderate', 'low']) {
    md += `| ${sev} | ${counts[sev]} |\n`;
  }
  md += '\n### Affected Dependencies\n';
  md += '| Dependency | Severity | Installed | Patched Version |\n|---|---|---|---|\n';
  md += getVulnTableRows(vulnerabilities);
  if (advisories) {
    md += '\n\n### Advisories (npm v6 format)\n';
    md += '| Dependency | Severity | Installed | Patched Version |\n|---|---|---|---|\n';
    md += getAdvisoriesTableRows(advisories);
  }
  fs.writeFileSync(outputFile, md);
}

main();
