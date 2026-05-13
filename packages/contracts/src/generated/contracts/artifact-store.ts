/* eslint-disable */
/* auto-generated from modules/contracts/artifact-store.schema.json */

/**
 * Metadata for binary/non-text artifacts (images, PDFs, SVGs, videos, code, reports) produced during venture execution. Artifact metadata enables discovery, retrieval, and lifecycle management without embedding large files in venture state.
 */
export interface ArtifactMetadataRecord {
  /**
   * Unique identifier for artifact (UUID v4)
   */
  artifact_id: string;
  /**
   * Artifact content type
   */
  type: "image" | "svg" | "pdf" | "html" | "json" | "video" | "code" | "report" | "wireframe" | "component" | "dataset";
  /**
   * MIME type (e.g., 'image/png', 'application/pdf')
   */
  mime_type: string;
  /**
   * Where artifact is stored
   */
  storage_backend: "s3" | "local" | "figma" | "github" | "inline";
  /**
   * Reference to artifact in storage. Format depends on backend: 's3://bucket/path', 'figma://file-id#node-id', 'github://owner/repo/path', or inline content for small artifacts
   */
  storage_ref: string;
  /**
   * Size of artifact in bytes
   */
  size_bytes?: number;
  /**
   * Venture this artifact belongs to
   */
  venture_id: string;
  /**
   * Which agent/module produced this artifact
   */
  produced_by_agent:
    | "opportunity"
    | "add-venture"
    | "brand-aid"
    | "builder"
    | "gtm"
    | "startup-ops"
    | "portfolio"
    | "bruce-core"
    | "bruce-memory";
  /**
   * Which workflow step produced this artifact (e.g., 'brand-aid:logo_generation')
   */
  produced_at_step?: string;
  /**
   * When artifact was produced
   */
  produced_at: string;
  /**
   * Human-readable name (e.g., 'Logo - Primary')
   */
  name?: string;
  /**
   * What this artifact is and why it was produced
   */
  description?: string;
  /**
   * Iteration/version of this artifact
   */
  version?: number;
  /**
   * Tags for discoverability (e.g., 'brand', 'logo', 'hero')
   */
  tags?: string[];
  /**
   * Time-to-live in hours. Null = indefinite. Used to auto-cleanup temporary artifacts.
   */
  ttl_hours?: number;
  /**
   * How long to keep artifact
   */
  retention_policy?: "temporary" | "standard" | "archive" | "permanent";
  /**
   * Who can access this artifact
   */
  access_control?: {
    /**
     * Is artifact publicly accessible?
     */
    public?: boolean;
    /**
     * Which modules can read/use this artifact
     */
    allowed_modules?: string[];
    /**
     * Which user IDs can access
     */
    allowed_users?: string[];
    [k: string]: unknown;
  };
  /**
   * Type-specific metadata
   */
  metadata?: {
    [k: string]: unknown;
  };
  /**
   * References to other artifacts this depends on
   */
  dependencies?: {
    artifact_id?: string;
    relationship?: "derived_from" | "used_by" | "part_of";
    [k: string]: unknown;
  }[];
  /**
   * Trace ID from workflow that produced this artifact
   */
  correlation_id?: string;
  created_at?: string;
  updated_at?: string;
  /**
   * Soft delete timestamp (null if not deleted)
   */
  deleted_at?: string;
}
