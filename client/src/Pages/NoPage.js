import mapacheNotFound from "../Static/img/mapachenotfound.png";

export default function NoPage() {
  return (
    <div className="container h-100">
      <div className="d-flex flex-column h-100 justify-content-center align-items-center">
        {" "}
        <img src={mapacheNotFound} alt="" width="300"></img>
        <h1 className="fw-bold">404: Page not found</h1>
      </div>
    </div>
  );
}
