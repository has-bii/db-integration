import React, { useState } from "react";
import Modal from "./Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleExclamation } from "@fortawesome/free-solid-svg-icons";

export default function ErrorTables() {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <Modal show={showModal} setShow={setShowModal} header="Error Logs">
        <div></div>
        <div>
          <button className="btn gray" onClick={() => setShowModal(false)}>
            Close
          </button>
        </div>
      </Modal>
      <button
        className="inline-flex gap-2 items-center"
        onClick={() => setShowModal(true)}
      >
        <FontAwesomeIcon icon={faCircleExclamation} size="xl" />
        <span className="hidden md:block">Logs</span>
      </button>
    </>
  );
}
