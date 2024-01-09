const express = require('express');
const { getUserInfo, updateUserInfo, updateAvatar, addFriend, searchUser, deleteFriend, searchDeleteFriend, addGroup, searchGroup, searchDeleteGroup, deleteGroup } = require('./router_handle/userinfo');

const router = express.Router();


router.get('/userinfo', getUserInfo)

router.post('/updateuserinfo', updateUserInfo)

router.post('/updateavatar', updateAvatar)


router.post('/searchuser', searchUser)

router.post('/addfriend', addFriend)

router.post('/searchdeletefriend', searchDeleteFriend)

router.post('/deletefriend', deleteFriend)

router.post('/searchgroup', searchGroup)

router.post('/addgroup', addGroup)

router.post('/searchdeletegroup', searchDeleteGroup)

router.post('/deletegroup', deleteGroup)

module.exports = router;