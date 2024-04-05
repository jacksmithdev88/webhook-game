import React, { useContext, useState } from 'react';
import { UserContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => { 
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState(false);

    const submitLogin = () => {
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        
        fetch('http://localhost:3000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })
        .then(response => response.json())
        .then(data => {
            setUser({ token: data.token, username: data.username, id: data.id });
            console.log(data);
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify({ token: data.token, id: data.id, username: data.username }));
            }
            navigate('/home');
        })
    };

    return (
        <div className="flex flex-col justify-center text-text text-xl items-center h-screen">
            <h1 className="text-2xl font-bold m-5">LOGIN</h1>

            <div className="flex flex-col">
                <div className='mb-4'>
                    <label htmlFor="username" hidden="true">Username</label>
                    <input type="text" className="bg-button-main text-text placeholder-text" id="username" name="username" placeholder="Username" />
                </div>

                <div className='mb-4'>
                    <label htmlFor="password" hidden="true">Password</label>
                    <input type="password" className="bg-button-main text-text placeholder-text" id="username" id="password" placeholder="Password" name="password" />
                </div>

                <div>
                    <label htmlFor="rememberMe" className="mr-4">Remember Me:</label>
                    <input type="checkbox" className="w-4 h-4 checked:" id="rememberMe" name="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                </div>
            </div>
            
            <button onClick={submitLogin} >Login</button>
        </div>
    );
}

export default LoginPage;