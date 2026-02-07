import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";
import { IDatabase } from "../database/db";

export class D1ProductRepository implements IProductRepository {
    constructor(private db: IDatabase) { }

    async list(search?: string): Promise<Product[]> {
        let query = "SELECT * FROM products";
        const params: any[] = [];

        if (search) {
            query += " WHERE name LIKE ? OR description LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        // @ts-ignore: Cloudflare types can be tricky in this context
        const { results } = await this.db.d1.prepare(query).bind(...params).all();
        return results as unknown as Product[];
    }

    async findById(id: number): Promise<Product | null> {
        // @ts-ignore
        const product = await this.db.d1.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
        return product as unknown as Product | null;
    }
}
