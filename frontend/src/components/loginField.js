const LoginField = () => { 
    return ( 
        <div className="flex flex-col">
            <div id="username">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" />
            </div>

            <div id="password">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" />
            </div>
        </div>
    )
}

export default LoginField;