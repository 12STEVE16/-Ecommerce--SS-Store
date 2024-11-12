
import passport from 'passport';
import User  from '../model/User.js';
import Product from '../model/product.js';
import Category from '../model/Category.js';
import mongoose from 'mongoose'; 
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

export const renderLoginAdmin = (req, res) => {
    res.render('admin/page-account-login');
};


// export const loginAdmin = (req, res) => {
//   console.log(req.body)
//   const user = new User({
//     username: req.body.username,
//     password: req.body.password,
//   });

//   req.login(user, (err) => {
//     if (err) {
//       console.log(err);
   
//     } else {
//       passport.authenticate('local')(req, res, () => {
//         res.redirect('admin/dashboard');
//       });
//     }
//   });
// };

export const loginAdmin = (req, res) => {
   const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  req.login(user, (err) => {
    if (err) {
      console.log(err);
      // Handle login error
      res.render('admin/page-account-login', { error: err.message });
    } else {
      passport.authenticate('local', (authErr, user, info) => {
        if (authErr) {
          console.log(authErr);
          // Handle authentication error
          res.render('admin/page-account-login', { error: authErr.message });
        } else if (!user) {
          // Authentication failed
          res.render('admin/page-account-login', { error: 'Invalid username or password' });
        } else {
          // Authentication successful, redirect to dashboard
          req.logIn(user, (loginErr) => {
            if (loginErr) {
              console.log(loginErr);
              // Handle login error after successful authentication
              res.render('admin/page-account-login', { error: loginErr.message });
            } else {
              res.redirect('admin/dashboard');
            }
          });
        }
      })(req, res);
    }
  });
};



export const renderDashboard = (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('admin/dashboard');
};


export const renderCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('admin/categories', { categories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Delete the category by ID
    const deletedCategory = await Category.findByIdAndDelete(categoryId);

    if (!deletedCategory) {
      return res.status(404).send('Category not found');
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


export const renderCreateCategories= (req, res) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.render('admin/create-categories');
};
export const createCategory = async (req, res) => {
  try {
    // Extract form fields

    console.log(req.body);
    const { category_name, parent_category, category_status } = req.body;

    // Create a new Category instance
    const newCategory = new Category({
      name: category_name,
      parent: parent_category,
      status: category_status,
    });

    // Save the new category to the database
    await newCategory.save();

    // Redirect or render response
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    // Handle errors appropriately, e.g., render an error page or redirect to a failure page
    res.status(500).send('Internal Server Error');
  }
};

export const renderEditCategories = async (req, res) => {
  const categoryId = req.params.id;

  try {
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send('Category not found');
    }

    res.render('admin/edit-categories', { category });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const editCategory = async (req, res) => {
  const categoryId = req.params.id;

  try {
    // Retrieve the category from the database
    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).send('Category not found');
    }

    // Update the category with the new values from the form
    category.name = req.body.category_name;
    category.parent = req.body.parent_category;
    category.status = req.body.category_status;

    // Save the updated category
    await category.save();

    // Redirect to the categories page or display a success message
    res.redirect('/admin/categories');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};




export const renderProducts = async (req, res) => {
  try {
    const products = await Product.find(); // Fetch all products from the database

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('admin/products-grid', { products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const deleteProduct = async (req, res) => {
  const productId = req.params.id;

  try {
    const deletedProduct = await Product.findByIdAndDelete(productId);

    if (!deletedProduct) {
      return res.status(404).send('Product not found');
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};





export const renderAddProducts = async (req, res) => {
  try {
    const activeCategories = await Category.find({ status: 'Active' });

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('admin/add-product', { activeCategories });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};

export const addProduct = async (req, res) => {
  try {
    const { file, files, body } = req;
    const avatar = file;
    const {
      title,
      description,
      productInformation,
      regularPrice,
      size,
      stock,
      productDiscount,
      brand,
      category,
    } = body;

    const images = [];

    if (files && files.length > 0) {
      // Files exist in the request
      // Perform your logic here
      for (const file of files) {
        const randomInteger = Math.floor(Math.random() * 20000001);
        const imageDirectory = "public/uploads/croppedProducts/";

        await fs.promises.mkdir(imageDirectory, { recursive: true });
        const imgFileName = `cropped${randomInteger}.jpg`;
        const imagePath = path.join(imageDirectory, imgFileName);

        const croppedImage = await sharp(file.path)
          .resize(1000, 1100, {
            fit: "fill",
          })
          .toFile(imagePath);

        if (croppedImage) {
          images.push({ url: imgFileName });
        }
      }
    } else {
      // No files in the request
      console.log("No files in the request");
    }

    // Calculate offerPrice only if productDiscount is provided and not empty
    // const offerPrice = productDiscount !== '' && !isNaN(parseFloat(productDiscount))
    //   ? parseFloat(regularPrice) - (parseFloat(regularPrice) * parseFloat(productDiscount)) / 100
    //   : null;
      const offerPrice = productDiscount !== '' && !isNaN(parseFloat(productDiscount))
    ? parseFloat((parseFloat(regularPrice) - (parseFloat(regularPrice) * parseFloat(productDiscount)) / 100).toFixed(2))
    : null;

    // Create a new Product instance
    const newProduct = new Product({
      title,
      description,
      productInformation,
      regularPrice: parseFloat(regularPrice),
      offerPrice,
      size,
      stock: parseInt(stock),
      productDiscount: productDiscount !== '' ? parseFloat(productDiscount) : null,
      brand,
      category,
      images,
      list: true,
      createdOn: new Date(),
      updatedOn: new Date(),
    });

    // Save the new product to the database
    await newProduct.save();

    // Redirect or render response
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    // Handle errors appropriately, e.g., render an error page or redirect to a failure page
    res.status(500).send('Internal Server Error');
  }
};


// Import necessary modules and models

export const renderEditProduct = async (req, res) => {
  try {
      // Retrieve product details based on the provided productId
      const productId = req.params.productId;
      const product = await Product.findById(productId);

      // Retrieve active categories (if needed)
      const activeCategories = await Category.find({ status: "Active" });
  
      // Render the edit-product view with product and categories data
      res.render('admin/edit-product', { product, activeCategories });
  } catch (error) {
      console.error(error);
      // Handle errors appropriately, e.g., render an error page or redirect to a failure page
      res.status(500).send('Internal Server Error');
  }
};

export const updateProduct = async (req, res) => {
  
  // console.log("body:",req.body)
  
  try {
    const productId = req.body.productId;
    const product = await Product.findById(productId);
    const productDiscount = req.body.productDiscount;
    const regularPrice=req.body.regularPrice;
    // Update product details based on the form data
    product.title = req.body.title;
    product.productInformation = req.body.productInformation;
    product.description = req.body.description;
    product.regularPrice = parseFloat(req.body.regularPrice);
    product.offerPrice = productDiscount && !isNaN(parseFloat(productDiscount)) ? parseFloat((regularPrice * (1 - parseFloat(productDiscount) / 100)).toFixed(2)) : null;

    product.size = req.body.size;
    product.stock = parseInt(req.body.stock);
    product.productDiscount = req.body.productDiscount !== '' ? parseFloat(req.body.productDiscount) : null;
    product.brand = req.body.brand;
    product.category = req.body.category;


   // Update new images
if (req.files && req.files.length > 0) {
  for (const file of req.files) {
    const randomInteger = Math.floor(Math.random() * 20000001);
    const imageDirectory = "public/uploads/croppedProducts/";

    // Use the asynchronous version of fs.mkdir to handle the callback
    await fs.promises.mkdir(imageDirectory, { recursive: true });

    const imgFileName = `cropped${randomInteger}.jpg`;
    const imagePath = path.join(imageDirectory, imgFileName);

    const croppedImage = await sharp(file.path)
      .resize(1000, 1100, {
        fit: "fill",
      })
      .toFile(imagePath);

    if (croppedImage) {
      product.images.push({ url: imgFileName });
    }
  }
}

    // Save the updated product to the database
    await product.save();

    res.redirect('/admin/products'); // Redirect to the products page after update
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
};


export const deleteProductImage = async (req, res) => {
  try {
      const productId = req.params.productId;
      const index = req.params.index;

      // Use import.meta.url to get the current module's URL
      const __filename = fileURLToPath(import.meta.url);
      // Use dirname to get the directory name
      const __dirname = dirname(__filename);

      const product = await Product.findById(productId);
      const deletedImagesPath ="public/uploads"
      // Check if the product exists
      if (!product) {
          return res.status(404).send('Product not found');
      }

      // Check if the index is within the array bounds
      if (index >= 0 && index < product.images.length) {
          // Get the image file path
          const imagePath = path.join(__dirname, '..', 'public', 'uploads', 'croppedProducts', product.images[index].url);

          // Create a deleted-images folder if it doesn't exist
          const deletedImagesPath = path.join(__dirname, '..', 'public', 'uploads', 'deleted-images');
          fs.mkdirSync(deletedImagesPath, { recursive: true });

          // Generate a unique filename to avoid overwriting existing files
          const uniqueFileName = `${Date.now()}_${product.images[index].url}`;

          // Move the image to the deleted-images folder
          const newImagePath = path.join(deletedImagesPath, uniqueFileName);
          fs.renameSync(imagePath, newImagePath);

          // Remove the image from the array
          product.images.splice(index, 1);

          // Save the updated product to the database
          await product.save();

          // Send a success response
          res.status(200).send('Image moved to deleted-images folder successfully');
      } else {
          res.status(400).send('Invalid image index');
      }
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
};

export const getUsersPage = async (req, res) => {
  try {

    let limit=6
    let page=req.query.page
    let pageNumber=page ? parseInt(page) : 1
    let skip=(pageNumber - 1) * limit
    const users = await User.find({is_admin: false})
    const user = await User.find({is_admin: false}).skip(skip).limit(limit)
    let pageLimit=Math.ceil(users.length/limit)
    res.render('admin/users',{ users: user,page,pageLimit })

    // // Fetch user data from the database
    // const users = await User.find({ is_admin: false });
    // // console.log('Fetched users:', users);
    // // Render the view with user data
    // res.render('admin/users', { users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).send('Internal Server Error');
  }
};

export const blockUnblockUser = async (req, res) => {
  const userId = req.params.userId;
  const block = req.query.block === 'true';

  try {
    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's status
    user.status = block;

    // Save the updated user
    await user.save();

    // Return success response
    res.status(200).json({ message: `User ${block ? 'blocked' : 'unblocked'} successfully` });
  } catch (error) {
    console.error('Error blocking/unblocking user:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};