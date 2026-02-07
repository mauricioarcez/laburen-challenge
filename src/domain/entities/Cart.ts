export interface Cart {
    id: number;
    created_at: string;
    updated_at: string;
}

export interface CartItem {
    id: number;
    cart_id: number;
    product_id: number;
    qty: number;
}

export interface CartWithItems extends Cart {
    items: CartItemDetail[];
}

export interface CartItemDetail {
    id: number;
    qty: number;
    name: string;
    price: number;
    total: number;
}
