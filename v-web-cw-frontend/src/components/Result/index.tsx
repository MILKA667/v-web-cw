import './style.css'
import { ResultContext } from '../../contexts/ResultContext'
import { useContext, useState, useRef } from 'react'
import FileTypeContext from '../../contexts/FileTypeContext'
import { useNotification } from '../../contexts/NotificationContext'

function Result() {
    const token = localStorage.getItem("token");
    const {showNotification} = useNotification();
    const { results } = useContext(ResultContext)!
    const { fileType } = useContext(FileTypeContext)!
    const [playingVideoIndex, setPlayingVideoIndex] = useState<number | null>(null)
    const videoRefs = useRef<{ [key: number]: HTMLVideoElement | null }>({})

    const sortedResults = [...results].sort((a, b) => (b.similarity || 0) - (a.similarity || 0))

    function formatTime(seconds: number): string {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    function extractAnimeName(filename: string): string {
        const patterns = [
            /\[.*?\]/g,
            /\(.*?\)/g,
            /\.mp4|\.mkv|\.avi|\.mov/gi,
            /RAW|BD|DVD|WEB-DL/gi,
            /\d+x\d+/g,
            /x264|x265|AAC|FLAC|EAC3/gi,
            /MultiSub|WEB-DL/gi
        ];

        let cleanName = filename;
        patterns.forEach(pattern => {
            cleanName = cleanName.replace(pattern, '');
        });

        cleanName = cleanName.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '').replace(/\s*-\s*/g, ' - ');

        return cleanName || filename;
    }

    const handlePlayVideo = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            setPlayingVideoIndex(index);
            video.style.display = 'block';
            video.play().catch(err => {
                console.error('Ошибка воспроизведения видео:', err);
            });
        }
    }

    async function addLike(title: string, image: string | undefined, anime_id: number | undefined) {
        const res = await fetch(`/api/add_like`, {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            method: "POST",
            body: JSON.stringify({ title, image, anime_id })
        })
        const data = await res.json();
        if (!res.ok) {
            showNotification(`${data.error}`, 'error')
            return
        }
        console.log(data);
    }

    async function addMusicLike(
        filename: string,
        image?: string,
        previewUrl?: string | null,
        artist?: string
    ) {
        const res = await fetch(`/api/add_music_like`, {
            headers: {
                'Content-Type': 'application/json',
                "Authorization": `Bearer ${token}`
            },
            method: "POST",
            body: JSON.stringify({ filename, image, previewUrl, artist })
        })
        const data = await res.json();
        console.log(data);
    }

    if (results.length === 0) {
        return (
            <div className="result_container">
                <p>Результаты поиска</p>
                <div className='result_card result_card_empty'>
                    <p className="empty_message">Нет результатов. Загрузите изображение и начните поиск.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="result_container">
            <p>Результаты поиска</p>
            <div className='results_list'>
                {sortedResults.map((result, index) => {
                    const resultKey = `${index}-${result.filename}-${result.anilist || ''}`;

                    return (
                        <div key={resultKey} className='result_card'>
                            <div className="result_type_badge">
                                {index === 0 ? (
                                    <>
                                        <span className="type_icon">🎯</span>
                                        <span className="type_text">Самый точный</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="type_icon">⭐</span>
                                        <span className="type_text">Результат #{index + 1}</span>
                                    </>
                                )}
                            </div>

                            <div className="result_content">
                                <div className="result_media_section">
                                    {result.image ? (
                                        <div className="result_media_wrapper">
                                            <img
                                                src={result.image}
                                                alt={extractAnimeName(result.filename)}
                                                className="result_media_image"
                                            />
                                            {result.video && (
                                                <button
                                                    className="play_button"
                                                    onClick={() => handlePlayVideo(index)}
                                                    aria-label="Воспроизвести видео"
                                                >
                                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                        <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="result_media_placeholder">
                                            <span className="placeholder_icon">📺</span>
                                        </div>
                                    )}
                                    {result.video && (
                                        <video
                                            ref={(el) => {
                                                videoRefs.current[index] = el;
                                            }}
                                            className={`result_video result_video_${index}`}
                                            controls
                                            style={{ display: playingVideoIndex === index ? 'block' : 'none' }}
                                            onEnded={() => setPlayingVideoIndex(null)}
                                        >
                                            <source src={result.video} type="video/mp4" />
                                            Ваш браузер не поддерживает видео.
                                        </video>
                                    )}
                                </div>

                                <div className="result_info_section">
                                    <div className="result_info_header">
                                        <h3 className="result_name">
                                            {fileType === "music"
                                                ? `${result.filename}${result.artist ? ` — ${result.artist}` : ""}`
                                                : extractAnimeName(result.filename)}
                                        </h3>

                                        {fileType === "anime" && result.anilist && (
                                            <a
                                                href={`https://anilist.co/anime/${result.anilist}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="result_author"
                                            >
                                                AniList #{result.anilist}
                                            </a>
                                        )}

                                        {fileType === "music" && result.previewUrl && (
                                            <a
                                                href={result.previewUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="result_author"
                                            >
                                                Прослушать превью
                                            </a>
                                        )}
                                    </div>

                                    <div className="result_meta_info">
                                        {result.similarity !== undefined && (
                                            <span className="meta_item">
                                                <span className="meta_label">Точность:</span>
                                                <span className="meta_value">{(result.similarity * 100).toFixed(1)}%</span>
                                            </span>
                                        )}
                                        {result.episode !== null && result.episode !== undefined && (
                                            <span className="meta_item">
                                                <span className="meta_label">Эпизод:</span>
                                                <span className="meta_value">{result.episode}</span>
                                            </span>
                                        )}
                                        {result.at !== undefined && (
                                            <span className="meta_item">
                                                <span className="meta_label">Время:</span>
                                                <span className="meta_value">{formatTime(result.at)}</span>
                                            </span>
                                        )}
                                    </div>

                                    <div className="result_feedback_buttons">
                                        {fileType === 'anime' && (
                                            <>
                                                <button className="feedback_button feedback_button_wrong" onClick={() => addLike(extractAnimeName(result.filename), result.image ?? undefined, result.anilist ?? undefined)}>
                                                    Лайк
                                                </button>
                                            </>
                                        )}
                                        {fileType === 'music' && (
                                            <>
                                                <button className="feedback_button feedback_button_wrong" onClick={() => addMusicLike(result.filename, result.image, result.previewUrl, result.artist)}>
                                                    Лайк
                                                </button>
                                            </>
                                        )}
                                        <button className="feedback_button feedback_button_correct">
                                            Поделиться
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export default Result;