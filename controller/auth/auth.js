const User = require('../../model/user')

const crypto = require('crypto')
const bcrypt = require('bcrypt')
const mailer = require('@sendgrid/mail')
const { validationResult } = require('express-validator')

mailer.setApiKey('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')


exports.getSignUp = (req, res) => {

    res.render('auth/signup', {
        title: 'Регистрация',
        isAuthenticated: false,
        isSignUp: true,
        oldInput: {
            email: '',
            password: '',
            username: '',
            confirmPassword: ''
        }
    })
}

exports.postSignUp = (req, res) => {
    const email = req.body.email
    const username = req.body.username
    const password = req.body.password
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            title: 'Регистрация',
            isAuthenticated: false,
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                username: username,
                password: password,
                confirmPassword: req.body.confirmPassword
            }
        })
    }

    bcrypt.hash(password, 12).then(hashedPassword => {
        const user = new User({
            username: username,
            email: email,
            password: hashedPassword,
            cart: {items: []}
        })
        return user.save()

    }).then(() => {
        res.redirect('/login')

        mailer.send({
            to: email,
            from: 'godness980@gmail.com',
            subject: 'Signup succeeded',
            html: '<h1>You successfully signed up!</h1>'
        }).then(() => {
            console.log('Sent')
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.getLogin = (req, res) => {

    res.render('auth/login', {
        title: 'Вход',
        isAuthenticated: false,
        isLogin:true,
        oldInput: {
            email: '',
            password: ''
        }
    })
}

exports.postLogin = (req, res) => {
    const email = req.body.email
    const password = req.body.password

    const errors = validationResult(req)

    if(!errors.isEmpty()){
        return res.status(422).render('auth/login', {
            title: 'Вход',
            errorMessage: errors.array()[0].msg,
            oldInput: {
                email: email,
                password: password
            }
        })
    }

    User.findOne({email: email}).then(user => {
        if (!user) {
            return res.status(422).render('auth/login', {
                title: 'Вход',
                errorMessage: 'Неправильный email или пароль',
                oldInput: {
                    email: email,
                    password: password
                }
            })
        }
        bcrypt.compare(password, user.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true
                req.session.user = user
                return req.session.save(() => {
                    res.redirect('/')
                })
            }
            return res.status(422).render('auth/login', {
                title: 'Вход',
                errorMessage: 'Неправильный email или пароль',
                oldInput: {
                    email: email,
                    password: password
                }
            })
        }).catch(err => {
            console.log(err)
        })
    })
}

exports.getLogout = (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
}

exports.getReset = (req, res) => {
    res.render('auth/reset', {
        title: 'Сброс пароля',
    })
}

exports.postReset = (req, res) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err)
            res.redirect('/reset')
        }
        const token = buffer.toString('hex')
        User.findOne({email: req.body.email}).then(user => {
            if (!user) {
                req.flash('error', 'Email не найден!')
                return res.redirect('/reset')
            }
            user.resetToken = token
            user.resetTokenExpiration = Date.now() + 3600000
            return user.save()
        }).then(result => {
            res.redirect('/')
            mailer.send({
                to: req.body.email,
                from: 'godness980@gmail.com',
                subject: 'Reset password',
                html: `<a>href='http://localhost:3000/reset/${token}'</a>`
            }).then(result => {
                console.log('Sent')
            })
        }).catch(err => {
            console.log(err)
        })
    })
}

exports.getSetNewPassword = (req, res) => {
    const token = req.params.token
    User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}}).then(user => {
        res.render('auth/set-new-password', {
            title: 'Установление нового пароля',
            userId: user._id.toString(),
            passwordToken: token
        })
    }).catch(err => {
        console.log(err)
    })
}

exports.postSetNewPassword = (req, res) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const passwordToken = req.body.passwordToken
    let resetUser

    User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId}).then(user => {
        resetUser = user
        return bcrypt.hash(newPassword, 12)
    }).then(hashedPassword => {
        resetUser.password = hashedPassword
        resetUser.resetToken = undefined
        resetUser.resetTokenExpiration = undefined

        return resetUser.save()
    }).then(result => {
        res.redirect('/login')
    }).catch(err => {
        console.log(err)
    })
}
