import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';
import { DatabaseResult, ApiResponse } from '../types';

class Database {
    private db: sqlite3.Database | null = null;
    private dbPath: string;
    private initialized: boolean = false;

    constructor() {
        this.dbPath = path.join(__dirname, '../../data/resources.db');
        this.init();
    }

    private init(): void {
        // Ensure data directory exists
        const dataDir = path.dirname(this.dbPath);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
            console.log('📁 Created data directory');
        }

        // Connect to database
        this.db = new sqlite3.Database(this.dbPath, (err) => {
            if (err) {
                console.error('❌ Database connection error:', err.message);
            } else {
                console.log('🗄️ Connected to SQLite database');
                this.createTables();
            }
        });
    }

    private createTables(): void {
        const createResourcesTable = `
            CREATE TABLE IF NOT EXISTS resources (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                category TEXT NOT NULL DEFAULT 'General',
                status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `;

        this.db!.run(createResourcesTable, (err) => {
            if (err) {
                console.error('❌ Error creating resources table:', err.message);
            } else {
                console.log('✅ Resources table ready');
                this.initialized = true;
            }
        });
    }

    // Get database instance
    getDb(): sqlite3.Database | null {
        return this.db;
    }

    // Run a query
    run(sql: string, params: any[] = []): Promise<DatabaseResult> {
        return new Promise((resolve, reject) => {
            this.db!.run(sql, params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        });
    }

    // Get single row
    get<T = any>(sql: string, params: any[] = []): Promise<T | undefined> {
        return new Promise((resolve, reject) => {
            this.db!.get(sql, params, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row as T | undefined);
                }
            });
        });
    }

    // Get all rows
    all<T = any>(sql: string, params: any[] = []): Promise<T[]> {
        return new Promise((resolve, reject) => {
            this.db!.all(sql, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows as T[]);
                }
            });
        });
    }

    // Close database connection
    close(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.db!.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('🔒 Database connection closed');
                    resolve();
                }
            });
        });
    }

    // Clear all data (useful for testing)
    async clearAllData(): Promise<ApiResponse> {
        try {
            await this.run('DELETE FROM resources');
            await this.run('DELETE FROM sqlite_sequence WHERE name="resources"');
            console.log('🧹 All data cleared');
            return { success: true, message: 'All data cleared' };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('❌ Error clearing data:', errorMessage);
            return { success: false, error: errorMessage };
        }
    }
}

// Create and export singleton instance
const database = new Database();
export default database;
