import { Router } from "express";
import { deleteProduct, registerProduct, updateProductById } from "../controllers/product.js";
import { upload } from "../middleware/multer.js";
import { verifyJWT } from "../middleware/isAuth.js";

const router = Router();
router.use(verifyJWT);
router.post('/product/register', upload.fields([{ name: 'avatar', maxCount: 3 }]), registerProduct);
router.put('/product/update/:id', updateProductById); 
router.delete('/product/delete/:id', deleteProduct);
export default router;
