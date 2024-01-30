import express from 'express';
import bodyParser from 'body-parser';
const router = express();
router.use(bodyParser.urlencoded({ extended: true }));
router.use(bodyParser.json());
router.set('view engine', 'ejs');
router.set('views', './views');



const get404 = (req, res, next) => {
    res.status(404).render('404', {
      pageTitle: 'Page Not Found',
      path: '/404',
    //   isAuthenticated: req.session.isLoggedIn
    });
  };
  const getAdmin404 = (req, res, next) => {
    res.status(404).render('admin404', {
      pageTitle: 'Page Not Found',
      path: 'admin404',
    //   isAuthenticated: req.session.isLoggedIn
    });
  };
  
//   const get500 = (req, res, next) => {
//     res.status(500).render('500', {
//       pageTitle: 'Error!',
//       path: '/500',
//       isAuthenticated: req.session.isLoggedIn
//     });
//   };
  
  




 export  {get404,getAdmin404 }