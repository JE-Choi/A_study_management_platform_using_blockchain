import React, { Component } from 'react';
import './PageDesc.css';

class PageDesc extends Component {
    render() {
        return (
            <div className="out_frame">
                <div className="page_desc">
                    <div className="page_header">[ STUDY CHAIN ]</div>
                    <span className="emphasis_page_desc_header">STUDY CHAIN </span>은 블록체인 기반의 스마트 계약을 이용한 
                    <span className="emphasis_page_desc"> 스터디 전용 관리 플랫폼</span>입니다.
                    <br />
                    <span className="emphasis_page_desc_smart">
                        <span className="desc_smart_contract">스마트 계약</span>
                        이란 조건이 충족되면 계약을 이행되는 
                        <span className="desc_smart_contract_2">'자동화 계약' 시스템</span>입니다.
                    </span>
                    <br/>
                    <br/>
                    출석 체크 및 퀴즈 결과에 따라 자동으로 거래가 이루어집니다.
                    <br/><br/>
                    <div className="emphasis_contract_desc_div">
                        <span className="emphasis_page_contract_desc_title">- 출석 체크 </span>
                        <span className="colon"> : </span>  
                        <span className="emphasis_page_contract_desc">미출석자는 자신을 제외한 스터디 원들에게 코인을 자동 지불하게 됩니다.</span>
                        <br/>
                        <span className="emphasis_page_contract_desc_title">- 퀴즈 결과 </span>
                        <span className="colon"> : </span>   
                        <span className="emphasis_page_contract_desc">퀴즈 점수로 순위를 매긴 후, 자신을 제외한 스터디 원들에게 벌금으로 코인을 자동 지불하게 됩니다. </span>
                        <br/>
                        <span className="emphasis_page_contract_desc_title">- 스터디 최종 종료 </span>
                        <span className="colon"> : </span>   
                        <span className="emphasis_page_contract_desc">미리 정해진 <span className="emphasis_midnight">최종 종료 날짜의 자정</span>에 각 스터디 원들에게 코인이 반환됩니다. </span>
                    </div>
                    <br />
                    원하는 스터디에 가입하기 위해서는, 
                    <br />스터디 모집 시에 적힌 <span className="emphasis_page_desc">코인을 스터디에 가입할 때 자동으로 환전됩니다.</span>
                    <br /><br />
                    스터디가 <span className="emphasis_page_desc">최종 종료</span>된 후, 
                    <span className="emphasis_page_desc">다시 그 코인을 돌려받을 수 있습니다.</span>
                    <br /><br />
                    <span className="emphasis_page_desc_cheer">STUDY CHAIN을 통해 모두가 스터디에 전념하여 좋은 성과를 이루기를 바랍니다.</span>
                </div>
            </div>
        );
    }
}

export default PageDesc;