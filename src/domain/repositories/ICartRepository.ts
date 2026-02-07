import { Cart, CartItem, CartWithItems } from "../entities/Cart";

export interface ICartRepository {
    create(): Promise<Cart>;
    addToCart(cartId: number, productId: number, qty: number): Promise<CartItem>;
    getCartWithItems(cartId: number): Promise<CartItemDetail[]>;
}

// Helper interface for return types if needed, matching usage in original code
import { CartItemDetail } from "../entities/Cart";
