import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleExclamation,
  faDatabase,
  faDungeon,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

export default function Navbar() {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const location = useLocation();
  const navigate = useNavigate();

  const logoutHandler = () => {
    removeCookie("access_token");
    navigate("/login");
  };

  return (
    <div className="bg-white drop-shadow-xl">
      <div className=" flex justify-center text-2xl font-extrabold border-b py-4 text-gray-700">
        BACKUP DB
      </div>
      <ul className="flex flex-row gap-8 justify-center py-4 border-b navbar overflow-auto">
        <li>
          <Link className={location.pathname === "/" ? "active" : ""} to={"/"}>
            <FontAwesomeIcon icon={faDungeon} size="xl" />
            <span className="hidden md:block">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link
            className={location.pathname === "/database" ? "active" : ""}
            to={"/database"}
          >
            <FontAwesomeIcon icon={faDatabase} size="xl" />
            <span className="hidden md:block">Database</span>
          </Link>
        </li>
        <li>
          <Link
            className={location.pathname === "/error" ? "active" : ""}
            to={"/error"}
          >
            <FontAwesomeIcon icon={faCircleExclamation} size="xl" />
            <span className="hidden md:block">Error</span>
          </Link>
        </li>
        <li>
          <button
            onClick={logoutHandler}
            className="inline-flex gap-2 items-center"
          >
            <FontAwesomeIcon icon={faRightFromBracket} size="xl" />
            <span className="hidden md:block">Logout</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
