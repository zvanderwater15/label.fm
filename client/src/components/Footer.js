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
          <a href="https://www.linkedin.com/in/zoe-vanderwater/" target="_blank" rel="noreferrer"><i class="ai-linkedin-box-fill"></i></a>
          <a href="https://github.com/zvanderwater15" target="_blank" rel="noreferrer"><i class="ai-github-fill"></i></a>
          <a href="https://twitter.com/dualbrainedbear" target="_blank" rel="noreferrer"><i class="ai-twitter-fill"></i></a>
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
