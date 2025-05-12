import * as duckdb from '@duckdb/duckdb-wasm'
import duckdb_wasm from '@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url'
import mvp_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url'
import duckdb_wasm_next from '@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url'
import eh_worker from '@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url'
import { fetchPublicFile } from './helpers.ts'

const MANUAL_BUNDLES = {
    mvp: {
        mainModule: duckdb_wasm,
        mainWorker: mvp_worker,
    },
    eh: {
        mainModule: duckdb_wasm_next,
        mainWorker: eh_worker
    },
}

let db: duckdb.AsyncDuckDB | null = null
let conn: duckdb.AsyncDuckDBConnection | null = null
let worker: Worker | null = null


export async function initialize(): Promise<void> {
    if (db) {
        return
    }

    const bundle = await duckdb.selectBundle(MANUAL_BUNDLES)

    worker = new Worker(bundle.mainWorker)
    const logger = new duckdb.ConsoleLogger()
    db = new duckdb.AsyncDuckDB(logger, worker)
    await db.instantiate(bundle.mainModule, bundle.pthreadWorker)
    conn = await db.connect()
}


export async function executeQuery(query: string): Promise<duckdb.DuckDBDataArray> {
    if (!conn) {
        throw new Error('Database not initialized or connection not established. Call initialize() first.')
    }
    const result = await conn.query(query)
    return JSON.parse(JSON.stringify(result.toArray()));
}


export async function registerFile(registeredName: string, filename: string): Promise<void> {
    if (!db) {
        throw new Error('Database not initialized. Call initialize() first.')
    }
    const response = await fetchPublicFile(filename);
    if (!response.ok) {
        throw new Error(`Failed to fetch file from URL: ${url} - Status: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    await db.registerFileBuffer(registeredName, uint8Array);
}

export async function close(): Promise<void> {
    if (conn) {
        await conn.close()
        conn = null
    }
    if (db) {
        await db.terminate()
        db = null
    }
    if (worker) {
        worker.terminate()
        worker = null
    }
}
