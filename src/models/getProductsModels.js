export class getProductsMoldel {
    constructor({
        idProduct,
        nameProduct,
        descriptionProduct,
        idCategorie,
        nameCategorie,
        price,
        urlImage
    }) {
        this.id = idProduct;
        this.name = nameProduct;
        this.description = descriptionProduct;
        this.category = {
            id: idCategorie,
            name: nameCategorie
        };
        this.price = price;
        this.imageUrl = urlImage;
    }
}
