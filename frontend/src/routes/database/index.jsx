import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowsRotate,
  faCaretDown,
  faCheck,
  faCircleNotch,
  faClock,
  faFloppyDisk,
  faPlay,
  faPlus,
  faRotate,
  faRotateRight,
  faStop,
} from "@fortawesome/free-solid-svg-icons";
import DatabaseConfig from "../../components/DatabaseConfig";
import NewDBConfig from "../../components/NewDBConfig";
import Dropdown from "../../components/Dropdown";
import { useToast } from "../../components/ToastProvider";

export default function Database() {
  const { pushToast } = useToast();
  const [firstMount, setFirstMount] = useState(true);
  const [firstFetch, setFirstFetch] = useState(true);
  const [myTimeout, setMyTimeout] = useState(null);
  const [saving, setSaving] = useState(false);
  const [databases, setDatabases] = useState([]);
  const [columnsModal, setColumnsModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadStatus, setLoadStatus] = useState(true);
  const [timestamp, setTimestamp] = useState(null);
  const [timeInterval, setTimeInterval] = useState("");
  const [status, setStatus] = useState(false);
  const [selected, setSelected] = useState({
    dbIndex: "",
    tableIndex: "",
  });
  const [newTable, setNewTable] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    columns: [],
  });
  const [newColumns, setNewColumns] = useState([]);
  const sourceNameRef = useRef();
  const [sourceName, setSourceName] = useState("");
  const [targetName, setTargetName] = useState("");
  const [showNewDB, setShowNewDB] = useState(false);
  const [newDB, setNewDB] = useState({
    connection: {
      source: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "1521",
        dialect: "oracle",
      },
      target: {
        database: "",
        user: "",
        password: "",
        host: "",
        port: "5432",
        dialect: "postgres",
      },
    },
    tables: [],
  });
  const [newTableDB, setNewTableDB] = useState({
    sourceTable: "",
    targetTable: "",
    filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
    columns: [],
  });
  const [getColsLoad, setGetColsLoad] = useState(false);
  const [selectedTable, setSelectedTable] = useState({
    connection: {},
    table: {},
  });
  const [fetchedCols, setFetchedCols] = useState({ source: [], target: [] });

  async function fetchDatabases() {
    await axios
      .get("/config")
      .then((res) => {
        setDatabases(res.data.config);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error while fetching Database Configuration: ", err);
      });
  }

  useEffect(() => {
    fetchDatabases();
  }, []);

  useEffect(() => {
    async function fetchBackup() {
      await axios
        .get("/backup/isRunning")
        .then((res) => {
          setStatus(res.data.status);

          setTimestamp(res.data.timestamp);

          setTimeInterval(res.data.interval);

          setLoadStatus(false);
        })
        .catch((err) => {
          console.error("Error while checking backup is running: ", err);
        });
    }

    fetchBackup();
  }, []);

  useEffect(() => {
    if (timeInterval.length !== 0) {
      if (timeInterval > 59) setTimeInterval(59);

      if (timeInterval <= 0) setTimeInterval(1);
    }
  }, [timeInterval]);

  useEffect(() => {
    if (firstMount) {
      setFirstMount(false);
    } else if (firstFetch) {
      setFirstFetch(false);
    } else if (!loading) {
      if (myTimeout) clearTimeout(myTimeout);

      setMyTimeout(
        setTimeout(() => {
          saveConfigs();
          setSaving(true);
        }, 1000)
      );
    }
  }, [databases]);

  function updateConnectionSourceHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.source[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  function updateConnectionTargetHandler(e, i, property) {
    const updated = databases.map((database, index) => {
      if (i === index) {
        database.connection.target[property] = e.target.value;

        return database;
      } else return database;
    });

    setDatabases(updated);
  }

  async function pushNewColumn() {
    async function add() {
      if (sourceName.length === 0 || targetName.length === 0)
        alert("Column names must not be empty!");
      else {
        setNewColumns((prev) => [
          ...prev,
          {
            source: sourceName,
            target: targetName,
          },
        ]);
      }
    }

    await add();

    setSourceName("");
    setTargetName("");

    sourceNameRef.current.focus();
  }

  async function addNewTable(index) {
    async function update() {
      setDatabases(
        databases.map((database, i) => {
          if (i === index) {
            database.tables = [...database.tables, newTable];
            return database;
          } else return database;
        })
      );
    }

    await update();

    setNewTable({
      sourceTable: "",
      targetTable: "",
      filterByCol: { source: "", target: "", type: "PRIMARYKEY" },
      columns: [],
    });
  }

  function delTables(dbIndex, tableIndex) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.filter(
            (table, i) => tableIndex !== i
          );

          return database;
        } else return database;
      })
    );
  }

  function updateTableProperty(
    dbIndex,
    tableIndex,
    tableProperty,
    e,
    filteredCol = false
  ) {
    setDatabases(
      databases.map((database, index) => {
        if (dbIndex === index) {
          database.tables = database.tables.map((table, i) => {
            if (tableIndex === i) {
              if (filteredCol) {
                table.filterByCol[tableProperty] = e.target.value;
              } else table[tableProperty] = e.target.value;

              return table;
            } else return table;
          });

          return database;
        } else return database;
      })
    );
  }

  function editAndNewColumnsHandler() {
    if (showNewDB) {
      setNewTableDB({ ...newTableDB, columns: newColumns });
    } else if (selected.dbIndex.length === 0) {
      setNewTable({ ...newTable, columns: newColumns });
    } else {
      setDatabases(
        databases.map((database, index) => {
          if (selected.dbIndex === index) {
            database.tables = database.tables.map((table, i) => {
              if (selected.tableIndex === i) {
                table.columns = newColumns;
              }

              return table;
            });
          }

          return database;
        })
      );

      setSelected({
        dbIndex: "",
        tableIndex: "",
      });
    }

    setNewColumns([]);
    setColumnsModal(false);
  }

  function delDatabaseHandler(indexDB) {
    setDatabases(databases.filter((db, i) => i !== indexDB));
  }

  function saveConfigs() {
    async function save() {
      const result = await axios
        .post("/config/update", { config: JSON.stringify(databases) })
        .then((res) => {
          setSaving(false);
          return res.data;
        })
        .catch((err) => {
          pushToast(false, "Failed to save config!");
          console.error("Error while saving configurations!\nError: ", err);
          return null;
        });

      if (result) pushToast(true, result.message);
    }

    save();
  }

  function startBackup() {
    async function start() {
      pushToast(true, "Starting backup...");
      const result = await axios
        .post("/backup/start", { timeInterval })
        .then((res) => {
          setStatus(res.data.status);
          setTimestamp(res.data.timestamp);
          setTimeInterval(res.data.interval);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while starting main backup!\nError: ", err);
          return null;
        });

      if (result) pushToast(result.status, result.message);
      else pushToast(false, "Failed to start backup!");
    }

    start();
  }

  function stopBackup() {
    async function stop() {
      pushToast(true, "Stopping backup...");
      const result = await axios
        .get("/backup/stop")
        .then((res) => {
          setStatus(res.data.status);
          setTimestamp(res.data.timestamp);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while stopping main backup!\nError: ", err);
          return null;
        });

      if (result) pushToast(result.status, result.message);
      else pushToast(false, "Failed to stop backup!");
    }

    stop();
  }

  async function applyInterval() {
    async function restart() {
      pushToast(true, "Restarting backup...");
      const result = await axios
        .post("/backup/restart", { timeInterval })
        .then((res) => {
          setStatus(res.data.status);
          setTimestamp(res.data.timestamp);
          setTimeInterval(res.data.interval);
          return res.data;
        })
        .catch((err) => {
          console.error("Error while restarting main backup!\nError: ", err);
          return null;
        });

      if (result) pushToast(result.status, result.message);
      else pushToast(false, "Failed to restart backup!");
    }

    restart();
  }

  function getColumns() {
    async function get() {
      setGetColsLoad(true);
      const res = await axios
        .post("/db/get-columns", selectedTable)
        .then((res) => {
          console.log(res.data);
          return res.data.data;
        })
        .catch((err) => {
          console.error("Error while fetching columns: ", err);
          pushToast(false, "Error while getting columns!");
          return null;
        })
        .finally(() => setGetColsLoad(false));

      if (res) setFetchedCols(res);
    }

    get();
  }

  return (
    <>
      <Modal
        show={columnsModal}
        setShow={setColumnsModal}
        header="Edit Columns"
        className="enable-overflow"
      >
        <div>
          <div className="tables-wrapper enable-overflow">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Source</th>
                  <th scope="col">Target</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newColumns.map((col, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{col.source}</td>
                    <td>{col.target}</td>
                    <td>
                      <button
                        className="btn fluid red"
                        onClick={() => {
                          setNewColumns(
                            newColumns.filter((c, i) => i !== index)
                          );
                        }}
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td>#</td>
                  <td>
                    <div className="inline-flex">
                      <input
                        ref={sourceNameRef}
                        type="text"
                        placeholder="Column name"
                        value={sourceName}
                        onChange={(e) => setSourceName(e.target.value)}
                      />
                      {fetchedCols.source.length > 0 && (
                        <Dropdown icon={faCaretDown} closeOnClick={true}>
                          <ul className="max-h-96 overflow-y-auto">
                            {fetchedCols.source.map((col, i) => (
                              <li key={i}>
                                <button onClick={() => setSourceName(col)}>
                                  {col}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Dropdown>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className=" inline-flex">
                      <input
                        type="text"
                        placeholder="Column name"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") pushNewColumn();
                        }}
                        value={targetName}
                        onChange={(e) => setTargetName(e.target.value)}
                      />
                      {fetchedCols.target.length > 0 && (
                        <Dropdown icon={faCaretDown} closeOnClick={true}>
                          <ul className="max-h-96 overflow-y-auto">
                            {fetchedCols.target.map((col, i) => (
                              <li key={i}>
                                <button onClick={() => setTargetName(col)}>
                                  {col}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </Dropdown>
                      )}
                    </div>
                  </td>
                  <td>
                    <button className="btn fluid green" onClick={pushNewColumn}>
                      add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <button
            className="btn gray"
            onClick={() => {
              setColumnsModal(false);
              setSelectedTable({ connection: {}, table: {} });
              setFetchedCols({ source: [], target: [] });
            }}
          >
            Cancel
          </button>
          <button className="btn yellow" onClick={getColumns}>
            Get Cols
            {getColsLoad && (
              <FontAwesomeIcon icon={faCircleNotch} className="animate-spin" />
            )}
          </button>
          <button className="btn green" onClick={editAndNewColumnsHandler}>
            Save
          </button>
        </div>
      </Modal>
      <Layout>
        <div className="flex flex-col px-4 md:px-0 md:flex-row gap-4 lg:items-center mb-4">
          <div className="text-2xl font-bold text-slate-950">Databases</div>
          {!loadStatus && (
            <div className="flex gap-4">
              <div
                className={`px-3 py-1 rounded-md text-sm w-fit first-letter:uppercase border ${
                  status
                    ? "border-green-500 text-green-500"
                    : "border-red-500 text-red-500"
                }`}
              >
                {status ? "Running at" : "stopped at"}
              </div>
              {timestamp && (
                <div className="inline-flex gap-2 items-center text-slate-400">
                  <FontAwesomeIcon icon={faClock} />
                  <span>
                    {new Date(timestamp).toLocaleString().replaceAll("/", "-")}
                  </span>
                </div>
              )}
            </div>
          )}
          <div className="flex flex-row gap-4 ml-auto items-center">
            <div className="inline-flex gap-2 items-center text-slate-400">
              {saving ? (
                <>
                  <FontAwesomeIcon
                    icon={faArrowsRotate}
                    className="animate-spin"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faCheck} />
                  <span>Saved</span>
                </>
              )}
            </div>

            <div className="inline-flex bg-white border rounded-md overflow-hidden">
              <button
                className="px-3 bg-black py-1 text-white capitalize border-r"
                onClick={applyInterval}
              >
                apply
              </button>
              <input
                type="number"
                placeholder="Interval in 1-59 mins"
                className="px-3 py-1 bg-transparent max-w-xs"
                value={timeInterval}
                onChange={(e) => setTimeInterval(e.target.value)}
              />
            </div>
            <Dropdown>
              <ul>
                <li>
                  <button onClick={() => setShowNewDB(true)}>
                    <FontAwesomeIcon icon={faPlus} />
                    Add
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      pushToast(true, "Saving...");
                      saveConfigs();
                    }}
                  >
                    <FontAwesomeIcon icon={faFloppyDisk} />
                    Save
                  </button>
                </li>
                <li>
                  <button onClick={startBackup}>
                    <FontAwesomeIcon icon={faPlay} />
                    Start
                  </button>
                </li>
                <li>
                  <button onClick={stopBackup}>
                    <FontAwesomeIcon icon={faStop} />
                    Stop
                  </button>
                </li>
                <li>
                  <button onClick={applyInterval}>
                    <FontAwesomeIcon icon={faRotateRight} />
                    Restart
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => {
                      setLoading(true);
                      setDatabases([]);
                      fetchDatabases();
                    }}
                  >
                    <FontAwesomeIcon icon={faRotate} />
                    refresh
                  </button>
                </li>
              </ul>
            </Dropdown>
          </div>
        </div>

        {/* New DB */}

        <NewDBConfig
          showNewDB={showNewDB}
          setShowNewDB={setShowNewDB}
          setColumnsModal={setColumnsModal}
          newColumns={newColumns}
          setNewColumns={setNewColumns}
          newTableDB={newTableDB}
          setNewTableDB={setNewTableDB}
          newDB={newDB}
          setNewDB={setNewDB}
          setDatabases={setDatabases}
          setSelectedTable={setSelectedTable}
        />

        {/* Databases */}
        {loading ? (
          <div className="w-full h-80 flex justify-center items-center text-2xl gap-4 text-slate-300 font-semibold animate-pulse">
            Fetching data...
            <FontAwesomeIcon
              icon={faCircleNotch}
              size="lg"
              className="animate-spin"
            />
          </div>
        ) : databases.length > 0 ? (
          databases.map((database, index) => (
            <DatabaseConfig
              key={index}
              index={index}
              database={database}
              delDatabaseHandler={delDatabaseHandler}
              newTable={newTable}
              setNewTable={setNewTable}
              updateConnectionSourceHandler={updateConnectionSourceHandler}
              updateConnectionTargetHandler={updateConnectionTargetHandler}
              updateTableProperty={updateTableProperty}
              setColumnsModal={setColumnsModal}
              setNewColumns={setNewColumns}
              addNewTable={addNewTable}
              setSelected={setSelected}
              delTables={delTables}
              setSelectedTable={setSelectedTable}
            />
          ))
        ) : (
          <div className="w-full h-80 flex justify-center items-center text-2xl text-slate-300 font-semibold">
            There is no configuration.
          </div>
        )}
      </Layout>
    </>
  );
}
