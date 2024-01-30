import passport from 'passport';
import User from '../model/User.js';

export const islogged = (req, res, next) => {
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect('/login');
    }
};
export const isAlreadyLogged = (req, res, next) => {
    if (req.isAuthenticated()) {
        res.redirect('/account');
    } else {
        next();
    }
};
export const isAdminLogged = (req, res, next) => {
    if (req.isAuthenticated()&& req.user.is_admin) {
        next();
    } else {
        res.redirect('/admin');
    }
};
export const isAdminAlreadyLogged = (req, res, next) => {
    if (req.isAuthenticated() && req.user.is_admin)  {
        res.redirect('admin/dashboard');
    } else {
        next();
    }
};