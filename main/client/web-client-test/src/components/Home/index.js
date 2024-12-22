import React from "react";
import {connect} from "react-redux";
import testUnit from "../../test/basic-test-unit";
import testUnit2 from "../../test/auth-test-unit";

import {authorizer} from "../../test/auth-config";
import OAuth2Service from "../../test/oauth2-service";
import AuthTestService from "../../test/auth-service";
import HeavyTaskService, {testAbortController, AbortManager} from "../../test/heavy-service";
import axios from "axios";

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

function connectChannelItem(channel, channelName, item, dispatch, authTestService) {
    setTimeout(() => {
        testUnit2(channel, item.id, authTestService).then((res) => {
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
    }, genRandom(1000, 20000));
}

function connectChannel(arr, channel, channelName, dispatch, authTestService) {
    arr.forEach(i => {
        connectChannelItem(channel, channelName, i, dispatch, authTestService);
    });
}

class Home extends React.Component {
    state = {
        history: []
    };

    oauth2Service = new OAuth2Service();
    authTestService = new AuthTestService();

    componentDidMount() {

        authorizer.sessionRefreshCallback = (session) => {
            this.props.dispatch({
                type: "SET_ACCESS_TOKEN",
                access_tokens: [session.access_token]
            });
            this.props.dispatch({
                type: "SET_REFRESH_TOKEN",
                refresh_tokens: [session.refresh_token]
            });
        };

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

    reLoginChanged = (e) => {
        authorizer.reLoginAuto = e.target.checked;
    };

    testAuthOnce = () => {
        const {
            auth
        } = this.props;

        const {
            access_tokens,
            refresh_tokens
        } = auth;

        if (!access_tokens.length || !refresh_tokens.length) {
            this.oauth2Service.token().then(res => {
                const session = res.data;
                this.props.dispatch({
                    type: "SET_ACCESS_TOKEN",
                    access_tokens: [session.access_token]
                });
                this.props.dispatch({
                    type: "SET_REFRESH_TOKEN",
                    refresh_tokens: [session.refresh_token]
                });
                authorizer.storageSession(session).then(() => {

                });
            }).catch(e => {
                console.log(e);
            });
        } else {
            this.authTestService.channel1(new Date().toLocaleTimeString()).then(({data}) => {
                console.log(data);
            }).catch(e => {
                console.log(e);
            });
        }
    };

    testAuth = () => {
        const {
            auth
        } = this.props;

        const {
            access_tokens,
            refresh_tokens
        } = auth;

        if (!access_tokens.length || !refresh_tokens.length) {
            this.oauth2Service.token().then(res => {
                const session = res.data;
                this.props.dispatch({
                    type: "SET_ACCESS_TOKEN",
                    access_tokens: [session.access_token]
                });
                this.props.dispatch({
                    type: "SET_REFRESH_TOKEN",
                    refresh_tokens: [session.refresh_token]
                });
                authorizer.storageSession(session).then(() => {
                    this.testAuth();
                });
            }).catch(e => {
                console.log(e);
            });
        } else {
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

                connectChannel(channel1_1, "channel1", "channel1_1", dispatch, this.authTestService);
                connectChannel(channel1_2, "channel2", "channel1_2", dispatch, this.authTestService);
                connectChannel(channel2_1, "channel1", "channel2_1", dispatch, this.authTestService);
                connectChannel(channel2_2, "channel2", "channel2_2", dispatch, this.authTestService);
            });
        }
    }

    heavyTask() {
        new HeavyTaskService().getTimeByAnnotation().then(data => {
            alert(data.data);
        });
    }

    // 静态注入： AbortController只能用一次
    staticHeavyAbort() {
        testAbortController.signal.onabort = function (e) {
            console.log(e);
            console.log("static controller aborted");
        };
        new HeavyTaskService().getTimeByAnnotation().then(data => {
            alert(data.data);
        }).catch(e => {
            console.log('isCancel = ' + axios.isCancel(e));
            // {aborted: true, reason: '3s后中断测试', onabort: null}
            console.log(testAbortController.signal);
            alert(testAbortController.signal.reason);
        });
        setTimeout(() => {
            testAbortController.abort("3s后中断测试");
        }, 3000);
    }

    dynamicHeavyAbort() {
        new HeavyTaskService().getTimeByFunction().then(data => {
            alert(data.data);
        }).catch(e => {
            console.log('isCancel = ' + axios.isCancel(e));
            alert(AbortManager.get().signal.reason);
        });
        setTimeout(() => {
            AbortManager.get().abort("4s后中断测试");
        }, 4000);
    }

    cancelTokenAbort() {
        new HeavyTaskService().cancelTokenTest().then(data => {
            alert(data.data);
        }).catch(e => {
            console.log('isCancel = ' + axios.isCancel(e));
            console.log(AbortManager.getCancelToken());
            alert(AbortManager.getCancelToken().signal.reason);
        });
        setTimeout(() => {
            AbortManager.getCancelToken().abort("2s后中断测试");
        }, 2000);
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
                                        {
                                            basic.result[i].indexOf('data:image') >= 0 ?
                                                <img src={basic.result[i]} alt={'图片'}/> :
                                                <div>{basic.result[i]}></div>
                                        }
                                    </td>
                                </tr>
                            })
                        }
                        </tbody>
                    </table>
                </div>

                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div>中断测试</div>
                    </div>
                    <div className="btn-group" role="group" aria-label="...">
                        <button type="button" className="btn btn-primary" onClick={this.heavyTask}>正常发送
                        </button>
                        <button type="button" className="btn btn-primary" onClick={this.staticHeavyAbort}>静态注入
                        </button>
                        <button type="button" className="btn btn-primary" onClick={this.dynamicHeavyAbort}>动态注入
                        </button>
                        <button type="button" className="btn btn-primary" onClick={this.cancelTokenAbort}>CancelToken兼容
                        </button>
                    </div>
                </div>

                <div className="panel panel-default">
                    <div className="panel-heading">
                        <div>Auth Plugin</div>
                    </div>
                    <div className="btn-group" role="group" aria-label="...">
                        <button type="button" className="btn btn-primary" onClick={this.testAuth}>并发测试</button>
                        <button type="button" className="btn btn-primary" onClick={this.testAuthOnce}>单步测试</button>
                    </div>
                    <div className="checkbox">
                        <label>
                            <input type="checkbox" onChange={this.reLoginChanged}/> refresh_token 过期自动登录
                        </label>
                    </div>
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
                        {
                            auth.access_tokens.map((i, j) => {
                                return <tr>
                                    <td>
                                        <th>{auth.access_tokens[j]}</th>
                                    </td>
                                    <td>
                                        <th>{auth.refresh_tokens[j]}</th>
                                    </td>
                                </tr>
                            })
                        }
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
