// shopController.js
import User from '../model/User.js';
import Product from '../model/product.js';
import Category from '../model/Category.js';

export const renderHome = async (req, res) => {
  try {
      // Fetch up to 8 products from the database
      const products = await Product.find().populate('category').limit(8);
     
      // Fetch latest 8 products from the database
      const newProducts = await Product.find().sort({ createdOn: -1 }).limit(8);
      // Render the view with the products and parent category data
      res.render('shop/index', { products,newProducts: newProducts});
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
  }
};


export const getProductDetails = async (req, res) => {
  try {
    // Get product details based on the product ID from the route parameter
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('category');
   
    if (!product) {
      // If the product is not found, render a 404 page or handle it accordingly
      return res.status(404).render('error404');
    }

    // Render the product details view with the product data
    res.render('shop/product-detail', { product });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).render('error500');
  }
};


// export const renderAllProducts = async (req, res) => {
//   try {
//     let products;
//     const categoryFilter = req.query.ParentCategory || req.query.Category; // Combine both filters

//     if (categoryFilter) {
//       if (req.query.ParentCategory) {
//         // If ParentCategory is present, filter by category.parent
//         products = await Product.find()
//           .populate('category')
//           .then(products => products.filter(product => product.category.parent === categoryFilter));
//       } else {
//         // If Category is present, filter by category.name
//         products = await Product.find()
//           .populate('category')
//           .then(products => products.filter(product => product.category.name === categoryFilter));
//       }
//     } else {
//       products = await Product.find();
//     }

//     const categories = await Category.find();
   
//     res.render('shop/shop-grid', { products, categories });
//   } catch (error) {
//     console.error("Error fetching products:", error);
//     res.status(500).send("Internal Server Error"); // Handle errors gracefully
//   }
// };

export const renderAllProducts = async (req, res) => {
  try {
    let limit = 6;
    let page = req.query.page;
    let pageNumber = page ? parseInt(page) : 1;
    let skip = (pageNumber - 1) * limit;

    let products;
    const categoryFilter = req.query.ParentCategory || req.query.Category; // Combine both filters
    console.log("hello this is categoclearry",categoryFilter)
    if (categoryFilter) {
      if (req.query.ParentCategory) {
        // If ParentCategory is present, filter by category.parent
        console.log("reached parent")
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter((product) => product.category.parent === categoryFilter)
          );
          console.log("reached parent",products)
      } else {
        // If Category is present, filter by category.name
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter((product) => product.category.name === categoryFilter)
          );
      }
    } else {
      products = await Product.find();
    }

    const categories = await Category.find();

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Paginate the products
    products = products.slice(skip, skip + limit);


    //RENDER NEW PRODUCTS
    const newProducts = await Product.find().sort({ createdOn: -1 }).limit(3);

    res.render('shop/shop-grid', {
      products,
      categories,
      page: pageNumber,
      pageLimit: totalPages,
      newProducts: newProducts
    });
  } catch (error) {
    // console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error'); // Handle errors gracefully
  }
};



 export const renderAccount = async (req, res) => {
    try {
      const foundUsers = await User.find({ secret: { $ne: null } });
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.render('shop/account', { usersWithSecrets: foundUsers });
    } catch (err) {
      console.error(err);
      // Handle the error appropriately (send an error response or redirect, etc.)
      res.status(500).send('Internal Server Error');
    }
  };

export const renderSubmit = (req, res) => {
  if (req.isAuthenticated()) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.render('shop/submit');
  } else {
    res.redirect('/login');
  }
};

  
export const logoutUser = (req, res) => {
  req.logout();
  res.redirect('/');
};
