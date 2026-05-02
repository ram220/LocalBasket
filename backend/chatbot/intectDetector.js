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

  // ================= RECOMMENDATIONS =================
  if (/breakfast|milk|bread|juice|shake|biryani|meal|thali|curry|rice|starter|tikka|kebab|manchurian|soup|spicy|snack|mixture|chat|chips|namkeen|samosa|sweet|ice cream|cake|dessert|desert|pastry|chocolate|pizza|burger|fries|fast food|roll|sandwich|grocer|staple|dal|oil|sugar|salt|fruit|veg|apple|banana|onion|potato|dairy|paneer|cheese|curd/.test(text))
    return "RECOMMEND_CATEGORY";

  if (/suggest|recommend|ideas|what should i buy|hungry|eat something/.test(text))
    return "RECOMMEND_START";

  return "UNKNOWN";
};
