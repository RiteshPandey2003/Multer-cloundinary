import { uploadOnCloudinary } from "../utils/cloundinary.js";
import { v2 as cloudinary } from "cloudinary";
import { Product } from "../models/Product.js";

const registerProduct = async (req, res) => {
  try {
    const { name, price, description, contactDetails, Address } = req.body;
    const avatarUrls = [];
    const avatars = req.files["avatar"];

    for (const avatar of avatars) {
      const url = await uploadOnCloudinary(avatar.path);
      if (url) {
        avatarUrls.push(url);
      }
    }

    const { collageName, city, category } = req.body;

    // Extract user ID from JWT token
    const userId = req.user.id;

    const existingProduct = await Product.findOne({ collageName, city });

    if (existingProduct) {
      existingProduct.sellers.push({
        name,
        price,
        description,
        avatar: avatarUrls,
        category,
        contactDetails,
        Address,
        user: userId,
      });
      await existingProduct.save();
      res.status(200).json({ message: "Product added to existing seller" });
    } else {
      const product = new Product({
        collageName,
        city,
        sellers: [
          {
            name,
            price,
            description,
            avatar: avatarUrls,
            category,
            contactDetails,
            Address,
            user: userId,
          },
        ],
      });
      await product.save();
      res.status(200).json({ message: "New product registered" });
    }
  } catch (error) {
    console.error("Error registering Product:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while registering the product" });
  }
};


const updateProductById = async (req, res) => {
  const { id } = req.params;
  const { name, price, description, contactDetails, Address, category } =
    req.body;
  const avatarUrls = [];
  const avatars = req.files["avatar"];

  // Upload avatars to Cloudinary and store URLs
  for (const avatar of avatars) {
    const url = await uploadOnCloudinary(avatar.path);
    if (url) {
      avatarUrls.push(url);
    }
  }

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.name = name;
    product.price = price;
    product.description = description;
    product.contactDetails = contactDetails;
    product.Address = Address;
    product.category = category;
    product.avatar = avatarUrls;

    await product.save();

    res
      .status(200)
      .json({
        message: "Product updated successfully",
        updatedProduct: product,
      });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.avatar.forEach(async (imageUrl) => {
      const publicId = imageUrl.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    });

    await Product.findByIdAndDelete(id);

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { registerProduct, updateProductById, deleteProduct };
