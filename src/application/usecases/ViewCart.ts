import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { CartItemDetail } from "../../domain/entities/Cart";

export class ViewCart {
    constructor(private cartRepository: ICartRepository) { }

    async execute(cartId: number): Promise<CartItemDetail[]> {
        return this.cartRepository.getCartWithItems(cartId);
    }
}
