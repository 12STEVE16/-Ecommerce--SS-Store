// routes/admin.js

import express from 'express';
import bodyParser from 'body-parser';
import * as adminController from '../controller/admin.js';
import {isAdminLogged,isAdminAlreadyLogged} from'../middleware/auth.js'
import * as errorController from '../controller/error.js';
import multer from 'multer';

const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.set('view engine', 'ejs');
router.set('views', './views');


// configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads');
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + '-' + file.originalname);
    },
  });
  const upload = multer({ storage: storage });


// Admin routes
const preserveSpacesMiddleware = (req, res, next) => {
    // Use the rawBody field to access the unmodified request body
    req.rawBody = req.body;
  
    // Disable trim for the specific route
    bodyParser.urlencoded({ extended: true, trim: false })(req, res, next);
  };
  

//admin authentication
router.get("/",isAdminAlreadyLogged, adminController.renderLoginAdmin);
router.post("/",isAdminAlreadyLogged, adminController.loginAdmin);
router.get('/logout', (req, res) => {
    req.logout((err) => {
    res.redirect('/admin');
    });
  });



router.get("/dashboard",isAdminLogged, adminController.renderDashboard);
router.get('/products', isAdminLogged, adminController.renderProducts);
router.delete('/delete-product/:id', isAdminLogged, adminController.deleteProduct);

router.get('/categories', isAdminLogged, adminController.renderCategories);
router.delete('/delete-category/:id', isAdminLogged,adminController.deleteCategory);


router.get('/create-category', isAdminLogged, adminController.renderCreateCategories);
router.post('/create-category', isAdminLogged, adminController.createCategory);

router.get('/edit-category/:id', isAdminLogged, adminController.renderEditCategories);
router.post('/edit-category/:id', isAdminLogged, adminController.editCategory);


router.get('/add-product', isAdminLogged, adminController.renderAddProducts);

// the route for handling product addition with multer middleware
router.post('/add-product', isAdminLogged,preserveSpacesMiddleware,upload.array('avatar',5), adminController.addProduct);

// Route to render the edit product page
router.get('/products/edit/:productId', isAdminLogged, adminController.renderEditProduct);

// Route to handle updating the product
router.post('/update-product', isAdminLogged, upload.array('avatar', 3), adminController.updateProduct);

router.delete('/delete-image/:productId/:index', isAdminLogged, adminController.deleteProductImage);


router.get('/users', isAdminLogged, adminController.getUsersPage);


router.post('/block-unblock-user/:userId', adminController.blockUnblockUser);


router.use(errorController.getAdmin404);

export default router;
