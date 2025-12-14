import { useState } from "react";
import Registration from "../../components/Registration";
import Login from "../../components/Login";
import './style.css'
export default function LoginPage() {

    const [activeTab, setActiveTab] = useState<'register' | 'login'>('login');
    return (
        <div className="registartion_page">
            <div className="registration_container">
                {(activeTab == "register") ? (
                    <Registration />
                ) : (
                    <>
                        <Login />
                    </>
                )}
                <div className="registration">
                    <button onClick={() => setActiveTab("login")}>Войти</button>
                    <button onClick={() => setActiveTab("register")}>Зарегистрироваться</button>
                </div>

            </div>
            <div className="tenor-gif-embed" data-postid="25645663" data-share-method="host" data-aspect-ratio="1" data-width="100%"><a href="https://tenor.com/view/hot-dog-gif-25645663">Hot Dog Sticker</a>from <a href="https://tenor.com/search/hot+dog-stickers">Hot Dog Stickers</a></div> <script type="text/javascript" async src="https://tenor.com/embed.js"></script>
        </div>

    )
}