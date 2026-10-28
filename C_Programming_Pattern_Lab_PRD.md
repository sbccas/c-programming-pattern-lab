# C Programming Pattern Lab
## Product Requirements Document (PRD) and Agentic Development Brief

**Document version:** 1.0  
**Status:** Ready for implementation  
**Product type:** Responsive educational web application  
**Primary audience:** First-year BCA, BSc IT, and BSc Data Science students  
**Deployment target:** GitHub repository connected to Vercel  
**Preferred implementation environment:** Antigravity, Claude, or another agentic AI coding environment

---

## 1. Executive Summary

Build **C Programming Pattern Lab**, a free-to-access, browser-based interactive learning platform that helps beginner students understand C programming pattern problems and, especially, nested `for` loops.

The product must teach the *execution logic* behind a pattern—not merely show the final output or provide code to copy. Students should be able to select a supported pattern, inspect its C source, execute the program step by step, observe the values of loop variables, see condition evaluations, watch the output build gradually, inspect a dry-run table, and practise predicting the next operation or output.

The application will use a React + TypeScript frontend and a deterministic, purpose-built simulator for a documented subset of C pattern-program constructs. Version 1 does **not** need a real C compiler and must not pretend to execute arbitrary C source. Patterns are predefined, verified program definitions interpreted by a safe simulation engine.

The application must be responsive, mobile-first, accessible, easy to extend, and deployable as a static frontend on Vercel. The source code will be maintained in GitHub. Vercel should automatically deploy configured branches and create preview deployments according to project settings.

### Product promise

> See the code. Follow the loop. Understand the pattern.

### Definition of success

A beginner should be able to choose a pattern, predict its output, run it one operation at a time, explain what the outer and inner loops are doing, follow the values of `i` and `j`, and verify the complete execution using the dry-run table.

---

## 2. Background and Problem Statement

Students often learn pattern programs by memorizing code or copying solutions. They may know that a nested loop prints a pattern without understanding:

- why the outer loop represents rows;
- why the inner loop completes all its iterations before the outer loop advances;
- why the inner loop variable is initialized again on each new row;
- how a loop condition determines the number of symbols printed;
- the difference between printing on the same line and printing a newline;
- how changes to a loop limit affect the output;
- how to dry-run nested loops systematically.

Static notes, final-output examples, and videos can help, but they do not always allow students to inspect the state of each iteration or control the execution themselves.

C Programming Pattern Lab will turn these concepts into a visual, interactive learning experience.

---

## 3. Goals

### 3.1 Primary goals

1. Teach nested `for` loops through visual execution.
2. Synchronize code highlighting, loop variables, condition results, output, and dry-run records.
3. Make execution controllable through Next Step, Previous Step, Auto Run, Pause, and Reset.
4. Provide a graduated library of verified patterns.
5. Let students change supported pattern parameters, such as row count.
6. Reinforce learning with prediction questions, hints, and quizzes.
7. Work without student accounts, a database, or a backend in version 1.
8. Be simple to maintain and extend using an AI coding editor.
9. Deploy from GitHub to Vercel with an automated workflow.
10. Work well on desktop classroom screens, laptops, tablets, and mobile devices.

### 3.2 Secondary goals

- Encourage experimentation and active learning.
- Provide teachers with a clear demonstration tool.
- Allow students to revisit patterns and practise independently.
- Establish a foundation for future lessons on loops, conditionals, and other C concepts.

### 3.3 Non-goals for version 1

- Arbitrary C code execution.
- A full C compiler or debugger.
- Server-side code execution.
- Student accounts, authentication, or cloud-synced progress.
- A teacher administration portal or class analytics.
- AI-generated answers or explanations at runtime.
- A database, subscription system, or payment integration.
- A general-purpose online IDE.

Do not add these features unless explicitly approved as a later phase.

---

## 4. Target Audience and Learning Context

### Primary audience

First-year students studying:

- Bachelor of Computer Applications (BCA)
- BSc Information Technology (BSc IT)
- BSc Data Science

### Assumed knowledge

Students may understand basic C syntax, variables, `printf`, and simple `for` loops, but may be new to nested loops and dry runs.

### Learning principles

- Use plain, beginner-friendly English.
- Introduce one new idea at a time.
- Make the relationship between code and output visible.
- Explain *why* each condition is true or false.
- Avoid unexplained jargon.
- Show exact variable values and execution order.
- Let students predict before revealing an answer.
- Make experimentation safe and reversible.
- Do not confuse a visual animation with actual program execution.

### Core teaching model

- **Outer loop:** usually controls the rows.
- **Inner loop:** controls what happens within the current row.
- **Output statement:** prints a symbol or value.
- **Newline:** moves output to the next line.
- **Dry run:** records how program state changes during execution.

These are teaching conventions for the included patterns, not universal claims about every possible nested loop.

---

## 5. Product Scope and Release Strategy

### Version 1 — Interactive Pattern Learning Lab

Version 1 must include:

- Home page and pattern library.
- Pattern detail/instruction area.
- Interactive simulator workspace.
- Verified predefined C pattern programs.
- Deterministic step-by-step execution.
- Code statement highlighting.
- Outer and inner variable inspection.
- Condition evaluation and explanation.
- Increment/decrement events where supported.
- Output built incrementally.
- Explicit newline events.
- Dry-run table.
- Next Step, Previous Step, Auto Run, Pause, and Reset.
- Adjustable speed.
- Supported parameter controls, including row count.
- Predict-the-output activity.
- Basic quiz and hints.
- Responsive design and accessibility basics.
- Local progress/preferences where useful.
- Automated tests for simulator behavior.
- README and deployment documentation.

### Later versions

Potential future features, not required for the initial release:

- More advanced patterns, including centered pyramids and diamonds.
- Custom-code editing and execution using a real compiler or sandbox.
- Additional C topics such as `while`, `do-while`, `if-else`, arrays, and functions.
- Student accounts and cloud-synced progress.
- Teacher dashboards and classroom assignments.
- Learning analytics.
- Gujarati or other language support.
- Exportable lesson sheets.
- Achievements or gamification.
- Optional AI-generated hints.

Keep the architecture extensible without building future features prematurely.

---

## 6. User Stories

### Student stories

1. As a student, I can open the lab without registering so that I can start learning immediately.
2. As a student, I can browse patterns by category and difficulty.
3. As a student, I can see the expected output and understand the learning objective before running the simulation.
4. As a student, I can inspect the complete C code.
5. As a student, I can advance one execution event at a time.
6. As a student, I can move backward and forward without corrupting the simulation state.
7. As a student, I can see the current values of `i` and `j`.
8. As a student, I can see the exact condition being checked and whether it is true or false.
9. As a student, I can watch each symbol appear in the output panel.
10. As a student, I can inspect a dry-run table that matches the actual execution.
11. As a student, I can pause, reset, and change simulation speed.
12. As a student, I can change supported input parameters and rerun the pattern.
13. As a student, I can answer a prediction question before seeing the next output or explanation.
14. As a student, I can request a hint without immediately revealing the full solution.
15. As a student, I can use the lab on a mobile device.
16. As a student, I receive a clear message when the simulation is complete.

### Teacher stories

1. As a teacher, I can demonstrate loop execution on a projector.
2. As a teacher, I can pause at a condition check and explain it.
3. As a teacher, I can reset quickly for another demonstration.
4. As a teacher, I can share a URL for students to practise outside class.
5. As a teacher, I can rely on the dry-run table being accurate and consistent with the output.

---

## 7. Information Architecture and Navigation

Recommended routes:

- `/` — Home
- `/patterns` — Pattern library
- `/patterns/:patternId` — Pattern learning page and simulator
- `/practice` — Practice zone
- `/about` — About the lab and its limitations

If a routing library is unnecessary for the initial build, use a simple routing solution that supports direct navigation and refreshes on Vercel. Configure Vercel rewrites/fallback behavior if required by the chosen router.

### Home page

Include:

- Product name and tagline.
- Short introduction.
- Primary action: **Start Learning**.
- Featured beginner patterns.
- “How it works” section.
- Learning steps: Understand → Visualize → Practise.
- Link to the pattern library.
- A clear indication that the lab simulates supported examples rather than compiling arbitrary C code.

### Pattern library

Each pattern card should show:

- Pattern name.
- Small preview of expected output.
- Category.
- Difficulty.
- Learning objective.
- Button/link to open the lesson.

Provide simple category and difficulty filters if practical. Avoid unnecessary complex search in the first release.

### Pattern learning page

Include:

- Pattern title and difficulty.
- Learning objective.
- Expected output.
- C source code.
- Beginner-friendly explanation.
- “Start simulation” action.
- Simulator workspace.
- Dry-run table.
- Predict-output challenge.
- Practice questions.
- Navigation to the previous/next pattern.

---

## 8. Simulator Workspace Requirements

The simulator is the most important product feature.

### 8.1 Desktop layout

Use a clear multi-panel layout:

1. **Code panel**
   - Show the supported C program.
   - Highlight the currently executing statement.
   - Distinguish initialization, condition checks, increments, output statements, and newline statements.
   - Keep code readable and selectable.

2. **Variable/state panel**
   - Show the current values of all relevant variables, especially `i` and `j`.
   - Distinguish uninitialized/not-yet-initialized values from numeric values.
   - Explain which operation changed a variable.

3. **Output panel**
   - Build the output as output events occur.
   - Preserve spaces and newlines exactly.
   - Show the current position or last appended output, without altering program semantics.
   - Provide a clear final output state.

4. **Dry-run panel**
   - Show a chronological execution trace.
   - Include a step/event number, statement/action, relevant variable values, condition expression, condition result, and output change as appropriate.
   - Highlight the current event.
   - Scroll to the current row when useful.
   - Remain readable on mobile.

5. **Execution controls**
   - Next Step.
   - Previous Step.
   - Auto Run.
   - Pause.
   - Reset.
   - Speed control.
   - Progress indicator.
   - Optional jump-to-start and jump-to-end if straightforward.

### 8.2 Mobile layout

Use a mobile-first responsive design. Avoid compressing all panels into unreadable columns.

Suggested mobile layout:

- Pattern/code summary at the top.
- Tabs or collapsible sections for Code, Variables, Output, and Dry Run.
- Execution controls easy to reach.
- Dry-run table with horizontal scrolling only if unavoidable.
- Adequate touch target sizes.
- No horizontal overflow across the entire page.

### 8.3 Execution behavior

- The simulator must have a single authoritative execution state.
- The code highlight, variables, output, condition explanation, and dry-run row must all be derived from that state.
- Next Step advances to exactly one defined execution event.
- Previous Step restores the exact prior state.
- Auto Run advances through the same event sequence as manual stepping.
- Pause stops automatic advancement promptly.
- Reset restores the initial state for the current parameter values.
- Changing parameters rebuilds the timeline and resets execution.
- Reaching the end produces a completion state.
- The interface must not display invented or inconsistent variable values.
- Execution must be deterministic: the same pattern and parameters always produce the same timeline and output.

### 8.4 Define “step” clearly

A step is one observable simulator event, not necessarily one entire iteration of the inner loop.

Events can include:

- Variable initialization.
- Condition evaluation.
- Statement execution.
- Variable increment/decrement.
- Newline output.
- Loop completion/transition.
- Program termination.

The user interface should label each event in beginner-friendly language. Do not silently skip condition checks or increments if the lesson claims to show every step.

---

## 9. Execution Engine — Critical Architecture Requirement

### 9.1 Core decision

Implement a deterministic, purpose-built interpreter/execution model in TypeScript for the documented subset of C supported by the pattern library. Do not attempt to implement the entire C language.

Pattern definitions should be data/configuration, not hard-coded inside UI components. The engine converts a pattern definition and its parameters into an ordered event timeline. The UI displays that timeline.

Recommended conceptual flow:

`Pattern Definition + Parameters → Validated Execution Model → Event Timeline → Current Simulation State → UI`

### 9.2 Recommended modules

Suggested files (adapt if a cleaner implementation is warranted):

- `src/engine/types.ts`
- `src/engine/executePattern.ts`
- `src/engine/buildTimeline.ts`
- `src/engine/replayState.ts`
- `src/engine/__tests__/`
- `src/patterns/`
- `src/hooks/useSimulation.ts`

### 9.3 Event model

Define a typed event union or similarly robust structure. At minimum, support events equivalent to:

- `INIT_VARIABLE`
- `CONDITION_CHECK`
- `OUTPUT`
- `NEWLINE`
- `INCREMENT`
- `DECREMENT`
- `LOOP_TRANSITION`
- `PROGRAM_END`

Each event should include enough metadata to render accurate explanations and tests, such as:

- Stable event index/ID.
- Event type.
- Source statement ID or code-line reference.
- Relevant variable values before and after the event, or enough information to reconstruct them.
- Condition expression and boolean result when relevant.
- Output text appended by the event when relevant.
- Human-readable explanation.
- Loop context (outer/inner) when relevant.

The exact schema may differ, but the model must be typed, explicit, deterministic, and testable.

### 9.4 State management and backward stepping

Do not implement Previous Step by manually trying to undo every UI effect. Use one of these deterministic approaches:

1. Generate an immutable event timeline and derive the visible state by replaying events up to the selected index; or
2. Generate immutable event snapshots after each event and select the snapshot for the current index.

For this small simulator, snapshots may be the simplest and safest approach. Ensure output and variables are reconstructed exactly when moving backward.

### 9.5 Accurate loop semantics

For the included `for` loop subset, the engine must model the correct execution order:

1. Initialize the loop variable once when entering that loop.
2. Evaluate the loop condition.
3. If false, exit the loop.
4. If true, execute the body.
5. Execute the update expression.
6. Return to the condition check.
7. When the inner loop exits, continue with the remaining outer-loop body.
8. Execute the outer update and re-evaluate its condition.
9. End the program only when the outer loop completes.

When the outer loop begins a new iteration, the inner loop's initialization executes again if the inner loop is inside the outer loop body.

Do not assume that `j` keeps increasing across rows. Do not reset it at an incorrect point. Do not execute the outer update before the inner loop and remaining body have completed.

### 9.6 Supported source model

Version 1 should use explicit structured pattern definitions rather than parsing arbitrary user-entered C source.

A pattern definition should declare, as appropriate:

- Stable ID and metadata.
- Title and description.
- Category and difficulty.
- Learning objectives.
- Displayed C source.
- Supported input parameters and constraints.
- Structured loop definitions.
- Output behavior.
- Code statement IDs/line mappings.
- Explanation strings.
- Expected output for baseline parameters.
- Quiz/prediction content.

The displayed code and the executable pattern definition must correspond exactly. Avoid the dangerous situation where the visible C code says one thing but the simulator runs a different hidden algorithm.

For version 1, the application should only offer source examples for which a faithful structured execution model exists. Document this limitation in the UI or About page.

### 9.7 Output semantics

Model output as appended text. `printf("* ");` appends `* ` without adding a newline. `printf("\n");` appends a newline. Do not trim trailing spaces or normalize line endings in the simulator state. The UI may display whitespace visibly for teaching, but must preserve the underlying output.

### 9.8 Safety

- Do not use `eval`, `new Function`, or execute arbitrary user input as JavaScript.
- Do not treat a source-code textarea as executable C.
- Validate all parameter values and impose sensible limits.
- Keep the simulator local to the browser.
- If arbitrary code execution is introduced in a future release, use a separate, reviewed sandbox/compiler architecture.

---

## 10. Initial Pattern Library

Implement the first release in a progression from simple to moderately challenging. Every pattern must have verified source, output, explanation, and execution tests.

### Level 1 — Basic repetition

#### Pattern 1: Rectangle of stars

Baseline: 3 rows, 4 stars per row.

```c
#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 3; i++)
    {
        for (j = 1; j <= 4; j++)
        {
            printf("* ");
        }
        printf("\n");
    }

    return 0;
}
```

Expected output (trailing spaces are present after each star in the actual output):

```text
* * * *
* * * *
* * * *
```

Learning goals:
- Outer loop controls rows.
- Inner loop has a fixed number of iterations.
- The inner loop completes before the next row starts.
- Newline is printed after the inner loop.

#### Pattern 2: Square of stars

Baseline: 4 rows and 4 columns. Similar to the rectangle, but equal dimensions reinforce the concept of a square. Avoid duplicating code unnecessarily if pattern parameters can support both.

#### Pattern 3: Repeated row number

Example output:

```text
1
2 2
3 3 3
4 4 4 4
```

This pattern requires the output expression to print `i`, while the inner loop controls repetition. Include it only once the engine explicitly supports this output behavior.

### Level 2 — Increasing patterns

#### Pattern 4: Right-angle triangle of stars

```c
#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 4; i++)
    {
        for (j = 1; j <= i; j++)
        {
            printf("* ");
        }
        printf("\n");
    }

    return 0;
}
```

Expected output:

```text
*
* *
* * *
* * * *
```

Learning goals:
- `j <= i` controls the number of stars.
- Inner loop iteration count changes with each row.
- The total number of stars for four rows is 1 + 2 + 3 + 4 = 10.

#### Pattern 5: Number triangle

```c
#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 1; i <= 4; i++)
    {
        for (j = 1; j <= i; j++)
        {
            printf("%d ", j);
        }
        printf("\n");
    }

    return 0;
}
```

Expected output:

```text
1
1 2
1 2 3
1 2 3 4
```

Learning goals:
- The loop structure is the same as the star triangle.
- Printing `j` rather than a fixed star changes the output.
- The inner loop starts with `j = 1` on each row.

### Level 3 — Decreasing patterns

#### Pattern 6: Inverted triangle of stars

```c
#include <stdio.h>

int main(void)
{
    int i, j;

    for (i = 4; i >= 1; i--)
    {
        for (j = 1; j <= i; j++)
        {
            printf("* ");
        }
        printf("\n");
    }

    return 0;
}
```

Expected output:

```text
* * * *
* * *
* *
*
```

Learning goals:
- Outer loop decrements.
- Inner loop uses the current value of `i`.
- The number of output symbols decreases each row.

### Pattern expansion candidates

After the first six patterns are tested and stable, add:
- Decreasing number triangle.
- Alphabet triangle.
- Centered pyramid with spaces and stars.
- Inverted centered pyramid.
- Diamond pattern using multiple inner loops.
- Hollow square using `if-else`.
- Number pyramids.

Do not publish a pattern until its visible C code, event timeline, dry run, and expected output agree.

---

## 11. Dry-Run Requirements

The dry-run table must be generated from the actual simulator timeline. It must not be a manually written table that can diverge from execution.

### Suggested columns

- Step number.
- Current operation.
- `i` value.
- `j` value.
- Condition expression.
- Condition result.
- Output change.
- Explanation.

Hide or show optional columns responsively if necessary, but do not lose critical information.

### Example: first row of the increasing star triangle

For:

```c
for (i = 1; i <= 4; i++)
{
    for (j = 1; j <= i; j++)
    {
        printf("* ");
    }
    printf("\n");
}
```

The first row must follow this logical sequence:

1. Initialize `i = 1`.
2. Check `i <= 4` → true.
3. Initialize `j = 1`.
4. Check `j <= i` → true.
5. Print `* `.
6. Increment `j` to 2.
7. Check `j <= i` → false.
8. Print newline.
9. Increment `i` to 2.
10. Check the outer condition again.

The exact number of displayed steps depends on whether the engine represents events such as loop transitions separately. That policy must be consistent and documented.

### Dry-run correctness rule

For every event index:
- Displayed variables must match the engine state.
- The highlighted code statement must match the event.
- The condition result must match the evaluated expression.
- Output must equal the accumulated output up to that event.
- Previous/Next navigation must update every panel consistently.

---

## 12. Prediction Challenges and Practice Zone

Include a small number of carefully designed activities in version 1.

### Activity types

1. **Predict the next row:** Show the current output and ask what the next row will contain.
2. **Predict the next variable value:** Ask what `j` becomes after an increment.
3. **Evaluate a condition:** Ask whether `j <= i` is true or false for given values.
4. **Find the number of iterations:** Ask how many times the inner loop runs for a specific row.
5. **Choose the correct loop condition:** Offer plausible alternatives.
6. **Identify the output:** Ask students to choose the final pattern.
7. **Spot the mistake:** Show a small, predefined code variation and ask what is wrong.

### Feedback behavior

- Tell the student whether the answer is correct.
- Explain the reasoning in simple language.
- Give a hint before revealing the full explanation.
- Allow retries.
- Do not penalize experimentation.
- Avoid relying on colour alone to indicate correctness.

Do not execute arbitrary code submitted through quiz inputs. All questions should be predefined and validated against known expected answers.

---

## 13. Visual Design and User Experience

### Design direction

Use a modern educational developer-tool aesthetic: clean, friendly, focused, and readable.

Suggested visual principles:
- Clear typography and generous spacing.
- Neutral backgrounds with restrained accent colours.
- High contrast for code and output.
- Consistent cards, panels, borders, and button styles.
- Clear focus and active-step states.
- Subtle animation that reinforces execution rather than distracting from it.
- Respect `prefers-reduced-motion`.
- Do not use sound effects by default.
- Support keyboard navigation.
- Provide accessible labels for controls.

### Responsive behavior

- Desktop: code, variables/output, and dry run can appear in coordinated panels.
- Tablet: two-panel layout or stacked panels.
- Mobile: stacked layout or tabs; execution controls must remain easy to reach.
- Avoid fixed widths that cause horizontal page overflow.
- Keep code horizontally scrollable if necessary, but do not make the whole page overflow.

### Interaction design

- Buttons must have clear labels and disabled states where appropriate.
- The current step must be obvious.
- Auto Run should not race ahead at an unreadable speed.
- Pausing and resetting must be predictable.
- Use text labels as well as icons.
- Make the final output easy to distinguish from intermediate output.

### Accessibility

Aim for WCAG 2.2 AA practices where practical:
- Keyboard-accessible controls.
- Visible focus indicators.
- Semantic HTML.
- Adequate contrast.
- Screen-reader labels.
- No colour-only communication.
- Reduced-motion support.
- Logical reading order.
- Accessible quiz feedback.

---

## 14. Technology Stack and Engineering Standards

### Recommended stack

- React.
- TypeScript in strict mode.
- Vite.
- Tailwind CSS.
- Lucide icons, if needed.
- React Router or an equally reliable lightweight routing approach.
- Vitest for unit tests.
- React Testing Library for UI behavior tests, where appropriate.
- Playwright or equivalent for essential end-to-end smoke tests if feasible.

Use current stable compatible versions at implementation time. Do not blindly install outdated versions from examples.

### Engineering standards

- Keep simulator logic separate from presentation components.
- Use TypeScript types for patterns, events, variables, and simulation state.
- Avoid `any` unless justified and documented.
- Use small components with clear responsibilities.
- Avoid duplicated pattern logic.
- Avoid oversized monolithic components.
- Do not add dependencies without a clear need.
- Use semantic HTML.
- Keep the browser console free of errors and avoid React key warnings.
- Handle invalid parameters and unexpected states gracefully.
- Add automated tests for critical behavior.
- Document any intentional limitations.

### State management

Use React state/hooks or a small reducer for the current timeline index and simulation settings. Do not introduce a large state-management library unless a demonstrated need emerges.

The execution engine should be pure/deterministic where practical. UI timers used for Auto Run should be managed safely and cleaned up when paused, reset, or when the component unmounts.

---

## 15. GitHub and Vercel Deployment

### Desired workflow

`AI coding editor → GitHub repository → Vercel preview deployment → verification → production deployment`

### Requirements

- Store all application source in the GitHub repository.
- Include a complete `README.md`.
- Provide reproducible install, development, test, and build commands.
- Connect the repository to Vercel.
- Use the chosen production branch, normally `main`.
- Use preview deployments to inspect changes before promoting them.
- Configure route fallback/rewrites if required by the router.
- Ensure the production build works with Vercel's configured build command and output directory.
- Do not commit secrets, tokens, or credentials.
- No environment variables should be necessary for the initial static application unless the chosen deployment requires them.
- Ensure direct navigation and page refreshes work on supported routes.
- Verify the live site after deployment.

### Suggested scripts

The implementation should provide appropriate equivalents of:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run test`
- `npm run lint` (if a linter is configured)

Use actual project scripts and document them accurately.

### Deployment verification

After deployment, test:
- Home page loads.
- Pattern pages load directly.
- Refreshing a nested route works.
- Simulator controls work in production.
- No local-only asset paths are used.
- No missing assets or console errors occur.
- Mobile layout works.
- The latest intended GitHub commit is deployed.

---

## 16. Testing Strategy

Testing is mandatory because a visually convincing simulator can still teach incorrect loop behavior.

### 16.1 Engine unit tests

Test:
- Outer-loop initialization and condition checks.
- Inner-loop initialization on every outer iteration.
- Correct execution order.
- Condition true/false results.
- Increment and decrement operations.
- Output concatenation.
- Newline handling.
- Loop completion and program termination.
- Exact expected output for each pattern.
- Variable values at selected events.
- Backward and forward navigation.
- Parameter boundaries and invalid inputs.
- Deterministic repeated runs.

### 16.2 Pattern acceptance tests

For each pattern:
1. Compare the final output with the expected output.
2. Verify event ordering.
3. Verify condition checks.
4. Verify variable values at row boundaries.
5. Verify that output and dry run agree.
6. Verify that the code shown matches the execution definition.

### 16.3 UI tests

Test:
- Pattern selection.
- Next Step and Previous Step.
- Auto Run and Pause.
- Reset.
- Parameter changes.
- Dry-run highlighting.
- Prediction answers and feedback.
- Mobile navigation and controls.
- Completion state.

### 16.4 Manual testing

At minimum, test:
- Desktop Chrome or an equivalent modern browser.
- A narrow mobile viewport.
- Keyboard-only navigation for key interactions.
- Reduced-motion setting.
- Direct route loading and refresh.
- Production deployment.

### 16.5 Release gate

Do not consider the application complete until:
- Production build succeeds.
- Tests pass.
- All initial patterns have correct outputs.
- Previous/Next state restoration works.
- Dry-run records match the timeline.
- Responsive layout is usable.
- Deployment instructions are documented.

---

## 17. Performance and Reliability

- Keep the initial application lightweight.
- Avoid a backend and database for version 1.
- Bound row/column inputs to avoid excessively large timelines or UI freezes.
- Consider a default maximum of 10 rows for teaching patterns, with a sensible configurable upper limit.
- Validate all inputs.
- Avoid unnecessary re-rendering of large tables.
- Keep animations modest.
- Do not let Auto Run continue after Pause, Reset, pattern change, or unmount.
- Avoid hidden dependencies on a network connection after the static app has loaded.
- Ensure errors are explained in plain language.

The exact parameter limit can be adjusted based on performance tests, but it must be enforced.

---

## 18. Privacy and Data Handling

Version 1 should:
- Require no personal information.
- Require no login.
- Send no student code to a server.
- Use local storage only for non-sensitive preferences or optional local progress.
- Explain local progress limitations if stored.
- Avoid analytics or tracking unless explicitly approved and disclosed.
- Avoid collecting student performance data remotely.

If accounts, analytics, or cloud storage are added in the future, assess privacy, security, and institutional requirements first.

---

## 19. Content and Educational Quality

Every pattern must include:
- A clear title.
- A beginner-friendly description.
- A learning objective.
- Valid C source code.
- A verified expected output.
- An explanation of the outer loop.
- An explanation of the inner loop.
- An explanation of the output statement.
- An explanation of the newline.
- A dry-run trace.
- At least one prediction or practice activity.
- Any relevant limitations or assumptions.

### Content writing rules

- Use short sentences and simple language.
- Explain new terms.
- Distinguish source-code syntax from simulator labels.
- Do not tell students that every nested loop necessarily represents rows and columns; explain that it is the chosen mental model for these patterns.
- Do not confuse a condition evaluation with executing the loop body.
- Make it clear that an inner loop is reinitialized each time execution enters that loop statement.
- Preserve exact output spaces and line breaks in the simulator model.
- Use the same code and semantics across the code panel, explanations, and dry-run table.

---

## 20. Proposed Repository Structure

Use this as a starting point, adapting where it improves the implementation:

```text
c-pattern-lab/
├── public/
│   ├── favicon.svg
│   └── images/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   └── routes.tsx
│   ├── components/
│   │   ├── AppHeader.tsx
│   │   ├── PatternCard.tsx
│   │   ├── CodePanel.tsx
│   │   ├── VariableInspector.tsx
│   │   ├── OutputPanel.tsx
│   │   ├── DryRunTable.tsx
│   │   ├── ExecutionControls.tsx
│   │   ├── ConditionExplanation.tsx
│   │   └── QuizCard.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── PatternLibraryPage.tsx
│   │   ├── PatternPage.tsx
│   │   ├── PracticePage.tsx
│   │   └── AboutPage.tsx
│   ├── engine/
│   │   ├── types.ts
│   │   ├── buildTimeline.ts
│   │   ├── executePattern.ts
│   │   ├── replayState.ts
│   │   └── __tests__/
│   ├── patterns/
│   │   ├── index.ts
│   │   ├── rectangle.ts
│   │   ├── starTriangle.ts
│   │   ├── numberTriangle.ts
│   │   └── invertedTriangle.ts
│   ├── hooks/
│   │   └── useSimulation.ts
│   ├── utils/
│   ├── styles/
│   └── main.tsx
├── tests/
├── README.md
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...
```

The agent may reorganize this structure if the resulting architecture remains modular, documented, and testable.

---

## 21. Definition of Done

The initial release is done when all of the following are true:

### Product
- [ ] The home page explains the purpose of the lab.
- [ ] Students can browse and open supported patterns.
- [ ] Each pattern includes source, output, learning objectives, and explanations.
- [ ] The simulator has all required execution controls.
- [ ] Code highlighting, variables, output, and dry run stay synchronized.
- [ ] Prediction questions provide meaningful feedback.
- [ ] The interface is usable on desktop and mobile.
- [ ] The app can be used without login.

### Execution accuracy
- [ ] The engine models the documented C subset correctly.
- [ ] Inner-loop initialization occurs at the correct time.
- [ ] Condition checks and updates appear in the right order.
- [ ] Output spacing and newlines are preserved.
- [ ] Previous Step restores the exact earlier state.
- [ ] Every pattern has automated correctness tests.
- [ ] The displayed source code matches the executed definition.

### Engineering and deployment
- [ ] TypeScript build succeeds.
- [ ] Linting and tests pass if configured.
- [ ] No critical console errors remain.
- [ ] README contains local development and deployment instructions.
- [ ] GitHub-to-Vercel deployment is configured.
- [ ] Direct route access and refresh work in production.
- [ ] The deployed application has been smoke-tested.

---

## 22. Instructions to the Agentic AI Developer

The following section is intended to be pasted into Antigravity, Claude, or another agentic coding environment along with this document.

### Master implementation instruction

You are the lead frontend engineer and educational software designer responsible for implementing **C Programming Pattern Lab** from this PRD.

**Your task is to build the working application, not merely propose a plan, create a mockup, or provide code snippets.**

#### Before coding
1. Inspect the existing workspace and repository.
2. If the repository already contains a project, understand it and preserve useful existing work.
3. Identify the existing framework, scripts, and deployment assumptions.
4. Create a concise implementation checklist internally or in the repository.
5. Resolve ordinary implementation choices using sensible defaults; do not stop for approval on non-critical details.

#### Implementation
1. Implement the complete in-scope version 1 defined in this document.
2. Use React, TypeScript, Vite, and Tailwind CSS unless the repository has a justified existing stack that should be preserved.
3. Build a polished, responsive, accessible interface.
4. Implement the deterministic simulator engine before relying on UI animations.
5. Ensure code highlighting, variables, condition evaluations, output, and dry-run data all come from the same execution state/timeline.
6. Implement manual forward/backward stepping, Auto Run, Pause, Reset, speed controls, and bounded parameters.
7. Implement the initial verified pattern library.
8. Implement prediction challenges and feedback.
9. Write and run tests for the engine and critical UI behavior.
10. Document the supported subset of C and the fact that arbitrary C code is not compiled or executed.
11. Add a comprehensive README with development, testing, build, GitHub, and Vercel deployment instructions.
12. Do not add authentication, a database, a backend, paid services, or out-of-scope features.
13. Do not use `eval`, `new Function`, or unsafe arbitrary-code execution.
14. Do not leave core functionality as a TODO, static mockup, or non-functional button.

#### Quality requirements
- The app must be genuinely usable, not just visually impressive.
- No fake execution data or disconnected UI panels.
- No inaccurate or manually fabricated dry-run records.
- No unexplained placeholder controls.
- No avoidable TypeScript errors, lint failures, or console errors.
- No broken routes or unhandled reset/pause behaviors.
- Keep the design consistent and readable on mobile.
- Validate pattern outputs and execution order with automated tests.
- Use accessible labels and keyboard-operable controls.

#### Verification
After implementation:
1. Install dependencies using the package manager appropriate to the project.
2. Run tests.
3. Run linting if configured.
4. Run a production build.
5. Fix failures instead of merely reporting them.
6. Test every initial pattern's output and execution trace.
7. Verify Previous Step, Next Step, Auto Run, Pause, Reset, and parameter changes.
8. Verify the application at a narrow viewport.
9. Verify route loading/refresh behavior.
10. Summarize what was implemented, tests run, build status, known limitations, and the exact steps the project owner must take to connect or verify GitHub and Vercel.

If the environment cannot access GitHub or Vercel credentials, do not claim that deployment is complete. Finish the local application and provide clear deployment steps instead.

**Proceed autonomously through implementation and verification.** Make sensible design decisions, maintain modular code, and prioritize correctness of the teaching simulator over unnecessary features.

---

## 23. Recommended First-Release Priorities

If implementation time or context becomes constrained, prioritize in this order:

1. Correct execution engine and event timeline.
2. Accurate dry-run table and synchronized output.
3. One fully functional increasing star triangle.
4. Previous/Next, Auto Run, Pause, and Reset.
5. Rectangle and number triangle.
6. Pattern library and polished navigation.
7. Prediction questions.
8. Responsive and accessibility refinements.
9. Additional patterns.
10. Optional progress persistence.

Do not sacrifice execution correctness to add more patterns quickly.

---

## 24. Final Product Statement

C Programming Pattern Lab is an interactive learning environment for beginning programming students. Its defining feature is a faithful, step-by-step visualization of nested-loop execution, connecting C source code to variables, conditions, output, and dry-run reasoning.

The product should help students move from memorizing patterns to understanding how the program generates them.

**Final guiding principle: Every visible step must represent a real, deterministic event in the supported simulator—not a decorative animation.**
