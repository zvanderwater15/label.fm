import "./Footer.css";

function Footer() {
  return (
    <div className="Footer">
      <hr className="Footer-line" />
      <div className="Footer-content">
        <div className="Footer-author">
          <p>by Zoe vanderWater</p>
        </div>
        <div className="Footer-socials">
          <a href="https://www.linkedin.com/in/zoe-vanderwater/" target="_blank" rel="noreferrer"><i className="ai-linkedin-box-fill"></i></a>
          <a href="https://github.com/zvanderwater15" target="_blank" rel="noreferrer"><i className="ai-github-fill"></i></a>
          <a href="https://twitter.com/dualbrainedbear" target="_blank" rel="noreferrer"><i className="ai-twitter-fill"></i></a>
        </div>
        <div className="Footer-credits">
          <p>Credits</p> 
          <p>User data - <a href="https://www.last.fm/" target="_blank" rel="noreferrer">Last.fm</a></p>
          <p>Record label data - <a href="https://musicbrainz.org/" target="_blank" rel="noreferrer">Musicbrainz</a></p>
        </div>
      </div>
    </div>
  );
}
export default Footer;
