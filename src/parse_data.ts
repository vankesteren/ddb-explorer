export interface RegionData {
  region_id: string
  color: string
  value: string
  label: string
}

export interface RegionDataSet {
  [group: string]: {
    [groupValue: string]: RegionData[]
  }
}

export function extractGroupsAndValues(data: RegionDataSet): { [group: string]: string[] } {
  const result: { [group: string]: string[] } = {};

  for (const group in data) {
    const groupValues = Object.keys(data[group]);
    result[group] = groupValues;
  }

  return result;
}

export function getRegionData(data: RegionDataSet, group: string, groupValue: string): RegionData[] {
  return data[group][groupValue];
}
