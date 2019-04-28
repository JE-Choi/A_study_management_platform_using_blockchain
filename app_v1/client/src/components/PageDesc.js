import React, { Component } from 'react';
import './PageDesc.css';

class PageDesc extends Component {
    render() {
        return (
            <div className="out_frame">
                <div className="page_desc">
                    <div className="page_header">STUDY CHAIN</div>
                    STUDY CHAIN은 블록체인 기반의 스마트 계약을 이용한 스터디 전용 관리 플랫폼입니다.
                    <br />
                    원하는 스터디에 가입하기 위해서는, 스터디 모집 시에 적힌 코인을 거래소에서 환전하면 가입할 수 있습니다.
                    <br />
                    스터디가 최종 종료 후 다시 그 코인을 돌려받을 수 있습니다.
                    <br />
                    <br />
                    <br />
                    STUDY CHAIN을 통해 모두가 스터디에 전념하여 좋은 성과를 이루기를 바랍니다.
                </div>
            </div>
        );
    }
}

export default PageDesc;