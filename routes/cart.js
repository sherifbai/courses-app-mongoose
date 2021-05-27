const { Router } = require('express')

const cartController = require('../controller/courses/courses')
const isAuth = require('../middlewear/is-auth')

const router = Router()

router.get('/remove/:id', isAuth, cartController.getDeleteFromCart)
router.get('/:id', isAuth, cartController.getAddToCart)
router.get('/', isAuth, cartController.getCart)


module.exports = router
