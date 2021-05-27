const { Router } = require('express')
const { body } = require('express-validator')

const authController = require('../controller/auth/auth')
const User = require('../model/user')

const router = Router()

router.get('/signup',  authController.getSignUp)
router.post('/signup', [
    body('email')
        .isEmail()
        .withMessage('Введите email')
        .custom((value, { req }) => {
            return User.findOne({email: value}).then(userDoc => {
                if(userDoc){
                    return Promise.reject('Данный email уже занят')
                }
            })
        })
        .normalizeEmail(),
    body('username')
        .isAlphanumeric()
        .isLength({min: 5, max:15}),
    body('password', 'Введите пароль')
        .isLength({min: 5})
        .isAlphanumeric()
        .trim(),
    body('confirmPassword')
        .isLength({min: 5})
        .custom((value, { req }) => {
            if(value !== req.body.password) {
                throw new Error('Пароли не совпадают!')
            }
            return true
        })
        .trim(),
], authController.postSignUp)

router.get('/login', authController.getLogin)
router.post('/login', [
    body('email')
        .isEmail()
        .withMessage('Введите email')
        .normalizeEmail(),
    body('password')
        .isAlphanumeric()
        .isLength({min: 5})
        .trim()
], authController.postLogin)

router.get('/logout', authController.getLogout)

router.get('/reset', authController.getReset)
router.post('/reset', authController.postReset)

router.get('/reset/:token', authController.getSetNewPassword)
router.post('/new-password', authController.postSetNewPassword)

module.exports = router
