import React from "react";
import {connect} from "react-redux";
import testUnit from "../../core/test/basic-test-unit";

class Home extends React.Component {
    state = {
        history: []
    };

    componentDidMount() {
        this.props.dispatch(
            (dispatch, getState) => {
                testUnit().then(res => {
                    dispatch({
                        type: "SET_RESULT",
                        payload: res
                    });
                });
            }
        );
    }

    render() {
        const {
            basic
        } = this.props;

        const {
            baseURL,
            result = {}
        } = basic;

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div>基础测试</div>
                        <div>{baseURL}</div>
                    </div>
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <td>
                                <th>地址</th>
                            </td>
                            <td>
                                <th>返回結果</th>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        {
                            Object.keys(result).map(i => {
                                return <tr>
                                    <td>
                                        {i}
                                    </td>
                                    <td>
                                        {result[i]}
                                    </td>
                                </tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return state;
})(Home);