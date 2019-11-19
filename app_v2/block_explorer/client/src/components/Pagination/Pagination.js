import React, { Component } from 'react';
import PaginationJS from "react-js-pagination";

class Pagination extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activePage: 1,
            curr_block: 0
        }
    }

    componentDidMount = () =>{
        this.setState({
            curr_block: this.props.curr_block
        });
    }

    handlePageChange = (pageNumber) => {
        this.setState({activePage: pageNumber});
        this.props.callbackReload(pageNumber);
    }

    render() {
        return (
            <div className="pagination_sub_div">
                <PaginationJS
                    className="pagination_list"
                    activePage={this.state.activePage}
                    itemsCountPerPage={20} // 페이지 당 항목 수
                    totalItemsCount={this.state.curr_block} // 표시하려는 총 항목 수
                    pageRangeDisplayed={7} // 페이지 매김의 페이지 범위
                    onChange={this.handlePageChange}
                />
            </div>
        );
    }
}

export default Pagination;