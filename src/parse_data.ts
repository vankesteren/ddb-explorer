//const { parquetQuery, asyncBufferFromUrl, parquetReadObjects } = await import('hyparquet')
//import { compressors } from 'hyparquet-compressors'
//
//const url = '/mentions_monthly.parquet'
//const file = await asyncBufferFromUrl({ url }) // wrap url for async fetching
//const data = await parquetQuery({
//  file,
//  compressors,
//  columns: ['year', 'month', 'disease', 'mention_rate'],
//  filter: { year: 1897, month: 2, disease: "malaria" }
//  //rowStart: 10,
//  //rowEnd: 20,
//})


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
