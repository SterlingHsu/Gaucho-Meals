import mapacheThisIsFine from "../Static/img/mapachethisisfine.png";
import Navbar from "../Components/Navbar";

export default function ForbiddenPage() {
  return (
    <div className="d-flex flex-column h-100">
      <Navbar />
      <div className="container h-100">
        <div className="d-flex flex-column h-100 justify-content-center align-items-center">
          {" "}
          <img src={mapacheThisIsFine} alt="" width="300"></img>
          <h1 className="fw-bold">403: Forbidden Page</h1>
        </div>
      </div>
    </div>
  );
}
