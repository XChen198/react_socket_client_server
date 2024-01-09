const bcrypt = require('bcryptjs');

const { getUserInfo, updateAvatar, checkEmail, updateUserInfo, searchUser, addFriend, searchDeleteFriend, deleteFriend, addGroup, searchDeleteGroup, deleteGroup } = require("../../db");

exports.getUserInfo = async (req, res) => {
    const { _id } = req.auth;
    const userinfo = await getUserInfo(_id);
    res.send({
        status: 200,
        msg: 'ok',
        data: userinfo
    })
}

exports.updateUserInfo = async (req, res) => {
    const { _id, email } = req.auth;
    const { username, oldpassword, newpassword } = req.body;
    if (oldpassword && newpassword) {
        const isEmailExist = await checkEmail(email)
        const isPasswordRight = bcrypt.compareSync(oldpassword, isEmailExist.password)
        if (!isPasswordRight) {
            return res.send({
                status: 400,
                msg: 'old password is not correct'
            })
        }
        if (oldpassword === newpassword) {
            return res.send({
                status: 400,
                msg: 'new password is the same as old password'
            })
        }
        const saltPassword = bcrypt.hashSync(newpassword, 10)
        if (username) {
            updateUserInfo(_id, username, saltPassword).then(data => {
                res.send({
                    status: 200,
                    msg: 'update successfully'
                })
            }).catch(err => {
                res.send({
                    status: 500,
                    msg: 'update failed'
                })
            })
        } else {
            res.send({
                status: 400,
                msg: 'username can not be empty'
            })
        }
    } else {
        if (username) {
            updateUserInfo(_id, username).then(data => {
                res.send({
                    status: 200,
                    msg: 'update successfully'
                })
            }).catch(err => {
                res.send({
                    status: 500,
                    msg: 'update failed'
                })
            })
        } else {
            res.send({
                status: 400,
                msg: 'username can not be empty'
            })
        }
    }
}

exports.updateAvatar = async (req, res) => {
    const { _id } = req.auth;
    updateAvatar(_id, req.body.avatar).then(data => {
        res.send({
            status: 200,
            msg: 'update successfully'
        })

    }).catch(err => {
        res.send({
            status: 500,
            msg: 'update failed'
        })
    })
}

exports.searchUser = async (req, res) => {
    const { email, _id } = req.auth;
    const { username } = req.body
    const { friend } = await getUserInfo(_id)
    let result = await searchUser(username)
    // 过滤掉用户自己和已经是好友的用户 friend是一个数组里面每一项是一个对象
    result = result.filter(item => item.email !== email && !friend.some(friend => friend.email === item.email))
    if (result.length === 0) {
        return res.send({
            status: 400,
            msg: 'no user found'
        })
    } else {
        res.send({
            status: 200,
            msg: 'ok',
            data: result
        })
    }
}

exports.addFriend = async (req, res) => {
    const { _id } = req.auth;
    const { username, email, avatar } = req.body
    addFriend(_id, username, email, avatar).then(data => {
        res.send({
            status: 200,
            msg: 'ok'
        })

    }).catch(err => {
        res.send({
            status: 500,
            msg: 'add friend failed'
        })
    })
}

exports.searchDeleteFriend = async (req, res) => {
    const { _id } = req.auth;
    const { username } = req.body;
    const result = await searchDeleteFriend(_id, username)
    if (result.length === 0) {
        return res.send({
            status: 400,
            msg: 'no user found'
        })
    }
    res.send({
        status: 200,
        msg: 'ok',
        data: result
    })
}

exports.deleteFriend = async (req, res) => {
    const { _id } = req.auth;
    const { email } = req.body;
    const result = await deleteFriend(_id, email)
    res.send({
        status: 200,
        msg: 'ok'
    })
}
const group = [{
    'groupname': 'Group1',
    'avatar': ''
},
{
    'groupname': 'Group2',
    'avatar': ''
},
{
    'groupname': 'Group3',
    'avatar': ''
}, {
    'groupname': 'Group4',
    'avatar': ''
},
{
    'groupname': 'Group5',
    'avatar': ''
},
{
    'groupname': 'Group6',
    'avatar': ''
},
{
    'groupname': 'Group7',
    'avatar': ''
},
{
    'groupname': 'Group8',
    'avatar': ''
},
{
    'groupname': 'Group9',
    'avatar': ''
},
{
    'groupname': 'Group10',
    'avatar': ''
}
]
exports.searchGroup = async (req, res) => {
    const { _id } = req.auth;
    const { groupname } = req.body;
    const { team } = await getUserInfo(_id)
    const resgx = new RegExp(groupname, 'i')
    let result = group.filter(item => resgx.test(item.groupname))
    // 过滤掉已经是群成员的群组
    result = result.filter(item => !team.some(team => team.groupname === item.groupname))
    if (result.length === 0) {
        return res.send({
            status: 400,
            msg: 'no group found'
        })
    }
    res.send({
        status: 200,
        msg: 'ok',
        data: result
    })
}

exports.addGroup = async (req, res) => {
    const { _id } = req.auth;
    const { groupname } = req.body;
    addGroup(_id, groupname).then(data => {
        res.send({
            status: 200,
            msg: 'ok'
        })
    }).catch(err => {
        res.send({
            status: 500,
            msg: 'add group failed'
        })
    })
}


exports.searchDeleteGroup = async (req, res) => {
    const { _id } = req.auth;
    const { groupname } = req.body;
    const result = await searchDeleteGroup(_id, groupname)
    if (result.length === 0) {
        return res.send({
            status: 400,
            msg: 'no group found'
        })
    }
    res.send({
        status: 200,
        msg: 'ok',
        data: result
    })
}

exports.deleteGroup = async (req, res) => {
    const { _id } = req.auth;
    const { groupname } = req.body;
    const result = await deleteGroup(_id, groupname)
    if (result.length === 0) {
        return res.send({
            status: 400,
            msg: 'no group found'
        })
    }
    res.send({
        status: 200,
        msg: 'ok'
    })
}