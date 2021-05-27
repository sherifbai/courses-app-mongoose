const { Router } = require('express')

const courseController = require('../controller/courses/courses')
const router = Router()

router.get('/', courseController.getAllCourses)
router.get('/:id', courseController.getCourse)

module.exports = router
