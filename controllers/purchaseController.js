const Razorpay = require("razorpay");
const userController = require('./userController');
const Order = require("../modals/orderModal");
const dotenv = require('dotenv');
dotenv.config();

exports.premiumMember = async (req, res, next) => {
  try {
    const razorPayKeyId = process.env.RAZORPAY_KEY_ID;
    const razorPayKeySecret = process.env.RAZORPAY_KEY_SECRET;
    var rzr = new Razorpay({
      key_id: razorPayKeyId,
      key_secret: razorPayKeySecret,
    });
    const amount = 3500;

    rzr.orders.create({ amount, currency: 'INR' }, async (error, order) => {
      if (error) {
        throw new Error(JSON.stringify(error));
      }
      try {
        const newOrder = new Order({
          status: 'PENDING',
          userId: req.user._id,
        });

        console.log("order created is >>>>>>>>>>>>>>", newOrder);

        await newOrder.save();

        return res.status(201).json({ order, key_id: rzr.key_id });
      } catch (error) {
        throw new Error(JSON.stringify(error));
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const order_id = req.body.order_id;
    const payment_id = req.body.payment_id;
    const userId = req.user.id;

    const order = await Order.findOne({ orderId: order_id });
    console.log("ORDER IS >>>>>>>>", order);

    const promise1 = order.updateOne({ paymentId: payment_id, status: "SUCCESS" });
    const promise2 = req.user.updateOne({ isPremiumUser: true });

    Promise.all([promise1, promise2])
      .then(() => {
        return res.status(200).json({ message: "Transaction Successful", token: userController.generateAccessToken(userId, undefined, true) });
      })
      .catch(async (error) => {
        console.log(error);
        await order.updateOne({ status: "FAILED" });
        throw new Error(JSON.stringify(error));
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error });
  }
};
