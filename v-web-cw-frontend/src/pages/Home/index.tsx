import './style.css'
import FileDropzone from '../../components/FileDropzone'
import Result from '../../components/Result'
import { FileProvider } from '../../contexts/FileContext'
import { FileTypeProvider } from '../../contexts/FileTypeContext'

function Home(){
    return(
        <FileProvider>
        <FileTypeProvider>
        <div className="main_container">
            <div className="drop_zone_container"><FileDropzone /></div>
            <div className="result_container"><Result /></div>
        </div>
        </FileTypeProvider>
        </FileProvider>
    )
}
export default Home