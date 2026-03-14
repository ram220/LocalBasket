const Cart = require("../models/cartModel");
const Products = require("../models/productsModel");
const calculateOffer = require('../utils/offersCheck');
const Vendors=require('../models/vendorModel')

//add to cart

exports.addToCart=async(req,res)=>{
    try{
        const {productId,quantity}=req.body;
        const userId=req.user.id;


        const product=await Products.findById(productId);

        if(!product){
            return res.status(404).json({
                status:"fail",
                message:"Product not found"
            });
        }

        const vendor=await Vendors.findById(product.vendorId);

        if(!vendor){
            return res.status(404).json({

                message:"Vendor not found"
            });
        }

        if(vendor.subscriptionStatus==="expired"){
            return res.status(403).json({
                message:"Shop is temporarily out of service (vendor plan expired)";
            });
        }

        if(!vendor.isShopOpen){
            return res.status(403).json({
                message:"Shop is currently closed"
            })
        }

        //this 2 lines
        const offerData = calculateOffer(product);
        const finalPrice = offerData.finalPrice || product.price;

        let cart=await Cart.findOne({userId});

        if(!cart){
            cart=await Cart.create({
                userId,
                items:[
                    {
                        productId,
                        vendorId:product.vendorId,
                        quantity,
                        /*price:product.price,*/
                        price:finalPrice,
                        image:product.image
                    }
                ]
            });
        }
        else{
            const itemIndex= cart.items.findIndex(
                item => item.productId.toString()===productId
            );

            if(itemIndex > -1){
                //product exists->update product
                cart.items[itemIndex].quantity += quantity
            }
            else{
                //product not exists -> add new
                cart.items.push({
                    productId,
                    vendorId:product.vendorId,
                    quantity,
                    //price: product.price
                    price:finalPrice
                })
            }
        }

        await cart.save();

        res.status(200).json({
            status: "success",
            message: "Item added to cart",
            cart
        })

    }
    catch(err){
        res.status(500).json({
            status: "fail",
            message: "Error while adding to cart",
            error: err.message
        });
    }
}



// get user cart

exports.getCart=async(req,res)=>{
    try{
        const userId=req.user.id;

        const cart=await Cart.findOne({userId})
            .populate("items.productId", "name price image expiryDate")
            .populate("items.vendorId", "shopName category");

        if(!cart){
            return res.status(200).json({
                status: "success",
                cart:{items:[]}
            })
        }

        //9 lines
        const updatedItems = cart.items.map(item => {
    const offerData = calculateOffer(item.productId);

    return {
        ...item.toObject(),
        finalPrice: offerData.finalPrice || item.productId.price,
        isOffer: offerData.isOffer || false,
        discountPercentage: offerData.discountPercentage || 0
    };
});

//upto here

        

        res.status(200).json({
            status: "success",
            //cart
            cart:{
                ...cart.toObject(),
                items:updatedItems
            }
        });

    }
    catch(err){
        res.status(500).json({
            status: "fail",
            message: "Error while fetching cart",
            error: err.message
        });
    }
}


// update quantity of item

exports.updateQuantity = async(req,res)=>{
    try{
        const userId = req.user.id;
        const {productId}=req.params;
        const {quantity}=req.body;

        if(quantity < 1){
            return res.status(400).json({
                message:"Quantity must be at least 1"
            });
        }

        const cart = await Cart.findOne({userId});

        if(!cart){
            return res.status(404).json({
                message:"Cart not found please add items"
            });
        }

        const item = cart.items.find(
            item => item.productId.toString() === productId
        );

        if(!item){
            return res.status(404).json({
                message:"Item not fount in cart"
            });
        }

        item.quantity = quantity;

        await cart.save();

        const updatedCart = await Cart.findOne({userId})
            .populate("items.productId", "name price image expiryDate")
            .populate("items.vendorId", "shopName category");


        // from here
        const updatedItems = updatedCart.items.map(item => {
    const offerData = calculateOffer(item.productId);

    return {
        ...item.toObject(),
        finalPrice: offerData.finalPrice || item.productId.price,
        isOffer: offerData.isOffer || false,
        discountPercentage: offerData.discountPercentage || 0
    };
});

res.status(200).json({
    status: 'success',
    message: "Quantity updated",
    cart: {
        ...updatedCart.toObject(),
        items: updatedItems
    }
});
//to here
       /* res.status(200).json({
            status: 'success',
            message: "Quantity updated",
            cart:updatedCart
        })*/

    }
    catch(err){
        res.status(500).json({
            message:"Error in updating quantity",
            err:err.message
        })
    }
}

// remove from cart

exports.removeFromCart=async(req,res)=>{
    try{
        const userId=req.user.id;
        const {productId}=req.params;

        const cart=await Cart.findOne({userId});
        if(!cart){
             return res.status(404).json({
                status: "fail",
                message: "Cart not found"
            });
        }

        //remove item
        cart.items=cart.items.filter(
            item=>item.productId.toString() !== productId
        );

        await cart.save();

        const updatedCart=await Cart.findOne({userId})
            .populate("items.productId", "name price image")
            .populate("items.vendorId", "shopName category");


        // from here 

const updatedItems = updatedCart.items.map(item => {
    const offerData = calculateOffer(item.productId);

    return {
        ...item.toObject(),
        finalPrice: offerData.finalPrice || item.productId.price,
        isOffer: offerData.isOffer || false,
        discountPercentage: offerData.discountPercentage || 0
    };
});

res.status(200).json({
    status: "success",
    message: "Item removed from cart",
    cart: {
        ...updatedCart.toObject(),
        items: updatedItems
    }
});

//to here

      /*  res.status(200).json({
            status: "success",
            message: "Item removed from cart",
            cart:updatedCart
        });*/
    }
    catch(err){
        res.status(500).json({
            status: "fail",
            message: "Error while removing item from cart",
            error: err.message
        });
    }
}