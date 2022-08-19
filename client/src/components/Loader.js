import BarLoader from "react-spinners/BarLoader";

const override = {
    display: "block",
    margin: "1em auto",
  };
  
function Loader() {
    return <BarLoader color={"#ff6b00"} cssOverride={override} loading={true} size={250} />
}

export default Loader