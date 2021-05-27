const { Router } = require('express')

const adminController = require('../controller/admin/edit-course')
const isAuth = require('../middlewear/is-auth')

const router = Router()

router.get('/', isAuth,  adminController.getAdminCourses)
router.get('/edit/:id', isAuth, adminController.getAdminEditCourse)
router.post('/edit', isAuth, adminController.postAdminEditCourse)
router.get('/remove/:id', isAuth, adminController.getAdminDeleteCourse)

module.exports = router
