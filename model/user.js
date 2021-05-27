const mongoose = require('mongoose')

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    cart: {
        items: [
            {
                courseId: { type: Schema.Types.ObjectId, ref: 'Course' },
                quantity: { type: Number }
            }
        ]
    },
    resetToken: String,
    resetTokenExpiration: Date
})

userSchema.methods.addToCart = function (course) {
    const cartCourseIndex = this.cart.items.findIndex(el => {
        return el.courseId.toString() === course._id.toString()
    })
    let newQuantity = 1
    const updatedCartItems = [...this.cart.items]

    if (cartCourseIndex >= 0) {
        newQuantity = this.cart.items[cartCourseIndex].quantity + 1
        updatedCartItems[cartCourseIndex].quantity = newQuantity
    } else {
        updatedCartItems.push({
            courseId: course._id,
            quantity: newQuantity
        })
    }
    this.cart = {
        items: updatedCartItems
    }

    return this.save()
}

userSchema.methods.deleteFromCart = function (course, courseId) {
    const cartCourseIndex = this.cart.items.findIndex(el => {
        return el.courseId.toString() === course._id.toString()
    })
    let updatedCartItems = [...this.cart.items]

    if (updatedCartItems[cartCourseIndex].quantity === 1) {
        updatedCartItems = this.cart.items.filter(el => {
            return el.courseId.toString() !== courseId.toString()
        })
    } else {
        updatedCartItems[cartCourseIndex].quantity -= 1
    }

    this.cart = {
        items: updatedCartItems
    }

    return this.save()
}

userSchema.methods.cleanCart = function (){
    this.cart = {items: []}
    return this.save()
}

module.exports = mongoose.model('User', userSchema)
