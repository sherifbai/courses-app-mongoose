const { Router } = require('express')

const router = Router()

router.get('/', (req, res) => {
    res.render('home', {
        title: 'Главная страница',
        isHome: true,
        isAuthenticated: req.session.isLoggedIn
    })
})

module.exports = router
