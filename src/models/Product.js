import mongoose, { Schema } from "mongoose";

const sellerSchema = new Schema({
    Address: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    category: {
        type: [String], 
        enum: ["food", "pg", "book", "dress"], 
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    avatar: [{
        type: String,
        required: true
    }],
    contactDetails: {
        type: Number,
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User' 
    }
});


const productSchema = new Schema(
    {
        collageName: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        sellers: [sellerSchema] 
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);
