const express = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const csrf = require('csurf')
const flash = require('connect-flash')
const multer = require('multer')

const User = require('./model/user')

const errorController = require('./controller/errors')

const homeRouter = require('./routes/home')
const coursesRouter = require('./routes/courses')
const addRouter = require('./routes/add')
const adminRouter = require('./routes/admin')
const cartRouter = require('./routes/cart')
const orderRouter = require('./routes/order')

const authRouter = require('./routes/auth')

const bodyParser = require('body-parser')
const exphbs = require('express-handlebars')

const url = "mongodb+srv://Sherif:5P86BeLIEsytx1Xg@cluster0.qwr9u.mongodb.net/my_db?retryWrites=true&w=majority"

const app = express()
const store = new MongoDBStore({
    uri: url,
    collection: 'session'
})
const csrfProtection = csrf({})

const hbs = exphbs.create({
    defaultLayout: 'main',
    extname: 'hbs'
})

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true)
    } else {
        cb(null, false)
    }
}

app.use(express.static('public'))
app.use('/images', express.static('images'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(multer({storage: fileStorage}).single('image'))

app.use(session({secret: 'my secret', resave: false, saveUninitialized: false, store: store}))
app.use(csrfProtection)
app.use(flash())


app.use((req, res, next) => {
    if (!req.session.user){
        return next()
    }
    User.findById(req.session.user._id).then(user => {
        req.user = user
        next()
    }).catch(err => {
        console.log(err)
    })
})


app.use((req, res, next) => {
    res.locals.isAuthenticated = req.session.isLoggedIn
    res.locals.csrfToken = req.csrfToken()
    next()
})


app.engine('hbs', hbs.engine)
app.set('view engine', 'hbs')
app.set('views', 'views')


app.use(authRouter)


app.use('/',homeRouter)
app.use('/courses', coursesRouter)
app.use('/add', addRouter)
app.use('/admin', adminRouter)
app.use('/cart', cartRouter)
app.use('/order', orderRouter)

app.use(errorController.get404)

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})
    .then(() => {
    console.log('Connected')
    app.listen(3000)
    })
    .catch(err => {
    console.log(err)
    })
