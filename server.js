const express = require('express')
const app = express();
const {Server} = require('socket.io');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors')
const PORT = process.env.PORT || 7878;

const expressServer = app.listen(PORT,()=> console.log(`PORT SUCCESSFULLY RUNNING ON PORT ${PORT}`));
const io = new Server(expressServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

io.on('connection', (socket) => {
    console.log('New client connected');
    
    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});


app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));
app.use(express.static(path.join(__dirname,'public')));
app.use(express.static(path.join(__dirname,'views')));
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.json());


const signUp = require('./routes/signup');
const logIn = require('./routes/login')
const chatHome = require('./routes/chathome');
const crudAPI = require('./routes/CRUDapi');
const latestMsg = require('./routes/newmsgAPI');
const newGroup = require('./routes/newgroup');
const manageGroups = require('./routes/managegroups');



app.use('/',signUp(io));

app.use('/login',logIn(io));

app.use('/chathome',chatHome(io));

app.use('/chatmessages',crudAPI(io));

app.use('/getlatest',latestMsg(io));

app.use('/newgroup',newGroup(io));

app.use('/managegroups',manageGroups(io));



