import React from "react";
import PropTypes from "prop-types";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function Toast({ status, message, setToast }) {
  return (
    <div className="toast-container">
      <div className={`toast ${status ? "green" : "red"}`}>
        <span>{message}</span>
        <button className="appearance-none" onClick={() => setToast(null)}>
          <FontAwesomeIcon icon={faXmark} />
        </button>
      </div>
    </div>
  );
}

Toast.propTypes = {
  status: PropTypes.bool.isRequired,
  message: PropTypes.string.isRequired,
  setToast: PropTypes.func.isRequired,
};

export default Toast;
