const calculateOffer = (product) => {
    const today = new Date();

    if (product.expiryDate) {
        const expiry = new Date(product.expiryDate);

        const diffTime = expiry - today;
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays <= 3 && diffDays >= 0) {
            return {
                isOffer: true,
                discountPercentage: 20,
                finalPrice: Math.round(product.price * 0.8)
            };
        }
    }

    return {
        isOffer: false,
        discountPercentage: 0,
        finalPrice: product.price
    };
};

module.exports = calculateOffer;