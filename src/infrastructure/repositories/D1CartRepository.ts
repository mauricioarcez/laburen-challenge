import { ICartRepository } from "../../domain/repositories/ICartRepository";
import { Cart, CartItem, CartItemDetail } from "../../domain/entities/Cart";
import { IDatabase } from "../database/db";

export class D1CartRepository implements ICartRepository {
    constructor(private db: IDatabase) { }

    async create(): Promise<Cart> {
        // @ts-ignore
        const result = await this.db.d1.prepare(
            "INSERT INTO carts (created_at, updated_at) VALUES (CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *"
        ).first();
        return result as unknown as Cart;
    }

    async addToCart(cartId: number, productId: number, qty: number): Promise<CartItem> {
        // Check if item already exists in cart
        // @ts-ignore
        const existing = await this.db.d1.prepare(
            "SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?"
        ).bind(cartId, productId).first();

        // @ts-ignore
        let result: CartItem;
        if (existing) {
            // @ts-ignore
            result = await this.db.d1.prepare(
                "UPDATE cart_items SET qty = qty + ? WHERE id = ? RETURNING *"
            ).bind(qty, existing.id).first();
        } else {
            // @ts-ignore
            result = await this.db.d1.prepare(
                "INSERT INTO cart_items (cart_id, product_id, qty) VALUES (?, ?, ?) RETURNING *"
            ).bind(cartId, productId, qty).first();
        }
        return result;
    }

    async getCartWithItems(cartId: number): Promise<CartItemDetail[]> {
        // @ts-ignore
        const { results } = await this.db.d1.prepare(`
          SELECT ci.id, ci.qty, p.name, p.price, (ci.qty * p.price) as total
          FROM cart_items ci
          JOIN products p ON ci.product_id = p.id
          WHERE ci.cart_id = ?
        `).bind(cartId).all();

        return results as unknown as CartItemDetail[];
    }
}
