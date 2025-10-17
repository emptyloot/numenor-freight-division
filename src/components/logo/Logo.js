import logoImage from '../../assets/Flag_of_Numenor.webp'
import './logo.css'
function Logo() {
    return (
        <div>
            <img className='logo-image' src={logoImage} alt="Numenor Frieght Division Logo" />
        </div>
    )
}

export default Logo;