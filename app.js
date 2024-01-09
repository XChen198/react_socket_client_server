const express = require('express')
const http = require('http')
const cors = require('cors')
const { expressjwt: jwt } = require('express-jwt')
const userRouter = require('./router/user')
const userinfoRouter = require('./router/userinfo')
const config = require('./config/index')
const crypto = require('crypto');
const { checkEmail } = require('./db')

const app = express()
const server = http.createServer(app)
const port = 3001;


app.use(cors());
app.use(express.json({ limit: '20mb' }))
app.use(express.urlencoded({ extended: false }))
app.use(jwt({ secret: config.jwtSecretKey, algorithms: ["HS256"] }).unless({ path: [/^\/api/] }))

app.use('/api', userRouter)
app.use('/user', userinfoRouter)

app.use((err, req, res, next) => {
    if (err.name === 'UnauthorizedError') {
        res.send({
            status: 401,
            msg: 'token is not vaild'
        })
    }
})

server.listen(port, () => {
    console.log(`Server running at http://127.0.0.1:${port}`)
})

const io = require('socket.io')(server, {
    pingTimeout: 30,
    cors: {
        origin: '*'
    },
    maxHttpBufferSize: 2e7
})
let users = [] // 存储在线的用户
const activeRooms = {} // 存储当前活跃的房间
// 生成房间号
function generateRoomName(email1, email2) {
    const hash = crypto.createHash('sha256');
    const sortedEmails = [email1, email2].sort().join('_');
    hash.update(sortedEmails);
    return hash.digest('hex');
}//
io.on('connection', (socket) => {
    console.log('a user connected');
    socket.on('disconnect', (data) => {
        console.log('disconnect');
    })
    socket.on('login', (data) => {
        // 得到了当前用户的登录信息 username 和 email
        console.log(data);
        // 将当前用户存储到在线用户列表中
        users.push(data)
    })

    socket.on('joinRoom', async (data, callback) => {
        const { myemail, email } = data;
        const { username, avatar } = await checkEmail(myemail)
        checkEmail(myemail).then(({ username, avatar }) => {
            // 创建房间名
            const roomName = generateRoomName(myemail, email);
            // 加入房间
            socket.join(roomName);
            // 将房间名存储到当前活跃的房间列表中
            if (!activeRooms[roomName]) {
                activeRooms[roomName] = { users: [] };
            }
            // 检查是否已经存在相同的邮箱
            if (!activeRooms[roomName].users.includes(myemail)) {
                activeRooms[roomName].users.push(myemail);
            }
            if (callback) {
                callback()
            }

            socket.on('sendMsg', (data) => {
                socket.to(roomName).emit('receiveMsg', { data: data, username: username, avatar: avatar });
            })
        }).catch((err) => {
            console.log(err);
        })

    })
    socket.on('leaveRoom', (data) => {
        const { myemail, email } = data
        const roomName = generateRoomName(myemail, email)
        if (activeRooms[roomName]) {
            socket.removeAllListeners('sendMsg')
            socket.leave(roomName)
            activeRooms[roomName].users = activeRooms[roomName].users.filter((item) => item !== myemail)
            if (activeRooms[roomName].users.length === 0) {
                delete activeRooms[roomName]
            }
        }

    })

    socket.on('joinGroup', (data, callback) => {
        const { myemail, email } = data
        checkEmail(myemail).then(({ username, avatar }) => {
            socket.join(email)
            if (!activeRooms[email]) {
                activeRooms[email] = { users: [] }
            }
            if (!activeRooms[email].users.includes(myemail)) {
                activeRooms[email].users.push(myemail)
            }
            if (callback) {
                callback()
            }
            socket.on('sendMsg', (data) => {
                socket.to(email).emit('receiveGroupMsg', { data: data, username, avatar: avatar })
            })
        })

    })

    socket.on('leaveGroup', (data) => {
        const { myemail, email } = data
        if (activeRooms[email]) {
            socket.removeAllListeners('sendMsg')
            socket.leave(email)
            activeRooms[email].users = activeRooms[email].users.filter((item) => item !== myemail)
            if (activeRooms[email].users.length === 0) {
                delete activeRooms[email]
            }
        }
    })
})

io.on('disconnect', () => {
    console.log('a user disconnected');
})
