import { useState } from "react";
import './style.css'

function Login() {
    async function login(email: string, password: string) {
        const res = await fetch("http://185.237.95.6:5000/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (data.token) {
            localStorage.setItem("token", data.token);
            localStorage.setItem("nickname", data.username)
            window.location.href = "/";
        } else {
            alert("Неверный логин или пароль");
        }
    }

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <form className="auth-form" onSubmit={(e) => {
            e.preventDefault();
            login(email, password);
        }}>
            <input
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите ваш email"
                type="email"
                required
            />
            <input
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                type="password"
                placeholder="Введите ваш пароль"
                required
            />
            <button className="main-button" type="submit">
                Войти
            </button>
        </form>
    );
}

export default Login;