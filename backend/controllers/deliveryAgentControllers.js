const DeliveryAgent=require('../models/deliveryAgentModel');
const Orders=require('../models/ordersModel');
const autoAssignAgent=require('../utils/orderAssignment')

exports.getAssignedOrders=async(req,res)=>{
    try{
        const agentId=req.user.id;
        const orders=await Orders.find({
            deliveryAgentId:agentId
        }).populate("userId", "name mobile address")
            .populate("items.productId","name image price")
            .populate("items.vendorId","shopName mobile address")
            .sort({createdAt:-1})


        res.status(200).json({
            status:"success",
            message:"fetched assigned orders",
            orders
        })
    }
    catch(err){
        res.status(500).json({
            message:"error while fecthing assigned orders",
            err:err.message
        })
    }
}


// update delivery status

exports.updateDeliveryStatus=async(req,res)=>{
    try{
        const {orderId,status,otp}=req.body;

        const order=await Orders.findById(orderId)

        if(status==="Delivered"){
            if(!otp || otp !== order.deliveryOTP){
                return res.status(400).json({
                    message: "Invalid or missing OTP for delivery completion"
                });
            }
            order.orderStatus="Delivered"
            
            const agent = await DeliveryAgent.findById(order.deliveryAgentId);

            if (agent) {
                agent.activeOrders = Math.max(0, agent.activeOrders - 1);

                if (agent.activeOrders < agent.maxOrdersLimit) {
                    agent.isBusy = false;
                }

                await agent.save();
            }

            const pendingOrder = await Orders.findOne({
                deliveryStatus: "Pending"
            }).sort({ createdAt: 1 });
    
            if (pendingOrder) {
                await autoAssignAgent(pendingOrder._id);
            }
        }

        order.deliveryStatus=status;
        await order.save();

        res.status(200).json({
            status:"success",
            message:"status updated"
        });
    }
    catch(err){
        res.status(500).json({
            message:"error while updating order delivery status",
            err:err.message
        })
    }
}

// update payment status

exports.updatePaymentStatus=async(req,res)=>{
    try{
        const {orderId}=req.body;

        const order=await Orders.findById(orderId);

        if(!order){
            return res.status(404).json({
                message: "Order not found"
            });
        }

        if (order.paymentMethod !== "COD") {
            return res.status(400).json({
                message: "Payment already handled online"
            });
        }

        order.paymentStatus = "Completed";

        await order.save();

        res.status(200).json({
            status: "success",
            message: "Payment marked as completed"
        });
    }
    catch(err){
        res.status(500).json({
            message: "Error updating payment status",
            err: err.message
        });
    }
}

// get my availability status

exports.getMyAvalibility = async (req, res) => {
    try {
        const agent = await DeliveryAgent.findById(req.user._id);

        res.json({
            isAvailable:agent.isAvailable
        });

    } catch (err) {
        res.status(500).json({
            message: "Error fetching profile"
        });
    }
};

// toggle availability

exports.toggleAvailability = async (req, res) => {
    try {
        const agentId = req.user.id;

        const agent = await DeliveryAgent.findById(agentId);

        if (!agent) {
            return res.status(404).json({ message: "Agent not found" });
        }

        agent.isAvailable = !agent.isAvailable;

        await agent.save();

        res.json({
            message: "Availability updated",
            isAvailable: agent.isAvailable
        });

    } catch (err) {
        res.status(500).json({
            message: "Error updating availability",
            err: err.message
        });
    }
};
