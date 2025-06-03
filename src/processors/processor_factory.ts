import { Processor } from "./processor"
import { ParquetProcessor} from "./processor_parquet.ts"
import { CsvProcessor } from "./processor_csv.ts"

export class ProcessorFactory {
  static create(fileName: string): Processor {
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

    switch (fileExtension) {
      case 'parquet':
        return new ParquetProcessor(fileName)
      case 'csv':
        return new CsvProcessor(fileName)
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`)
    }
  }
}
