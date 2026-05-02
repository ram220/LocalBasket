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

    const userId = req.user ? req.user.id : null;
    const { message } = req.body;

    const text = message.toLowerCase();

    const intent = detectIntent(text);

    let cart = null;
    if (userId) {
      cart = await Cart.findOne({ userId })
        .populate("items.productId");
    }

    // ================= ADD TO CART =================

    if (intent === "ADD_TO_CART") {

      if (!userId) {
        return res.json({ reply: "Please login to manage your cart." });
      }

      // Separate the product name from the shop name so the search engine doesn't get confused
      let productSearchText = text;
      const locationKeywords = [" from ", " at ", " in "];
      for (const keyword of locationKeywords) {
          if (productSearchText.includes(keyword)) {
              productSearchText = productSearchText.split(keyword)[0];
              break;
          }
      }

      const products = await matchProduct(productSearchText);

      if (!products || products.length === 0) {
        return res.json({ reply: "Sorry I couldn't find that product." });
      }

      let product;

      if (products.length > 1) {
          const filtered = products.filter(p => p.vendorId && p.vendorId.shopName && text.includes(p.vendorId.shopName.toLowerCase()));
          
          if (filtered.length === 1) {
              product = filtered[0];
          } else {
              const formattedProducts = products.map(p => {
                  const offerData = calculateOffer(p);
                  return {
                      name: p.name,
                      price: p.price,
                      finalPrice: offerData.finalPrice || p.price,
                      shopName: p.vendorId ? p.vendorId.shopName : "Unknown Shop"
                  };
              });

              return res.json({
                  reply: `I found multiple items. Please specify the shop name (e.g., "add ${products[0].name} from ${products[0].vendorId?.shopName || 'ShopName'}")`,
                  products: formattedProducts
              });
          }
      } else {
          product = products[0];
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

      if (!userId) {
        return res.json({ reply: "Please login to manage your cart." });
      }

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

      if (!userId) {
        return res.json({ reply: "Please login to manage your cart." });
      }

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

      if (!userId) {
        return res.json({ reply: "Please login to manage your cart." });
      }

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

      if (!userId) {
        return res.json({ reply: "Please login to view your cart." });
      }

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

      if (!userId) {
        return res.json({ reply: "Please login to manage your cart." });
      }

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

    // ================= TIME-BASED RECOMMENDATIONS =================

    if (intent === "RECOMMEND_START") {
      const hour = new Date().getHours();
      let reply = "";
      let options = [];

      if (hour >= 6 && hour < 11) {
        reply = "Good morning! ☀️ Are you looking for a healthy breakfast or some fresh juice?";
        options = ["breakfast (milk & bread)", "fresh juices"];
      } else if (hour >= 11 && hour < 16) {
        reply = "Good afternoon! 🌤️ Craving a heavy lunch or some light starters?";
        options = ["biryanis & meals", "starters"];
      } else if (hour >= 16 && hour < 21) {
        reply = "Good evening! 🌆 Time for some evening cravings. What are you in the mood for?";
        options = ["spicy snacks", "desserts", "fast food"];
      } else {
        reply = "Late night cravings? 🌙 What sounds good?";
        options = ["midnight snacks", "desserts"];
      }

      return res.json({ reply, options });
    }

    if (intent === "RECOMMEND_CATEGORY") {
      let keywords = [];

      if (/breakfast|milk|bread|egg|butter/.test(text)) keywords = ["milk", "bread", "egg", "butter", "breakfast"];
      else if (/juice|shake|fresh/.test(text)) keywords = ["juice", "shake", "fresh"];
      else if (/biryani|meal|thali|curry|rice/.test(text)) keywords = ["biryani", "meal", "thali", "curry", "rice", "fried rice"];
      else if (/starter|tikka|kebab|manchurian|soup/.test(text)) keywords = ["starter", "tikka", "kebab", "manchurian", "soup"];
      else if (/sweet|ice cream|cake|dessert|desert|pastry|chocolate/.test(text)) keywords = ["ice cream", "cake", "dessert", "pastry", "chocolate", "sweets"];
      else if (/pizza|burger|fries|fast food|roll|sandwich/.test(text)) keywords = ["pizza", "burger", "fries", "fast food", "roll", "sandwich"];
      else if (/grocer|staple|dal|oil|sugar|salt/.test(text)) keywords = ["grocery", "dal", "oil", "sugar", "salt", "atta", "rice"];
      else if (/fruit|apple|banana|mango|grapes|orange/.test(text)) keywords = ["fruit", "apple", "banana", "mango", "grapes", "orange", "fruits"];
      else if (/veg|onion|potato|tomato|cabbage|carrot/.test(text)) keywords = ["vegetable", "onion", "potato", "tomato", "veg", "vegetables"];
      else if (/dairy|paneer|cheese|curd/.test(text)) keywords = ["dairy", "paneer", "cheese", "curd", "milk", "butter"];
      else keywords = ["mixture", "chat", "chips", "namkeen", "snack", "samosa", "kurkure", "lays"];

      const products = await Products.find({
        $or: [
          { name: { $regex: keywords.join("|"), $options: "i" } },
          { keywords: { $in: keywords } }
        ],
        inStock: true
      }).populate("vendorId", "shopName").limit(6);

      const formattedProducts = products.map(p => {
          const offerData = calculateOffer(p);
          return {
              name: p.name,
              price: p.price,
              finalPrice: offerData.finalPrice || p.price,
              shopName: p.vendorId ? p.vendorId.shopName : "Unknown Shop"
          };
      });

      return res.json({
        reply: `Here are my top recommendations for ${text}!`,
        products: formattedProducts
      });
    }

    // ================= UNKNOWN =================

    return res.json({
      reply: "Sorry I didn't understand that. Try saying add rice, show cart, or suggest me something."
    });

  }

  catch (err) {


    res.status(500).json({
      reply: "Something went wrong"
    });
  }
};