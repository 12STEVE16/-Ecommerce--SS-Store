// secretsRoutes.js
import express from 'express';
import * as shopController from '../controller/shopController.js';
import {islogged,} from'../middleware/auth.js'
const router = express.Router();



router.get("/",shopController.renderHome);
router.get('/products/:productId', shopController.getProductDetails);

router.get('/account', islogged, shopController.renderAccount);

router.get('/allProducts', shopController.renderAllProducts);


router.get('/search', shopController.searchProducts);
router.post('/updateAccount', islogged, shopController.updateAccount);
router.post('/updateAddress', islogged, shopController.updateAddress);

router.get('/cart',islogged,shopController.renderCart)
router.get('/cart/add/:productId',islogged, shopController.addToCart);

router.get('/cart/remove/:productId',islogged, shopController.removeFromCart);
router.get('/cart/clear',islogged, shopController.clearCart);

router.get('/checkout',islogged,shopController.renderCheckout)
export default router;