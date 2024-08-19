import mapacheThisIsFine from "../Static/img/mapachethisisfine.png"

export default function ForbiddenPage() {
  return (
    <div className="container h-100">
      <div className="d-flex flex-column h-100 justify-content-center align-items-center">
        {" "}
        <img src={mapacheThisIsFine} alt="" width="300"></img>
        <h1 className="fw-bold">403: Forbidden Page</h1>
      </div>
    </div>
  );
}
