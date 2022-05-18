import React from "react";
import test from "../../core/test/test-unit";

const styles = {
    center: {
        textAlign: "center"
    }
};

class Home extends React.Component {
    state = {
        history: []
    };

    componentDidMount() {
        test().then(results => {
            this.setState({
                history: results
            });
        });
    }

    render() {
        const {history} = this.state;
        return (
            <div style={styles.center}>
                {
                    history.map(i => {
                        return <p>{typeof i === "string" ? i : JSON.stringify(i)}</p>;
                    })
                }
            </div>
        );
    }
}

export default Home;