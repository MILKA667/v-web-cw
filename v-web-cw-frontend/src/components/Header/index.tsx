import './style.css'
import { useNavigate } from "react-router-dom";
function Header() {
  const navigate = useNavigate();
  const nickname = localStorage.getItem("nickname")
  return (
    <header className="header">
      <div className='left_side' onClick={()=>navigate("/")}>
        <img src='/Ellipse_1.png' alt="Eclipse" className='logo_icon' />
        <p className='title'>MediaHunter</p>
      </div>
      <div className='right_side' onClick={()=>navigate("/likes")}>
        <p className='nickname'>{nickname}</p>
        <img src='/profile.svg' alt="Profile" className='profile_icon' />
      </div>
    </header>
  );
}

export default Header;
