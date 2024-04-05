import { useState } from 'react';
import { useNavigate } from "react-router-dom";

const HomePage = () => {
    const [fill, setFill] = useState(false); // Add a state variable for the fill
    const navigate = useNavigate();

    const login = () => {
        setFill(true); // Set the fill to true when the login button is clicked
        navigate("/login");
    };

    const register = () => {
        setFill(true); // Set the fill to true when the register button is clicked
        navigate("/register");
    }

    return ( 
        <div className="flex flex-col justify-center text-text text-xl items-center h-screen">
            <div>

                <div id="filling-glass" className={fill ? "fill" : ""}>
                    {/* Add the beer glass here */}
                </div>

                <div id="intro-section">
                    <h1 className="text-2xl font-bold m-5">WELCOME!</h1>
                    
                    <p className="m-5">To play you must have an account!</p>

                    <p className="m-5">Log In or Register below.</p>
                    
                </div>
            </div>

            <div>
                <div id="buttons" className="flex flex-row m-auto justify-center text-center flex-1 w-full">
                    <button id="login" className="mx-5 font-bold bg-button-main text-button-text" onClick={login}>LOGIN</button>
                    <button id="register" className="mx-5 font-bold bg-button-secondary text-button-text" onClick={register}>REGISTER</button>
                </div>
            </div>
        </div>
    )
};

export default HomePage;