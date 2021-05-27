const Courses = require('../../model/courses')
const Order = require('../../model/order')

exports.getAllCourses = (req, res) => {
    Courses.find().then(courses =>{
        res.render('courses', {
            title: 'Курсы',
            isCourses: true,
            courses: courses.map(el => el.toJSON())
        })
    })
}

exports.getCourse = (req, res) => {
    Courses.findOne({_id: req.params.id}).then(course => {
        res.render('course', {
            title: `Курс ${course.title}`,
            course: course.toJSON()
        })
    })
}

exports.getAddToCart = (req, res) => {
    Courses.findOne({_id: req.params.id}).then(course => {
        return req.user.addToCart(course)
        }).then(() => {
        res.redirect('/courses')
    })
}

exports.getDeleteFromCart = (req, res) => {
    const courseId = req.params.id
    Courses.findOne({_id: req.params.id}).then(course => {
        return req.user.deleteFromCart(course, courseId)
    }).then(() => {
        res.redirect('/cart')
    })
}

exports.getCart = (req, res) => {
    req.user.populate('cart.items.courseId'). execPopulate().then(user => {
        let overallSum = 0
        const courses = user.cart.items.map(el => {
            const val = el.toJSON()
            val.sum =val.courseId.price * val.quantity
            overallSum += val.sum
            return val
        })
        res.render('cart', {
            title: 'Корзинка',
            isCart: true,
            courses: courses,
            overallSum: overallSum
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.getAddToOrder = (req, res) => {
    req.user.populate('cart.items.courseId').execPopulate().then(user => {
        const products = user.cart.items.map(el => {
            return {quantity: el.quantity, product: {...el.courseId._doc}}
        })
        const order = new Order({
            user: {
                username: req.user.username,
                userId: req.user
            },
            products: products
        })
        return order.save()
    }).then(() => {
        return req.user.cleanCart()
    }).then(()=> {
        res.redirect('/order')
    })
}

exports.getOrders = (req, res) => {
    Order.find().then(orders => {
        orders = orders.map(el => {
            el = el.toJSON();
            el.overallSum = 0
            if(el.user.userId.toString() === req.session.user._id.toString()) {
                el.isCreator = true
            } else {
                el.isCreator = false
            }
            el.products =  el.products.map(i => {
                i.sum = i.quantity * i.product.price
                el.overallSum += i.sum
                return i;
            });
            return el;
        });


        res.render('order', {
            title: 'Заказы',
            isOrder: true,
            orders: orders
        })
    })
}

exports.getDeleteOrder = (req, res) => {
    Order.findByIdAndDelete({_id: req.params.id}).then(() => {
        res.redirect('/order')
    })
}

exports.getCoursesFromOrder = (req, res) => {
    Order.findOne({_id: req.params.id}).then(order => {
        res.render('orders-courses', {
            title: 'Заказанные курсы',
            courses: order.products.map(el => el.toJSON())
        })
    })
}
