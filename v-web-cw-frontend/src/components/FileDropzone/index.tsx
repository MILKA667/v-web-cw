import './style.css'
import { FileContext } from '../../contexts/FileContext'
import { useState, useEffect, useContext } from 'react'
import SearchParams from '../SearchParams'
import FileTypeContext from '../../contexts/FileTypeContext'
import AudioRecorder from './AudioRecorder'

function FileDropzone() {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const { file, setFile, clearFile } = useContext(FileContext)!
    const { fileType } = useContext(FileTypeContext)!

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0])
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
        }
    }

    useEffect(() => {
        if (!file) {
            setPreviewUrl(null)
            return
        }

        const url = URL.createObjectURL(file)
        setPreviewUrl(url)

        return () => URL.revokeObjectURL(url)
    }, [file])

    return (
        <div className="drop_zone_container">
            <div className='content'>
                <div
                    className={`drop_zone ${isDragging ? 'dragging' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById('input_file')?.click()}
                >
                    {previewUrl ? (
                        fileType === 'music' ? (
                            <div>
                                <audio controls src={previewUrl} />
                                <p>{file?.name}</p>
                            </div>
                        ) : (
                            <img
                                src={previewUrl}
                                alt="Preview"
                                style={{
                                    width: '700px',
                                    height: '300px',
                                    objectFit: 'contain',
                                }}
                            />
                        )
                    ) : (
                        <>
                            <img src='/upload_icon.svg' alt="Upload Icon" />
                            <p>Нажмите или перетащите для загрузки файла</p>
                            {fileType === 'music' && (
                                <div
                                    className='audio_record'
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <AudioRecorder
                                        onRecordingComplete={(audioFile) => setFile(audioFile)}
                                        maxDuration={10}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    <input
                        type='file'
                        accept={fileType === 'music' ? 'audio/*' : '.png'}
                        id='input_file'
                        style={{ display: 'none' }}
                        onChange={handleFileSelect}
                    />
                </div>
                <button onClick={() => clearFile()}>Очистить</button>
            </div>

            <SearchParams />
        </div>
    )
}

export default FileDropzone
