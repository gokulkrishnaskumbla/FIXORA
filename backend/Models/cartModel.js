const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'users',
        required: true,
    },
    services: [
        {
            serviceId: {
                type: mongoose.Types.ObjectId,
                ref: 'Service',
                required: true
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0
    }
});

cartSchema.methods.calculateTotalPrice = function () {
    this.totalPrice = this.services.reduce((total, service) => total + service.price, 0);
};

module.exports = mongoose.model('carts', cartSchema);
