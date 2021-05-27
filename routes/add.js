const { Router } = require('express')
const { body } = require('express-validator')

const courseController = require('../controller/courses/add')
const isAuth = require('../middlewear/is-auth')

const router = Router()

router.get('/', isAuth, courseController.getAddCourse)

router.post('/',[
    body('title', 'Неправильное заполнение имени')
        .isLength({min: 1, max: 50}),
    body('price', 'Цена должна быть цифрой!')
        .isFloat(),
] ,isAuth, courseController.postAddCourse)

module.exports = router
