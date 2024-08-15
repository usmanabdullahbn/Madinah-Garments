import { Router } from 'express';
import { adminOnly } from '../middlewares/auth.js';
import { singleUpload } from '../middlewares/multer.js';
import {
  deleteProduct,
  getAdmintProducts,
  getAllCategories,
  getAllProducts,
  getLastestProducts,
  getSigleProduct,
  newProduct,
  updateProduct,
} from '../controllers/product.js';

const app = Router();

app.post("/new", adminOnly, singleUpload, newProduct);
app.get("/all", getAllProducts);
app.get("/latest", getLastestProducts);
app.get("/categories", getAllCategories);
app.get("/admin-products", adminOnly, getAdmintProducts);

app.route("/:id")
  .get(getSigleProduct)
  .put(adminOnly, singleUpload, updateProduct)
  .delete(adminOnly, deleteProduct);

export default app;
