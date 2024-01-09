const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/users')

mongoose.connection.once('connected', () => {
    console.log('数据库连接成功');
})

mongoose.connection.on('error', () => {
    console.log('数据库连接失败');
})

let userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    newPassword: String,
    avatar: {
        type: String,
        default: ''
    },
    friend: {
        type: Array,
        default: []
    },
    team: {
        type: Array,
        default: []
    },
})
let userModel = mongoose.model('users', userSchema)
function signUpUser(username, email, password) {
    return userModel.create({
        username,
        email,
        password,
    })
}
function checkEmail(email) {
    // 检查邮箱是否已经在数据库中存在, 若存在则返回true, 不存在则返回false
    return userModel.findOne({ email }).select({ __v: 0 })
}

function loginUser(email, password) {
    return userModel.findOne({ email, password })
}

function getUserInfo(_id) {
    return userModel.findById({ _id }).select({ __v: 0, password: 0 })
}
function updateUserInfo(_id, username, newpassword) {
    if (username && newpassword) {
        return userModel.updateOne({ _id }, { username, password: newpassword })
    } else if (username) {
        return userModel.updateOne({ _id }, { username })
    }
}
function updateAvatar(_id, avatar) {
    return userModel.updateOne({ _id }, { avatar: avatar })
}
function searchUser(username) {
    return userModel.find({ username: { $regex: username, $options: 'i' } }).select({ __v: 0, password: 0, friend: 0, team: 0 })
}
function addFriend(_id, username, email, avatar) {
    return userModel.updateOne({ _id }, { $push: { friend: { username, email, avatar } } })
}

function searchDeleteFriend(_id, username) {
    // 通过username模糊查找用户数据中的friend数组，返回一个数组
    return getUserInfo(_id).then(result => {
        const resgx = new RegExp(username, 'i')
        return result.friend = result.friend.filter(item => resgx.test(item.username))
    })
}

function deleteFriend(_id, email) {
    // 通过email删除用户数据中的friend数组中的某一项
    return userModel.updateOne({ _id }, { $pull: { friend: { email } } })
}

function addGroup(_id, groupname) {
    return userModel.updateOne({ _id }, { $push: { team: { groupname } } })
}

function searchDeleteGroup(_id, groupname) {
    return getUserInfo(_id).then(result => {
        const resgx = new RegExp(groupname, 'i')
        return result.team = result.team.filter(item => resgx.test(item.groupname))
    })
}
function deleteGroup(_id, groupname) {
    return userModel.updateOne({ _id }, { $pull: { team: { groupname } } })
}
module.exports = {
    signUpUser,
    checkEmail,
    loginUser,
    getUserInfo,
    updateAvatar,
    updateUserInfo,
    searchUser,
    addFriend,
    searchDeleteFriend,
    deleteFriend,
    addGroup,
    searchDeleteGroup,
    deleteGroup
}

