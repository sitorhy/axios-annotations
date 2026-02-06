import './App.css'
import BaseInfo from "./components/BaseInfo.tsx";
import AuthInfo from "./components/AuthInfo.tsx";

const style = {
    padding: '10px'
}

function App() {
    return (
        <div style={style}>
            <BaseInfo/>
            <br/>
            <AuthInfo/>
        </div>
    )
}

export default App
