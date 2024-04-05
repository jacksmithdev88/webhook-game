import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../context/UserContext';
const RegisterPage = () => {
    const { setUser } = useContext(UserContext);
    const navigate = useNavigate();
    const [rememberMe, setRememberMe] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const submitRegister = () => {
        
        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let retypePassword = document.getElementById("retypePassword").value;


        if (!username || !password || !retypePassword) {
            setErrorMessage("Missing fields!");
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }
    
        if (password !== retypePassword) {
            setErrorMessage("Passwords do not match!");
            setTimeout(() => setErrorMessage(''), 2000);
            return;
        }
        
        fetch('http://localhost:3000/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username: username, password: password}),
        })
        .then(response => {
            if(response.status === 400) {
                setErrorMessage("User already exists!");
                setTimeout(() => setErrorMessage(''), 2000);
                throw new Error("User already exists");
            }
            return response.json();
        })
        .then(data => {
            setUser({ token: data.token, username: data.username, id: data.id });
            console.log(data);
            if (rememberMe) {
                localStorage.setItem('user', JSON.stringify({ token: data.token, id: data.id, username: data.username }));
            }
        })
        .catch(error => {
            console.error(error);
        });
    }

    return ( 
        <div>
       
            <div className="flex flex-col justify-center text-text text-xl items-center h-screen">
                <h1 className="text-2xl font-bold m-5">REGISTER</h1>

                <div className="flex flex-col">
                    <div className='mb-4'>
                        <label htmlFor="username" hidden="true">Username</label>
                        <input type="text" className="bg-button-main text-text placeholder-text" id="username" name="username" placeholder="Username" />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor="password" hidden="true">Password</label>
                        <input type="password" className="bg-button-main text-text placeholder-text" id="password" placeholder="Password" name="password" />
                    </div>

                    <div className='mb-4'>
                        <label htmlFor="retypePassword" hidden="true">Retype Password</label>
                        <input type="password" className="bg-button-main text-text placeholder-text" id="retypePassword" placeholder="Retype Password" name="retypePassword" />
                    </div>

                    <div>
                        <label htmlFor="rememberMe" className="mr-4">Remember Me:</label>
                        <input type="checkbox" className="w-4 h-4 checked:" id="rememberMe" name="rememberMe" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} />
                    </div>
                </div>
                
                <button onClick={submitRegister} >Login</button>
         
                <div id="errors">{errorMessage}</div>
            </div>

    </div>
    )
};

export default RegisterPage;