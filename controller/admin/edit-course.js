const Courses = require('../../model/courses')

exports.getAdminCourses = (req, res) => {
    Courses.find({userId: req.session.user._id}).then(courses => {
        res.render('admin-page', {
            title: 'Администрация',
            isAdmin: true,
            courses: courses.map(el => el.toJSON())
        })
    })
}

exports.getAdminEditCourse = (req, res) => {
    Courses.findOne({_id: req.params.id}).then(course => {
        res.render('admin-edit-course', {
            title: `Редактирование курса ${course.title}`,
            course: course.toJSON()
        })
    })
}

exports.postAdminEditCourse = (req, res) => {
    const image = req.file
    const updatedTitle = req.body.title
    const updatedPrice = req.body.price

    Courses.findById(req.body.id).then(course => {
        course.title = updatedTitle
        course.price = updatedPrice
        if(image){
            course.imgUrl = image.path
        }
        return course.save().then(() => {
            res.redirect('/admin')
        })
    })
}

exports.getAdminDeleteCourse = (req, res) => {
    Courses.findByIdAndDelete({_id: req.params.id}).then(() => {
        res.redirect('/admin')
    })
}
