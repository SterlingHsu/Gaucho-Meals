export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target.classList.contains("modal")) {
      onClose();
    }
  };

  return (
    <div
      className="modal d-flex align-items-center justify-content-center"
      tabIndex="-1"
      role="dialog"
      style={{ display: "block", backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={handleOutsideClick}
    >
      <div
        className="modal-dialog"
        role="document"
        style={{ maxHeight: "90vh", display: "flex", flexDirection: "column" }}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body" style={{ overflowY: "auto" }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
