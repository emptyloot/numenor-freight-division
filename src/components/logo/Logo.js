import logoImage from '../../assets/Flag_of_Numenor.webp';
/**
@description logo container with image of numenor tree flag. provide accessibility
@returns {object} (JSX.element) render of numenor flag tree image.
 */
function Logo() {
  return (
    <div>
      <img className="w-auto h-full blox max-h-[150px]" src={logoImage} alt="Numenor Freight Division Logo" />
    </div>
  );
}
export default Logo;
