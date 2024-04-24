import mongoose, { Schema } from "mongoose";

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
        Address: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true
        },
        category: {
            type: [String], // Array of strings
            enum: ["food", "pg", "book", "dress"], // Restricts categories to specified options
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
        }
    },
    {
        timestamps: true
    }
);

export const Product = mongoose.model("Product", productSchema);
