import { check } from "@placemarkio/check-geojson"

export function parseGeojson(geojsonString: string) {
  try {
    check(geojsonString)
    const parsedGeojson = JSON.parse(geojsonString)
    return {
      valid: true,
      geojson: parsedGeojson,
      errors: null
    }
  } catch (e) {
      return {
        valid: false,
        geojson: null,
        errors: e.issues.map(item => item.message).join(" ")
      }
  }
}
