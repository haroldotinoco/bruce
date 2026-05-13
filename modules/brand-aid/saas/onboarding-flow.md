# Brand-Aid Onboarding Flow

## Overview

The brand-aid onboarding flow is triggered when a venture is approved in the add-venture module. It guides users through a 5-step process to build a complete brand identity: brand brief creation, naming workshop, visual identity direction, messaging framework, and brand guidelines document generation.

---

## Activation Trigger

### Event: venture.approved

When add-venture marks a venture as approved, the following event is published:

```json
{
  "event_type": "venture.approved",
  "account_id": "acc_12345",
  "venture_id": "ven_67890",
  "venture_data": {
    "name": "TechFlow",
    "hypothesis": "AI-powered workflow automation for small teams",
    "target_market": "SMBs (10-50 employees)",
    "pain_point": "Manual repetitive tasks consuming 40% of work time",
    "solution": "Intelligent task automation with natural language interface",
    "unique_value": "80% faster setup than competitors, no coding needed"
  },
  "timestamp": "2026-04-06T10:30:00Z"
}
```

### Event Consumer: brand-aid Service

```typescript
// consumeVentureApprovedEvent.ts
import { EventConsumer, Message } from "@bruce/events";
import { initiateBrandOnboarding } from "./initiateBrandOnboarding";

export class VentureApprovedEventConsumer implements EventConsumer {
  async handle(message: Message): Promise<void> {
    const { event_type, account_id, venture_id, venture_data } = message;

    if (event_type !== "venture.approved") {
      return;
    }

    console.log(
      `Brand-aid: Onboarding initiated for venture ${venture_id} (account: ${account_id})`
    );

    try {
      await initiateBrandOnboarding({
        accountId: account_id,
        ventureId: venture_id,
        ventureData: venture_data,
      });
    } catch (error) {
      console.error(
        `Failed to initiate brand onboarding for ${venture_id}:`,
        error
      );
      throw error;
    }
  }
}
```

---

## Step 1: Brand Brief Creation

### Purpose

Transform the venture hypothesis into a structured brand brief that guides all downstream brand-building decisions.

### Inputs

- Venture name, hypothesis, target market, pain point, solution, unique value
- Account plan tier (determines template access)
- User preferences (industry, style preferences if available)

### Process

```typescript
// createBrandBrief.ts
import { BrandBriefService } from "./services/BrandBriefService";

interface BrandBriefInput {
  accountId: string;
  ventureId: string;
  ventureData: {
    name: string;
    hypothesis: string;
    target_market: string;
    pain_point: string;
    solution: string;
    unique_value: string;
  };
  planTier: "pro" | "enterprise";
}

export async function createBrandBrief(
  input: BrandBriefInput
): Promise<BrandBriefResult> {
  const briefService = new BrandBriefService();

  // Step 1a: Ingest venture data
  const briefContent = await briefService.generateBriefFromVenture(
    input.ventureData
  );

  // Step 1b: Create structured brief document
  const brief = await briefService.createBrief({
    account_id: input.accountId,
    venture_id: input.ventureId,
    title: `Brand Brief: ${input.ventureData.name}`,
    content: briefContent,
    status: "draft",
  });

  // Step 1c: Store in database (partitioned by account_id)
  await briefService.saveBrief(brief);

  // Step 1d: Cache draft state
  await cacheBrandDraft(
    input.accountId,
    input.ventureId,
    brief.id,
    {
      step: "brand_brief",
      brief_id: brief.id,
      brief_content: briefContent,
      completed_at: new Date(),
    }
  );

  // Step 1e: Publish event
  await publishEvent({
    event_type: "brand-aid.brief.created",
    account_id: input.accountId,
    brief_id: brief.id,
    venture_id: input.ventureId,
    timestamp: new Date(),
  });

  return {
    briefId: brief.id,
    content: briefContent,
    nextStep: "naming_workshop",
  };
}
```

### Outputs

- Brand brief document (stored in S3, account-isolated)
- Brief metadata record in database
- Event: brand-aid.brief.created

---

## Step 2: Naming Workshop

### Purpose

Generate, evaluate, and select a compelling brand name that resonates with the target market and differentiates from competitors.

### Substeps

#### 2a: Name Generation (name-generator)

```typescript
// generateBrandNames.ts
import { NameGeneratorService } from "./services/NameGeneratorService";

export async function generateBrandNames(
  accountId: string,
  ventureId: string,
  briefId: string,
  briefContent: BrandBriefContent
): Promise<GeneratedNamesResult> {
  const generator = new NameGeneratorService();

  // Read brief to understand brand direction
  const brief = await getBrandBrief(accountId, ventureId, briefId);

  // Generate name options using LLM + templates
  const generatedNames = await generator.generate({
    brief_content: brief.content,
    industry: extractIndustry(brief.content),
    target_market: brief.target_market,
    tone: brief.tone_direction || "innovative", // from brief or default
    count: 15, // Generate 15 options
  });

  // Evaluate domain availability
  const namesWithDomains = await Promise.all(
    generatedNames.map(async (name) => ({
      ...name,
      domain_available: await checkDomainAvailability(name.name),
    }))
  );

  // Store generated names
  await saveGeneratedNames(accountId, ventureId, briefId, namesWithDomains);

  return {
    names: namesWithDomains,
    nextPhase: "critique",
  };
}
```

#### 2b: Name Evaluation (name-critic)

```typescript
// evaluateNames.ts
import { NameCriticService } from "./services/NameCriticService";

export async function evaluateNames(
  accountId: string,
  ventureId: string,
  briefId: string,
  names: GeneratedName[]
): Promise<EvaluatedNamesResult> {
  const critic = new NameCriticService();

  // Evaluate each name against criteria
  const evaluations = await Promise.all(
    names.map(async (name) => {
      const evaluation = await critic.evaluate({
        name: name.name,
        brand_brief: await getBrandBrief(accountId, ventureId, briefId),
        target_market: name.target_market,
        domain_available: name.domain_available,
        criteria: [
          "memorability",
          "uniqueness",
          "market_relevance",
          "growth_potential",
          "pronunciation_ease",
        ],
      });

      return {
        name: name.name,
        scores: evaluation.scores,
        overall_score: evaluation.overall_score,
        feedback: evaluation.feedback,
        recommendation: evaluation.recommendation,
      };
    })
  );

  // Rank by score
  const rankedNames = evaluations.sort(
    (a, b) => b.overall_score - a.overall_score
  );

  // Create shortlist (top 5)
  const shortlist = rankedNames.slice(0, 5);

  // Store evaluations
  await saveNameEvaluations(accountId, ventureId, briefId, rankedNames);

  return {
    shortlist: shortlist,
    nextPhase: "selection",
  };
}
```

#### 2c: Name Selection (name-selector)

```typescript
// selectBrandName.ts
export async function selectBrandName(
  accountId: string,
  ventureId: string,
  briefId: string,
  selectedName: string
): Promise<NameSelectionResult> {
  // Validate selection is from evaluated shortlist
  const shortlist = await getNameShortlist(accountId, ventureId, briefId);
  const isValid = shortlist.some((n) => n.name === selectedName);

  if (!isValid) {
    throw new Error(`Name "${selectedName}" is not in the approved shortlist`);
  }

  // Record selection
  const selection = await saveNameSelection(accountId, ventureId, briefId, {
    selected_name: selectedName,
    selected_at: new Date(),
    user_id: getCurrentUserId(),
  });

  // Update brand state
  await updateBrandDraftState(accountId, ventureId, briefId, {
    step: "naming_workshop",
    selected_name: selectedName,
    completed_at: new Date(),
  });

  // Publish event
  await publishEvent({
    event_type: "brand-aid.name.selected",
    account_id: accountId,
    venture_id: ventureId,
    brand_name: selectedName,
    timestamp: new Date(),
  });

  return {
    selectedName: selectedName,
    nextStep: "visual_identity",
  };
}
```

### Outputs

- 15 generated name options
- Evaluated names with scores and feedback
- Selected brand name
- Event: brand-aid.name.selected

---

## Step 3: Visual Identity Direction

### Purpose

Define the visual direction: color palette, typography, imagery style, and design principles.

### Process

```typescript
// defineVisualIdentity.ts
import { VisualIdentityService } from "./services/VisualIdentityService";

export async function defineVisualIdentity(
  accountId: string,
  ventureId: string,
  briefId: string,
  selectedName: string
): Promise<VisualIdentityResult> {
  const visualService = new VisualIdentityService();
  const brief = await getBrandBrief(accountId, ventureId, briefId);

  // Step 3a: Analyze brand personality from brief
  const personality = await visualService.analyzeBrandPersonality(
    brief.content,
    selectedName
  );

  // Step 3b: Generate color palette recommendations
  const colorPalettes = await visualService.generateColorPalettes({
    brand_personality: personality,
    industry: extractIndustry(brief.content),
    target_market: brief.target_market,
    options: 3, // Offer 3 palette options
  });

  // Step 3c: Recommend typography
  const typographyOptions = await visualService.recommendTypography({
    brand_personality: personality,
    use_cases: ["headlines", "body", "accent"],
    plan_tier: await getUserPlanTier(accountId),
    // Enterprise gets custom font recommendations; Pro gets standard
  });

  // Step 3d: Define imagery style
  const imageryStyle = await visualService.defineImageryStyle({
    brand_personality: personality,
    target_market: brief.target_market,
    guidelines: [
      "photograph vs illustration",
      "color treatment",
      "composition style",
    ],
  });

  // Step 3e: Create design system foundation
  const designSystem = await visualService.createDesignSystem({
    name: selectedName,
    color_palettes: colorPalettes,
    typography: typographyOptions,
    imagery_style: imageryStyle,
    spacing: generateSpacingScale(),
    component_patterns: generateComponentPatterns(),
  });

  // Store visual identity
  const visualIdentity = await visualService.saveVisualIdentity({
    account_id: accountId,
    venture_id: ventureId,
    brand_name: selectedName,
    design_system: designSystem,
    status: "draft",
  });

  // Cache draft
  await cacheBrandDraft(accountId, ventureId, briefId, {
    step: "visual_identity",
    visual_identity_id: visualIdentity.id,
    design_system: designSystem,
    completed_at: new Date(),
  });

  return {
    visualIdentityId: visualIdentity.id,
    colorPalettes: colorPalettes,
    typography: typographyOptions,
    imageryStyle: imageryStyle,
    nextStep: "messaging_framework",
  };
}
```

### Outputs

- 3 color palette options
- Typography recommendations
- Imagery style guide
- Design system foundation
- Event: brand-aid visual identity defined (internal)

---

## Step 4: Messaging Framework and Tone of Voice

### Purpose

Define the brand's core messaging, key messages, and tone of voice for consistent communication.

### Process

```typescript
// defineMessagingFramework.ts
import { MessagingService } from "./services/MessagingService";

export async function defineMessagingFramework(
  accountId: string,
  ventureId: string,
  briefId: string,
  selectedName: string
): Promise<MessagingFrameworkResult> {
  const messagingService = new MessagingService();
  const brief = await getBrandBrief(accountId, ventureId, briefId);

  // Step 4a: Extract core message from venture hypothesis
  const coreMessage = await messagingService.deriveCoreMessage({
    venture_hypothesis: brief.hypothesis,
    unique_value: brief.unique_value,
    solution: brief.solution,
  });

  // Step 4b: Generate key messages for different audiences
  const keyMessages = await messagingService.generateKeyMessages({
    core_message: coreMessage,
    audiences: [
      "customers",
      "investors",
      "employees",
      "partners",
    ],
    pain_point: brief.pain_point,
    unique_value: brief.unique_value,
  });

  // Step 4c: Define tone of voice
  const toneOfVoice = await messagingService.defineToneOfVoice({
    brand_name: selectedName,
    target_market: brief.target_market,
    personality_traits: await extractPersonalityTraits(brief),
    industry: extractIndustry(brief.content),
    tone_options: [
      "professional",
      "friendly",
      "authoritative",
      "innovative",
      "playful",
    ],
  });

  // Step 4d: Create messaging examples
  const messagingExamples = await messagingService.createMessagingExamples({
    core_message: coreMessage,
    tone_of_voice: toneOfVoice,
    channels: [
      "website_headline",
      "tagline",
      "elevator_pitch",
      "social_media",
      "email_subject",
    ],
  });

  // Step 4e: Compile messaging framework
  const messagingFramework = await messagingService.compileFramework({
    account_id: accountId,
    venture_id: ventureId,
    brand_name: selectedName,
    core_message: coreMessage,
    key_messages: keyMessages,
    tone_of_voice: toneOfVoice,
    messaging_examples: messagingExamples,
  });

  // Store messaging framework
  const savedFramework = await messagingService.saveFramework(
    messagingFramework
  );

  // Cache draft
  await cacheBrandDraft(accountId, ventureId, briefId, {
    step: "messaging_framework",
    framework_id: savedFramework.id,
    framework: messagingFramework,
    completed_at: new Date(),
  });

  return {
    frameworkId: savedFramework.id,
    coreMessage: coreMessage,
    keyMessages: keyMessages,
    toneOfVoice: toneOfVoice,
    messagingExamples: messagingExamples,
    nextStep: "brand_guidelines",
  };
}
```

### Outputs

- Core message statement
- Key messages by audience
- Tone of voice definition with examples
- Messaging examples for various channels
- Event: brand-aid messaging framework defined (internal)

---

## Step 5: Brand Guidelines Document Generation

### Purpose

Compile all brand elements into a comprehensive, exportable brand guidelines document.

### Process

```typescript
// generateBrandGuidelines.ts
import { GuidelinesService } from "./services/GuidelinesService";

export async function generateBrandGuidelines(
  accountId: string,
  ventureId: string,
  briefId: string,
  selectedName: string
): Promise<BrandGuidelinesResult> {
  const guidelinesService = new GuidelinesService();
  const planTier = await getUserPlanTier(accountId);

  // Step 5a: Gather all brand elements from cache
  const visualIdentity = await getBrandDraft(
    accountId,
    ventureId,
    "visual_identity"
  );
  const messagingFramework = await getBrandDraft(
    accountId,
    ventureId,
    "messaging_framework"
  );

  // Step 5b: Compile guidelines document
  const guidelinesContent = await guidelinesService.compile({
    brand_name: selectedName,
    brand_brief: await getBrandBrief(accountId, ventureId, briefId),
    visual_identity: visualIdentity.design_system,
    messaging_framework: messagingFramework.framework,
    sections: [
      "brand_story",
      "brand_values",
      "visual_identity",
      "typography",
      "color_palette",
      "imagery_style",
      "tone_of_voice",
      "key_messages",
      "dos_and_donts",
      "contact_information",
    ],
  });

  // Step 5c: Generate in requested formats
  const supportedFormats = getFormatsByPlanTier(planTier);
  const guidelinesDocuments = await Promise.all(
    supportedFormats.map((format) =>
      guidelinesService.generateDocument(guidelinesContent, format)
    )
  );

  // Step 5d: Upload to S3 (account-isolated prefix)
  const uploadedFiles = await Promise.all(
    guidelinesDocuments.map((doc) =>
      uploadToS3(accountId, ventureId, doc)
    )
  );

  // Step 5e: Create brand identity record
  const brandIdentity = await guidelinesService.createBrandRecord({
    account_id: accountId,
    venture_id: ventureId,
    brand_name: selectedName,
    brief_id: briefId,
    status: "approved",
    guidelines_locations: uploadedFiles.map((f) => f.s3_url),
    created_at: new Date(),
  });

  // Step 5f: Publish completion event
  await publishEvent({
    event_type: "brand-aid.brand.generated",
    account_id: accountId,
    venture_id: ventureId,
    brand_id: brandIdentity.id,
    brand_name: selectedName,
    guidelines_urls: uploadedFiles.map((f) => f.s3_url),
    timestamp: new Date(),
  });

  // Step 5g: Clear draft cache
  await clearBrandDraft(accountId, ventureId, briefId);

  return {
    brandId: brandIdentity.id,
    brandName: selectedName,
    guidelinesUrls: uploadedFiles,
    guidelinesFormats: supportedFormats,
    status: "approved",
    nextStep: "builder_module",
  };
}

function getFormatsByPlanTier(
  planTier: "pro" | "enterprise"
): ("pdf" | "markdown" | "figma" | "html" | "json")[] {
  return planTier === "enterprise"
    ? ["pdf", "markdown", "figma", "html", "json"]
    : ["pdf", "markdown"];
}

async function uploadToS3(
  accountId: string,
  ventureId: string,
  document: {
    format: string;
    content: Buffer;
    filename: string;
  }
): Promise<{ s3_url: string; format: string }> {
  const s3Key = `account_${accountId}/venture_${ventureId}/brand-guidelines/${document.filename}`;

  const s3Url = await s3Client.upload(
    process.env.BRAND_AID_BUCKET!,
    s3Key,
    document.content
  );

  return {
    s3_url: s3Url,
    format: document.format,
  };
}
```

### Outputs

- Brand guidelines document (PDF, Markdown, and optionally Figma/HTML/JSON for enterprise)
- Brand identity record in database
- All assets stored in account-isolated S3 prefix
- Event: brand-aid.brand.generated (triggers builder module activation)

---

## Complete Flow Sequence

```
venture.approved event
    ↓
Step 1: Brand Brief Creation
  ├─ Ingest venture data
  ├─ Generate brand brief
  ├─ Store in database (account-partitioned)
  └─ Publish: brand-aid.brief.created
    ↓
Step 2: Naming Workshop
  ├─ 2a: Generate 15 name options
  ├─ 2b: Evaluate names (scores & feedback)
  ├─ 2c: Select final name
  └─ Publish: brand-aid.name.selected
    ↓
Step 3: Visual Identity Direction
  ├─ Analyze brand personality
  ├─ Generate color palettes (3 options)
  ├─ Recommend typography
  ├─ Define imagery style
  └─ Create design system
    ↓
Step 4: Messaging Framework & Tone
  ├─ Extract core message
  ├─ Generate key messages (by audience)
  ├─ Define tone of voice
  └─ Create messaging examples
    ↓
Step 5: Brand Guidelines Generation
  ├─ Compile comprehensive document
  ├─ Export to supported formats
  ├─ Upload to S3 (account-isolated)
  ├─ Create brand identity record
  ├─ Clear draft cache
  └─ Publish: brand-aid.brand.generated
    ↓
builder module activated
```

---

## Error Handling & Retries

```typescript
// onboardingOrchestration.ts
export async function orchestrateBrandOnboarding(
  accountId: string,
  ventureId: string,
  ventureData: VentureData
): Promise<void> {
  const maxRetries = 3;
  let currentStep = "brand_brief";

  try {
    // Step 1
    const briefResult = await retryWithBackoff(
      () =>
        createBrandBrief({
          accountId,
          ventureId,
          ventureData,
          planTier: await getUserPlanTier(accountId),
        }),
      maxRetries
    );
    currentStep = "naming_workshop";

    // Step 2
    const namesResult = await retryWithBackoff(
      () =>
        generateBrandNames(
          accountId,
          ventureId,
          briefResult.briefId,
          briefResult.content
        ),
      maxRetries
    );
    // User selects name (async, not automatic)
    currentStep = "visual_identity";

    // Step 3 onwards...
  } catch (error) {
    console.error(
      `Brand onboarding failed at step ${currentStep} for ${ventureId}:`,
      error
    );

    // Publish failure event for monitoring
    await publishEvent({
      event_type: "brand-aid.onboarding.failed",
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

The brand-aid onboarding flow transforms a venture hypothesis into a complete, exportable brand identity through 5 structured steps, with tenant isolation enforced at every layer and clear event-driven handoffs to the builder module.
