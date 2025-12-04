import backGroundMap from '../../assets/bitcraftmapbackground.webp';

/**
@description Uses a blur background and overlay. Give good backdrop for contrast.
@returns {object} (JSX.element) render blurry map and Numenor themed color overlay.
 */
function BackGround() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full z-[-1] bg-cover bg-center"
      style={{ backgroundImage: `url(${backGroundMap})` }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-primary-dark/80 backdrop-blur-md"></div>
    </div>
  );
}

export default BackGround;
