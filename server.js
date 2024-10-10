const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;





// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



//? Serve static files from the "public" directory                    정적스키마
app.use(express.static(path.join(__dirname)));



// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/magatia'  )
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log(err));





//^ 유저 스키마 정의 
var UserSchema = new mongoose.Schema({
    email: String, // 이메일
    password: String // 비밀번호
});
var Users = mongoose.model('users', UserSchema);


// app.use(bodyParser.urlencoded({ limit: '1gb', extended: false }));


// Handle signup POST request
app.post('/signup', async (req, res) => {
    const { email, password, repeat_password } = req.body;

    // Check if passwords match
    /* if (password !== repeat_password) {
        return res.status(400).json({ success: false, message: 'Passwords do not match!' });
    } */

    var new_user = new Users({ email, password });

    try {
        await new_user.save(); // Save the new user to the database
        return res.status(200).json({ success: true });
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Signup failed!', error: err.message });
    }
});

// Handle signin POST request
app.post('/signin', async (req, res) => {
    try {
        const user = await Users.findOne({ email: req.body.email, password: req.body.password });
        if (user) {
            return res.status(200).json({ success: true, message: 'User found!', data: user });
        } else {
            return res.status(404).json({ success: false, message: 'User not found!' });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: 'Error occurred!', error: err.message });
    }
});




/* 

app.post('/signup', async (req, res) => {       //! 회원가입버튼 클릭시
    var new_user = new Users(req.body);

    try {
        await new_user.save(); // save() 메서드가 비동기적으로 동작하므로 await 사용
        // return res.status(200).json({ message: '저장 성공!', data: new_user });
        return res.status(200).json({success:true});

    } catch (err) {
        return res.status(500).json({ message: '저장 실패!', error: err.message });
    }
});

app.post('/signin', async (req, res) => {
    try {
        const user = await Users.findOne({ id: req.body.id, password: req.body.password });
        if (user) {
            return res.status(200).json({ message: '유저 찾음!', data: user });
        } else {
            return res.status(404).json({ message: '유저 없음!' });
        }
    } catch (err) {
        return res.status(500).json({ message: '에러!', error: err.message });
    }
}); */





/* app.post('/signup', async (req, res) => {                //! 원래거
    const { email, password, repeat_password } = req.body;

    // Check if passwords match
    if (password !== repeat_password) {
        return res.status(400).send('비밀번호가 일치하지 않습니다.');
    }

    try {
        // Create a new user
        const newUser = new User({ email, password });
        await newUser.save();
        res.send('성공적으로 가입되었습니다.');
    } catch (err) {
        res.status(400).send('Error: ' + err.message);
    }
});
 */






app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

app.get("/",function(req,res){              /* 로컬에서 html 실행하기  */
res.sendfile("index.html");


});