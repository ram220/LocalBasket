const calculateOffer = (product) => {
    const today = new Date();

    // 1. Prioritize manual vendor offer
    if (product.isOffer && product.discountPercentage > 0) {
        return {
            isOffer: true,
            discountPercentage: product.discountPercentage,
            finalPrice: Math.round(product.price * (1 - product.discountPercentage / 100))
        };
    }

    // 2. Fallback to automatic expiry-based offer (20%)
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