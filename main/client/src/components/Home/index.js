import React from "react";
import {connect} from "react-redux";
import testUnit from "../../core/test/basic-test-unit";
import testUnit2 from "../../core/test/auth-test-unit";

function genRandom(min, max) {
    return (Math.random() * (max - min + 1) | 0) + min;
}

function renderChannel(channel) {
    if (channel.length <= 0) {
        return <div style={{textAlign: 'center'}}>
            <div style={{fontSize: '24px'}}>
                <span className="glyphicon glyphicon-inbox" aria-hidden="true"/>
            </div>
            <div>
                <p>空测试用例</p>
            </div>
        </div>
    }
    return channel.map(i => {
        let text = '';
        let cls = '';
        if (i.status === 'pending') {
            text = '挂起';
            cls = 'list-group-item-info';
        } else if (i.status === 'error') {
            text = i.error;
            cls = 'list-group-item-danger';
        } else {
            text = i.marker;
            cls = 'list-group-item list-group-item-success';
        }
        return <li className={['list-group-item', cls].join(' ')}>{text}</li>
    })
}

function connectChannelItem(channel, channelName, item, dispatch) {
    setTimeout(() => {
        testUnit2(channel, item.id, (status) => {
            dispatch({
                status
            });
        }).then((res) => {
            if (res.error) {
                dispatch({
                    type: "COMMIT_CHANNEL_ITEM",
                    id: item.id,
                    marker: item.id,
                    error: res.error + " " + item.id,
                    channel: channelName,
                    status: "error"
                });
            } else {
                dispatch({
                    type: "COMMIT_CHANNEL_ITEM",
                    id: item.id,
                    marker: res.message,
                    channel: channelName,
                    error: null,
                    status: "success"
                });
            }
        })
    }, genRandom(1000, 10000));
}

function connectChannel(arr, channel, channelName, dispatch) {
    arr.forEach(i => {
        connectChannelItem(channel, channelName, i, dispatch);
    });
}

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

    testAuth = () => {
        this.props.dispatch((dispatch, getState) => {
            dispatch({
                type: "CLEAR"
            });
            const {
                auth
            } = getState();
            const {results} = auth;
            const {
                channel1_1 = [],
                channel1_2 = [],
                channel2_1 = [],
                channel2_2 = []
            } = results;

            connectChannel(channel1_1, "channel1", "channel1_1", dispatch);
            connectChannel(channel1_2, "channel2", "channel1_2", dispatch);
            connectChannel(channel2_1, "channel1", "channel2_1", dispatch);
            connectChannel(channel2_2, "channel2", "channel2_2", dispatch);
        });
    }

    render() {
        const {
            basic,
            auth
        } = this.props;

        const {results} = auth;
        const {
            channel1_1 = [],
            channel1_2 = [],
            channel2_1 = [],
            channel2_2 = []
        } = results;

        return (
            <div>
                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div>基础测试</div>
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
                            Object.keys(basic.result).map(i => {
                                return <tr>
                                    <td>
                                        {i}
                                    </td>
                                    <td>
                                        {basic.result[i]}
                                    </td>
                                </tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>

                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div>Auth Plugin</div>
                    </div>

                    <button type="button" className="btn btn-primary" onClick={this.testAuth}>并发测试</button>
                    
                    <table className="table table-striped">
                        <thead>
                        <tr>
                            <td>
                                <th>access_token</th>
                            </td>
                            <td>
                                <th>refresh_token</th>
                            </td>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                <th>{auth.access_token}</th>
                            </td>
                            <td>
                                <th>{auth.refresh_token}</th>
                            </td>
                        </tr>
                        </tbody>
                    </table>

                    <div className="row">
                        <div className="col-xs-6">
                            <ul className="list-group">
                                {renderChannel(channel1_1)}
                            </ul>
                        </div>
                        <div className="col-xs-6">
                            <ul className="list-group">
                                {renderChannel(channel2_1)}
                            </ul>
                        </div>
                    </div>

                    <div className="row">
                        <div className="col-xs-6">
                            <ul className="list-group">
                                {renderChannel(channel1_2)}
                            </ul>
                        </div>
                        <div className="col-xs-6">
                            <ul className="list-group">
                                {renderChannel(channel2_2)}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect((state) => {
    return state;
})(Home);