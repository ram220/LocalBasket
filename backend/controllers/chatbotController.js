const Cart = require("../models/cartModel");
const Products = require("../models/productsModel");

const detectIntent = require("../chatbot/intectDetector");
const extractEntities = require("../chatbot/entityExtractor");
const extractCategory = require("../chatbot/categoryExtractor");
const matchProduct = require("../chatbot/productMatcher");
const matchProductInCart = require("../chatbot/cartProductMatcher");
const calculateOffer = require('../utils/offersCheck');
exports.chatBot = async (req, res) => {
  try {

    const userId = req.user.id;
    const { message } = req.body;

    const text = message.toLowerCase();

    const intent = detectIntent(text);

    let cart = await Cart.findOne({ userId })
      .populate("items.productId");

    // ================= ADD TO CART =================

    if (intent === "ADD_TO_CART") {

      const product = await matchProduct(text);

      if (!product) {
        return res.json({ reply: "Sorry I couldn't find that product." });
      }

      const { quantity } = extractEntities(text, product);

      if (!cart) {
        cart = await Cart.create({
          userId,
          items: [{
            productId: product._id,
            vendorId: product.vendorId,
            quantity,
            price: product.price
          }]
        });
      }

      else {

        const item = cart.items.find(
          i => i.productId._id.toString() === product._id.toString()
        );

        if (item) {
          item.quantity += quantity;
        }

        else {
          cart.items.push({
            productId: product._id,
            vendorId: product.vendorId,
            quantity,
            price: product.price
          });
        }

        await cart.save();
    };

        cart = await Cart.findOne({ userId }).populate("items.productId");

        const updatedItems = cart.items.map(item => {
        const offerData = calculateOffer(item.productId);

        return {
            ...item.toObject(),
            finalPrice: offerData.finalPrice || item.productId.price,
            isOffer: offerData.isOffer || false,
            discountPercentage: offerData.discountPercentage || 0
            }
        });      
    

      return res.json({
        reply: `${product.name} added to your cart`,
        cart:updatedItems
      });
    }

    // ================= REMOVE FROM CART =================

    if (intent === "REMOVE_FROM_CART") {

      if (!cart) {
        return res.json({ reply: "Your cart is empty." });
      }

      const item = matchProductInCart(cart, text);

      if (!item) {
        return res.json({ reply: "That product is not in your cart." });
      }

      cart.items = cart.items.filter(
        i => i.productId._id.toString() !== item.productId._id.toString()
      );

    
      await cart.save();

        cart = await Cart.findOne({ userId }).populate("items.productId");

        const updatedItems = cart.items.map(item => {
        const offerData = calculateOffer(item.productId);

        return {
            ...item.toObject(),
            finalPrice: offerData.finalPrice || item.productId.price,
            isOffer: offerData.isOffer || false,
            discountPercentage: offerData.discountPercentage || 0
        };
        });
      return res.json({
        reply: `${item.productId.name} removed from cart`,
        cart:updatedItems
      });
    }

    // ================= INCREASE QUANTITY =================

    if (intent === "INCREASE_QUANTITY") {

      if (!cart) {
        return res.json({ reply: "Your cart is empty." });
      }

      const item = matchProductInCart(cart, text);

      if (!item) {
        return res.json({ reply: "Product not found in your cart." });
      }

      const { quantity } = extractEntities(text);

      item.quantity += quantity;

      await cart.save();

        cart = await Cart.findOne({ userId }).populate("items.productId");

        const updatedItems = cart.items.map(item => {
        const offerData = calculateOffer(item.productId);

        return {
            ...item.toObject(),
            finalPrice: offerData.finalPrice || item.productId.price,
            isOffer: offerData.isOffer || false,
            discountPercentage: offerData.discountPercentage || 0
        };
        });
      return res.json({
        reply: `${item.productId.name} quantity increased`,
        cart:updatedItems
      });
    }

    // ================= DECREASE QUANTITY =================

    if (intent === "DECREASE_QUANTITY") {

      if (!cart) {
        return res.json({ reply: "Your cart is empty." });
      }

      const item = matchProductInCart(cart, text);

      if (!item) {
        return res.json({ reply: "Product not found in your cart." });
      }

      const { quantity } = extractEntities(text);

      item.quantity -= quantity;

      if (item.quantity <= 0) {
        cart.items = cart.items.filter(
          i => i.productId._id.toString() !== item.productId._id.toString()
        );
      }

      await cart.save();

        cart = await Cart.findOne({ userId }).populate("items.productId");

        const updatedItems = cart.items.map(item => {
        const offerData = calculateOffer(item.productId);

        return {
            ...item.toObject(),
            finalPrice: offerData.finalPrice || item.productId.price,
            isOffer: offerData.isOffer || false,
            discountPercentage: offerData.discountPercentage || 0
        };
        });
      return res.json({
        reply: `${item.productId.name} quantity decreased`,
        cart:updatedItems
      });
    }

    // ================= SHOW CART =================

    if (intent === "SHOW_CART") {

      if (!cart || cart.items.length === 0) {
        return res.json({ reply: "Your cart is empty." });
      }

      return res.json({
        reply: "Here are the items in your cart",
        cart: cart.items
      });
    }

    // ================= CLEAR CART =================

    if (intent === "CLEAR_CART") {

      if (!cart) {
        return res.json({ reply: "Your cart is already empty." });
      }

      cart.items = [];

      await cart.save();

      return res.json({
        reply: "Your cart has been cleared.",
        cart:[]
      });
    }

    // ================= CHEAPEST PRODUCTS BY CATEGORY =================

    if (intent === "CHEAPEST_BY_CATEGORY") {

        const category = extractCategory(text);

        let products;

        if (category) {
            products = await Products.find({ category }).sort({ price: 1 }).limit(5);

        return res.json({
        reply: `Here are cheapest ${category}`,
        products
        });
    }



    products = await Products.find().sort({ price: 1 }).limit(5);

    return res.json({
        reply: "Here are cheapest products",
        products
    });
}

    // ================= OFFERS =================

    if (intent === "SHOW_OFFERS") {

        const products = await Products.find().limit(10);

        const offerProducts = products
            .map(p => {
            const offer = calculateOffer(p);

            if (offer.isOffer) {
                return {
                ...p._doc,
                finalPrice: offer.finalPrice
                };
            }

            return null;
        })
        .filter(Boolean);

        return res.json({
            reply: "Here are current offers",
            products: offerProducts
        });
    }

    // ================= UNKNOWN =================

    return res.json({
      reply: "Sorry I didn't understand that. Try saying add rice or show cart."
    });

  }

  catch (err) {

    console.error(err);

    res.status(500).json({
      reply: "Something went wrong"
    });
  }
};