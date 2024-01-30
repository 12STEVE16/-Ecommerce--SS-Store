// secretsRoutes.js
import express from 'express';
import * as shopController from '../controller/shopController.js';
import {islogged,} from'../middleware/auth.js'
const router = express.Router();



router.get("/",shopController.renderHome);
router.get('/products/:productId', shopController.getProductDetails);

router.get('/account', islogged, shopController.renderAccount);

router.get('/allProducts', shopController.renderAllProducts);





export default router;