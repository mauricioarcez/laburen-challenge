import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { CartItem } from "../../domain/entities/Cart";

export class AddToCart {
    constructor(private cartRepository: ICartRepository) { }

    async execute(cartId: number, productId: number, qty: number): Promise<CartItem> {
        return this.cartRepository.addToCart(cartId, productId, qty);
    }
}
