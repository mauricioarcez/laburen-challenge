import { IProductRepository } from "../../domain/repositories/IProductRepository";
import { Product } from "../../domain/entities/Product";

export class ListProducts {
    constructor(private productRepository: IProductRepository) { }

    async execute(search?: string): Promise<Product[]> {
        return this.productRepository.list(search);
    }
}
