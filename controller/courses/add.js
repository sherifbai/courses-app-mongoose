const Course = require('../../model/courses')

const { validationResult } = require('express-validator')

exports.getAddCourse = (req, res) => {
    res.render('add-course', {
        title: 'Добавление курса',
        isAdd: true,
        oldInput: {
            title: '',
            price: '',
            imgUrl: ''
        }
    })
}

exports.postAddCourse = (req, res) => {
    const title = req.body.title
    const price = req.body.price
    const image = req.file

    if(!image) {
        return res.status(422).render('add-course', {
            title: 'Добавление курса',
            isAdd: true,
            errorMessage: 'Файл должен быть фото',
            oldInput: {
                title: title,
                price: price,
            }
        })
    }

    const imgUrl = image.path

    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('add-course', {
            title: 'Добавление курса',
            isAdd: true,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                title: title,
                price: price,
            }
        })
    }

    const course = new Course({
        title: title,
        price: price,
        imgUrl: imgUrl,
        userId: req.user
    })

    course.save().then(() => {
        res.redirect('/courses')
    })
}
