
function ProducerList() {
    return (
      <div>
          <ol>
              <Producer/>
          </ol>
      </div>
    );
  }
  
  function Producer() {
    return (
      <li>
          <p>Producer</p>
      </li>
    );
  }

  export default ProducerList;
  