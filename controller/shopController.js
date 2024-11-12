// shopController.js
import User from '../model/User.js';
import Product from '../model/product.js';
import Category from '../model/Category.js';

export const renderHome = async (req, res) => {
  try {
   

     // Fetch the user and populate the cart's product data if the user is logged in
     const user = req.user ? await User.findById(req.user._id).populate('cart.productId') : null;

     
      // Fetch up to 8 products from the database
      const products = await Product.find().populate('category').limit(8);
     
      // Fetch latest 8 products from the database
      const newProducts = await Product.find().sort({ createdOn: -1 }).limit(8);
      // Render the view with the products and parent category data
      res.render('shop/index', { products,newProducts: newProducts,user});
  } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).send("Internal Server Error");
  }
};


export const getProductDetails = async (req, res) => {
  try {

    const user = req.user ? await User.findById(req.user._id).populate('cart.productId') : null;
    // Get product details based on the product ID from the route parameter
    const productId = req.params.productId;
    const product = await Product.findById(productId).populate('category');
   
    if (!product) {
      // If the product is not found, render a 404 page or handle it accordingly
      return res.status(404).render('error404');
    }
    
    // Render the product details view with the product data
    res.render('shop/product-detail', { product,user });
  } catch (error) {
    console.error('Error fetching product details:', error);
    res.status(500).render('error500');
  }
};


export const renderAllProducts = async (req, res) => {
  try {
    const user = req.user ? await User.findById(req.user._id).populate('cart.productId') : null;
    let limit = 8;
    let page = req.query.page;
    let pageNumber = page ? parseInt(page) : 1;
    let skip = (pageNumber - 1) * limit;

    let products;
    const sortOrder = req.query.sortOrder || 'featured';
    const categoryFilter = req.query.ParentCategory || req.query.Category; // Combine both filters
    if (categoryFilter) {
      if (req.query.ParentCategory) {
        // If ParentCategory is present, filter by category.parent
        
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter((product) => product.category.parent === categoryFilter)
          );
          
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
     // Sort products based on sortOrder
     if (sortOrder === 'priceAsc') {
      products = products.sort((a, b) => a.regularPrice - b.regularPrice);
    } else if (sortOrder === 'priceDesc') {
      products = products.sort((a, b) => b.regularPrice - a.regularPrice);
    }
     

    // Paginate the products
    products = products.slice(skip, skip + limit);
   
    
    //RENDER NEW PRODUCTS FOR DISPLAYING ON THE SIDE BAR
    const newProducts = await Product.find().sort({ createdOn: -1 }).limit(3);
    res.render('shop/shop-grid', {
      products,
      categories,
      page: pageNumber,
      pageLimit: totalPages,
      newProducts: newProducts,
      categoryFilterValue:categoryFilter,
      sortOrder,
      totalProducts, 
      user

    });
  } catch (error) {
    // console.error('Error fetching products:', error);
    res.status(500).send('Internal Server Error'); // Handle errors gracefully
  }
};



 export const renderAccount = async (req, res) => {
    try {
      console.log(req.user )
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.render('shop/account',{ user: req.user } );
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


export const searchProducts = async (req, res) => {
  try {
    const searchQuery = req.query.q;
    const regex = new RegExp(searchQuery.split('').join('.*'), 'i'); // Create a case-insensitive regex for fuzzy matching

    // Find products with titles matching the fuzzy regex
    const products = await Product.find({ title: { $regex: regex } }).limit(10); // Limit the number of suggestions
    res.json(products);
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).send('Internal Server Error');
  }
};


export const updateAccount = async (req, res) => {
  try {
      const userId = req.user._id;
      const { firstName, lastName, phone } = req.body;

      if (!firstName || !lastName || !phone) {
          return res.json({ success: false, message: 'All fields are required.' });
      }

      if (!/^[a-zA-Z]+$/.test(firstName) || !/^[a-zA-Z]+$/.test(lastName)) {
          return res.json({ success: false, message: 'Name must contain only letters.' });
      }

      if (!/^\d{10}$/.test(phone)) {
          return res.json({ success: false, message: 'Phone number must be 10 digits.' });
      }

      await User.findByIdAndUpdate(userId, {
          firstName,
          lastName,
          mobile: phone,
          updatedOn: new Date()
      });

      res.json({ success: true, message: 'Account updated successfully.' });
  } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ success: false, message: 'Failed to update account.' });
  }
};

export const updateAddress = async (req, res) => {
  const { addressLine1, addressLine2, suburb, city, state, postcode } = req.body;
  try {
      const user = req.user;
      if (!user.address) {
          user.address = {}; // Initialize the address object if it doesn't exist
      }
      user.address.addressLine1 = addressLine1;
      user.address.addressLine2 = addressLine2; 
      user.address.suburb = suburb;
      user.address.city = city;
      user.address.state = state;
      user.address.postcode = postcode;
      await user.save();
      res.json({ success: true, message: 'Address updated successfully' });
  } catch (error) {
      console.error('Error updating address:', error);
      res.status(500).json({ success: false, message: 'Failed to update address' });
  }
};


export const renderCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).populate('cart.productId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.render('shop/shop-cart', { user });
  } catch (error) {
    console.error('Error loading cart:', error);
    res.status(500).json({ success: false, message: 'Failed to load cart' });
  }
};

export const addToCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user.cart) {
      user.cart = [];
    }

    // Check if the product already exists in the cart
    const productIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (productIndex !== -1) {
      // If product exists, increment the quantity
      user.cart[productIndex].quantity += 1;
    } else {
      // If product doesn't exist, add new product to the cart
      const product = await Product.findById(productId);
      user.cart.push({
        productId: product._id,
        quantity: 1,
      });
    }

    // Save the user with updated cart
    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ success: false, message: 'Failed to add to cart' });
  }
};


export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const productId = req.params.productId;

    const user = await User.findById(userId);

    user.cart = user.cart.filter(item => item.productId.toString() !== productId);

    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ success: false, message: 'Failed to remove from cart' });
  }
};

export const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    user.cart = [];

    await user.save();

    res.redirect('/cart');
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ success: false, message: 'Failed to clear cart' });
  }
};


export const renderCheckout= async(req,res)=>{
  try {
    res.render('shop/shop-checkout');
  }catch (error){
    console.error("Error loading checkout:", error);
    res.status(500).send("Internal Server Error");
  }

  };


// export const renderHome = async (req, res) => {
//   try {
   

//      // Fetch the user and populate the cart's product data if the user is logged in
//      const user = req.user ? await User.findById(req.user._id).populate('cart.productId') : null;

     
//       // Fetch up to 8 products from the database
//       const products = await Product.find().populate('category').limit(8);
     
//       // Fetch latest 8 products from the database
//       const newProducts = await Product.find().sort({ createdOn: -1 }).limit(8);
//       // Render the view with the products and parent category data
//       res.render('shop/index', { products,newProducts: newProducts,user});
//   } catch (error) {
//       console.error("Error fetching products:", error);
//       res.status(500).send("Internal Server Error");
//   }
// };