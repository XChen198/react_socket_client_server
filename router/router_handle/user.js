const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/index');
const { signUpUser, checkEmail, loginUser } = require('../../db/index');

exports.signup = async (req, res) => {
    const { username, email, password, repassword } = req.body
    // 如果两次密码不一致, 则返回错误信息
    if (password !== repassword) {
        return res.send({
            status: 400,
            msg: 'two passwords are not the same'
        })
    }
    // 如果邮箱不合法, 则返回错误信息
    // 正则表达式验证邮箱是否合法
    // [\w\.-]+: 匹配由字母、数字、下划线、点号、连字符组成的字符串，至少包含一个字符。
    // @: 匹配邮箱中间的@
    // [a-zA-Z\d\.-]+: 匹配由字母、数字、点号、连字符组成的字符串，至少包含一个字符。
    // \.: 匹配邮箱中间的.
    // [a-zA-Z]{2,}: 匹配至少两个字母组成的字符串。
    // $: 匹配字符串的结尾。
    const emailReg = /^[\w\.-]+@[a-zA-Z\d\.-]+\.[a-zA-Z]{2,}$/
    if (!emailReg.test(email)) {
        return res.send({
            status: 400,
            msg: 'email is not valid'
        })
    }
    // 如果邮箱已经存在, 则返回错误信息
    const isEmailExist = await checkEmail(email)
    if (isEmailExist) {
        return res.send({
            status: 409,
            msg: 'email already exists'
        })
    }
    // 对密码进行加密
    const saltPassword = bcrypt.hashSync(password, 10)
    signUpUser(username, email, saltPassword).then((data) => {
        res.send({
            status: 200,
            msg: 'sign up successfully'
        })
    }).catch((err) => {
        res.send({
            status: 500,
            msg: 'sign up failed'
        })
    })
}

exports.login = async (req, res) => {
    const { email, password } = req.body
    const isEmailExist = await checkEmail(email)
    if (!isEmailExist) {
        return res.send({
            status: 400,
            msg: 'email does not exist'
        })
    }
    const isPasswordRight = bcrypt.compareSync(password, isEmailExist.password)
    if (!isPasswordRight) {
        return res.send({
            status: 400,
            msg: 'password is not correct'
        })
    }
    // 生成token
    const user = { ...isEmailExist._doc, password: '', avatar: '', friend: [], team: [] }
    const token = jwt.sign(user, config.jwtSecretKey, { expiresIn: config.expiresIn })
    res.send({
        status: 200,
        msg: 'login successfully',
        token
    })
}
