import { uploadOnCloudinary } from '../utils/cloundinary.js';
import { v2 as cloudinary } from 'cloudinary';
import {Product} from "../models/Product.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import {ApiError} from "../utils/ApiError.js"

const registerProduct = async (req, res) => {
  try {
      const { collageName, city, name, price, discription } = req.body;
      const avatarUrls = [];
      const avatars = req.files['avatar'];

      for (const avatar of avatars) {
          const url = await uploadOnCloudinary(avatar.path);
          if (url) {
              avatarUrls.push(url);
          }
      }

      const existingProduct = await Product.findOne({ collageName, city });

      if (existingProduct) {
          existingProduct.category.push(req.body.category);
          await existingProduct.save();
          console.log("Category appended to existing product:", existingProduct);
          return new ApiResponse(200, "Category appended to existing product");
      } else {
          const product = new Product({ collageName, city, name, price, discription, avatar: avatarUrls, category: [req.body.category] });
          await product.save();
          console.log("New product registered:", product);
          return new ApiResponse(200, "Product registered successfully");
      }
  } catch (error) {
      console.error("Error registering Product:", error);
      throw new ApiError(500, "Something went wrong while registering the product");
  }
};

  const deleteProduct = async (req, res) => {
    const { id } = req.params;
  
    try {
      const product = await Product.findById(id);
  

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }
  

      // product.avatar.forEach(filePath => {
      //   fs.unlinkSync(filePath);
      // });

      product.avatar.forEach(async imageUrl => {
        const publicId = imageUrl.split('/').pop().split('.')[0]; 
        await cloudinary.uploader.destroy(publicId);
      });

      await Product.findByIdAndDelete(id);
  
      res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
      console.error('Error deleting product:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  export { deleteProduct };

export {registerProduct}
