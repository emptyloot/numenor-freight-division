import backGroundMap from '../../assets/bitcraftmapbackground.png';

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
      <div className="absolute top-0 left-0 w-full h-full bg-[#0B2545]/80 backdrop-blur-md"></div>
    </div>
  );
}

export default BackGround;
