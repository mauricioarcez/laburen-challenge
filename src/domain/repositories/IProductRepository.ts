import { Product } from "../entities/Product";

export interface IProductRepository {
    list(search?: string): Promise<Product[]>;
    findById(id: number): Promise<Product | null>;
}
