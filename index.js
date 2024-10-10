const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const bcrypt = require('bcrypt'); // Password hashing library
const session = require('express-session');
const nodemailer = require('nodemailer'); 

const app = express();
const port = process.env.PORT || 3000;

const verificationCodes = {}; // Object to store verification codes for each email

//^ Session 설정
app.use(session({
    secret: 'your-secret-key', // Secret key for session encryption
    resave: false,
    saveUninitialized: true,
    cookie: {} // Cookie expiration settings
}));

// Middleware to parse JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname)));

//^ MongoDB 연결
mongoose.connect('mongodb://127.0.0.1:27017/magatia', {
}).then(() => console.log('MongoDB connected...'))
  .catch(err => console.log(err));

// 유저 스키마 


const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true }, // Email
    password: { type: String, required: true }, // Hashed password
    joinDate: { type: Date, default: Date.now }, // Join date
    watchedVideos: [ // Schema for storing watch history
        {
            videoId: String, // YouTube video ID
            title: String, // Video title
            watchedDate: { type: Date, default: Date.now } // Watch date
        }
    ]
});



const User = mongoose.model('User', UserSchema);

module.exports = {User};        /* 다른곳에서도 사용가능 */













// Endpoint to save watched videos
app.post('/save-watched-video', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { videoId, title } = req.body;

    try {
        // Add watch history
        await User.updateOne(
            { email: req.session.user.email },
            { $push: { watchedVideos: { videoId, title } } }
        );

        res.json({ success: true, message: '시청 기록이 저장되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: '시청 기록 저장 중 오류가 발생했습니다.', error: err.message });
    }
});

// Endpoint to get watched videos
app.get('/get-watched-videos', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    try {
        const user = await User.findOne({ email: req.session.user.email });
        res.json({ success: true, watchedVideos: user.watchedVideos });
    } catch (err) {
        res.status(500).json({ success: false, message: '시청 기록 불러오기 중 오류가 발생했습니다.', error: err.message });
    }
});

//^회원가입
app.post('/signup', async (req, res) => {
    const { email, password, repeat_password } = req.body;

   

    try {

     // Check password match
    if (password !== repeat_password) {
        return res.status(400).json({ success: false, message: '비밀번호가 일치하지 않습니다.' });
    }

        
        // 이미 존재 하는 아이디 확인
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: '오류' });
            }

             



        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = new User({ email, password: hashedPassword });
        await newUser.save();

        return res.status(200).json({ success: true, message: '회원가입에 성공했습니다!' });
    } catch (err) {
        return res.status(500).json({ success: false, message: '회원가입에 실패했습니다!', error: err.message });
    }
});

//^로그인
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
 
 
 
 
    // Check password
 const isMatch = await bcrypt.compare(password, user.password);
 if (!isMatch) {
     return res.status(400).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
 }



    try {
        // Search for user by email
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: '이메일 또는 비밀번호가 잘못되었습니다.' });
        }

       

        // Login success
        req.session.user = user; // Save login state in session
        return res.status(200).json({ success: true, message: '로그인 되었습니다.' });

    } catch (err) {
        return res.status(500).json({ success: false, message: '서버 오류가 발생했습니다.', error: err.message });
    }
});

//^ 로그아웃 handler
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: '로그아웃 실패' });
        }
        res.clearCookie('connect.sid'); // Delete session cookie
        return res.status(200).json({ success: true, message: '로그아웃 되었습니다.' });
    });
});

// Check login status
app.get('/check-session', (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true });
    } else {
        return res.json({ loggedIn: false });
    }
});

// Check login status (duplicate endpoint)
app.get('/check-login', (req, res) => {
    if (req.session.user) {
        return res.json({ loggedIn: true });
    } else {
        return res.json({ loggedIn: false });
    }
});

// Get user info
app.get('/user-info', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: '로그인이 필요합니다.' });
    }

    User.findOne({ email: req.session.user.email })
        .then(user => {
            if (!user) {
                return res.status(404).json({ error: '사용자를 찾을 수 없습니다.' });
            }
            res.json({
                email: user.email,
                joinDate: user.joinDate
            });
        })
        .catch(err => res.status(500).json({ error: '서버 오류' }));
});

// Update email handler
app.post('/update-email', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { email } = req.body;
    try {
        await User.updateOne({ email: req.session.user.email }, { $set: { email: email } });
        req.session.user.email = email; // Update email in session
        res.json({ success: true, message: '이메일이 성공적으로 변경되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: '이메일 변경 중 오류가 발생했습니다.', error: err.message });
    }
});

// Update password handler
app.post('/update-password', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ success: false, message: '로그인이 필요합니다.' });
    }

    const { password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await User.updateOne({ email: req.session.user.email }, { $set: { password: hashedPassword } });
        res.json({ success: true, message: '비밀번호가 성공적으로 변경되었습니다.' });
    } catch (err) {
        res.status(500).json({ success: false, message: '비밀번호 변경 중 오류가 발생했습니다.', error: err.message });
    }
});



//! 이메일 보내기ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ
// 인증 코드 검증 핸들러
app.post('/validate-verification-code', (req, res) => {
    const { email, code } = req.body; // 요청 본문에서 이메일과 인증 코드(6자리)를 추출

    // 저장된 인증 코드와 요청한 코드가 일치하는지 확인
    if (verificationCodes[email] && verificationCodes[email] === code) {
        delete verificationCodes[email]; // 검증 후 해당 코드를 삭제
        res.status(200).json({ success: true, message: '인증번호가 확인되었습니다.' }); // 성공 응답
    } else {
        res.status(400).json({ success: false, message: '유효하지 않은 인증번호입니다.' }); // 실패 응답
    }
});

// 인증 코드 전송 핸들러
app.post('/send-verification-code', async (req, res) => {
    const { email } = req.body; // 요청 본문에서 이메일을 추출

    try {
        // 사용자 존재 여부 확인
        const user = await User.findOne({ email: email });

        if (!user) {
            // 사용자가 없으면 404 응답
            return res.status(404).json({ success: false, message: '이메일이 일치하는 사용자를 찾을 수 없습니다.' });
        }

        // 6자리 인증 코드 생성
        const verificationCode = crypto.randomBytes(3).toString('hex');
        verificationCodes[email] = verificationCode; // 생성된 코드를 저장

        // 이메일 전송 옵션 설정
        const mailOptions = {
            from: 'leehiesoo@gmail.com', // 발신자 이메일
            to: email, // 수신자 이메일
            subject: '아이디 찾기 인증번호', // 이메일 제목
            text: `인증번호는 ${verificationCode} 입니다.` // 이메일 내용
        };

        // 이메일 전송
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Email sending error:', error); // 에러 로그
                return res.status(500).json({ success: false, message: '이메일 전송 실패', error: error.message }); // 실패 응답
            } else {
                console.log('Email sent:', info.response); // 성공 로그
                res.status(200).json({ success: true, message: '인증번호가 이메일로 전송되었습니다.' }); // 성공 응답
            }
        });
    } catch (err) {
        return res.status(500).json({ success: false, message: '서버 오류 발생', error: err.message }); // 예외 처리
    }
});

// Nodemailer를 사용하여 이메일 전송을 위한 트랜스포터 설정
const transporter = nodemailer.createTransport({
    service: 'gmail', // 사용 중인 이메일 서비스
    auth: {
        user: 'leehiesoo@gmail.com', // 본인 이메일
        pass: 'lasrkobfklxkszgq' // 본인 이메일 비밀번호 또는 앱 비밀번호
    }
});

//! 이메일 보내기ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ








// 서버시작
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

