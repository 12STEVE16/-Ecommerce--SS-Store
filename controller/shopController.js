// shopController.js
import User from '../model/User.js';
import Product from '../model/product.js';
import Category from '../model/Category.js';
import Order from '../model/Order.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';


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

    // Get search query, category, and sort order from the request query
    const searchQuery = req.query.search || '';
    const sortOrder = req.query.sortOrder || 'featured';
    const categoryFilter = req.query.ParentCategory || req.query.Category;
    const parentCategory = req.query.ParentCategory || null ;
    let products;

    if (req.query.ParentCategory) {
      // If ParentCategory is present, filter by category.parent
      if (searchQuery) {
        // If a search query is present, filter by category.parent and search
        const regex = new RegExp(searchQuery, 'i'); // case-insensitive regex
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter(
              (product) =>
                product.category.parent === categoryFilter &&
                (regex.test(product.title) || regex.test(product.description))
            )
          );
      } else {
        // If no search query, just filter by category.parent
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter((product) => product.category.parent === categoryFilter)
          );
      }
    } else if (req.query.Category) {
      // If Category is present, filter by category.name
      if (searchQuery) {
        // If a search query is present, filter by category.name and search
        const regex = new RegExp(searchQuery, 'i'); // case-insensitive regex
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter(
              (product) =>
                product.category.name === categoryFilter &&
                (regex.test(product.title) || regex.test(product.description))
            )
          );
      } else {
        // If no search query, just filter by category.name
        products = await Product.find()
          .populate('category')
          .then((products) =>
            products.filter((product) => product.category.name === categoryFilter)
          );
      }
    } else {
      // If no category filter is provided, return all products
      products = await Product.find().populate('category');
    }

    // Execute the query and sort based on the sortOrder
    if (sortOrder === 'priceAsc') {
      products = products.sort((a, b) => a.regularPrice - b.regularPrice);
    } else if (sortOrder === 'priceDesc') {
      products = products.sort((a, b) => b.regularPrice - a.regularPrice);
    }

    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    // Paginate the products
    products = products.slice(skip, skip + limit);

    // Render new products for sidebar
    const newProducts = await Product.find().sort({ createdOn: -1 }).limit(3);
    
    res.render('shop/shop-grid', {
      products,
      categories: await Category.find(),
      page: pageNumber,
      pageLimit: totalPages,
      newProducts,
      categoryFilterValue: categoryFilter,
      sortOrder,
      totalProducts,
      searchQuery, // Pass the search query to the view
      user,
      parentCategory
    });
  } catch (error) {
    console.error('Error fetching products:', error); // Debugging log
    res.status(500).send('Internal Server Error');
  }
};


 export const renderAccount = async (req, res) => {
    try {
      const userId = req.user._id;
      // Fetch user and populate wishlist with product details
      const user = await User.findById(userId).populate('cart.productId').populate('wishlist.productId');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.render('shop/account',{ user} );
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
    const products = await Product.find({ title: { $regex: regex } }).limit(2); // Limit the number of suggestions
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

    // Populate cart items with product details
    const user = await User.findById(userId).populate('cart.productId');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Calculate the total amount for the cart
    let totalAmount = 0;
  
    user.cart.forEach((item) => {
      const product = item.productId;
      if (product && product.offerPrice) {  // Ensure product and price exist
        totalAmount += product.offerPrice * item.quantity;
      }
    });
  
    // Render the cart view with user and totalAmount
    res.render('shop/shop-cart', { user, totalAmount });
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


export const renderWishlist = async (req, res) => {
   try {
      const userId = req.user._id;
  
      // Fetch user and populate wishlist with product details
      const user = await User.findById(userId).populate('cart.productId').populate('wishlist.productId');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.render('shop/shop-wishlist', { user });
    } catch (error) {
      console.error("Error rendering wishlist:", error);
      res.status(500).send("Internal Server Error");
    }
  };
  

export const addToWishlist = async (req, res) => {
  try {
      const userId = req.user._id;
      const productId = req.params.productId;
  
      // Check if the productId already exists in the wishlist
      const user = await User.findById(userId);
  
      // Check if product already exists in wishlist
      const isProductInWishlist = user.wishlist.some(item => item.productId.toString() === productId);
  
      if (isProductInWishlist) {
        return res.status(400).send('Product is already in the wishlist');
      }
  
      // Add product to wishlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { wishlist: { productId } }, // Add productId to wishlist only if it doesn't exist already
      });
  
      res.redirect('/wishlist');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
  
export const removeFromWishlist = async (req, res) => {
  try {
      const userId = req.user._id;
      const productId = req.params.productId;
  
      // Remove product from wishlist
      await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: { productId } },
      });
  
      res.redirect('/wishlist');
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      res.status(500).send('Internal Server Error');
    }
  };
  
export const addToCartFromWishlist = async (req, res) => {
  try {

      const userId = req.user._id;
      const productId = req.params.productId;
  
      // Add product to cart
      await User.findByIdAndUpdate(userId, {
        $addToSet: { cart: { productId } },
      });
  
      // Remove product from wishlist
      await User.findByIdAndUpdate(userId, {
        $pull: { wishlist: { productId } },
      });
  
      res.redirect('/wishlist');
    } catch (error) {
      console.error('Error adding to cart and removing from wishlist:', error);
      res.status(500).send('Internal Server Error');
    }
  };

  



export const renderCheckout= async(req,res)=>{
   try {
      const userId = req.user._id;
  
      // Populate cart items with product details
      const user = await User.findById(userId).populate('cart.productId');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
  
      res.render('shop/shop-checkout',{user});
    }catch (error){
      console.error("Error loading checkout:", error);
      res.status(500).send("Internal Server Error");
    }
  
    };


// export const checkoutOrder = async (req, res) => {
//   try {
//           const { paymentMethod } = req.body;
//           const user = await User.findById(req.user._id).populate('cart.productId');
  
//           if (!user.cart.length) {
//               return res.status(400).render('shop/shop-checkout', { errorMessage: 'Cart is empty. Please add products to proceed.' });
//           }
  
//           let total = 0;
//           let outOfStock = [];
  
//           // Check stock availability and calculate total
//           for (let item of user.cart) {
//               const product = item.productId;
//               if (product.stock < item.quantity) {
//                   outOfStock.push(product.title);
//               }
//               total += product.offerPrice * item.quantity;
//           }
  
//           if (outOfStock.length) {
//               return res.status(400).render('shop/shop-checkout', {
//                 errorMessage: 'Some items are out of stock.',
//                   outOfStock
//               });
//           }
  
//           // Deduct stock if Cash on Delivery
//           if (paymentMethod === 'Cash on Delivery') {
//               for (let item of user.cart) {
//                   const product = item.productId;
//                   product.stock -= item.quantity;
//                   await product.save();
//               }
//           }
  
//           // Create Order
//           const order = new Order({
//               user: user._id,
//               items: user.cart.map(item => ({
//                   productId: item.productId._id,
//                   quantity: item.quantity,
//                   price: item.productId.offerPrice
//               })),
//               total,
//               paymentMethod,
//               status: 'Completed'
//           });
  
//           await order.save();
//            // Add order to the user's orders array
//         user.orders.push(order._id);

  
//           // Clear user's cart
//           user.cart = [];
//           await user.save();


//         // Set session flag for successful checkout
//         req.session.checkoutCompleted = true;
//         req.session.recentOrderId = order._id; // Save the order ID for rendering success page
  
//           // Redirect to success page
//           res.redirect('/success');
//       } catch (error) {
//           console.error(error);
//           // res.status(500).render('error', { message: 'Something went wrong. Please try again later.' });
//       }
//   };

//initialise stripe
  
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const checkoutOrder = async (req, res) => {
  try {
    const { paymentMethod } = req.body;
    const user = await User.findById(req.user._id).populate('cart.productId');

    if (!user.cart.length) {
      return res.status(400).render('shop/shop-checkout',{user},{
        message: 'Cart is empty. Please add products to proceed.'
      });
    }

    let total = 0;
    let outOfStock = [];

    // Check stock availability and calculate total
    for (let item of user.cart) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        outOfStock.push(product.title);
      }
      total += product.offerPrice * item.quantity;
    }

    if (outOfStock.length) {
      return res.status(400).render('shop/shop-checkout',{user}, {
        errorMessage: 'Some items are out of stock.',
        outOfStock
      });
    }

    if (paymentMethod === 'Cash on Delivery') {
      // Deduct stock and create order for COD
      for (let item of user.cart) {
        const product = item.productId;
        product.stock -= item.quantity;
        await product.save();
      }

      const order = new Order({
        user: user._id,
        items: user.cart.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.offerPrice
        })),
        total,
        paymentMethod,
        status: 'Completed'
      });

      await order.save();

      user.orders.push(order._id);
      user.cart = [];
      await user.save();

      req.session.checkoutCompleted = true;
      req.session.recentOrderId = order._id;

      return res.redirect('/success');
    } else if (paymentMethod === 'Card Payment') {
      // Create Order in 'Pending' status before Stripe session
      const order = new Order({
        user: user._id,
        items: user.cart.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.productId.offerPrice
        })),
        total,
        paymentMethod,
        status: 'Pending' // Pending until payment succeeds
      });

      await order.save();

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: user.cart.map(item => ({
          price_data: {
            currency: 'usd',
            product_data: {
              name: item.productId.title
            },
            unit_amount: Math.round(item.productId.offerPrice * 100)
          },
          quantity: item.quantity
        })),
        mode: 'payment',
        client_reference_id: order._id.toString(), // Link the order to the Stripe session
        success_url: `${process.env.BASE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BASE_URL}/cancel`
      });

      return res.redirect(session.url);
    }

    return res.status(400).render('shop/shop-checkout',{user}, {
      message: 'Invalid payment method selected.'
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('shop/shop-checkout',{user}, { message: 'Something went wrong. Please try again later.' });
  }
};


export const orderSuccess = async (req, res) => {
  try {
    
    let user = await User.findById(req.user._id).populate('orders').populate('cart.productId');
    // const sessionId = req.query.session_id; // Retrieve the session_id from the query string
    // console.log("REACHED HERE",req.session.checkoutCompleted,sessionId)
    // // If no session_id and checkoutCompleted flag is missing, restrict access
    // if (!sessionId && !req.session.checkoutCompleted) {
    //   return res.status(403).render('shop/shop-checkout',{user}, { message: 'Access denied. Please complete a checkout first.' });
    // }

 

    // if (!user) {
    //   return res.status(404).render('error',{user}, { message: 'User not found.' });
    // }

    // // Handle Stripe session if session_id is present
    // if (sessionId) {
    //   // Retrieve the Stripe session details
    //   const session = await stripe.checkout.sessions.retrieve(sessionId);

    //   if (!session || session.payment_status !== 'paid') {
    //     return res.status(400).render('shop/shop-checkout',{user}, { message: 'Payment not completed or invalid session.' });
    //   }

    //   // Process order based on session details
    //   const { client_reference_id, amount_total } = session;

    //   recentOrder = user.orders.find(order => order._id.toString() === client_reference_id);
    //   if (!recentOrder) {
    //     return res.status(404).render('shop/shop-checkout',{user}, { message: 'Order not found.' });
    //   }

    //   // Update order status if necessary
    //   recentOrder.status = 'Completed';
    //   await recentOrder.save();
    // } else {
    //   // Handle non-Stripe checkout (e.g., Cash on Delivery)
    //   if (!user.orders.length) {
    //     return res.status(404).render('shop/shop-checkout',{user}, { message: 'No recent orders found.' });
    //   }
    //   recentOrder = user.orders[0]; // Get the latest order
    // }

    res.render('shop/orderSuccess', {
      
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('shop/shop-checkout',{user}, { message: 'Unable to retrieve order details. Please try again.' });
  }
};
