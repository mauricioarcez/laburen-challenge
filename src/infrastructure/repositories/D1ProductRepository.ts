import { IProductRepository, ProductFilters } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { IDatabase } from "../database/db";

/**
 * D1 implementation of the product repository.
 * Uses FTS5 for full-text search with BM25 ranking.
 */
export class D1ProductRepository implements IProductRepository {
    constructor(private db: IDatabase) { }

    /**
     * Search products using FTS5 full-text search.
     * Supports multi-term queries like "camiseta OR remera".
     */
    async search(filters: ProductFilters): Promise<Product[]> {
        const conditions: string[] = ["p.disponible = 1"];
        const params: (string | number)[] = [];
        let usesFts = false;

        // Build FTS5 query if search terms provided
        if (filters.query && filters.query.trim()) {
            const terms = filters.query.trim().split(/\s+/).filter(t => t.length > 0);
            if (terms.length > 0) {
                // Join terms with OR for FTS5 multi-term search
                const ftsQuery = terms.join(" OR ");
                conditions.push("fts MATCH ?");
                params.push(ftsQuery);
                usesFts = true;
            }
        }

        // Structured filters
        if (filters.categoria) {
            conditions.push("p.categoria = ?");
            params.push(filters.categoria);
        }
        if (filters.talla) {
            conditions.push("p.talla = ?");
            params.push(filters.talla);
        }
        if (filters.color) {
            conditions.push("p.color = ?");
            params.push(filters.color);
        }
        if (filters.precio_max !== undefined) {
            conditions.push("p.precio_50_u <= ?");
            params.push(filters.precio_max);
        }

        const whereClause = conditions.length > 0
            ? `WHERE ${conditions.join(" AND ")}`
            : "";

        // Use FTS5 join and BM25 ranking when searching, otherwise simple query
        const query = usesFts
            ? `
                SELECT p.* FROM products p
                JOIN products_fts fts ON p.rowid = fts.rowid
                ${whereClause}
                ORDER BY bm25(products_fts)
                LIMIT 10
            `
            : `
                SELECT * FROM products p
                ${whereClause}
                LIMIT 10
            `;

        const stmt = this.db.d1.prepare(query);
        const boundStmt = params.length > 0 ? stmt.bind(...params) : stmt;

        // @ts-ignore: D1 types
        const { results } = await boundStmt.all();
        return results as unknown as Product[];
    }

    async findById(id: string): Promise<Product | null> {
        // @ts-ignore: D1 types
        const product = await this.db.d1
            .prepare("SELECT * FROM products WHERE id = ?")
            .bind(id)
            .first();
        return product as unknown as Product | null;
    }
}
