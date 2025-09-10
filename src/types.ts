import { z } from "zod";

export const colorSchemes = [
  "viridis",
  "plasma",
  "inferno",
  "magma",
  "cividis",
  "turbo",
  "warm",
  "cool",
  "cubehelix",
  "no colorscheme"
] as const;
export type ColorScheme = (typeof colorSchemes)[number];


export const MapColorConfigSchema = z.object({
  minValue: z.number(),
  maxValue: z.number(),
  numBins: z.number().int().positive().optional(),
  colorScheme: z.enum(colorSchemes).optional(),
  dynamic: z.boolean().optional(),
}).refine(
  v => v.minValue <= v.maxValue,
  { message: "minValue must be <= maxValue", path: ["minValue"] }
);
export type MapColorConfig = z.infer<typeof MapColorConfigSchema>;


export const AppConfigSchema = z.discriminatedUnion("kind", [
  // 1) GeoJSON only
  z.object({
    kind: z.literal("geojson-only"),
    geojsonFileName: z.string(),
    idColumnGeojson: z.string(),
    legendTitle: z.string().optional(),
  }),

  // 2) GeoJSON + external data file
  z.object({
    kind: z.literal("geojson-datafile"),
    geojsonFileName: z.string(),
    dataFileName: z.string(),
    idColumnGeojson: z.string(),
    idColumnDataFile: z.string(),
    categoryColumns: z.array(z.string()),
    valueColumn: z.string(),
    legendTitle: z.string().optional(),
    mapColorConfig: MapColorConfigSchema,
    initialFiltering: z.record(z.string(), z.string()).optional(),
  }),

  // 3) GeoJSON with embedded data
  z.object({
    kind: z.literal("geojson-embedded"),
    geojsonFileName: z.string(),
    idColumnGeojson: z.string(),
    categoryColumns: z.array(z.string()),
    valueColumn: z.string(),
    legendTitle: z.string(),
    mapColorConfig: MapColorConfigSchema,
    initialFiltering: z.record(z.string(), z.string()).optional(),
  }),
]);

export type AppConfig = z.infer<typeof AppConfigSchema>;


// Config validator
export function validateAppConfig(input: unknown): AppConfig {
  const result = AppConfigSchema.safeParse(input)

  if (result.success) {
    console.log(`[App Config Validator] parsed ${result.data.kind} config`)
    return Object.freeze(result.data)
  }

  const errors = result.error.issues.map(iss => {
    const path = iss.path.length ? ` at ${iss.path.join(".")}` : ""
    return `${iss.message}${path}`
  })

  throw new Error(["Invalid AppConfig:", ...errors.map(e => ` - ${e}`)].join("\n"))
}
