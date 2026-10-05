import {
  Button,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
} from "cursor/canvas";

const SLIDES = [
  "The method",
  "Simplicity, above all",
  "The loop",
  "Compound skills",
  "Planning skill changes",
  "ExecPlans",
  "ExecPlan sections",
  "Where decisions live",
  "Ontology",
  "Three agents",
  "Maintaining the harness",
  "Coding rules",
  "Rules by kind of work",
  "Tests and the test environment",
  "Git as the record",
  "Advanced: graph and worktrees",
  "Docs map",
  "Sibling systems",
  "Cold start",
] as const;

export default function AgenticCodingMethodology() {
  const [slide, setSlide] = useCanvasState("slide", 0);
  const index = Math.min(Math.max(slide, 0), SLIDES.length - 1);

  return (
    <Stack gap={16}>
      <Row align="center" justify="space-between" gap={12}>
        <Stack gap={4}>
          <H1>Agentic coding method</H1>
          <Text tone="secondary" size="small">
            A practice for keeping several coding agents on one written method.
            Lessons only. No product, customer, or repository is named.
          </Text>
        </Stack>
        <Pill active size="sm">
          {index + 1} / {SLIDES.length}
        </Pill>
      </Row>

      <Grid columns="240px 1fr" gap={20} align="start">
        <Stack gap={4}>
          {SLIDES.map((title, i) => (
            <Button
              key={title}
              variant={i === index ? "primary" : "ghost"}
              onClick={() => setSlide(i)}
            >
              {i + 1}. {title}
            </Button>
          ))}
        </Stack>

        <Stack gap={14}>
          <Row gap={8}>
            <Button
              variant="secondary"
              disabled={index === 0}
              onClick={() => setSlide(index - 1)}
            >
              Previous
            </Button>
            <Button
              variant="primary"
              disabled={index === SLIDES.length - 1}
              onClick={() => setSlide(index + 1)}
            >
              Next
            </Button>
          </Row>
          <SlideBody index={index} />
        </Stack>
      </Grid>

      <Divider />
      <Text tone="tertiary" size="small">
        Simplicity sits above every other rule: the smallest readable change
        that does what was asked. Policy files stay short. Detail lives in
        package docs.
      </Text>
    </Stack>
  );
}

function SlideBody({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <Overview />;
    case 1:
      return <Simplicity />;
    case 2:
      return <Loop />;
    case 3:
      return <Skills />;
    case 4:
      return <PlanSkill />;
    case 5:
      return <ExecPlanWhy />;
    case 6:
      return <ExecPlanSections />;
    case 7:
      return <Decisions />;
    case 8:
      return <Ontology />;
    case 9:
      return <Sync />;
    case 10:
      return <Harness />;
    case 11:
      return <Coding />;
    case 12:
      return <KindOfWork />;
    case 13:
      return <Tests />;
    case 14:
      return <GitRecord />;
    case 15:
      return <Advanced />;
    case 16:
      return <DocsMap />;
    case 17:
      return <Siblings />;
    default:
      return <ColdStart />;
  }
}

function Overview() {
  return (
    <Stack gap={14}>
      <H2>One method, several agents</H2>
      <Callout tone="warning" title="Above every other rule: simplicity">
        Do the smallest readable thing that produces the behavior that was
        asked for. Every later rule yields when it would add code, process,
        or abstraction the request does not need.
      </Callout>
      <Text>
        An agent that opens the codebase cold follows a written path. It
        chooses an idea, writes what to build, writes how to build it as an
        execution plan, reviews that document, implements test-first against
        a test environment, reviews the diff, then records a learning only
        when the finished code would not teach the lesson. Chat memory is not
        the system of record. Git history and the docs tree are.
      </Text>
      <Row gap={16} wrap>
        <Stat value="8" label="Stages in the loop" />
        <Stat value="3" label="Agents kept in sync" />
        <Stat value="12" label="Required ExecPlan sections" />
        <Stat value="Test only" label="Where tests and live checks run" />
      </Row>
      <Callout tone="info" title="What this talk is">
        Transferable lessons: how to plan, review, test, remember decisions,
        and keep agent instructions from rotting. Examples are patterns
        (a batch job, a web UI, a sibling service), not a particular product.
      </Callout>
    </Stack>
  );
}

function Simplicity() {
  return (
    <Stack gap={12}>
      <H2>Simplicity is the rule the others serve</H2>
      <Text>
        When two instructions compete, pick the simpler change that still
        does what was asked. A clever design, a fuller plan, or a stricter
        process does not win on its own. The user can always ask for more.
        The agent does not add it first.
      </Text>
      <Table
        headers={["Order", "What wins"]}
        rows={[
          ["1", "What the user asked for in this conversation."],
          ["2", "Simplicity: the smallest change a person can read and still see the requested behavior."],
          ["3", "Every other rule in this method: plans, reviews, tests, ontology, git ceremony, graphs, worktrees."],
        ]}
        rowTone={["neutral", "warning", "info"]}
      />
      <H3>What simplicity means in the work</H3>
      <Text>
        Prefer the simplest design that works. Prefer readable code over a
        clever abstraction. Change as few lines as the fix needs. Do not
        optimize before something is slow. Do not introduce a pattern, a
        framework, or an extra module for a problem a named function can
        hold. Do not add edge cases, fallbacks, retries, caches, logging
        systems, or validation that nobody asked for. If a further
        improvement looks useful, stop and ask.
      </Text>
      <H3>What it demotes</H3>
      <Text>
        A one-step fix does not get an ExecPlan, a worktree, a graph tour, or
        a new glossary entry. Those tools are for work that is actually
        multi-step, easy to get wrong twice, or hard to resume. Batch rules,
        UI checks, and the test environment still apply, because skipping
        them would make the change unsafe. They do not justify extra
        behavior. Modularity shapes the code that was requested. It is not a
        reason to split files or add helpers the change does not need.
      </Text>
      <Callout tone="info" title="Ask, then wait">
        The minimal fix is the default. Anything beyond it is a question,
        not a surprise in the diff.
      </Callout>
    </Stack>
  );
}

function Loop() {
  return (
    <Stack gap={12}>
      <H2>The loop</H2>
      <Text>
        Each stage answers one question and writes one kind of artifact. The
        next stage reads that artifact. It does not re-decide the previous
        question.
      </Text>
      <Table
        headers={["Stage", "Skill", "Question", "Lands in"]}
        rows={[
          ["1. Ideate", "ce-ideate", "Which ideas are worth exploring?", "docs/ideation/"],
          ["2. Brainstorm", "ce-brainstorm", "What should we build?", "docs/brainstorms/, a requirements doc"],
          ["3. Plan", "ce-plan", "How do we build this one goal?", "docs/plans/, an ExecPlan"],
          ["4. Document review", "ce-doc-review", "Would this plan cause the wrong work?", "Edits inside the plan"],
          ["5. Vet", "vet-reviews", "Which outside comments do we accept?", "Accept or reject before code"],
          ["6. Work", "ce-work", "Does the plan now behave as specified?", "Code, tests, living plan sections"],
          ["7. Code review", "ce-code-review", "Does the diff match the plan?", "Findings. Apply only when asked."],
          ["8. Compound", "ce-compound", "Would a future agent repeat this mistake?", "docs/solutions/, only if the bar is met"],
        ]}
      />
      <Text tone="secondary" size="small">
        Code review used to be invoked as ce:review. The current name is
        ce-code-review. Vet sits after document review and again after any
        review written by another model. It is a filter, not a second author.
      </Text>
    </Stack>
  );
}

function Skills() {
  return (
    <Stack gap={12}>
      <H2>Compound engineering, used as a system</H2>
      <Text>
        The skills are a pipeline with hard boundaries. Ideation does not
        write requirements. Brainstorming does not write implementation.
        Planning does not write code. Compounding does not fire on every
        finished task.
      </Text>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>Before code</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                ce-ideate grounds ideas in the repo, critiques all of them,
                and stops at a ranked list.
              </Text>
              <Text>
                ce-brainstorm turns one chosen idea into requirements:
                problem, scope, success, and at least one non-goal.
              </Text>
              <Text>
                A grilling pass runs inside planning, one open question at a
                time, before a durable plan is drafted.
              </Text>
              <Text>
                ce-plan writes the ExecPlan, then a confidence pass, then a
                mandatory document review. Those two passes catch different
                defects.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>During and after code</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                ce-work implements the plan and verifies it. It does not
                reopen product decisions.
              </Text>
              <Text>
                ce-debug is the path for an open bug that is not yet a plan.
              </Text>
              <Text>
                ce-code-review reports defects against the intended behavior.
                A bare review does not edit the tree.
              </Text>
              <Text>
                Before a significant fix, search docs/solutions/ so a known
                incident is not solved again from scratch.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <H3>The compound bar</H3>
      <Text>
        ce-compound writes one learning under docs/solutions/ only when the
        reasoning would be lost from the final code, tests, and existing
        docs. Completion and a large diff do not qualify. Ask: if this note
        vanished, would the next engineer repeat the mistake? If not, write
        nothing. A separate refresh pass keeps the concepts glossary and
        stale learnings aligned with the code.
      </Text>
    </Stack>
  );
}

function PlanSkill() {
  return (
    <Stack gap={12}>
      <H2>Local changes to the planning skill</H2>
      <Text>
        Upstream compound-engineering planning is still there. Durable plans,
        in every project, are forced through three overrides. A one-line
        answer and a short chat brief skip them. Work that touches
        authentication, payments, migrations, persistent data, batch jobs, or
        an external contract is always a durable ExecPlan.
      </Text>
      <Table
        headers={["Override", "What it replaces", "Rule"]}
        rows={[
          [
            "1. Structure",
            "The default plan template and its frontmatter",
            "Read the repo's PLANS.md end to end. Section names, order, and prose style come from that file.",
          ],
          [
            "2. Grill first",
            "Drafting from the first plausible design",
            "Resolve every blocking branch before writing. Do not re-ask a decision the user already chose against an alternative.",
          ],
          [
            "3. Place and name",
            "Upstream filenames",
            "Package docs/plans/. Date plus a three-digit ID unique across the whole tree, including archived plans. One goal. One-time scripts carry that same ID.",
          ],
        ]}
      />
      <Callout tone="neutral" title="Two reviews, both required">
        The confidence check strengthens rationale, sequencing, and risk. The
        document review checks coherence, feasibility, and scope. Skipping
        the document review because the confidence check already ran is not
        allowed.
      </Callout>
      <Text>
        Purpose states the observable outcome first. If the approach is
        already fixed, it is a separate means line that points at the
        Decision Log. The approach is not the goal. Validation names the
        project's real test commands, and those commands load the test
        environment. Abandoned experiments are removed from the diff before
        the plan is called done.
      </Text>
    </Stack>
  );
}

function ExecPlanWhy() {
  return (
    <Stack gap={12}>
      <H2>What an ExecPlan is for</H2>
      <Text>
        An ExecPlan is the OpenAI execution-plan format, written down in a
        root PLANS.md and followed to the letter. It exists because an
        implementing agent has no memory of the design conversation. The
        reader is a novice with the working tree and this one file.
      </Text>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>The failure it prevents</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                A plan that says "add a health check" can be implemented
                without anyone being able to see that it works.
              </Text>
              <Text>
                A plan that says "as discussed" dies when the chat ends.
              </Text>
              <Text>
                A plan with many subsystems cannot be verified until all of
                them land, so a failure has no owner.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>The bar</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                Self-contained. Every term of art is defined in the file.
              </Text>
              <Text>
                Outcome first. Acceptance is a command and an output a person
                can observe.
              </Text>
              <Text>
                Living. Progress, surprises, decisions, and the retrospective
                are updated as the work proceeds, not after the fact.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <H3>How a plan is allowed to grow</H3>
      <Text>
        One easily achievable goal per file. If the draft spans an API, a
        parser, a datastore, a UI, and a migration, stop and split before
        writing. Related plans sit in a program folder. A phase plan
        sequences the child plans. It does not absorb their work. The
        filename carries a three-digit ID that is unique across the whole
        plans tree, including completed and archived plans. One-time scripts
        use that same ID, so a script, a git tag, and a plan file point at
        one goal.
      </Text>
      <Text>
        Milestones tell the story: goal, work, result, proof. Progress is
        the fine grain: checkboxes with timestamps, including a half-finished
        step split into done and remaining. A prototyping milestone is
        allowed when it reduces risk. It is labeled as a prototype and says
        how to promote it or throw it away. When the plan file is revised, a
        short note at the bottom says what changed and why, and the living
        sections are updated to match.
      </Text>
    </Stack>
  );
}

function ExecPlanSections() {
  return (
    <Stack gap={12}>
      <H2>ExecPlan sections, and the problem each one solves</H2>
      <Text>
        Checklists are allowed only in Progress. Everywhere else the plan is
        prose. When the markdown file is only the plan, it is not wrapped in
        a code fence. Commands and short transcripts are indented.
      </Text>
      <Table
        headers={["Section", "Problem it solves"]}
        rows={[
          [
            "Purpose / Big Picture",
            "Stops a plan that only describes code. States what someone can do afterward, and how to see it. The chosen approach, if already fixed, is a means line, not the goal.",
          ],
          [
            "Progress",
            "Lets a later session resume. Timestamped checkboxes. A half-done step is split into done and remaining so the file matches reality.",
          ],
          [
            "Surprises & Discoveries",
            "Keeps evidence that would die in chat: an unexpected bug, a performance tradeoff, a command transcript. The next agent does not rediscover it.",
          ],
          [
            "Decision Log",
            "Stops re-deciding. Each entry is the decision, the rationale, and the date. Choices already made in the design session are written here.",
          ],
          [
            "Outcomes & Retrospective",
            "At a milestone, compares the result with the original purpose: what shipped, what remains, what the plan got wrong.",
          ],
          [
            "Context and Orientation",
            "Teaches a novice the current code. Names files and defines terms. Does not say 'as discussed' or point at a blog.",
          ],
          [
            "Plan of Work",
            "Says which file and which function change, in prose. It decides the approach. It does not paste the finished patch.",
          ],
          [
            "Concrete Steps",
            "Exact commands, the working directory, and a short expected transcript. Updated when the real commands differ from the draft.",
          ],
          [
            "Validation and Acceptance",
            "A behavior someone can check. Names the real test command in the test environment, and says which new test fails before the change and passes after.",
          ],
          [
            "Idempotence and Recovery",
            "Says which steps are safe to repeat, how to retry a step that failed halfway, and how to roll back anything destructive.",
          ],
          [
            "Artifacts and Notes",
            "Keeps the short log, diff, or transcript that proves success, inside the plan, so the proof is not only on one machine.",
          ],
          [
            "Interfaces and Dependencies",
            "Names the modules to use and the signatures that must exist at the end. Stops an agent from inventing a second library for the same job.",
          ],
        ]}
      />
    </Stack>
  );
}

function Decisions() {
  return (
    <Stack gap={12}>
      <H2>Where a decision is allowed to live</H2>
      <Text>
        There is no single decisions database. A decision lives at the layer
        that matches how long it must survive, and who must see it on every
        turn.
      </Text>
      <Table
        headers={["Layer", "Where", "Use it for"]}
        rows={[
          [
            "This plan",
            "Decision Log inside the ExecPlan",
            "Choices made while designing or building that one goal.",
          ],
          [
            "Standing style",
            "docs/architecture/",
            "How plans are scoped, how modules are shaped, how helpers are placed.",
          ],
          [
            "Domain design",
            "docs/architecture/",
            "Boundaries that agents keep rediscovering: who owns a file, what a pipeline may retry, what a UI may assume.",
          ],
          [
            "Settled choices",
            "docs/solutions/architecture-decisions/",
            "A choice a future agent would otherwise reopen, including what was rejected and why.",
          ],
          [
            "Incidents",
            "docs/solutions/",
            "A solved failure whose reasoning is not obvious from the final code.",
          ],
          [
            "Vocabulary",
            "A concepts glossary",
            "Names that must mean the same thing in every later plan.",
          ],
          [
            "Every turn",
            "AGENTS.md, CLAUDE.md, the Cursor rule",
            "Short non-negotiables and links. Not the design essay.",
          ],
        ]}
        rowTone={["info", "neutral", "neutral", "success", "neutral", "neutral", "warning"]}
      />
    </Stack>
  );
}

function Ontology() {
  return (
    <Stack gap={12}>
      <H2>Ontology: a shared model agents can obey</H2>
      <Text>
        In 2026 this is an active topic because agents act through APIs, not
        through a screen a human can correct in the moment. The public
        argument is that a team needs one canonical model of its domain:
        the objects, the relationships, the invariants, and which actions are
        allowed. Palantir-style ontology-driven development treats that model
        as operational, not as a slide. A knowledge-layer writeup (Neo4j)
        splits it into three parts: the ontology (what the business means),
        the data (what is true now), and memory (what was tried and learned).
        An engineering playbook calls the same idea a typed world model:
        domain-driven design's ubiquitous language, written so a machine can
        check it. A 2026 paper on auditable agents starts from a
        human-authored ontology and only then derives agent roles.
      </Text>
      <Grid columns={2} gap={12}>
        <Card>
          <CardHeader>What this practice already does</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                A concepts glossary defines the stable words before
                architecture, plans, or incident notes use them. It says what
                each term is, and which nearby term it must not be confused
                with.
              </Text>
              <Text>
                ExecPlans define any unusual term in the plan itself, so a
                cold agent does not invent a second meaning.
              </Text>
              <Text>
                Architecture notes and decision records hold the invariants:
                which system owns a job, which retry is allowed, which
                shortcut is rejected.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>What it is not yet</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                It is a written ubiquitous language, not a formal schema in
                OWL or RDF, and not an ontology SDK that generated code must
                compile against.
              </Text>
              <Text>
                Invariants are enforced by review and tests, not by a
                knowledge graph that blocks an illegal agent action at
                runtime.
              </Text>
              <Text>
                The code graph in the advanced section is a map of functions
                and files. That is a different layer from a domain ontology.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>
      <Text tone="secondary" size="small">
        Sources: Applied AI Society, Ontology-Driven Development; Neo4j,
        The Enterprise Knowledge Layer; DevFloor9 engineering playbook,
        Ontology Engineering; arXiv 2606.04903, human-authored ontologies for
        auditable agents.
      </Text>
    </Stack>
  );
}

function Sync() {
  return (
    <Stack gap={12}>
      <H2>Three agents read three files</H2>
      <Text>
        Claude Code reads CLAUDE.md. Codex reads AGENTS.md. Cursor reads an
        always-on policy rule. At each location those three files are one
        policy. A change in any of them is copied to the other two. The root
        holds cross-package rules. Each package holds its own trio. A nested
        guide next to the code wins over the package file, which wins over
        the root.
      </Text>
      <Table
        headers={["Agent", "What it loads", "Scope"]}
        rows={[
          ["Claude Code", "CLAUDE.md", "Root, each package, and nested guides beside the code"],
          ["Codex", "AGENTS.md", "The same locations. The package file is the companion to that package's CLAUDE.md."],
          ["Cursor", "An always-on policy rule", "The same policy, in the rule format that tool loads every turn"],
        ]}
      />
      <Callout tone="warning" title="Drift is the failure">
        The same paragraph copied in full into the root, the package, and a
        nested file will diverge. Keep one canonical statement, link to it,
        and put the long procedure in docs.
      </Callout>
    </Stack>
  );
}

function Harness() {
  return (
    <Stack gap={12}>
      <H2>Maintaining the harness</H2>
      <Text>
        The harness is everything an agent loads before it touches code:
        policy files, skills, and the docs those files point at. It rots by
        accumulation. Maintenance is a habit, not a rewrite.
      </Text>
      <H3>1. Prune the every-turn files first</H3>
      <Text>
        AGENTS.md, CLAUDE.md, and the Cursor policy rule are loaded on almost
        every turn. Every extra paragraph competes with the code. They should
        stay a map: non-negotiables, commands, and links. After a program of
        plans lands, or when a session spends its context re-reading policy,
        cut them back.
      </Text>
      <Table
        headers={["Signal", "Action"]}
        rows={[
          [
            "The same block exists in all three agent files",
            "Keep one short sentence in each. Put the procedure in one doc and link it.",
          ],
          [
            "A section names a finished migration, an old path, or a retired tool",
            "Delete it from the every-turn file. Git history is the archive.",
          ],
          [
            "A table is only needed for one kind of task",
            "Move it to a skill or to docs/references.",
          ],
        ]}
      />
      <Text>
        Do not prune the overarching rule: simplicity comes before every
        other instruction except the user's request. Also keep the
        non-negotiables: tests use the test environment only, do not edit
        vendored framework code, ask before a worktree, keep the three agent
        files in sync, strict test-first development, one goal per plan, and
        no silent defaults.
      </Text>
      <H3>2. Update skills without losing local edits</H3>
      <Text>
        The update-skill workflow installs or upgrades skills from an upstream
        repository while keeping local changes. It is not a blind overwrite.
        Skills live in a user copy per agent, and a git backup in the
        repository is the history those user copies do not have. Cursor's
        skills directory is a link to one of those copies. Write to the real
        copy, not through the link.
      </Text>
      <Text>
        For each skill, classify it. New: install it, and say which existing
        skill it overlaps. Unmodified: replace the folder with upstream.
        Customized: never replace the folder. Diff against the upstream
        version it started from, then show three lists and wait for approval
        on each item: customizations to keep, bugs in the local copy, and
        upstream improvements worth taking. If upstream renamed or retired a
        skill, say what replaces it. Sibling skills that still use the old
        name are part of the same plan. A shallow clone is not enough when
        the baseline commit is older than that clone. Deepen the history
        before calling a skill unmodified.
      </Text>
      <H3>3. Keep the rest of the harness pointed at docs</H3>
      <Text>
        Nested guides hold local gotchas for one folder. The root file does
        not repeat them. A session-orientation script can list features and
        the test command. It does not become a second policy. When policy
        text does change, mirror it across the three agent files at that
        location in the same change.
      </Text>
    </Stack>
  );
}

function Coding() {
  return (
    <Stack gap={12}>
      <H2>Rules that keep the code modular</H2>
      <Text>
        These sit under simplicity. They shape the change that was asked
        for. They do not authorize a new feature, a fallback, a second code
        path, or a split that exists only to look organized.
      </Text>
      <Table
        headers={["Decision", "What it means"]}
        rows={[
          [
            "Framework first",
            "Search the framework the app already uses before writing a new subsystem. Extend it in the project's extension folder. Do not edit the vendored framework.",
          ],
          [
            "Deep modules",
            "Few functions, obvious inputs and outputs, substantial behavior behind them. Do not split a file only to lower the line count.",
          ],
          [
            "Helper placement",
            "The main file orchestrates. Helpers for that script live in a folder beside it, named from the script.",
          ],
          [
            "One goal per plan",
            "If the draft has several independently shippable outcomes, stop and ask to split.",
          ],
          [
            "Explicit resources",
            "No silent localhost, default database, or alternate model. Missing configuration fails immediately.",
          ],
          [
            "Root cause",
            "Name the first bad step. A patch of the visible symptom is labeled temporary and is not called done.",
          ],
          [
            "Context before tables",
            "A status reply opens with what is in scope and what passing means, then the counts.",
          ],
        ]}
      />
    </Stack>
  );
}

function KindOfWork() {
  return (
    <Stack gap={12}>
      <H2>Rules that depend on the kind of work</H2>
      <Text>
        The shared method is the same everywhere. Some rules exist only
        because of the technology. They live in the package policy for that
        kind of system, not in the root file. Two examples: long-running
        batch jobs, and a web UI.
      </Text>
      <H3>Batch jobs</H3>
      <Text>
        A batch job processes many units and is expected to be interrupted.
        The rules exist so a second run is safe and a failed run can
        continue.
      </Text>
      <Table
        headers={["Rule", "Example"]}
        rows={[
          [
            "Idempotent",
            "Running the same inputs again does not insert a second copy, send a second write, or leave a half-applied mix of old and new state.",
          ],
          [
            "Durable failure",
            "A failed unit is stored with a stable identity: which program, which item, which failure class. The record is updated on retry. It is not only a line in a log that scrolls away.",
          ],
          [
            "Resume, do not restart",
            "Completed units are skipped. The next run starts at the first unit that is not done. It does not reprocess the job from the first item.",
          ],
          [
            "Recovery is a program",
            "The failure record is enough for a later recovery run to retry that unit without an agent re-reading the original session.",
          ],
        ]}
      />
      <H3>Web UI</H3>
      <Text>
        A UI change is not done when the code compiles. It is done when a
        person can exercise the flow in a browser against safe data.
      </Text>
      <Table
        headers={["Rule", "Example"]}
        rows={[
          [
            "Verify the flow",
            "Start the dev server and click, type, and navigate. A single screenshot of the happy path is not verification. Check loading, empty, and error states.",
          ],
          [
            "Two widths",
            "Check a phone width and a desktop width when layout changed. Shared state is checked on every page that reads it, not only the page that was edited.",
          ],
          [
            "Existing components",
            "Use the design system and its components before adding a new primitive. Prefer strict types. Do not use an unchecked any.",
          ],
          [
            "Test-backed API",
            "If the screen calls an API, that API is the test-environment server. A UI check never points at production data.",
          ],
          [
            "First bad step",
            "Before patching a visual symptom, find whether the fault is the request, the response shape, client state, provider order, layout, or the process that is actually running.",
          ],
        ]}
      />
    </Stack>
  );
}

function Tests() {
  return (
    <Stack gap={12}>
      <H2>Tests run only in the test environment</H2>
      <Callout tone="warning" title="Non-negotiable">
        Automated tests and live checks load a dedicated test environment.
        They never load the production environment file, production database
        names, or production credentials. A green suite against the wrong
        environment is a failure, not a pass.
      </Callout>
      <Text>
        The test environment is selected by a script or file that points
        every resource (databases, queues, model endpoints that tests are
        allowed to hit) at test instances. There is no silent fallback to
        localhost or to production if a variable is missing. The run fails
        fast. Live verification of an API means a real server process started
        from that same test environment, on a port that is not the one an
        already-running local server uses, exercised with test data. A mocked
        handler or a hand-written sample response is not live verification.
        A UI flow that calls the API points its base URL at that
        test-backed server.
      </Text>
      <H3>Test-first, and explain the test</H3>
      <Text>
        Every code change follows red, green, refactor, one behavior at a
        time. Writing the whole suite first, then the implementation, locks
        an imagined shape. Those tests break on refactors that did not change
        behavior.
      </Text>
      <Table
        headers={["Moment", "What happens", "What is said out loud"]}
        rows={[
          [
            "Before the test",
            "Name one observable behavior and the layer: unit, integration, or live.",
            "Which fact this test locks, and why this layer is the one that can see it.",
          ],
          [
            "Red",
            "Write the failing test. Run it in the test environment. Show the failure.",
            "The command, the assertion, and the failure that proves the test can fail.",
          ],
          [
            "Green",
            "The smallest code that makes that test pass.",
            "What changed, and that this test would fail again if that behavior regressed.",
          ],
          [
            "Refactor",
            "Clean up only while the same tests stay green.",
            "Behavior did not change. A test that broke was coupled to internals.",
          ],
        ]}
        rowTone={["info", "warning", "success", "neutral"]}
      />
      <Text>
        Pure logic is a unit test. Interactions, API contracts, and database
        flows are integration tests against the test environment. A bug fix
        starts from a regression test that fails on the unfixed code. A plan
        names the test files and the scenarios so the implementer does not
        invent coverage during the work.
      </Text>
    </Stack>
  );
}

function GitRecord() {
  return (
    <Stack gap={12}>
      <H2>Git is the system of record</H2>
      <Text>
        Chat scrolls away. Copies named _old or _backup, and commented-out
        previous versions, are not a backup. Commits are. Commit after each
        coherent change, with a message that says why. Do not commit secrets,
        environment files, credentials, or generated dumps.
      </Text>
      <H3>Tags for significant commits</H3>
      <Text>
        After the commit that finishes an ExecPlan or a major feature, create
        an annotated tag on that commit. A plan tag uses the plan ID, for
        example plan-020-short-name. A major feature with no plan ID uses a
        feature- prefix. Ordinary small commits are not tagged. The tag is
        created locally and is not pushed unless someone asks. Tags matter
        because the reflog expires. A tag is the durable bookmark.
      </Text>
      <H3>Other git rules</H3>
      <Text>
        Stay on the current branch. Do not create or switch branches unless
        asked.         Do not push or merge unless asked, except through gitsaver, below. Do not force-push the default branch. Do not skip
        hooks. Do not amend a commit that failed its hook, or a commit that
        was already pushed, unless that was explicitly requested. Stage named
        paths. Do not stage everything in the tree with one blanket add.
      </Text>
      <H3>Git time travel</H3>
      <Text>
        Use the git time-travel skill when a regression needs a cause, lost
        work needs recovery, or a line needs its history. Bisect between a
        known-good commit and a known-bad commit, with a test that is
        deterministic. A flaky test will mark the wrong commit. Blame, and a
        search of history for when a string appeared or disappeared, answers
        why code exists. The reflog shows every move of HEAD and can recover
        a commit that no branch points at. Take a backup branch before a
        rebase or other history rewrite. If a force push is truly required,
        use the form that refuses to overwrite remote commits you have not
        seen. If a rebase gets stuck, abort it.
      </Text>
      <H3>Gitsaver</H3>
      <Text>
        Gitsaver runs only when someone types the command and a new branch
        name, for example `/gitsaver next-work`. A sentence like "save my
        work" does not start it. Invoking it is the approval for the full
        sequence in that repository: commit, push, open a pull request,
        squash-merge if checks allow, then create and push the named branch
        for the next piece of work.
      </Text>
      <Table
        headers={["Step", "What it does"]}
        rows={[
          ["Find the repo", "Uses the git root of the working directory. If several nested repositories changed, it asks which ones. It does not commit across them silently."],
          ["Classify files", "Stages source, tests, docs, and migrations. Skips secrets, environment files, dependencies, logs, and live databases. Asks only when a file is ambiguous."],
          ["Commit", "Stages specific paths. Never adds the whole tree at once. Message follows recent commit style."],
          ["Publish", "Pushes, opens a pull request against the detected default branch, and squash-merges if checks and permissions allow."],
          ["Continue", "Checks out the default branch, pulls, then creates and pushes the new branch name. If the name exists, it appends a suffix and continues."],
          ["Stop", "Stops on secrets in the staged set, merge conflicts, a blocked merge, or a failed push. It does not force-merge and it never commits directly on the default branch."],
        ]}
      />
    </Stack>
  );
}

function Advanced() {
  return (
    <Stack gap={12}>
      <H2>Advanced concepts</H2>
      <H3>A code graph, then the source</H3>
      <Text>
        A code knowledge graph answers "what connects to what" faster than a
        text search of a large tree. The working rule is map, then street
        view. Query the graph for a connection, a path from one symbol to
        another, or the neighborhood of a concept. Then read the files it
        names before any edit. The graph orients. The source is what gets
        changed.
      </Text>
      <Table
        headers={["Situation", "Prefer"]}
        rows={[
          ["How does one part reach another?", "Graph query, then read the endpoints"],
          ["Exact error text, or a known symbol rename", "Text search only"],
          ["The file is already open", "Read it. Skip the graph."],
          ["About to edit", "Read the source even if the graph already named it"],
          ["Graph is missing or the user said to skip it", "Text search and reading only"],
        ]}
      />
      <Text>
        After code changes, update the graph from the syntax tree so the next
        session is not querying a stale map. One vague query is not an
        inventory. If the hits look thin, query again with a symbol name.
        This graph is not the domain ontology. It does not define what a
        business term means. It shows how code refers to code.
      </Text>
      <H3>Worktrees</H3>
      <Text>
        A git worktree is a second working directory for the same repository,
        usually on another branch, sharing the object database. It lets two
        lines of work stay checked out at once without stashing. That
        isolation is useful for a risky experiment or a review that must not
        disturb the current checkout. It is not the default.
      </Text>
      <Text>
        Stay in the current branch and the current worktree unless the user
        asks for another one, or approves one after you explain why isolation
        would help. Do not infer that approval from the kind of task. A
        script that creates a worktree is under the same rule.         Gitsaver is a different tool: it moves the current checkout through a
        pull request onto a new branch. A worktree adds a second checkout.
      </Text>
    </Stack>
  );
}

function DocsMap() {
  return (
    <Stack gap={12}>
      <H2>Where the written method lives</H2>
      <Text>
        There is no single docs folder at the very top that tries to explain
        every package. Each package keeps its own tree. Each document starts
        with a short table of contents. A second package, such as a web UI,
        gets the same shape even when it has fewer files.
      </Text>
      <Table
        headers={["Folder", "Role"]}
        rows={[
          ["critical/", "Index of rules that must be applied before coding."],
          ["architecture/", "Standing design: boundaries, module shape, failure contracts."],
          ["database/", "Storage design and compatibility notes."],
          ["ideation/", "Ranked ideas. Not requirements and not a plan."],
          ["brainstorms/", "What to build. The origin document for planning."],
          ["plans/", "ExecPlans, program subfolders, completed work, and an archive."],
          ["solutions/", "Learnings, including architecture decisions and incident writeups."],
          ["references/", "Operating policy, test layout, plan-ID rules, the concepts glossary, environment setup."],
          ["prompts/", "Reusable operator prompts. Not agent policy."],
        ]}
      />
    </Stack>
  );
}

function Siblings() {
  return (
    <Stack gap={12}>
      <H2>Related systems share a contract, not code</H2>
      <Text>
        When several repositories cooperate, the failure mode is an agent
        "fixing" a problem in the wrong one. The cure is a short
        cross-reference document that says what each system owns, the only
        shared surface, and what each system must never do.
      </Text>
      <Grid columns={3} gap={12}>
        <Card>
          <CardHeader>Produces inputs</CardHeader>
          <CardBody>
            <Text>
              A sibling service acquires or generates the raw inputs. It has
              its own policy files and its own plans. It is not a module of
              the application.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Consumes inputs</CardHeader>
          <CardBody>
            <Text>
              The application validates those inputs and does its own job. It
              does not reach into the producer to paper over a bad input. A
              broken contract is fixed where the input is created.
            </Text>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Presents results</CardHeader>
          <CardBody>
            <Text>
              A UI talks to the application through a configured base URL. It
              does not import server code. Its live checks point at the
              test-environment server.
            </Text>
          </CardBody>
        </Card>
      </Grid>
      <Text>
        The shared surface should be small and named: a directory layout, a
        filename pattern, or an API schema. If two repositories start to need
        a shared library, stop and write the contract down first. Plans that
        span both sides stay separate files that cite each other. They are
        not merged into one plan with two deployables.
      </Text>
    </Stack>
  );
}

function ColdStart() {
  return (
    <Stack gap={12}>
      <H2>What a cold agent does first</H2>
      <Table
        headers={["Order", "Action"]}
        rows={[
          ["1", "Apply simplicity first: the smallest readable change that does what was asked. Use the rest of this list only as far as that change needs."],
          ["2", "Read the nearest agent guide, then the operating-policy doc if the task is non-trivial."],
          ["3", "If the direction is open, ideate. If the idea is chosen but fuzzy, brainstorm. Skip both for a change that is already clear and small."],
          ["4", "Search solutions and architecture, and use the concepts glossary, before designing a choice the repo already made."],
          ["5", "For multi-step work, write an ExecPlan: grill, one goal, the next free plan ID, then a document review. A one-step fix does not get a plan."],
          ["6", "Vet any comment from another model against the policy before editing. Reject comments that add unrequested behavior."],
          ["7", "Implement test-first in the test environment. Explain each test: behavior, layer, command, and the red failure."],
          ["8", "Review the diff. Apply findings only after vetting. Live-check APIs and UI flows against test resources."],
          ["9", "If the lesson would be lost from the code, write one solution note. Otherwise stop."],
          ["10", "Tag a finished plan. If policy text changed, mirror it across the three agent files. If those files grew by duplication, prune them back to links."],
        ]}
      />
      <Callout tone="success" title="Done means observable">
        The plan's acceptance is a command and an output. The code review's
        bar is the plan. The learning's bar is a lesson the code does not
        already contain. The test's bar is a failure in the test environment
        before the change, and a pass after it.
      </Callout>
    </Stack>
  );
}
