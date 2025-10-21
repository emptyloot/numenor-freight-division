import backgroundmap from '../../assets/bitcraftmapbackground.png';

function Background() {
  return (
    <div
      className="fixed top-0 left-0 w-full h-full z-[-1] bg-cover bg-center"
      style={{ backgroundImage: `url(${backgroundmap})` }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-[#0B2545]/80 backdrop-blur-md"></div>
    </div>
  );
}

export default Background;
