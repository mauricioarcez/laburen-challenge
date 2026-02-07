import { IDatabase } from "../database/db";
import { D1ProductRepository } from "../repositories/D1ProductRepository";
import { D1CartRepository } from "../repositories/D1CartRepository";
import { ListProducts } from "../../application/usecases/ListProducts";
import { GetProductDetails } from "../../application/usecases/GetProductDetails";
import { CreateCart } from "../../application/usecases/CreateCart";
import { AddToCart } from "../../application/usecases/AddToCart";
import { ViewCart } from "../../application/usecases/ViewCart";

export class Container {
    public readonly listProducts: ListProducts;
    public readonly getProductDetails: GetProductDetails;
    public readonly createCart: CreateCart;
    public readonly addToCart: AddToCart;
    public readonly viewCart: ViewCart;

    constructor(db: IDatabase) {
        const productRepository = new D1ProductRepository(db);
        const cartRepository = new D1CartRepository(db);

        this.listProducts = new ListProducts(productRepository);
        this.getProductDetails = new GetProductDetails(productRepository);
        this.createCart = new CreateCart(cartRepository);
        this.addToCart = new AddToCart(cartRepository);
        this.viewCart = new ViewCart(cartRepository);
    }
}
