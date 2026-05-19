import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(scriptDir, '..');
const repoRoot = join(packageRoot, '../..');
const modulesDir = join(repoRoot, 'modules');
const outRoot = join(packageRoot, 'src/generated');

const generatedHeader = (source) =>
  `/* eslint-disable */\n// auto-generated from ${source}; run pnpm --filter @bruce/schemas generate\n\n`;

function pascalCase(value) {
  return value
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function quote(value) {
  return JSON.stringify(value);
}

async function findAgentSchemas() {
  const modules = await readdir(modulesDir, { withFileTypes: true });
  const schemas = [];

  for (const moduleEntry of modules) {
    if (!moduleEntry.isDirectory()) continue;
    const agentsDir = join(modulesDir, moduleEntry.name, 'agents');
    let agents;
    try {
      agents = await readdir(agentsDir, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const agentEntry of agents) {
      if (!agentEntry.isDirectory()) continue;
      for (const kind of ['input', 'output']) {
        const abs = join(agentsDir, agentEntry.name, `${kind}.schema.json`);
        try {
          await readFile(abs, 'utf8');
          schemas.push({
            module: moduleEntry.name,
            agentId: agentEntry.name,
            kind,
            abs,
            relFromRepo: relative(repoRoot, abs).replace(/\\/g, '/'),
          });
        } catch {
          // Agents without both schemas are ignored by the generated registry.
        }
      }
    }
  }

  return schemas.sort((a, b) =>
    `${a.module}/${a.agentId}/${a.kind}`.localeCompare(`${b.module}/${b.agentId}/${b.kind}`),
  );
}

function isSchemaObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value);
}

function literalExpression(value) {
  if (value === null) return 'z.null()';
  if (typeof value === 'string') return `z.literal(${quote(value)})`;
  if (typeof value === 'number' || typeof value === 'boolean') return `z.literal(${String(value)})`;
  return 'z.unknown()';
}

function enumExpression(values) {
  if (values.length === 0) return 'z.never()';
  if (values.every((value) => typeof value === 'string')) {
    return values.length === 1
      ? `z.literal(${quote(values[0])})`
      : `z.enum([${values.map(quote).join(', ')}])`;
  }
  return `z.union([${values.map(literalExpression).join(', ')}])`;
}

function typeExpression(type) {
  if (Array.isArray(type)) {
    const variants = type.map((item) => typeExpression(item));
    const unique = [...new Set(variants)];
    return unique.length === 1 ? unique[0] : `z.union([${unique.join(', ')}])`;
  }

  switch (type) {
    case 'string':
      return 'z.string()';
    case 'number':
      return 'z.number()';
    case 'integer':
      return 'z.number().int()';
    case 'boolean':
      return 'z.boolean()';
    case 'null':
      return 'z.null()';
    case 'array':
      return 'z.array(z.unknown())';
    case 'object':
      return 'z.record(z.unknown())';
    default:
      return 'z.unknown()';
  }
}

function schemaToZod(schema) {
  if (!isSchemaObject(schema)) return 'z.unknown()';

  if (Object.prototype.hasOwnProperty.call(schema, 'const')) {
    return literalExpression(schema.const);
  }

  if (Array.isArray(schema.enum)) {
    return enumExpression(schema.enum);
  }

  if (Array.isArray(schema.oneOf) && schema.oneOf.length > 0) {
    return `z.union([${schema.oneOf.map(schemaToZod).join(', ')}])`;
  }

  if (Array.isArray(schema.anyOf) && schema.anyOf.length > 0) {
    return `z.union([${schema.anyOf.map(schemaToZod).join(', ')}])`;
  }

  if (Array.isArray(schema.allOf) && schema.allOf.length > 0) {
    return schema.allOf.map(schemaToZod).reduce((acc, expr) => `${acc}.and(${expr})`);
  }

  let expr;
  const schemaType = schema.type;
  const hasObjectShape = isSchemaObject(schema.properties);

  if (schemaType === 'object' || hasObjectShape) {
    expr = objectToZod(schema);
  } else if (schemaType === 'array') {
    expr = `z.array(${schemaToZod(schema.items)})`;
  } else {
    expr = typeExpression(schemaType);
  }

  if (schemaType === 'string') {
    if (typeof schema.minLength === 'number') expr += `.min(${schema.minLength})`;
    if (typeof schema.maxLength === 'number') expr += `.max(${schema.maxLength})`;
  }

  if (schemaType === 'number' || schemaType === 'integer') {
    if (typeof schema.minimum === 'number') expr += `.min(${schema.minimum})`;
    if (typeof schema.maximum === 'number') expr += `.max(${schema.maximum})`;
  }

  if (schema.nullable === true) {
    expr += '.nullable()';
  }

  return expr;
}

function objectToZod(schema) {
  const properties = isSchemaObject(schema.properties) ? schema.properties : {};
  const required = new Set(Array.isArray(schema.required) ? schema.required : []);
  const entries = Object.entries(properties).map(([key, value]) => {
    let child = schemaToZod(value);
    if (!required.has(key)) child += '.nullish()';
    return `${quote(key)}: ${child}`;
  });

  let expr = `z.object({${entries.length > 0 ? `\n  ${entries.join(',\n  ')}\n` : ''}})`;
  if (schema.additionalProperties === true) {
    expr += '.passthrough()';
  } else if (isSchemaObject(schema.additionalProperties)) {
    expr += `.catchall(${schemaToZod(schema.additionalProperties)})`;
  }
  return expr;
}

async function writeSchemaFile(entry) {
  const raw = await readFile(entry.abs, 'utf8');
  const schema = JSON.parse(raw);
  const agentName = pascalCase(entry.agentId);
  const exportName = `${agentName}${pascalCase(entry.kind)}`;
  const outRel = join('agents', entry.module, entry.agentId, `${entry.kind}.ts`);
  const outPath = join(outRoot, outRel);
  const source = entry.relFromRepo;
  const zodExpr = schemaToZod(schema);
  const body =
    `${generatedHeader(source)}import { z } from 'zod';\n\n` +
    `export const ${exportName}Schema = ${zodExpr};\n` +
    `export type ${exportName} = z.infer<typeof ${exportName}Schema>;\n`;

  await mkdir(dirname(outPath), { recursive: true });
  await writeFile(outPath, body, 'utf8');
  return { ...entry, exportName, outRel: outRel.replace(/\\/g, '/') };
}

async function writeRegistry(written) {
  const byAgent = new Map();
  for (const entry of written) {
    const key = `${entry.module}/${entry.agentId}`;
    const current = byAgent.get(key) ?? { module: entry.module, agentId: entry.agentId };
    current[entry.kind] = entry;
    byAgent.set(key, current);
  }

  const completeAgents = [...byAgent.values()].filter((entry) => entry.input && entry.output);
  const imports = [];
  const rows = [];

  for (const entry of completeAgents) {
    const inputAlias = `${pascalCase(entry.module)}${pascalCase(entry.agentId)}InputSchema`;
    const outputAlias = `${pascalCase(entry.module)}${pascalCase(entry.agentId)}OutputSchema`;
    imports.push(
      `import { ${entry.input.exportName}Schema as ${inputAlias} } from './${entry.input.outRel.replace(/\.ts$/, '.js')}';`,
      `import { ${entry.output.exportName}Schema as ${outputAlias} } from './${entry.output.outRel.replace(/\.ts$/, '.js')}';`,
    );
    rows.push(`  {
    module: ${quote(entry.module)},
    agentId: ${quote(entry.agentId)},
    inputSchema: ${inputAlias},
    outputSchema: ${outputAlias},
    skillPath: ${quote(`${entry.module}/agents/${entry.agentId}/SKILL.md`)},
    constraintsPath: ${quote(`${entry.module}/agents/${entry.agentId}/constraints.md`)},
    capabilitiesPath: ${quote(`${entry.module}/agents/${entry.agentId}/capabilities.json`)},
    toolsPath: ${quote(`${entry.module}/agents/${entry.agentId}/tools.json`)},
  }`);
  }

  const body =
    `${generatedHeader('modules/*/agents/*/{input,output}.schema.json')}import type { z } from 'zod';\n` +
    `${imports.join('\n')}\n\n` +
    `export interface AgentSchemaRegistryEntry {\n` +
    `  module: string;\n` +
    `  agentId: string;\n` +
    `  inputSchema: z.ZodTypeAny;\n` +
    `  outputSchema: z.ZodTypeAny;\n` +
    `  skillPath: string;\n` +
    `  constraintsPath: string;\n` +
    `  capabilitiesPath: string;\n` +
    `  toolsPath: string;\n` +
    `}\n\n` +
    `export const agentSchemaRegistry = [\n${rows.join(',\n')}\n] satisfies AgentSchemaRegistryEntry[];\n\n` +
    `export function getAgentSchemaEntry(module: string, agentId: string): AgentSchemaRegistryEntry | undefined {\n` +
    `  return agentSchemaRegistry.find((entry) => entry.module === module && entry.agentId === agentId);\n` +
    `}\n`;

  await writeFile(join(outRoot, 'registry.ts'), body, 'utf8');
  return completeAgents.length;
}

const schemas = await findAgentSchemas();
const written = [];
for (const schema of schemas) {
  written.push(await writeSchemaFile(schema));
}
const agents = await writeRegistry(written);
console.log(`[generate-schemas] wrote ${written.length} schema files for ${agents} agents`);
