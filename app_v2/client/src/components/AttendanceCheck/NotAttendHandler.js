import { post } from 'axios';

const NotAttendHandler = {
    notAttendInfo: null,
    
    run : async function(_studyId, attendance_date, attendance_view, valid_attendance_time){
        NotAttendHandler.notAttendInfo = null;
        return new Promise(function (resolve, reject) {
            NotAttendHandler.callisNotAttendInfo(_studyId).then((res_personId)=>{
                console.log('미출석자: ',res_personId.data);
                NotAttendHandler.notAttendInfo = res_personId.data;
                if(res_personId.data.length > 0){
                    NotAttendHandler.isNotAttendStatus(_studyId, res_personId.data, attendance_date, attendance_view, 0, valid_attendance_time).then((is_end)=>{
                        if(is_end === true){
                            resolve(true);
                        }
                    });
                } else {
                    resolve(false);
                }
            });
        });
    },

    // 지각자 정보 가져오는 쿼리 = 출석 하지 않는 사람들 추출
    callisNotAttendInfo : async function(_studyId){
        const url = '/api/community/isNotAttend';
        
        const enter_date =  new Date();
        const s_year = enter_date.getFullYear();
        const s_month = enter_date.getMonth()+1;
        const s_date = enter_date.getDate();
        
        const attendance_start_date = s_year + '-'+s_month+ '-'+s_date;
        console.log(attendance_start_date);
        return post(url,  {
            study_id: _studyId,
            attendance_start_date: attendance_start_date
        });
    },

    // 지각자 DB에 넣는 쿼리
    isNotAttendStatus : async function(_studyId, personIdData, _attendance_date, _attendance_view, is_attendance,valid_attendance_time){
        const url = '/api/community/isAttendStatus';
        return new Promise(function (resolve, reject) {
            for(let i = 0; i < personIdData.length; i++){
                let personId = personIdData[i].person_id;
                post(url, {
                    study_id: _studyId,
                    user_id: personId,
                    attendance_start_date: _attendance_date,
                    attendance_start_time: _attendance_view,
                    is_attendance: is_attendance,
                    valid_attendance_time: valid_attendance_time,
                    is_first : false
                }); 
                if(i === personIdData.length-1){
                    resolve(true);
                }
            }
        });
    }
};
  
export default NotAttendHandler;