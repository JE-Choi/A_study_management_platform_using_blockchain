const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 5000;
var parser = bodyParser.json();
app.use(parser);
app.use(bodyParser.urlencoded({ extended : true}));

const data = fs.readFileSync('./database.json');
const conf = JSON.parse(data);
const mysql = require('mysql');

const connection = mysql.createConnection({
    host: conf.host,
    user: conf.user,
    password: conf.password,
    port: conf.port,
    database: conf.database
});
connection.connect();

app.post('/api/createAccount', (req, res) => {
    let sql = `INSERT INTO account_list VALUES (?,?,?);`;
    
    let account_id = req.body.account_id;
    let account_num = req.body.account_num;
    let account_pw = req.body.account_pw;
    let params = [account_id, account_num,account_pw];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// npm install --save multer 설치 이후 하기.
// const multer = require('multer');
// const upload = multer({dest: './upload'});

app.get('/api/customers', (req, res) => {

    connection.query(
        "SELECT * FROM studyitem",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// multer 설치 이후 하기.
// 사용자가 프로필 이미지 확인하기 위해서.
// app.use('/image', express.static('./upload'));

// 사용자가 고객 추가 데이터 전송했을 때 처리하는 부분.
// app.post('/api/customers', upload.single('image'), (req, res) => {
app.post('/api/customers', parser, (req, res) => {
    let sql = `INSERT INTO studyitem VALUES (NULL, ?, ?, ?, ?, ?, ?, ?)`;
    // DB에 이미지가 존재하는 이미지 경로
    // 이미지 접근 가능.
    // 즉, 사용자는 실제 프로필 이미지를 받아오고, 이미지 받아옴.
    // filename은 multer 라이브러리가 자동으로 겹치지 않는 이름으로 할당.
    // let image = '/image/' + req.file.filename;
    let study_name = req.body.study_name;
    let study_type = req.body.study_type;
    let num_people = req.body.num_people;
    // let current_num_people = req.body.current_num_people;
    let study_period = req.body.study_period;
    let study_coin = req.body.study_coin;
    let study_desc = req.body.study_desc;

    //let params = [personId, personPw, personPw2, name];
    let params = [study_name, study_type, num_people, "0", study_period, study_coin, study_desc];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); // 성공적 데이터 입력->클라이언트에게 출력
        }
    );
});

// RenameStudy에서 사용
// stydy_info에서 사용
app.get('/api/customers/view/:id', (req, res) => {
    let sql = `SELECT * FROM studyitem where s_id  = ?`;
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 방장 불러오는 부분
app.get('/api/customers/view_leader/:id', (req, res) => {
    let sql = `SELECT person_name FROM person_info WHERE person_id = (SELECT person_id from study_join where STUDY_JOIN.leader = 1 AND STUDY_JOIN.study_id = ?)`;
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.post('/api/customers/view/rename/', (req, res) => {
    let sql = `UPDATE studyitem SET study_name = ?, study_type = ?, num_people = ?, study_period = ?, study_coin = ?, study_desc = ? WHERE s_id  = ?`;
   
    let study_name = req.body.study_name;
    let study_type = req.body.study_type;
    let num_people = req.body.num_people;

    let study_period = req.body.study_period;
    let study_coin = req.body.study_coin;
    let study_desc = req.body.study_desc;
    let id = req.body.rename_index;

    let params = [study_name, study_type, num_people, study_period, study_coin, study_desc, id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); // 성공적으로 데이터 입력->클라이언트에게 출력
        }
    );
});

app.delete('/api/customers/:id', (req, res) => {
    let sql = 'DELETE FROM studyitem WHERE s_id = ?';
    let params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

// 회원가입 중복확인 부분
app.post('/api/signup_overlap', (req, res) => {
    // let sql = `SELECT COUNT(person_id) FROM PERSON_INFO WHERE person_id=?`;
    let sql = "SELECT * FROM PERSON_INFO WHERE PERSON_ID = ?";
 
    let person_id = req.body.person_id;

    let params = [person_id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// STUDY 가입자
app.post('/api/customers/join/:id', (req, res) => {
    let sql = `INSERT INTO STUDY_JOIN VALUES (?, ?, ?, ?)`;

    let study_id = req.params.id;
    let person_id = req.body.person_id;
    let leader = req.body.leader;
    let account_number = req.body.account_number;

    let params = [study_id, person_id, leader, account_number];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// STUDY 생성자
app.post('/api/customers/leader', (req, res) => {
    let sql = `INSERT INTO STUDY_JOIN VALUES (?, ?, ?, ?)`;

    let study_id = req.body.study_id;
    let person_id = req.body.person_id;
    let leader = req.body.leader;
    let account_number = req.body.account_number;

    let params = [study_id, person_id, leader, account_number];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 회원가입 데이터 삽입
app.post('/api/signup', parser, (req, res) => {
    let sql =`INSERT INTO PERSON_INFO VALUES (?,?,?);`;
    let personId  = req.body.personId;
    let personPw = req.body.personPw;
    let personName = req.body.personName;

    let params = [personId,personPw,personName];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 로그인 판별
app.post('/api/login', (req, res) => {
    let sql = "SELECT * FROM PERSON_INFO WHERE PERSON_ID = ?";

    let userId = req.body.userId;

    let params = [userId];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 로그인한 사용자
app.post('/api/login/user_name', (req, res) => {
    let sql = "SELECT person_name FROM PERSON_INFO WHERE PERSON_ID = ?";

    let person_id = req.body.person_id;

    let params = [person_id];
    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 로그인 한 사용자는 스터디에 가입한 사람인지 판별
app.post('/api/isjoin',(req,res)=>{
    let sql = `SELECT * FROM study_join WHERE PERSON_ID = ? AND STUDY_ID = ?`;

    let person_id = req.body.person_id;
    let study_id = req.body.study_id;

    let params = [person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
