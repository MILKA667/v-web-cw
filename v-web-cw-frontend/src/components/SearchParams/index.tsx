import { useContext, useState } from "react";
import { FileContext } from "../../contexts/FileContext";
import './style.css'
import { ResultContext, type Result } from "../../contexts/ResultContext";
import FileTypeContext from "../../contexts/FileTypeContext";
import { useNotification } from "../../contexts/NotificationContext";


export default function SearchParams() {
    const { showNotification } = useNotification();
    const { file } = useContext(FileContext)!
    const { setResults, clearResults } = useContext(ResultContext)!

    const { fileType, setFileType } = useContext(FileTypeContext)!

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>("");


    function mapAuddToResults(data: any): Result[] {
        if (!data || !data.track) return [];

        const track = data.track;


        const result: Result = {
            filename: track.title || "Неизвестный",
            image: track.images?.coverart,
            video: undefined,
            similarity: undefined,
            episode: null,
            anilist: undefined,
            from: undefined,
            to: undefined,
            duration: undefined,
            artist: track.subtitle || null,
            previewUrl: track.url || undefined
        };

        return [result];
    }

    async function getAniListPoster(anilistId: number): Promise<string | undefined> {
        const response = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                query: `
                    query ($id: Int) {
                        Media(id: $id) {
                            coverImage {
                                extraLarge
                            }
                        }
                    }
                `,
                variables: { id: anilistId }
            })
        });

        const data = await response.json();
        return data?.data?.Media?.coverImage?.extraLarge;
    }




    async function upload_file() {
        if (!file) {
            showNotification('Вы не загрузили файл!', 'error')
            return;
        }

        setIsLoading(true);

        try {
            const formData = new FormData();
            let response: Response;
            let data: any;
            switch (fileType) {
                case "anime":
                    showNotification('Поиск аниме не доступен с российским IP', 'info')
                    formData.append("image", file);
                    response = await fetch("https://api.trace.moe/search", {
                        method: "POST",
                        body: formData
                    });
                    data = await response.json();
                    if (!response.ok) {
                        showNotification(`${data.error}`, 'error')
                        return
                    }

                    console.log(data);

                    if (data.result?.length > 0) {
                        const results: Result[] = await Promise.all(
                            data.result.map(async (item: any) => {
                                const poster = item.anilist
                                    ? await getAniListPoster(item.anilist)
                                    : undefined;

                                return {
                                    filename: item.filename || "Неизвестный файл",
                                    image: poster ?? item.image,
                                    video: item.video,
                                    similarity: item.similarity,
                                    episode: item.episode ?? null,
                                    anilist: item.anilist,
                                    from: item.from,
                                    at: item.at,
                                    to: item.to,
                                    duration: item.duration
                                };
                            })
                        );

                        setResults(results);
                    } else {
                        showNotification('Ничего не найденно :(', 'warning')
                    }
                    break;

                case "film":
                    showNotification('Поиск фильма по кадру в разработке', 'info')
                    break;
                case "serial":
                    showNotification('Поиск сериала по кадру в разработке', 'info')
                    break;
                case "music":
                    formData.append("music", file);
                    console.log(file, file instanceof File);
                    response = await fetch(`/api/search_music`, {
                        method: "POST",
                        body: formData
                    });
                    if (!response.ok) {
                        showNotification(`${data.error}`, 'error')
                        return
                    }


                    data = await response.json();
                    console.log(data);

                    const results = mapAuddToResults(data);
                    if (results.length > 0) {
                        setResults(results);
                    } else {
                        setError("Ничего не найдено");
                    }
                    break;

                default:
                    break;
            }
        } catch (err) {
            showNotification('Ошибка при поиске', 'error')
        } finally {
            setIsLoading(false);
        }
    }







    return (
        <div className='settings_container'>
            <div className="search_content">
                <p>Настройки поиска</p>
                {error && <div style={{ color: 'red', marginBottom: '10px', fontSize: '14px' }}>{error}</div>}
                <div className="button_group">
                    <button
                        className={fileType === 'anime' ? 'ActiveButton' : 'noActiveButton'}
                        onClick={() => { setFileType("anime"), clearResults() }}
                        disabled={isLoading}
                    >
                        <img src="/rei_ayanami.svg" alt="anime" />
                        <p>АНИМЕ</p>
                    </button>
                    <button
                        className={fileType === 'music' ? 'ActiveButton' : 'noActiveButton'}
                        onClick={() => { setFileType("music"), clearResults() }}
                        disabled={isLoading}
                    >
                        <img src="/nirvana.png" alt="music" />
                        <p>МУЗЫКА</p>
                    </button>
                    <button
                        className={fileType === 'film' ? 'ActiveButton' : 'noActiveButton'}
                        onClick={() => { setFileType("film"), clearResults() }}
                        disabled={isLoading}
                    >
                        <img src="/iron_man.png" alt="film" />
                        <p>ФИЛЬМ</p>
                    </button>
                    <button
                        className={fileType === 'serial' ? 'ActiveButton' : 'noActiveButton'}
                        onClick={() => { setFileType("serial"), clearResults() }}
                        disabled={isLoading}
                    >
                        <img src="/walter_weiht.png" alt="serial" />
                        <p>СЕРИАЛ</p>
                    </button>
                </div>
            </div>
            <button
                className="start_button"
                onClick={upload_file}
                disabled={isLoading}
            >
                {isLoading ? "Поиск..." : "Поиск!"}
            </button>
        </div>
    );
}


