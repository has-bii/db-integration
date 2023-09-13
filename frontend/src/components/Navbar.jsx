import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBell,
  faCircleExclamation,
  faDatabase,
  faDungeon,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import Dropdown from "./Dropdown";
import convertDate from "../../lib/convertDate";
import axios from "../../lib/axios";

export default function Navbar() {
  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);
  const location = useLocation();
  const navigate = useNavigate();
  const [ErrorJSON, setErrorJSON] = useState([]);
  const [readErrorJSON, setReadErrorJSON] = useState(0);

  const logoutHandler = () => {
    removeCookie("access_token");
    navigate("/login");
  };

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(
        `${import.meta.env.VITE_API_URL.replace("http", "ws")}`
      );

      // WebSocket event listeners

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.status === "all") setErrorJSON(data.data);

        if (data.status === "new") if (data.data) setErrorJSON(data.data);
      };
    }

    connect();
  }, []);

  useEffect(() => {
    setReadErrorJSON(ErrorJSON.filter((err) => !err.isRead).length);
  }, [ErrorJSON]);

  function clearNotifications() {
    async function clear() {
      await axios.get("/notification/clear");

      setErrorJSON([]);
    }

    clear();
  }

  function readNotifications() {
    async function read() {
      await axios.get("/notification/read");

      setErrorJSON(
        ErrorJSON.map((err) => {
          err.isRead = true;
          return err;
        })
      );
    }

    read();
  }

  return (
    <div className="bg-white drop-shadow-xl relative z-20">
      <div className=" flex justify-center text-2xl font-extrabold border-b py-4 text-gray-700">
        INTEGRATION DB
      </div>
      <ul className="flex flex-row gap-8 justify-center py-4 border-b navbar overflow-visible">
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
          <div className="inline-flex gap-4 items-center">
            <Dropdown
              icon={faBell}
              textButton="Notification"
              iconSize="xl"
              position="bottom middle"
            >
              <div className="inline-flex gap-4 border-b bg-slate-100 items-center px-4 w-full">
                <h6 className="font-bold text-slate-500">Notifications</h6>
                <button className="ml-auto py-1.5" onClick={readNotifications}>
                  Mark as read
                </button>
                <button
                  className="capitalize py-1.5"
                  onClick={clearNotifications}
                >
                  clear
                </button>
              </div>
              <ul className="w-96 max-h-96 overflow-y-auto">
                {ErrorJSON.length === 0 ? (
                  <li>
                    <div className="p-4 text-slate-400">
                      There is no notification.
                    </div>
                  </li>
                ) : (
                  ErrorJSON.map((json, i) => (
                    <li key={i}>
                      <div className="px-4 py-2">
                        <div className="inline-flex gap-2 items-center">
                          <span className="text-sm text-slate-400">
                            {convertDate(new Date(json.date))}
                          </span>
                          {!json.isRead && (
                            <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p>{json.message}</p>
                      </div>
                    </li>
                  ))
                )}
              </ul>
            </Dropdown>
            {readErrorJSON > 0 && (
              <div className="w-6 h-6 inline-flex justify-center items-center bg-red-500 rounded-full text-white text-xs">
                <span>{readErrorJSON}</span>
              </div>
            )}
          </div>
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
