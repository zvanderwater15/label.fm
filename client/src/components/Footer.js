import "./Footer.css";

function Footer() {
  return (
    <div>
      <hr className="Footer-line" />
      <div className="Footer-content">
        <div className="Footer-author">
          <p>by Zoe vanderWater</p>
        </div>
        <div className="Footer-socials">
          <span>O</span>
          <span>O</span>
          <span>O</span>
        </div>
        <div className="Footer-credits">
          <p>Credits</p> 
          <p>Last.fm for user and album data.</p>
          <p>Musicbrainz for record label data.</p>
        </div>
      </div>
    </div>
  );
}
export default Footer;
