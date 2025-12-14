import { useState } from "react";

function Registration(){
    async function register(email: string, password:string, username: string) {
        const res = await fetch("http://185.237.95.6:5000/api/register",{
            headers: {
                'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify({email,password,username})
        })
        const data = await res.json();
        console.log(data);
    }
    
    const [email,setEmail] = useState("")
    const [password,setPassword] = useState("")
    const [username,setUsername] = useState("")
    return (
        <form className="auth-form" onSubmit={e => { e.preventDefault(); register(email, password, username); }}>
            <input 
                className="form-input"
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="Введите ваш email"
                type="email"
                required
            />
            <input 
                className="form-input"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                type="text" 
                placeholder="Ваш никнейм"
                required
            />
            <input 
                className="form-input"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                type="password" 
                placeholder="Придумайте пароль"
                required
            />
            <button className="main-button" type="submit">
                Зарегистрироваться
            </button>
        </form>
    );
}

export default Registration;