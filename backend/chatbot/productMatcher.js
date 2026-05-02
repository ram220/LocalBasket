const Products = require('../models/productsModel');

const stopWords = [
  "add", "remove", "get", "show", "to", "from", "my", "cart", 
  "in", "a", "an", "the", "please", "can", "you", "i", "want", "some", "buy", "for"
];

function extractSearchTerm(input) {
  let words = input.toLowerCase().split(/\s+/);
  return words.filter(w => !stopWords.includes(w)).join(" ").trim();
}

module.exports = async function matchProduct(input) {
  if (!input) return [];

  // Clean the input to remove conversational words
  const phrase = extractSearchTerm(input);
  if (!phrase) return [];

  // 1️⃣ EXACT NAME MATCH (case-insensitive)
  let products = await Products.find({
    name: { $regex: new RegExp(`^${phrase}$`, "i") }
  }).populate('vendorId', 'shopName');

  if (products.length > 0) return products;

  // 2️⃣ PARTIAL NAME MATCH (MOST IMPORTANT)
  // E.g. "sugar" matches "Sugar 1kg" and "Sugar 500g"
  products = await Products.find({
    name: { $regex: phrase, $options: "i" }
  }).populate('vendorId', 'shopName');

  if (products.length > 0) return products;

  // 3️⃣ ALL WORDS MATCH IN NAME (Strict AND)
  // E.g. "kandhi pappu" matches a product containing both "kandhi" AND "pappu"
  const words = phrase.split(" ");
  if (words.length > 1) {
    products = await Products.find({
      $and: words.map(w => ({ name: { $regex: w, $options: "i" } }))
    }).populate('vendorId', 'shopName');

    if (products.length > 0) return products;
  }

  // 4️⃣ KEYWORD MATCH (Strict ALL)
  if (words.length > 0) {
      products = await Products.find({
        keywords: { $all: words }
      }).populate('vendorId', 'shopName');
      
      if (products.length > 0) return products;
  }

  // If nothing strictly matches, return empty array instead of guessing wrongly.
  return [];
};
