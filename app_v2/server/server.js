import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mysql from "mysql";

const app = express();
dotenv.config();

const port = 5000;
const parser = bodyParser.json();

app.use(parser);
app.use(bodyParser.urlencoded({ extended : true}));

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port:process.env.DB_PORT,
    database: process.env.DB_DATABASE
});
connection.connect();

// 계좌 생성
app.post('/api/createAccount', (req, res) => {
    const sql = `INSERT INTO account_list VALUES (?,?,?,?);`;
    // const account_index = req.body.account_index;
    const account_num = req.body.account_num;
    const account_pw = req.body.account_pw;
    const person_id = req.body.person_id;
    const study_id = req.body.study_id;

    const params = [account_num, account_pw, person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디 목록들 요소 불러오기
app.get('/api/select/studyitem', (req, res) => {

    connection.query(
        "SELECT * FROM studyitem where is_end = 0 and is_start = 0 ORDER BY s_id desc",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 모든 스터디 목록들 요소 불러오기
app.post('/api/select/all_studyitem', (req, res) => {
    
    connection.query(
        "SELECT * FROM studyitem",
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 특정 스터디의 가입 정보
app.post('/api/select/study_join/where/study_id', (req, res) => {
    const sql = `SELECT * FROM study_join WHERE study_id = ?;`;
    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 특정 사용자의 스터디 탈퇴
app.post('/api/community/studyWithdrawal', (req, res) => {
    const sql = `delete FROM study_join WHERE study_id = ? AND person_id = ?;`;
    const study_id = req.body.study_id;
    const person_id = req.body.person_id;

    const params = [study_id, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 해당 스터디에 가입한 스터디 원 수
app.post('/api/myPage/numOfMember', (req, res) => {
    const sql = `SELECT COUNT(*) AS numOfMember FROM study_join WHERE study_id = ?;`;
    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 스터디 목록에 항목 삽입
app.post('/api/insert/studyitem', parser, (req, res) => {
    const sql = `INSERT INTO studyitem VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, 0, 0,?)`;
    const study_name = req.body.study_name;
    const study_type = req.body.study_type;
    const num_people = req.body.num_people;
    const study_start_date = req.body.study_start_date;
    const study_end_date = req.body.study_end_date;
    const study_coin = req.body.study_coin;
    const study_desc = req.body.study_desc;
    const study_cnt = req.body.study_cnt;

    const params = [study_name, study_type, num_people, study_start_date, study_end_date, study_coin, study_desc, study_cnt];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// RenameStudy, stydy_info에서 사용
app.get('/api/studyItems/view/:id', (req, res) => {
    const sql = `SELECT * FROM studyitem where s_id  = ?`;
    const params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// study_join, person_info의 이름 순으로 데이터 추출
app.post('/api/select/studyitemAndperson_info/orderBypersonName', (req, res) => {
    const sql = `SELECT * FROM study_join AS s_join 
    JOIN person_info AS p_info ON s_join.person_id = p_info.person_id 
    where study_id = ? order by PERSON_NAME;`;

    const study_id = req.body.study_id;
   
    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// study_join, person_info leader순으로 데이터 추출
app.post('/api/select/studyitemAndperson_info/orderByleader', (req, res) => {
    const sql = `SELECT * FROM study_join AS s_join 
    JOIN person_info AS p_info ON s_join.person_id = p_info.person_id 
    where study_id = ? order by leader desc;`;

    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 방장 불러오기
app.get('/api/studyItems/view_leader/:id', (req, res) => {
    const sql = `SELECT person_name FROM person_info WHERE person_id = (SELECT person_id from study_join where study_join.leader = 1 AND study_join.study_id = ?)`;
    
    const params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디 내용 수정
app.post('/api/studyItems/view/rename/', (req, res) => {
    const sql = `UPDATE studyitem SET study_name = ?, study_type = ?, num_people = ?, start_date = ?, end_date = ?, study_coin = ?, study_desc = ?, study_cnt = ? WHERE s_id  = ?`;
   
    const study_name = req.body.study_name;
    const study_type = req.body.study_type;
    const num_people = req.body.num_people;
    const study_start_date = req.body.study_start_date;
    const study_end_date = req.body.study_end_date;
    const study_coin = req.body.study_coin;
    const study_desc = req.body.study_desc;
    const study_cnt = req.body.study_cnt;
    const id = req.body.rename_index;

    const params = [study_name, study_type, num_people, study_start_date, study_end_date, study_coin, study_desc, study_cnt ,id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 스터디 목록에서 요소 삭제
app.delete('/api/delete/studyitem/:id', (req, res) => {
    const sql = 'DELETE FROM studyitem WHERE s_id = ?';
    const params = [req.params.id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    )
});

// STUDY 가입 정보 삽입
app.post('/api/insert/study_join', (req, res) => {
    const sql = `INSERT INTO study_join VALUES (?, ?, ?)`;

    const study_id = req.body.study_id;
    const person_id = req.body.person_id;
    const leader = req.body.leader;

    const params = [study_id, person_id, leader];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 회원가입
app.post('/api/signup', (req, res) => {
    const sql =`INSERT INTO person_info VALUES (?,?,?);`;
    const personId  = req.body.personId;
    const personPw = req.body.personPw;
    const personName = req.body.personName;
    
    const params = [personId,personPw,personName];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 회원가입할 때 주 계좌 정보 저장
app.post('/api/insert/main_account_list', (req, res) => {
    const sql =`INSERT INTO main_account_list VALUES (?,?,?,?);`;
    const account_index  = req.body.account_index;
    const account_num = req.body.account_num;
    const account_pw = req.body.account_pw;
    const person_id = req.body.person_id;
    
    const params = [account_index,account_num,account_pw, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 주 계좌 정보 조회
app.post('/api/select/main_account_list/ConfirmInformation', (req, res) => {
    const sql =`SELECT * FROM main_account_list WHERE person_id = ?;`;
    
    const person_id = req.body.person_id;
    
    const params = [person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 모든 사용자 정보 불러오기
app.post('/api/select/allPerson_info', (req, res) => {
    const sql = "SELECT * FROM person_info;";

    connection.query(
        sql,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 특정 사용자 정보 불러오기
app.post('/api/select/person_info/where/person_id', (req, res) => {
    const sql = "SELECT * FROM person_info WHERE PERSON_ID = ?";
    
    const person_id = req.body.person_id;
    const params = [person_id];

    connection.query(sql, params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 로그인 한 사용자는 스터디에 가입한 사람인지 판별
// 로그인 한 사용자는 해당 스터디의 리더인지 판별
app.post('/api/isCheckJoinAndLeader',(req,res)=>{
    const sql = `SELECT * FROM study_join WHERE PERSON_ID = ? AND STUDY_ID = ?`;

    const person_id = req.body.person_id;
    const study_id = req.body.study_id;

    const params = [person_id,study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// myPage에서 해당 사용자가 가입한 스터디 불러오기
app.post('/api/myPage/joinStudy', (req, res) => {
    const sql = `SELECT * from studyitem WHERE s_id in (SELECT study_id FROM study_join WHERE person_id = ?) and is_end = ? and is_start = 1`;
    
    const person_id = req.body.person_id;
    const is_end = req.body.is_end;
    
    const params = [person_id, is_end];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// myPage에서 해당 사용자가 가입한 모집중인 스터디 불러오기
app.post('/api/myPage/recruitment_JoinStudy', (req, res) => {
    const sql = `SELECT * from studyitem WHERE s_id in (SELECT study_id FROM study_join WHERE person_id = ?) and is_end = 0 and is_start = 0`;
    const person_id = req.body.person_id;
    
    const params = [person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// myPage에서 해당 사용자가 가입한 모집중인 스터디 모집 완료하기
app.post('/api/myPage/start_Study', (req, res) => {
    const sql = `UPDATE studyitem SET is_start = ? WHERE s_id = ?;`;
    const study_id = req.body.study_id;
    const is_start = req.body.is_start;
    
    const params = [is_start, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 특정 스터디, 특정 사용자에게 할당된 계좌 인덱스
app.post('/api/community/loadAccountIndex', (req, res) => {
    const sql = `SELECT * FROM account_list WHERE study_id = ? AND person_id = ?;`;
    
    const study_id = req.body.study_id;
    const person_id = req.body.person_id;
    
    const params = [study_id,person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 출석체크 최초 출석자인지 확인
app.post('/api/community/isFirstAttend', (req, res) => {
    const sql = `SELECT * FROM attendance_check 
                WHERE study_id = ? AND attendance_start_date IN (SELECT attendance_start_date
                FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?) 
                ORDER BY attendance_start_date DESC, attendance_start_time`;

    const study_id = req.body.study_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );

});

// 출석 여부에 따른 DB 삽입
app.post('/api/community/isAttendStatus', (req, res) => {
    const sql =`INSERT INTO attendance_check VALUES (?, ?, ?, ?, ?, ?, ?, ?);`;
    
    const study_id = req.body.study_id;
    const user_id = req.body.user_id;
    const attendance_start_date = req.body.attendance_start_date;
    const attend_start_time = req.body.attendance_start_time;
    const is_attendance = req.body.is_attendance;
    const valid_attendance_time = req.body.valid_attendance_time;
    const is_first = req.body.is_first;
    const attendance_num_auth = req.body.attendance_num_auth;

    const params = [study_id, user_id, attendance_start_date, attend_start_time, is_attendance, valid_attendance_time, is_first, attendance_num_auth];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});  

// 최초 출석자에 따라 출석 취소 버튼 활성화하기 위한 자신이 최초 출석자인지 확인
app.post('/api/community/isFirstAttendee', (req, res) => {
    const sql = `SELECT * FROM attendance_check 
                    WHERE study_id = ? AND is_first = 1 AND person_id = ? AND attendance_start_date 
                    IN (SELECT attendance_start_date
                    FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?)`;

    const study_id = req.body.study_id;
    const person_id = req.body.person_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, person_id, study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );    
});

// 출석 인증 번호 확인
app.post('/api/community/getAuthNumber', (req, res) => {
    const sql = `SELECT * FROM attendance_check WHERE study_id = ? AND attendance_start_date = ? AND is_first=1;`;

    const study_id = req.body.study_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );    
});

// 자신의 출석 여부에 따라 달라지는 버튼 색
app.post('/api/community/isAttendanceRateBtn', (req, res) => {
    const sql =` SELECT is_attendance FROM attendance_check WHERE study_id = ? AND person_id = ? AND attendance_start_date = ? ;`;
    
    const study_id = req.body.study_id;
    const user_id = req.body.user_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, user_id, attendance_start_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});  

// 스터디 출석 날짜 불러오기
app.post('/api/community/getAttendanceDate', (req, res) => {
    const sql =`SELECT attendance_start_date FROM attendance_check WHERE study_id=? GROUP BY attendance_start_date ORDER BY attendance_start_date desc;`;
    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 출석 하지 않는 사람들 추출
app.post('/api/community/isNotAttend', parser, (req, res) => {
    const sql =` SELECT person_id FROM study_join WHERE study_id = ? AND person_id 
        NOT IN (SELECT person_id FROM attendance_check 
        WHERE study_id = ? AND attendance_start_date IN (SELECT attendance_start_date
        FROM attendance_check WHERE study_id = ? AND attendance_start_date = ?) 
        ORDER BY attendance_start_date DESC, attendance_start_time);`;

    const study_id = req.body.study_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, study_id,study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 지각 거래 발생 유무 확인
app.post('/api/community/tardiness_deal_status', parser, (req, res) => {
    const sql = `SELECT * FROM tardiness_deal_status WHERE study_id = ? AND transaction_date = ?;`;
    const study_id = req.body.study_id;
    const transaction_date = req.body.transaction_date;

    const params = [study_id, transaction_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 거래 내역 진행 여부 저장
app.post('/api/community/inert_status_of_tardiness', parser, (req, res) => {
    const sql = `INSERT INTO tardiness_deal_status VALUES (?,?,?);`;
    const study_id = req.body.study_id;
    const transaction_date = req.body.transaction_date;
    const tardiness_status = req.body.tardiness_status;

    const params = [study_id, transaction_date, tardiness_status];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 자신을 제외한 스터디원
app.post('/api/community/receiver_list', parser, (req, res) => {
    const sql = `SELECT * FROM attendance_check WHERE study_id = ? and is_attendance = 1 AND attendance_start_date = ?;`;
    const study_id = req.body.study_id;
    const attendance_start_date = req.body.attendance_start_date;

    const params = [study_id, attendance_start_date];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 지각 스마트 계약 거래를 진행 할 수 있는 사람인지 확인 - 최초 출석자 
app.post('/api/community/attendanceTradingAuthority', (req, res) => {
    const sql = `SELECT * FROM attendance_check WHERE study_id = ?  AND attendance_start_date = ? AND is_first = 1 AND person_id = ?;`;

    const study_id = req.body.study_id;
    const transaction_date = req.body.transaction_date;
    const person_id = req.body.person_id;

    const params = [study_id, transaction_date, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 오늘 출석한 사람 이름 불러오기
app.post('/api/community/getAttendeeName', (req, res) => {
    const sql = `SELECT person_name FROM person_info WHERE person_id IN (SELECT person_id FROM attendance_check WHERE study_id = ? AND attendance_start_date = ? AND is_attendance = 1);`;
    const study_id = req.body.study_id;
    const quiz_date = req.body.quiz_date;
    
    const params = [study_id, quiz_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 퀴즈 점수 저장
app.post('/api/community/setQuizScore', (req, res) => {
    const sql =`INSERT INTO quiz_score VALUES(?, ?, ?, ?, ?);`;

    const study_id = req.body.study_id;
    const user_name = req.body.userName;
    const quiz_date = req.body.quiz_date;
    const user_score = req.body.user_score;
    const rank = req.body.rank;

    const params = [study_id, user_name, quiz_date, user_score, rank];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// 해당 날짜의 스터디 원의 퀴즈 점수 불러오기
app.post('/api/community/getQuizResult', (req, res) => {
    const sql = `SELECT * FROM quiz_score WHERE study_id=? AND quiz_date=? ORDER BY score DESC;`;
    const study_id = req.body.study_id;
    const quiz_date = req.body.quiz_date;

    const params = [study_id, quiz_date];
    connection.query(sql,params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
}); 

// // 계좌 불러오기
// app.get('/api/selectFromInitAccountList', (req, res) => {
//     const sql =`SELECT * FROM init_account_list where is_use = 0 ORDER BY account_index ASC;`;
    
//     connection.query(sql,
//         (err, rows, fields) => {
//             res.send(rows); 
//         }
//     );
// });

// // 계좌 속성값 변경
// app.post('/api/useInitAccount', (req, res) => {
//     const sql =`UPDATE init_account_list SET is_use = true WHERE account_index = ?;`;

//     const account_index = req.body.account_index;

//     const params = [account_index];
//     connection.query(sql,params, 
//         (err, rows, fields) => {
//             res.send(rows); 
//         }
//     );
// }); 

// 스터디 진행 횟수 구하기
app.post('/api/select/cnt/cnt_total', (req, res) => {
    const sql = `SELECT att_check.study_id, att_check.attendance_start_date, s_item.study_cnt AS cnt_total
    FROM attendance_check AS att_check 
    JOIN studyitem as s_item ON att_check.study_id = s_item.s_id
    WHERE s_item.s_id = ?  GROUP BY att_check.attendance_start_date;`;

    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

//특정 계좌정보와 person_info 테이블 정보 얻어오기
app.post('/api/community/getAccountInfo/personInfo', (req, res) => {
    const sql = `SELECT * FROM account_list AS a_list 
    LEFT JOIN person_info as p_info ON a_list.person_id = p_info.PERSON_ID 
    WHERE a_list.study_id = ? AND a_list.person_id = ?;`;
   
    const study_id = req.body.study_id;
    const person_id = req.body.person_id;

    const params = [study_id, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 해당 스터디에 가입한 특정 계좌정보와 person_info 테이블 정보 모두 얻어오기
app.post('/api/community/getAccountInfo/personInfo/whereStudyJoin', (req, res) => {
    const sql = `SELECT * FROM account_list AS a_list 
    LEFT JOIN person_info as p_info ON a_list.person_id = p_info.PERSON_ID 
    WHERE a_list.study_id = ? AND a_list.person_id in (SELECT person_id FROM study_join WHERE study_id = ?);`;
   
    const study_id = req.body.study_id;

    const params = [study_id, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 오늘이 종료날짜인 스터디항목 추출
app.post('/api/extractStudyOfEndDate', (req, res) => {
    const sql = `SELECT * FROM studyitem WHERE date(end_date)=?;`;
   
    const today = req.body.today;

    const params = [today];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 종료날짜인 스터디에 속한 스터디원의 계좌 정보 추출
app.post('/api/extractAccountOfPerson/inStudyOfEndDate', (req, res) => {
    const sql = `SELECT * FROM account_list WHERE study_id = ? AND person_id = ?;`;
    const study_id = req.body.study_id;
    const person_id = req.body.person_id;
    
    const params = [study_id, person_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 종료날짜인 스터디 종료 여부 설정
app.post('/api/setEndStudy', (req, res) => {
    const sql = `UPDATE studyitem SET is_end = 1 WHERE s_id = ?;`;
    const study_id = req.body.study_id;
    
    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 접속한 스터디가 종료된 스터디인지 확인
app.post('/api/community/isEnd', (req, res) => {
    const sql = `SELECT is_end FROM studyitem WHERE s_id = ?;`;
    const study_id = req.body.study_id;
    
    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 퀴즈
// person_name으로 person_id찾기
app.post('/api/community/find/person_name', (req, res) => {
    const sql = `SELECT * FROM person_info WHERE person_name = ?;`;
    const person_name = req.body.person_name;
    
    const params = [person_name];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 퀴즈
// person_name으로 person_id찾기
app.post('/api/community/find/receiver', (req, res) => {
    const sql = `SELECT * FROM quiz_score WHERE score_rank < (SELECT score_rank FROM quiz_score WHERE person_name = ? AND quiz_date = ? AND study_id = ?)  AND quiz_date = ? AND study_id = ?;`;
    const person_name = req.body.person_name;
    const quiz_date = req.body.quiz_date;
    const study_id = req.body.study_id;
    
    const params = [person_name, quiz_date, study_id, quiz_date, study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// //사용자의 계좌 index 얻어오기
// app.post('/api/community/getAccountId', (req, res) => {
//     const sql = `SELECT * FROM account_list WHERE person_id = ? AND study_id = ?;`;
   
//     const study_id = req.body.study_id;
//     const person_id = req.body.person_id;

//     const params = [person_id, study_id];
//     connection.query(sql, params, 
//         (err, rows, fields) => {
//             res.send(rows); 
//         }
//     );
// });

// 가입 스터디 원 leader값으로 정렬해서 불러오기
app.post('/api/community/getMemberOrderbyLeader', (req, res) => {
    const sql = `SELECT @rownum:=@rownum+1 AS index_num, p_info.person_name, s_join.leader FROM study_join AS s_join 
    JOIN person_info AS p_info ON s_join.person_id = p_info.person_id , (SELECT @rownum:=0) TMP 
    where study_id = ? order by leader desc;`;
   
    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql, params, 
        (err, rows, fields) => {
            res.send(rows); 
        }
    );
});

// 달력에 날짜, 장소 추가
// STUDY 날짜, 장소 삽입
app.post('/api/insert/study_schedule', (req, res) => {
    const sql = `INSERT INTO study_schedule VALUES (?, ?, ?, ?)`;

    const study_id = req.body.study_id;
    const meeting_date = req.body.meeting_date;
    const meeting_time = req.body.meeting_time;
    const meeting_place = req.body.meeting_place;

    const params = [study_id, meeting_date, meeting_time, meeting_place];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 달력에 STUDY 날짜, 장소 삭제
app.post('/api/delete/study_schedule', (req, res) => {
    const sql = `DELETE FROM study_schedule WHERE study_id = ? AND meeting_date = ? AND meeting_time = ?;`;

    const study_id = req.body.study_id;
    const meeting_date = req.body.meeting_date;
    const meeting_time = req.body.meeting_time;

    const params = [study_id, meeting_date, meeting_time];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// STUDY 날짜, 장소 읽기
app.post('/api/select/study_schedule', (req, res) => {
    const sql = `SELECT * FROM study_schedule WHERE study_id = ?`;

    const study_id = req.body.study_id;

    const params = [study_id];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// 특정 날짜 STUDY 일정 읽기
app.post('/api/select/study_schedule/where/day', (req, res) => {
    const sql = `SELECT * FROM study_schedule WHERE study_id = ? AND meeting_date = ?;`;

    const study_id = req.body.study_id;
    const day = req.body.day;

    const params = [study_id, day];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// tnx_hash
app.post('/api/insert/txn', (req, res) => {
    const sql = `INSERT INTO hash_list VALUES (?,?,?);`;
    const idx_hash = req.body.idx_hash;
    const txn_hash = req.body.txn_hash;
    const t_hash = req.body.t_hash;
    const params = [idx_hash, txn_hash, t_hash];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// tnx_hash
app.post('/api/select/txn', (req, res) => {
    const sql = `select * from  hash_list where idx_hash = ?;`;
    const idx_hash = req.body.idx_hash;
    const params = [idx_hash];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

// tnx_hash
app.post('/api/select/txn_hash', (req, res) => {
    const sql = `select * from  hash_list where txn_hash = ?;`;
    const txn_hash = req.body.txn_hash;
    const params = [txn_hash];
    connection.query(sql,params,
        (err, rows, fields) => {
            res.send(rows);
        }
    );
});

app.listen(port, () => console.log(`Listening on port ${port}`));
