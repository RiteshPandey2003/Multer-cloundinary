import { Router } from "express";
import { deleteProduct, registerProduct } from "../controllers/product.js";
import {upload} from "../middleware/multer.js"



const router = Router()

router.post('/product/register', upload.fields([{ name: 'avatar', maxCount: 3 }]),registerProduct);
router.delete('/product/delete/:id', deleteProduct);
export default router;