// Order Model
import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [
        {
            productId: {
                type: mongoose.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    total: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Cash on Delivery', 'Card Payment', 'Paypal'],
        required: true
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending'
    },
    createdOn: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        default: ''
    }
});


const Order = mongoose.model('Order', orderSchema);

export default Order;
