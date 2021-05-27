const { Router } = require('express')

const orderController = require('../controller/courses/courses')
const isAuth = require('../middlewear/is-auth')

const router = Router()

router.get('/', isAuth, orderController.getOrders)
router.get('/remove/:id', isAuth, orderController.getDeleteOrder)
router.get('/add', isAuth, orderController.getAddToOrder)
router.get('/courses/:id', isAuth, orderController.getCoursesFromOrder)

module.exports = router
