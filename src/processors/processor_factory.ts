import { Processor } from "./processor"
import { ParquetProcessor} from "./processor_parquet.ts"

export class ProcessorFactory {
  static create(fileName: string): Processor {
    const fileExtension = fileName.split('.').pop()?.toLowerCase() || ''

    switch (fileExtension) {
      case 'parquet':
        return new ParquetProcessor(fileName)
      default:
        throw new Error(`Unsupported file type: ${fileExtension}`)
    }
  }
}
