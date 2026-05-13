# BruceMemory Onboarding Flow

This document describes the complete activation and initialization process for BruceMemory when a new account begins using the system.

## Activation Triggers

BruceMemory is activated in two scenarios:

### 1. Plan Upgrade Trigger
- Account upgrades to Pro or Enterprise plan
- Automatic activation initiated by billing system
- Onboarding flow starts immediately

### 2. Manual Opt-In Trigger
- Account manually enables BruceMemory feature
- Requires accepting terms and data governance agreement
- Can be disabled and re-enabled (preserves data)

## Onboarding Workflow

### Phase 1: Initialization Request

When activation is triggered, the system initiates the onboarding:

```typescript
interface OnboardingRequest {
  account_id: string;
  plan_type: 'pro' | 'enterprise';
  trigger_type: 'plan_upgrade' | 'manual_opt_in';
  initiated_at: ISO8601Timestamp;
  initiated_by: 'system' | 'user_id';
}

// Initiate onboarding
const initiateOnboarding = async (request: OnboardingRequest): Promise<OnboardingSession> => {
  const session = {
    session_id: generateUUID(),
    account_id: request.account_id,
    status: 'initializing',
    steps_completed: [],
    steps_total: 5,
    created_at: new Date(),
    estimated_completion: new Date(Date.now() + 5 * 60000) // ~5 minutes
  };

  // Store session for tracking
  await db.onboarding_sessions.insert(session);

  // Emit event for async processing
  await eventBus.emit('bruce-memory.onboarding.initiated', {
    account_id: request.account_id,
    session_id: session.session_id,
    plan_type: request.plan_type
  });

  return session;
};
```

### Phase 2: Vector DB Namespace Provisioning

Create and configure the dedicated vector database namespace:

```typescript
interface NamespaceConfig {
  namespace_id: string;
  account_id: string;
  provider: 'pinecone' | 'weaviate'; // Configurable
  dimension: 1536; // OpenAI embedding dimension
  metric: 'cosine'; // Similarity metric
  metadata_filter_support: true;
  index_type: 'production';
}

const provisionNamespace = async (
  account_id: string,
  plan_type: 'pro' | 'enterprise'
): Promise<NamespaceConfig> => {
  const namespaceId = account_id; // Use account_id as namespace identifier

  // Create namespace in vector DB
  const vectorDb = getVectorDbClient();

  const namespace = await vectorDb.createNamespace({
    name: namespaceId,
    dimension: 1536,
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: 'us-west-2'
      }
    },
    metadata_config: {
      indexed: ['account_id', 'venture_id', 'pattern_type', 'confidence']
    }
  });

  // Store namespace mapping
  await db.namespaces.insert({
    namespace_id: namespaceId,
    account_id,
    provider: 'pinecone',
    created_at: new Date(),
    status: 'active'
  });

  // Emit event for compliance logging
  await eventBus.emit('bruce-memory.namespace.provisioned', {
    account_id,
    namespace_id: namespaceId,
    timestamp: new Date()
  });

  return {
    namespace_id: namespaceId,
    account_id,
    provider: 'pinecone',
    dimension: 1536,
    metric: 'cosine',
    metadata_filter_support: true,
    index_type: 'production'
  };
};
```

### Phase 3: Initial Learning Corpus Seeding

If historical venture data is available, seed the learning corpus:

```typescript
interface LearningRecord {
  learning_id: string;
  account_id: string;
  venture_id: string;
  category: string;
  content: string;
  timestamp: ISO8601Timestamp;
  source: 'historical_import' | 'user_ingestion' | 'api';
}

const seedLearningCorpus = async (
  account_id: string,
  ventures: Venture[]
): Promise<{ seeded_count: number; skipped_count: number }> => {
  let seededCount = 0;
  let skippedCount = 0;

  for (const venture of ventures) {
    try {
      // Fetch historical learning data if available
      const historicalLearnings = await db.venture_learnings
        .where('venture_id', venture.id)
        .where('account_id', account_id)
        .limit(1000); // Reasonable batch size

      if (historicalLearnings.length === 0) {
        skippedCount++;
        continue;
      }

      // Process learnings into vector embeddings
      for (const learning of historicalLearnings) {
        const embedding = await generateEmbedding(learning.content);

        // Store in vector DB with isolation tags
        await vectorDb.upsert({
          namespace: account_id,
          vectors: [{
            id: learning.learning_id,
            values: embedding,
            metadata: {
              account_id,
              venture_id: venture.id,
              venture_name: venture.name,
              category: learning.category,
              source: 'historical_import',
              timestamp: learning.timestamp,
              confidence: 0.95 // Historical data assumed high confidence
            }
          }]
        });
      }

      seededCount++;

      // Emit event for tracking
      await eventBus.emit('bruce-memory.learning.imported', {
        account_id,
        venture_id: venture.id,
        learning_count: historicalLearnings.length
      });

    } catch (error) {
      logger.error('Failed to seed learnings for venture', {
        venture_id: venture.id,
        error: error.message
      });
      skippedCount++;
    }
  }

  return { seeded_count: seededCount, skipped_count: skippedCount };
};
```

### Phase 4: Pattern Library Initialization

Run the first pattern extraction pass to initialize the pattern library:

```typescript
interface PatternExtractionJob {
  job_id: string;
  account_id: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  patterns_extracted: number;
  started_at: ISO8601Timestamp;
  completed_at?: ISO8601Timestamp;
  error?: string;
}

const initializePatternLibrary = async (
  account_id: string
): Promise<PatternExtractionJob> => {
  const jobId = generateUUID();

  // Create job record
  const job: PatternExtractionJob = {
    job_id: jobId,
    account_id,
    status: 'queued',
    patterns_extracted: 0,
    started_at: new Date()
  };

  await db.pattern_jobs.insert(job);

  // Queue pattern extraction asynchronously
  await queue.enqueue({
    type: 'pattern-extraction-job',
    account_id,
    job_id: jobId,
    priority: 'high' // Prioritize onboarding jobs
  });

  // Emit event
  await eventBus.emit('bruce-memory.pattern.extraction_started', {
    account_id,
    job_id: jobId
  });

  return job;
};

// Pattern extraction worker
const patternExtractionWorker = async (job: PatternJob) => {
  const { account_id, job_id } = job;

  try {
    // Fetch all learnings from the account's namespace
    const learnings = await vectorDb.query({
      namespace: account_id,
      top_k: 10000, // Retrieve all
      filter: {
        'metadata.account_id': account_id
      }
    });

    // Group by venture and category
    const grouped = groupBy(learnings, (l) => `${l.venture_id}:${l.category}`);

    let patternCount = 0;

    // Extract patterns using pattern-extractor agent
    for (const [group, items] of Object.entries(grouped)) {
      const patterns = await patternExtractorAgent.extract({
        learnings: items,
        account_id,
        group_key: group
      });

      for (const pattern of patterns) {
        // Store pattern with isolation tags
        const patternEmbedding = await generateEmbedding(pattern.description);

        await db.patterns.insert({
          pattern_id: generateUUID(),
          account_id,
          venture_id: pattern.venture_id,
          category: pattern.category,
          description: pattern.description,
          confidence: pattern.confidence,
          learning_count: pattern.learning_count,
          embedding: patternEmbedding,
          created_at: new Date()
        });

        patternCount++;
      }
    }

    // Update job
    await db.pattern_jobs.update(job_id, {
      status: 'completed',
      patterns_extracted: patternCount,
      completed_at: new Date()
    });

    // Emit completion event
    await eventBus.emit('bruce-memory.pattern.extraction_completed', {
      account_id,
      job_id,
      patterns_extracted: patternCount
    });

  } catch (error) {
    await db.pattern_jobs.update(job_id, {
      status: 'failed',
      error: error.message,
      completed_at: new Date()
    });

    await eventBus.emit('bruce-memory.pattern.extraction_failed', {
      account_id,
      job_id,
      error: error.message
    });
  }
};
```

### Phase 5: Query API Activation

Enable the API endpoints for the account:

```typescript
interface ApiKeyPair {
  primary_key: string;
  secondary_key: string;
  created_at: ISO8601Timestamp;
  last_rotated_at: ISO8601Timestamp;
  next_rotation_due: ISO8601Timestamp;
}

const activateQueryApi = async (account_id: string): Promise<ApiKeyPair> => {
  // Generate API key pair
  const primaryKey = generateSecureToken(32);
  const secondaryKey = generateSecureToken(32);

  // Store keys (hashed)
  const now = new Date();
  await db.api_keys.insert({
    account_id,
    key_type: 'primary',
    key_hash: hashToken(primaryKey),
    created_at: now,
    last_rotated_at: now,
    next_rotation_due: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
    status: 'active'
  });

  await db.api_keys.insert({
    account_id,
    key_type: 'secondary',
    key_hash: hashToken(secondaryKey),
    created_at: now,
    last_rotated_at: now,
    next_rotation_due: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
    status: 'active'
  });

  // Update tenant context
  await db.tenants.update(account_id, {
    'api_keys.primary_key': primaryKey,
    'api_keys.secondary_key': secondaryKey
  });

  // Emit activation event
  await eventBus.emit('bruce-memory.api.activated', {
    account_id,
    timestamp: now
  });

  return {
    primary_key: primaryKey,
    secondary_key: secondaryKey,
    created_at: now,
    last_rotated_at: now,
    next_rotation_due: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
  };
};
```

## Complete Onboarding Orchestration

```typescript
const completeOnboarding = async (request: OnboardingRequest) => {
  const session = await initiateOnboarding(request);

  try {
    // Step 1: Provision namespace
    logger.info(`[${session.session_id}] Provisioning namespace`, {
      account_id: request.account_id
    });
    await provisionNamespace(request.account_id, request.plan_type);
    await updateProgress(session.session_id, 1);

    // Step 2: Seed corpus (optional)
    logger.info(`[${session.session_id}] Seeding learning corpus`, {
      account_id: request.account_id
    });
    const ventures = await db.ventures.where('account_id', request.account_id);
    await seedLearningCorpus(request.account_id, ventures);
    await updateProgress(session.session_id, 2);

    // Step 3: Initialize patterns
    logger.info(`[${session.session_id}] Initializing pattern library`, {
      account_id: request.account_id
    });
    const patternJob = await initializePatternLibrary(request.account_id);
    await updateProgress(session.session_id, 3);

    // Step 4: Wait for pattern extraction (async, but log completion)
    logger.info(`[${session.session_id}] Waiting for pattern extraction`, {
      account_id: request.account_id
    });
    await updateProgress(session.session_id, 4);

    // Step 5: Activate API
    logger.info(`[${session.session_id}] Activating query API`, {
      account_id: request.account_id
    });
    const apiKeys = await activateQueryApi(request.account_id);
    await updateProgress(session.session_id, 5);

    // Mark onboarding complete
    await db.onboarding_sessions.update(session.session_id, {
      status: 'completed',
      completed_at: new Date()
    });

    // Emit completion event
    await eventBus.emit('bruce-memory.onboarding.completed', {
      account_id: request.account_id,
      session_id: session.session_id,
      api_keys: {
        primary_key: apiKeys.primary_key.substring(0, 8) + '...'
      }
    });

    logger.info(`[${session.session_id}] Onboarding completed successfully`, {
      account_id: request.account_id
    });

    return { session, apiKeys };

  } catch (error) {
    logger.error(`[${session.session_id}] Onboarding failed`, {
      account_id: request.account_id,
      error: error.message
    });

    await db.onboarding_sessions.update(session.session_id, {
      status: 'failed',
      error: error.message,
      completed_at: new Date()
    });

    throw error;
  }
};
```

## Onboarding Status Polling

Clients can poll the onboarding progress:

```typescript
// GET /onboarding/status/:session_id
const getOnboardingStatus = async (sessionId: string) => {
  const session = await db.onboarding_sessions.findById(sessionId);

  return {
    session_id: session.session_id,
    status: session.status,
    steps_completed: session.steps_completed,
    steps_total: session.steps_total,
    progress_percent: Math.round((session.steps_completed / session.steps_total) * 100),
    estimated_completion: session.estimated_completion,
    completed_at: session.completed_at,
    error: session.error
  };
};
```

## Post-Onboarding Configuration

After onboarding completes, accounts can configure:

### Pattern Extraction Cadence (Enterprise)
- Default: Daily (Enterprise), Weekly (Pro)
- Customizable via tenant settings

### Intelligence Synthesis Schedule (Enterprise)
- Default: Monthly
- Customizable via tenant settings

### Webhook Endpoints
- Register endpoints for event notifications
- Events emitted after: pattern extraction, synthesis completion, etc.

### Custom Pattern Queries (Enterprise)
- Create saved query templates
- Schedule recurring analysis jobs

## Troubleshooting

If onboarding fails or gets stuck:

1. Check session status: `GET /onboarding/status/:session_id`
2. Review logs: Look for errors in vector DB provisioning or pattern extraction
3. Retry: Call `POST /onboarding/retry/:session_id` to retry from last failed step
4. Manual intervention: Contact support for stuck jobs

## Summary

The BruceMemory onboarding flow provides:
- Automated namespace provisioning for data isolation
- Historical learning corpus seeding (if available)
- Initial pattern library generation
- API access enablement
- Estimated 5-10 minute completion time depending on corpus size
