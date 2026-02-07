import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Cart } from "../../domain/entities/Cart";

export class CreateCart {
    constructor(private cartRepository: ICartRepository) { }

    async execute(): Promise<Cart> {
        return this.cartRepository.create();
    }
}
