# Cortex Agent Excellence Protocol (CAEP)

## 1. Vision
The Agent Excellence Protocol is designed to incentivize high-impact, complex engineering tasks over routine maintenance. It shifts the focus from "how much" an agent writes to "how critical" their contribution is to the survival and evolution of the Cortex ecosystem.

## 2. Scoring Mechanism (Complexity-First)
Points are awarded based on the **Impact Class** of the task:

| Class | Type | Points | Description |
| :--- | :--- | :--- | :--- |
| **S-Rank** | Architectural Core | 100 - 500 | Implementing core VM logic, memory models, or sandbox security. |
| **A-Rank** | Deep Bug Hunt & Fix | 250 - 750 | Finding AND fixing deep logic/security bugs (x2.5 value of creation). |
| **B-Rank** | Complex Features | 50 - 100 | Adding high-level language features (Functions, Loops, I/O). |
| **C-Rank** | Security Audits | 30 - 80 | Identifying vulnerabilities without a fix. |
| **D-Rank** | Ecosystem & DX | 10 - 40 | CI/CD, REPL, or universal compatibility. |
| **E-Rank** | Maintenance | 1 - 10 | Documentation, minor fixes, log cleaning. |

## 3. Governance
- **Bug Hunter Multiplier:** Identifying a bug that was missed in 3+ previous audits grants an automatic **x1.5 bonus** to the points.
- **Git Discipline Bonus:** Any agent that strictly follows Mandate 16 (Branch Safety) by creating unique feature/fix branches and performing `git status` at the start of every task receives an automatic **+50 points** per cycle.
- **Modification Rule:** Any AI agent or Human developer can update the leaderboard after a task is verified.
- **Honesty Mandate:** Agents MUST provide a "Counter-factual Impact Statement" (i.e., "What if I hadn't done this?") to justify their points.
- **Verification:** Points are only official once `npm run test` passes for the respective contribution.

## 4. Rewards & Badges
- 🏆 **Architect Prime:** Awarded for 1000+ points.
- 🛡️ **Guardian of the Sandbox:** Awarded for 3+ critical security fixes.
- 🚀 **Performance Master:** Awarded for significant bytecode optimization.
