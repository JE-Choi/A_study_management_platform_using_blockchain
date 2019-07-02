import React from 'react';
import './StudyItem.css'
import { post } from 'axios';

class StudyItem extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            current_num_people: 0,
            start_date_view:'',
            end_date_view:''
        }
    }

    componentDidMount() {
        this.callCurrentPeopleInfo()
        .then(res => {
            this.setState ({
                current_num_people: res.data.length
            });
            let start_date = new Date(this.props.start_date);
            // let end_date = new Date(this.props.end_date);

            let s_year = String(start_date.getFullYear());
            let s_month = String(start_date.getMonth()+1);
            let s_date = String(start_date.getDate());
            let start_date_view = s_year+'년 '+s_month+'월 '+s_date+'일';

            let end_date = this.props.end_date;
            console.log(end_date);
            let date = end_date.split('-');
            let day = date[2].split('T');
            let date_str = date[0]+'년 '+date[1]+'월 '+day[0]+'일';
            console.log(date_str);

            // let e_year = String(end_date.getFullYear());
            // let e_month = String(end_date.getMonth()+1);
            // let e_date = String(end_date.getDate());
            // let end_date_view = e_year+'년 '+e_month+'월 '+e_date+'일';
            this.setState({
                start_date_view: start_date_view,
                end_date_view: date_str
            });
        }).catch(err => console.log(err));
    }

    // 스터디에 가입한 현재 사람 정보 얻어오는 부분
    callCurrentPeopleInfo = async () => {
        const url = '/api/select/study_join/where/study_id';

        return post(url,  {
            study_id: this.props.index
        });
    }
 
    render() {
        return (
            <li className="item_study" >
                <div className="study_background">
                </div>
                <div className="study_desc">
                    <ul className="study_desc_list"> 
                        <li><span className="study_name">{this.props.study_name} - {this.props.study_type}</span></li>
                        <li>모집 인원 : {this.props.num_people} 명</li>
                        <li>현재 인원 : {this.state.current_num_people} 명</li>
                        <li>종료 날짜 : {this.state.end_date_view}</li>
                        <li>스터디 코인 : {this.props.study_coin} 코인</li>
                        <li>스터디 설명 : {this.props.study_desc}</li>
                    </ul>
                </div>
            </li>
        )
    }
}

export default StudyItem;