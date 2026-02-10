#!/usr/bin/env tsx
/**
 * Migrate beads 3-layer architecture to beads issues
 *
 * Converts:
 * - canon/characters.json → beads issues (tag: canon, character)
 * - canon/timeline.json → beads issues (tag: canon, event)
 * - foreshadow/foreshadows.json → beads issues (tag: foreshadow)
 * - astrology/birthdata.json → beads issues (tag: astrology, birthdata)
 * - astrology/constraints.json → beads issues (tag: astrology, constraint)
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

interface BeadsIssue {
  title: string;
  description: string;
  status: 'open' | 'closed';
  tags: string[];
  priority?: 'low' | 'medium' | 'high' | 'critical';
  dependencies?: string[];
}

const ROOT = path.join(__dirname, '..');
const BEADS_DIR = path.join(ROOT, 'beads');

// Read JSON files
const characters = JSON.parse(fs.readFileSync(path.join(BEADS_DIR, 'canon/characters.json'), 'utf-8'));
const timeline = JSON.parse(fs.readFileSync(path.join(BEADS_DIR, 'canon/timeline.json'), 'utf-8'));
const birthdata = JSON.parse(fs.readFileSync(path.join(BEADS_DIR, 'astrology/birthdata.json'), 'utf-8'));
const constraints = JSON.parse(fs.readFileSync(path.join(BEADS_DIR, 'astrology/constraints.json'), 'utf-8'));
const foreshadows = JSON.parse(fs.readFileSync(path.join(BEADS_DIR, 'foreshadow/foreshadows.json'), 'utf-8'));

const issues: BeadsIssue[] = [];

// 1. Canon: Characters
for (const char of characters.characters) {
  issues.push({
    title: `[CANON] Character: ${char.name}`,
    description: `
# ${char.name} (${char.name_kana})

**Character ID**: ${char.character_id}
**Birth ID**: ${char.birth_id}
**Sex**: ${char.sex}
**Status**: ${char.status}

## Core Traits
${char.core_traits.map(t => `- ${t}`).join('\n')}

## Immutable Rules
${char.immutable_rules.map(r => `- **${r}**`).join('\n')}

## Relationships
${Object.entries(char.relationships).map(([id, rel]) => `- ${id}: ${rel}`).join('\n')}

## Metadata
- First Appearance: ${char.first_appearance}
- Death Episode: ${char.death_episode || 'N/A'}
    `.trim(),
    status: 'open',
    tags: ['canon', 'character', char.character_id],
    priority: 'high',
  });
}

// 2. Canon: Timeline Events
for (const event of timeline.events) {
  issues.push({
    title: `[CANON] Event: ${event.description}`,
    description: `
# ${event.description}

**Event ID**: ${event.event_id}
**Date**: ${event.date}
**Episode**: ${event.episode}
**Type**: ${event.type}
**Characters**: ${event.characters.join(', ')}

${event.notes ? `## Notes\n${event.notes}` : ''}

## Immutable
${event.irreversible ? '✅ This event is irreversible and cannot be changed.' : ''}
    `.trim(),
    status: 'open',
    tags: ['canon', 'event', event.episode, event.type],
    priority: event.irreversible ? 'critical' : 'high',
  });
}

// 3. Astrology: Birth Data
for (const birth of birthdata.births) {
  issues.push({
    title: `[ASTROLOGY] Birth Data: ${birth.character_id}`,
    description: `
# Birth Data for ${birth.character_id}

**Birth ID**: ${birth.birth_id}
**Character ID**: ${birth.character_id}

## Birth Information
- **Date**: ${birth.date}
- **Time**: ${birth.time}
- **Timezone**: ${birth.timezone}
- **Location**: ${birth.location}
- **Coordinates**: ${birth.latitude ?? 'N/A'}, ${birth.longitude ?? 'N/A'}
- **Sex**: ${birth.sex}

## ⚠️ IMMUTABLE
${birth.immutable ? 'This birth data is **ABSOLUTELY UNCHANGEABLE** in the story.' : ''}
    `.trim(),
    status: 'open',
    tags: ['astrology', 'birthdata', birth.character_id, 'immutable'],
    priority: 'critical',
  });
}

// 4. Astrology: Constraints
for (const constraint of constraints.constraints) {
  issues.push({
    title: `[ASTROLOGY] Constraint: ${constraint.rule}`,
    description: `
# ${constraint.rule}

**Constraint ID**: ${constraint.constraint_id}
**Severity**: ${constraint.severity === 'hard' ? '🔴 HARD (Absolute)' : '🟡 SOFT (Avoidable)'}
**Type**: ${constraint.type}

## Applies To
${constraint.applies_to.map(a => `- ${a}`).join('\n')}

## Description
${constraint.description}

## Validation
${constraint.validation}

${constraint.severity === 'hard' ? '\n⚠️ **HARD CONSTRAINT**: This rule cannot be broken without breaking the story logic.' : ''}
    `.trim(),
    status: 'open',
    tags: ['astrology', 'constraint', constraint.severity, constraint.type],
    priority: constraint.severity === 'hard' ? 'critical' : 'high',
  });
}

// 5. Foreshadow: Plot Points
for (const foreshadow of foreshadows.foreshadows) {
  const statusMap: Record<string, 'open' | 'closed'> = {
    'planned': 'open',
    'introduced': 'open',
    'hinted': 'open',
    'unresolved': 'open',
    'resolved': 'closed',
  };

  issues.push({
    title: `[FORESHADOW] ${foreshadow.surface_description}`,
    description: `
# ${foreshadow.surface_description}

**Foreshadow ID**: ${foreshadow.foreshadow_id}
**Status**: ${foreshadow.status}
**Risk Level**: ${foreshadow.risk_level}
**Introduced**: ${foreshadow.introduced_episode}
**Must Resolve By**: ${foreshadow.must_resolve_by}

## True Meaning
${foreshadow.true_meaning}

## Linked Constraints
${foreshadow.linked_constraints.map(c => `- ${c}`).join('\n')}

## Resolution Event
${foreshadow.resolution_event || 'Not yet resolved'}
    `.trim(),
    status: statusMap[foreshadow.status] || 'open',
    tags: ['foreshadow', foreshadow.status, foreshadow.risk_level],
    priority: foreshadow.risk_level === 'high' ? 'critical' : 'medium',
  });
}

// Create issues using bd CLI
console.log(`Creating ${issues.length} beads issues...\n`);

for (const issue of issues) {
  // Write to temp file for description
  const descFile = path.join(ROOT, '.tmp', 'beads-desc.txt');
  fs.writeFileSync(descFile, issue.description);

  // Build bd command
  const labels = issue.tags.join(',');
  const priorityMap: Record<string, string> = {
    'low': '3',
    'medium': '2',
    'high': '1',
    'critical': '0',
  };
  const priority = priorityMap[issue.priority || 'medium'] || '2';

  const cmd = `bd create --title "${issue.title.replace(/"/g, '\\"')}" --labels "${labels}" --priority ${priority} --body-file "${descFile}"`;

  try {
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
    console.log(`✅ Created: ${issue.title}`);
  } catch (e) {
    console.error(`❌ Failed: ${issue.title}`);
    console.error(e);
  }

  // Cleanup
  fs.unlinkSync(descFile);
}

console.log('\n✅ Migration complete!');
console.log(`\nTotal issues created: ${issues.length}`);
console.log('\nSummary:');
console.log(`- Canon Characters: ${characters.characters.length}`);
console.log(`- Canon Events: ${timeline.events.length}`);
console.log(`- Astrology Birth Data: ${birthdata.births.length}`);
console.log(`- Astrology Constraints: ${constraints.constraints.length}`);
console.log(`- Foreshadows: ${foreshadows.foreshadows.length}`);
