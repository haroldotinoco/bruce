# Builder Onboarding Flow

## Overview

The builder onboarding flow is triggered when brand-aid completes the brand identity generation. It guides users through a 5-step process to define the MVP technical specification, architecture, feature prioritization, sprint planning, and acceptance criteria.

---

## Activation Trigger

### Event: brand.completed (from brand-aid module)

When brand-aid finalizes the brand identity, it publishes:

```json
{
  "event_type": "brand-aid.brand.generated",
  "account_id": "acc_12345",
  "venture_id": "ven_67890",
  "brand_id": "brand_abc123",
  "brand_name": "TechFlow",
  "guidelines_urls": [
    "https://s3.amazonaws.com/brand-assets/acc_12345/ven_67890/guidelines.pdf"
  ],
  "timestamp": "2026-04-06T10:45:00Z"
}
```

### Event Consumer: builder Service

```typescript
// consumeBrandCompletedEvent.ts
import { EventConsumer, Message } from "@bruce/events";
import { initiateMVPSpecification } from "./initiateMVPSpecification";

export class BrandCompletedEventConsumer implements EventConsumer {
  async handle(message: Message): Promise<void> {
    const {
      event_type,
      account_id,
      venture_id,
      brand_id,
      brand_name,
      guidelines_urls,
    } = message;

    if (event_type !== "brand-aid.brand.generated") {
      return;
    }

    console.log(
      `Builder: MVP specification initiated for venture ${venture_id} (account: ${account_id})`
    );

    try {
      await initiateMVPSpecification({
        accountId: account_id,
        ventureId: venture_id,
        brandId: brand_id,
        brandName: brand_name,
        guidelinesUrls: guidelines_urls,
      });
    } catch (error) {
      console.error(
        `Failed to initiate MVP specification for ${venture_id}:`,
        error
      );
      throw error;
    }
  }
}
```

---

## Step 1: Venture Context + Brand Brief Ingestion

### Purpose

Load the venture data and brand identity to establish context for the MVP specification.

### Inputs

- Venture data (from add-venture via cache)
- Brand identity (brand_id, brand_name, visual direction, messaging)
- Account preferences (tech stack, team size, methodology)

### Process

```typescript
// ingestVentureAndBrandContext.ts
import { MVPSpecificationService } from "./services/MVPSpecificationService";

interface ContextInput {
  accountId: string;
  ventureId: string;
  brandId: string;
  brandName: string;
  guidelinesUrls: string[];
}

export async function ingestVentureAndBrandContext(
  input: ContextInput
): Promise<ContextResult> {
  const specService = new MVPSpecificationService();

  // Step 1a: Fetch venture data from cache
  const ventureData = await getVentureData(input.accountId, input.ventureId);

  if (!ventureData) {
    throw new Error(`Venture ${input.ventureId} not found`);
  }

  // Step 1b: Fetch brand identity
  const brandIdentity = await getBrandIdentity(
    input.accountId,
    input.brandId
  );

  if (!brandIdentity) {
    throw new Error(`Brand ${input.brandId} not found`);
  }

  // Step 1c: Load account preferences
  const accountPrefs = await getAccountPreferences(input.accountId);

  // Step 1d: Create initial MVP specification record
  const mvpSpec = await specService.createInitialSpecification({
    account_id: input.accountId,
    venture_id: input.ventureId,
    brand_id: input.brandId,
    brand_name: input.brandName,
    venture_context: {
      hypothesis: ventureData.hypothesis,
      target_market: ventureData.target_market,
      pain_point: ventureData.pain_point,
      solution: ventureData.solution,
      unique_value: ventureData.unique_value,
    },
    brand_context: {
      brand_name: input.brandName,
      core_message: brandIdentity.messaging_framework.core_message,
      tone_of_voice: brandIdentity.messaging_framework.tone_of_voice,
    },
    account_preferences: accountPrefs,
    status: "context_ingested",
  });

  // Step 1e: Cache context for workflow
  await cacheSpecContext(input.accountId, input.ventureId, mvpSpec.id, {
    venture_data: ventureData,
    brand_identity: brandIdentity,
    account_prefs: accountPrefs,
  });

  // Step 1f: Publish event
  await publishEvent({
    event_type: "builder.context.ingested",
    account_id: input.accountId,
    venture_id: input.ventureId,
    spec_id: mvpSpec.id,
    timestamp: new Date(),
  });

  return {
    specId: mvpSpec.id,
    ventureData: ventureData,
    brandIdentity: brandIdentity,
    nextStep: "technical_architecture",
  };
}
```

### Outputs

- MVP Specification record created
- Venture + brand context cached
- Event: builder.context.ingested (internal)

---

## Step 2: Technical Architecture Definition

### Purpose

Define the system architecture, technology stack, and infrastructure approach for the MVP.

### Process

```typescript
// defineArchitecture.ts
import { ArchitectureService } from "./services/ArchitectureService";

export async function defineTechnicalArchitecture(
  accountId: string,
  ventureId: string,
  specId: string,
  accountPrefs: AccountPreferences
): Promise<ArchitectureResult> {
  const archService = new ArchitectureService();
  const spec = await getMVPSpec(accountId, ventureId, specId);

  // Step 2a: Analyze requirements from venture hypothesis
  const requirements = await archService.extractRequirements({
    hypothesis: spec.venture_context.hypothesis,
    solution: spec.venture_context.solution,
    target_market: spec.venture_context.target_market,
    scale_considerations: accountPrefs.expected_growth || "medium",
  });

  // Step 2b: Recommend technology stack
  const techStackOptions = await archService.recommendTechStack({
    requirements: requirements,
    account_preferences: accountPrefs.tech_stack_preferences || [],
    plan_tier: await getUserPlanTier(accountId),
    team_size: accountPrefs.team_size || 5,
    preferred_methodology: accountPrefs.methodology || "agile",
  });

  // Step 2c: Define system architecture
  const architecture = await archService.defineArchitecture({
    tech_stack: techStackOptions.recommended,
    requirements: requirements,
    scalability_needs: extractScalabilityNeeds(spec),
    compliance_requirements: accountPrefs.compliance_requirements || [],
  });

  // Step 2d: Create architecture documentation
  const archDocs = await archService.generateArchitectureDocumentation({
    architecture: architecture,
    formats: ["markdown", "drawio"],
    include_sections: [
      "system_overview",
      "component_diagram",
      "data_flow",
      "technology_rationale",
      "infrastructure_plan",
      "deployment_strategy",
      "scaling_plan",
    ],
  });

  // Step 2e: Store architecture
  const savedArch = await archService.saveArchitecture({
    account_id: accountId,
    venture_id: ventureId,
    spec_id: specId,
    architecture: architecture,
    documentation: archDocs,
    status: "draft",
  });

  // Step 2f: Cache architecture
  await cacheSpecDraft(accountId, ventureId, specId, {
    step: "technical_architecture",
    architecture_id: savedArch.id,
    tech_stack: architecture.tech_stack,
    completed_at: new Date(),
  });

  return {
    architectureId: savedArch.id,
    techStack: architecture.tech_stack,
    systemDiagram: archDocs.system_overview,
    scalingPlan: archDocs.scaling_plan,
    nextStep: "feature_prioritization",
  };
}

function extractScalabilityNeeds(spec: MVPSpecification): {
  expected_users: string;
  expected_growth: string;
  performance_requirements: string;
} {
  const market = spec.venture_context.target_market;
  // Parse market description to estimate scale
  if (market.includes("enterprise")) {
    return {
      expected_users: "1000+",
      expected_growth: "high",
      performance_requirements: "high-availability",
    };
  } else if (market.includes("SMB")) {
    return {
      expected_users: "100-500",
      expected_growth: "medium",
      performance_requirements: "standard",
    };
  }
  return {
    expected_users: "10-100",
    expected_growth: "low-to-medium",
    performance_requirements: "standard",
  };
}
```

### Outputs

- Technical architecture definition
- Tech stack recommendations
- System diagram and architecture documentation
- Infrastructure plan
- Scaling strategy

---

## Step 3: Feature Prioritization and Backlog Creation

### Purpose

Define the product backlog and prioritize features for the MVP scope.

### Process

```typescript
// prioritizeFeatures.ts
import { BacklogService } from "./services/BacklogService";

export async function prioritizeFeatures(
  accountId: string,
  ventureId: string,
  specId: string
): Promise<BacklogResult> {
  const backlogService = new BacklogService();
  const spec = await getMVPSpec(accountId, ventureId, specId);
  const arch = await getTechnicalArchitecture(accountId, ventureId, specId);

  // Step 3a: Extract feature requirements from venture hypothesis
  const impliedFeatures = await backlogService.extractImpliedFeatures({
    solution: spec.venture_context.solution,
    pain_point: spec.venture_context.pain_point,
    unique_value: spec.venture_context.unique_value,
  });

  // Step 3b: Generate feature list from brand messaging
  const messagingFeatures = await backlogService.extractFeaturesFromMessaging({
    core_message: spec.brand_context.core_message,
    key_messages: spec.brand_context.key_messages,
    tone_of_voice: spec.brand_context.tone_of_voice,
  });

  // Step 3c: Combine and deduplicate features
  const allFeatures = await backlogService.combineFeatures({
    implied_features: impliedFeatures,
    messaging_features: messagingFeatures,
  });

  // Step 3d: Prioritize using MoSCoW method
  const prioritized = await backlogService.prioritizeFeatures({
    features: allFeatures,
    method: "moscow", // Must have, Should have, Could have, Won't have
    scope_constraints: {
      target_sprints: 3,
      team_size: spec.account_preferences.team_size || 5,
    },
  });

  // Step 3e: Create detailed backlog with acceptance criteria templates
  const backlog = await backlogService.createBacklog({
    account_id: accountId,
    venture_id: ventureId,
    spec_id: specId,
    features: prioritized.must_have, // Start with must-have features
    additional_features: prioritized.should_have,
    future_features: [
      ...prioritized.could_have,
      ...prioritized.wont_have,
    ],
  });

  // Step 3f: Generate backlog documentation
  const backlogDocs = await backlogService.generateBacklogDocumentation({
    backlog: backlog,
    formats: ["markdown", "json"],
    include_user_stories: true,
    include_acceptance_criteria_templates: true,
  });

  // Step 3g: Store backlog
  const savedBacklog = await backlogService.saveBacklog(backlog, backlogDocs);

  // Step 3h: Cache backlog draft
  await cacheSpecDraft(accountId, ventureId, specId, {
    step: "feature_prioritization",
    backlog_id: savedBacklog.id,
    feature_count: allFeatures.length,
    mvp_features: prioritized.must_have.length,
    completed_at: new Date(),
  });

  return {
    backlogId: savedBacklog.id,
    totalFeatures: allFeatures.length,
    mvpFeatures: prioritized.must_have,
    shouldHaveFeatures: prioritized.should_have,
    futureFeatures: [
      ...prioritized.could_have,
      ...prioritized.wont_have,
    ],
    backlogDocumentation: backlogDocs,
    nextStep: "sprint_planning",
  };
}
```

### Outputs

- Feature backlog with prioritization (MoSCoW)
- MVP feature set (Must Have features)
- Future roadmap features
- User stories with acceptance criteria templates
- Backlog documentation

---

## Step 4: Sprint Planning

### Purpose

Organize MVP features into 3-sprint (or configurable) planning cycles with story estimation and task breakdown.

### Process

```typescript
// planSprints.ts
import { SprintService } from "./services/SprintService";

export async function planSprints(
  accountId: string,
  ventureId: string,
  specId: string,
  maxSprints: number = 3
): Promise<SprintPlanResult> {
  const sprintService = new SprintService();
  const spec = await getMVPSpec(accountId, ventureId, specId);
  const backlog = await getBacklog(accountId, ventureId, specId);

  // Step 4a: Estimate feature complexity and effort
  const estimatedFeatures = await sprintService.estimateFeatures({
    features: backlog.mvp_features,
    methodology: spec.account_preferences.methodology || "agile",
    team_size: spec.account_preferences.team_size || 5,
    estimation_method: "story_points", // Use story points: 1-21 scale
  });

  // Step 4b: Distribute features across sprints
  const sprintDistribution = await sprintService.distributeAcrossSprints({
    estimated_features: estimatedFeatures,
    max_sprints: maxSprints,
    sprint_capacity: calculateSprintCapacity(
      spec.account_preferences.team_size,
      2 // weeks per sprint
    ),
  });

  // Step 4c: Break features into stories and tasks
  const sprints = await Promise.all(
    sprintDistribution.map(async (distribution, sprintIndex) => {
      const sprintNumber = sprintIndex + 1;

      const stories = await sprintService.createStories({
        features: distribution.features,
        sprint_number: sprintNumber,
        acceptance_criteria: true,
      });

      const tasks = await sprintService.breakDownIntoTasks({
        stories: stories,
        team_size: spec.account_preferences.team_size || 5,
      });

      return {
        sprint_number: sprintNumber,
        stories: stories,
        tasks: tasks,
        total_story_points: distribution.total_points,
        estimated_duration_weeks: 2,
      };
    })
  );

  // Step 4d: Create sprint planning documents
  const sprintDocs = await sprintService.generateSprintPlans({
    sprints: sprints,
    team_size: spec.account_preferences.team_size || 5,
    formats: ["markdown", "json"],
    include_sections: [
      "sprint_goals",
      "story_breakdown",
      "task_assignments",
      "dependencies",
      "risks_and_mitigations",
    ],
  });

  // Step 4e: Store sprint plans
  const savedSprints = await Promise.all(
    sprints.map((sprint, index) =>
      sprintService.saveSprint({
        account_id: accountId,
        venture_id: ventureId,
        spec_id: specId,
        sprint_number: sprint.sprint_number,
        stories: sprint.stories,
        tasks: sprint.tasks,
        documentation: sprintDocs[index],
        status: "planned",
      })
    )
  );

  // Step 4f: Cache sprint plans
  await cacheSpecDraft(accountId, ventureId, specId, {
    step: "sprint_planning",
    sprint_ids: savedSprints.map((s) => s.id),
    total_sprints: sprints.length,
    completed_at: new Date(),
  });

  return {
    sprints: savedSprints,
    totalStories: sprints.reduce((sum, s) => sum + s.stories.length, 0),
    totalTasks: sprints.reduce((sum, s) => sum + s.tasks.length, 0),
    totalStoryPoints: sprints.reduce(
      (sum, s) => sum + s.total_story_points,
      0
    ),
    sprintDocumentation: sprintDocs,
    nextStep: "acceptance_criteria",
  };
}

function calculateSprintCapacity(
  teamSize: number,
  sprintWeeks: number
): number {
  // Rough estimation: 5-8 story points per developer per week
  // Assumes team productivity and accounting for non-dev work
  const pointsPerDeveloper = 6 * sprintWeeks;
  return Math.floor(teamSize * pointsPerDeveloper);
}
```

### Outputs

- 3 sprint plans (or configured number)
- Stories with story points estimates
- Task breakdowns per story
- Sprint goals and roadmap
- Dependencies and risk identification

---

## Step 5: Acceptance Criteria and Handoff to GTM

### Purpose

Define detailed acceptance criteria for all stories and prepare specification for handoff to GTM module.

### Process

```typescript
// defineAcceptanceAndHandoff.ts
import { AcceptanceCriteriaService } from "./services/AcceptanceCriteriaService";
import { GTMHandoffService } from "./services/GTMHandoffService";

export async function defineAcceptanceCriteriaAndHandoff(
  accountId: string,
  ventureId: string,
  specId: string
): Promise<HandoffResult> {
  const acceptanceService = new AcceptanceCriteriaService();
  const gtmService = new GTMHandoffService();
  const spec = await getMVPSpec(accountId, ventureId, specId);
  const sprints = await getSprints(accountId, ventureId, specId);

  // Step 5a: Generate acceptance criteria for each story
  const storiesWithCriteria = await Promise.all(
    sprints.flatMap((sprint) =>
      sprint.stories.map(async (story) => {
        const criteria = await acceptanceService.generateAcceptanceCriteria({
          story: story,
          venture_context: spec.venture_context,
          acceptance_criteria_template: "gherkin", // Given-When-Then format
        });

        return {
          ...story,
          acceptance_criteria: criteria,
        };
      })
    )
  );

  // Step 5b: Create QA/testing checklist
  const testingChecklists = await acceptanceService.createTestingChecklists({
    stories: storiesWithCriteria,
    include_sections: [
      "functional_testing",
      "ui_ux_testing",
      "performance_testing",
      "security_testing",
    ],
  });

  // Step 5c: Store acceptance criteria
  await Promise.all(
    storiesWithCriteria.map((story) =>
      acceptanceService.saveAcceptanceCriteria({
        account_id: accountId,
        venture_id: ventureId,
        spec_id: specId,
        story_id: story.id,
        criteria: story.acceptance_criteria,
        testing_checklist: testingChecklists[story.id],
      })
    )
  );

  // Step 5d: Compile complete MVP specification document
  const mvpDocument = await acceptanceService.compileSpecification({
    spec: spec,
    architecture: await getTechnicalArchitecture(accountId, ventureId, specId),
    backlog: await getBacklog(accountId, ventureId, specId),
    sprints: storiesWithCriteria.map((s) => s),
    acceptance_criteria: storiesWithCriteria.map((s) => ({
      story_id: s.id,
      criteria: s.acceptance_criteria,
    })),
  });

  // Step 5e: Export in supported formats
  const planTier = await getUserPlanTier(accountId);
  const exportFormats = getExportFormatsByPlan(planTier);

  const exportedDocuments = await Promise.all(
    exportFormats.map((format) =>
      acceptanceService.exportDocument(mvpDocument, format)
    )
  );

  // Step 5f: Upload to S3 (account-isolated)
  const uploadedFiles = await Promise.all(
    exportedDocuments.map((doc) =>
      uploadToS3(accountId, ventureId, specId, doc)
    )
  );

  // Step 5g: Update spec status to approved
  await updateMVPSpec(accountId, ventureId, specId, {
    status: "approved",
    approved_at: new Date(),
    acceptance_criteria_count: storiesWithCriteria.flatMap(
      (s) => s.acceptance_criteria
    ).length,
  });

  // Step 5h: Prepare GTM handoff data
  const gtmHandoff = await gtmService.prepareHandoffData({
    account_id: accountId,
    venture_id: ventureId,
    spec_id: specId,
    brand_id: spec.brand_id,
    brand_name: spec.brand_name,
    mvp_features: (await getBacklog(accountId, ventureId, specId)).mvp_features,
    sprint_count: sprints.length,
    team_size: spec.account_preferences.team_size,
  });

  // Step 5i: Publish handoff event to GTM module
  await publishEvent({
    event_type: "builder.mvp.approved",
    account_id: accountId,
    venture_id: ventureId,
    spec_id: specId,
    brand_id: spec.brand_id,
    brand_name: spec.brand_name,
    mvp_features: gtmHandoff.mvp_features,
    sprint_count: sprints.length,
    team_size: spec.account_preferences.team_size,
    specification_urls: uploadedFiles.map((f) => f.s3_url),
    timestamp: new Date(),
  });

  // Step 5j: Clear draft cache
  await clearSpecDraft(accountId, ventureId, specId);

  return {
    specId: specId,
    status: "approved",
    acceptanceCriteriaCount: storiesWithCriteria.flatMap(
      (s) => s.acceptance_criteria
    ).length,
    exportedFormats: exportFormats,
    specificationUrls: uploadedFiles,
    gtmHandoffInitiated: true,
    nextStep: "gtm_module",
  };
}

function getExportFormatsByPlan(
  planTier: "pro" | "enterprise"
): ("markdown" | "pdf" | "jira" | "asana" | "monday" | "linear" | "json")[] {
  return planTier === "enterprise"
    ? ["markdown", "pdf", "jira", "asana", "monday", "linear", "json"]
    : ["markdown", "pdf", "jira"];
}
```

### Outputs

- Acceptance criteria for all stories (Gherkin/Given-When-Then format)
- QA/testing checklists
- Complete MVP specification document (PDF, Markdown, JSON)
- Signed S3 URLs to exported documents
- Event: builder.mvp.approved (triggers GTM module activation)

---

## Complete Flow Sequence

```
brand.completed event (from brand-aid)
    ↓
Step 1: Venture Context + Brand Ingestion
  ├─ Load venture data + brand identity
  ├─ Load account preferences
  ├─ Create initial spec record
  └─ Cache context
    ↓
Step 2: Technical Architecture Definition
  ├─ Extract requirements
  ├─ Recommend tech stack
  ├─ Define system architecture
  ├─ Generate architecture documentation
  └─ Create infrastructure + scaling plans
    ↓
Step 3: Feature Prioritization & Backlog
  ├─ Extract features from solution + messaging
  ├─ Prioritize using MoSCoW
  ├─ Separate MVP vs. future features
  └─ Create detailed user stories
    ↓
Step 4: Sprint Planning
  ├─ Estimate story complexity (story points)
  ├─ Distribute across sprints
  ├─ Break into tasks
  └─ Create sprint plans
    ↓
Step 5: Acceptance Criteria & Handoff
  ├─ Define acceptance criteria (Gherkin)
  ├─ Create QA checklists
  ├─ Compile specification document
  ├─ Export to supported formats
  ├─ Upload to S3 (account-isolated)
  ├─ Update spec status
  ├─ Publish: builder.mvp.approved
  └─ Clear draft cache
    ↓
GTM module activated
```

---

## Error Handling & Retries

```typescript
// builderOrchestration.ts
export async function orchestrateBuilderWorkflow(
  accountId: string,
  ventureId: string,
  brandId: string,
  brandName: string
): Promise<void> {
  const maxRetries = 3;
  let currentStep = "context_ingestion";

  try {
    // Step 1
    const contextResult = await retryWithBackoff(
      () =>
        ingestVentureAndBrandContext({
          accountId,
          ventureId,
          brandId,
          brandName,
          guidelinesUrls: [],
        }),
      maxRetries
    );
    currentStep = "technical_architecture";

    // Step 2
    const archResult = await retryWithBackoff(
      () =>
        defineTechnicalArchitecture(
          accountId,
          ventureId,
          contextResult.specId,
          contextResult.accountPrefs
        ),
      maxRetries
    );
    currentStep = "feature_prioritization";

    // Step 3
    const backlogResult = await retryWithBackoff(
      () =>
        prioritizeFeatures(accountId, ventureId, contextResult.specId),
      maxRetries
    );
    currentStep = "sprint_planning";

    // Step 4
    const sprintResult = await retryWithBackoff(
      () =>
        planSprints(accountId, ventureId, contextResult.specId),
      maxRetries
    );
    currentStep = "acceptance_criteria";

    // Step 5
    await retryWithBackoff(
      () =>
        defineAcceptanceCriteriaAndHandoff(
          accountId,
          ventureId,
          contextResult.specId
        ),
      maxRetries
    );
  } catch (error) {
    console.error(
      `Builder workflow failed at step ${currentStep} for ${ventureId}:`,
      error
    );

    await publishEvent({
      event_type: "builder.workflow.failed",
      account_id: accountId,
      venture_id: ventureId,
      failed_at_step: currentStep,
      error_message: error.message,
      timestamp: new Date(),
    });

    throw error;
  }
}
```

---

## Summary

The builder onboarding flow transforms a brand identity and venture hypothesis into a complete, executable MVP specification through 5 structured steps, with tenant isolation enforced at every layer and clear event-driven handoffs to the GTM module.
