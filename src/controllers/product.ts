import { Request } from "express";
import { TryCatch } from "../middlewares/error.js";
import {
  BaseQuerry,
  NewProductRequestBody,
  SearchRequestQuery,
} from "../types/types.js";
import { Product } from "../models/product.js";
import ErrorHandler from "../utils/utility-class.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";
// import { faker } from "@faker-js/faker";

// Revalidate on New, Update, Delete Product & on New Order
export const getLastestProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("latest-product"))
    products = JSON.parse(myCache.get("latest-product") as string);
  else {
    products = await Product.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-product", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update, Delete Product & on New Order
export const getAllCategories = TryCatch(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await Product.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on New, Update, Delete Product & on New Order
export const getAdmintProducts = TryCatch(async (req, res, next) => {
  let products;

  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New, Update, Delete Product & on New Order
export const getSigleProduct = TryCatch(async (req, res, next) => {
  let product;
  const id = req.params.id;
  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(req.params.id);

    if (!product) return next(new ErrorHandler("Product Not Found", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

interface MulterFile extends Express.Multer.File {
  firebaseUrl?: string;
}

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, price, stock, category, color, size, description } = req.body;
    const file = req.file as MulterFile;
    const photoUrl = file?.firebaseUrl;

    if (!photoUrl) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
      return next(new ErrorHandler("Please enter All Fields", 400));
    }

    await Product.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photoUrl,
      description,
      color,
      size,
    });

    invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatch(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category, color, size, description } = req.body;
  const file = req.file as MulterFile;
  const photoUrl = file?.firebaseUrl;

  const product = await Product.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photoUrl) product.photo = photoUrl;
  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;
  if (description) product.description = description;


  if (color) product.color = JSON.parse(color);
  if (size) product.size = JSON.parse(size);

  await product.save();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});


export const deleteProduct = TryCatch(async (req, res, next) => {
  const product = await Product.findById(req.params.id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });

  await product.deleteOne();

  invalidateCache({
    product: true,
    productId: String(product._id),
    admin: true,
  });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatch(
  async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const page = Number(req.query.page) || 1;

    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuerry: BaseQuerry = {};

    if (search)
      baseQuerry.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuerry.price = {
        $lte: Number(price),
      };

    if (category) baseQuerry.category = category;

    const productPromise = Product.find(baseQuerry)
      .sort(sort ? { price: sort === "asc" ? 1 : -1 } : undefined)
      .limit(limit)
      .skip(skip);
    const [products, filteredOnlyProducts] = await Promise.all([
      productPromise,
      Product.find(baseQuerry), // Get all matching products without pagination
    ]);

    const totalProducts = filteredOnlyProducts.length;
    const totalPage = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);
