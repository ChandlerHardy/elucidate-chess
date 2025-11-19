#!/usr/bin/env ts-node

// TypeScript version of skill-activation hook
// Analyzes prompts and file context to suggest relevant skills

import * as fs from 'fs';
import * as path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const SKILL_RULES_PATH = path.join(PROJECT_ROOT, '.claude/skill-rules.json');

interface SkillRule {
  name: string;
  patterns: string[];
  pathPatterns: string[];
  description: string;
}

interface SkillRules {
  version: string;
  skills: SkillRule[];
}

function loadSkillRules(): SkillRules {
  try {
    if (fs.existsSync(SKILL_RULES_PATH)) {
      const content = fs.readFileSync(SKILL_RULES_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (error) {
    console.warn('Could not load skill rules:', error);
  }

  // Return default rules
  return {
    version: '1.0',
    skills: [
      {
        name: 'chess-development',
        patterns: ['chess', 'stockfish', 'pgn', 'fen', 'board', 'game', 'analysis'],
        pathPatterns: ['apps/**/*', '*chess*', '*game*'],
        description: 'Chess application development patterns'
      }
    ]
  };
}

function analyzePrompt(prompt: string, rules: SkillRules): string[] {
  const relevantSkills: string[] = [];
  const promptLower = prompt.toLowerCase();

  for (const skill of rules.skills) {
    const matchesPattern = skill.patterns.some(pattern =>
      promptLower.includes(pattern.toLowerCase())
    );

    if (matchesPattern) {
      relevantSkills.push(skill.name);
    }
  }

  return relevantSkills;
}

// Main execution
function main() {
  const userPrompt = process.env.USER_PROMPT || '';
  const rules = loadSkillRules();
  const relevantSkills = analyzePrompt(userPrompt, rules);

  if (relevantSkills.length > 0) {
    console.log('🤖 Relevant Skills Detected:');
    relevantSkills.forEach(skill => {
      const skillRule = rules.skills.find(s => s.name === skill);
      if (skillRule) {
        console.log(`  - ${skillRule.name}: ${skillRule.description}`);
      }
    });
  }
}

if (require.main === module) {
  main();
}