import { useState, useEffect } from "react";
import './style.css';

export default function Like() {
    type FileType = 'film' | 'serial' | 'anime' | 'music';

    const [filetype, setFileType] = useState<FileType>('anime');
    const [favAnime, setFavAnime] = useState<any[]>([]);
    const [favMusic, setFavMusic] = useState<any[]>([]);

    const token = localStorage.getItem("token");

    useEffect(() => {
        async function load() {
            const res = await fetch("http://185.237.95.6:5000/api/get_likes", {
                headers: {
                    'Content-Type': 'application/json',
                    "Authorization": `Bearer ${token}`,
                },
                method: "GET"
            });

            const data = await res.json();
            console.log(data);

            setFavAnime(data.anime || []);
            setFavMusic(data.music || []);
        }
        load();
    }, [token]);

    return (
        <div className="like_page">

            <div className="params">
                <button
                    className={filetype === 'anime' ? 'ActiveButton' : 'noActiveButton'}
                    onClick={() => setFileType("anime")}
                ><p>Аниме</p></button>

                <button
                    className={filetype === 'film' ? 'ActiveButton' : 'noActiveButton'}
                    onClick={() => setFileType("film")}
                ><p>Фильм</p></button>

                <button
                    className={filetype === 'serial' ? 'ActiveButton' : 'noActiveButton'}
                    onClick={() => setFileType("serial")}
                ><p>Сериал</p></button>

                <button
                    className={filetype === 'music' ? 'ActiveButton' : 'noActiveButton'}
                    onClick={() => setFileType("music")}
                ><p>Музыка</p></button>
            </div>

            <div className="like_container">
                {filetype === "anime" && (
                    <div className="anime_list">
                        {favAnime.length === 0 ? (
                            <p>У вас нет лайкнутых аниме</p>
                        ) : (
                            favAnime.map((item, index) => (
                                <div key={index} className="anime_card">
                                    <img src={item.image} alt={item.title} />
                                    <p>{item.title}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {filetype === "film" && <div>Фильмы избранное</div>}
                {filetype === "serial" && <div>Сериалы избранное</div>}

                {filetype === "music" && (
                    <div className="anime_list">
                        {favMusic.length === 0 ? (
                            <p>У вас нет любимых песен</p>
                        ) : (
                            favMusic.map((item, index) => (
                                <div key={index} className="anime_card">
                                    <img src={item.image} alt={item.title} />
                                    <p>{item.title} — {item.artist}</p>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}
