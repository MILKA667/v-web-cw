import { useState } from "react";
import './style.css'
import { useNotification } from "../../contexts/NotificationContext";
const API_URL = import.meta.env.VITE_API_URL;

function Login() {
    const {showNotification} = useNotification();
    async function login(email: string, password: string) {
        const res = await fetch(`${API_URL}:5000/api/login`, {
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
            showNotification('Неверный логин или пароль', 'error')
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