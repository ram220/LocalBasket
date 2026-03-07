module.exports = function detectIntent(text) {
  text = text.toLowerCase();

  // ================= CART =================
  if (/clear|empty/.test(text) && text.includes("cart"))
    return "CLEAR_CART";

  if (/show|view/.test(text) && text.includes("cart"))
    return "SHOW_CART";

  // ================= OFFERS =================
  if (/offer|discount/.test(text))
    return "SHOW_OFFERS";

  // ================= CHEAPEST BY CATEGORY (🔥 MUST BE BEFORE CHEAP_PRODUCTS)

  // ================= GENERIC CHEAP PRODUCTS
  if (/cheap|cheapest|low price|lowest|best price|low cost/.test(text))
    return "CHEAPEST_BY_CATEGORY";

  // ================= CART ACTIONS =================
  if (/remove|delete/.test(text))
    return "REMOVE_FROM_CART";

  if (/decrease|reduce|less/.test(text))
    return "DECREASE_QUANTITY";

  if (/increase|add more|more|another|extra/.test(text))
    return "INCREASE_QUANTITY";

  if (/add|buy|put/.test(text))
    return "ADD_TO_CART";


  return "UNKNOWN";
};
