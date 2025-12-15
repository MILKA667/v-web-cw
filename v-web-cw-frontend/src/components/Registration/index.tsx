import { useState } from "react";
import { useNotification } from "../../contexts/NotificationContext";

function Registration() {
    const { showNotification } = useNotification();

    async function register(email: string, password: string, username: string) {
        const res = await fetch(`/api/register`, {
            headers: {
                'Content-Type': 'application/json',
            },
            method: "POST",
            body: JSON.stringify({ email, password, username })
        })
        const data = await res.json();
        if (!res.ok) {
            showNotification(`${data.error}`, 'error')
            return
        }
        console.log(data);
        showNotification('Регистрация успешна!', 'success')
    }

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [username, setUsername] = useState("")
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