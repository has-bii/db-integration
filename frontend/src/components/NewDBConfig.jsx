import PropTypes from "prop-types";
import Modal from "./Modal";
import axios from "../../lib/axios";
import { useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

function NewDBConfig({
  showNewDB,
  setShowNewDB,
  setColumnsModal,
  newColumns,
  setNewColumns,
  newTableDB,
  setNewTableDB,
  newDB,
  setNewDB,
  setDatabases,
}) {
  const [editColumnsModal, setEditColumnsModal] = useState(false);
  const editColsSourceRef = useRef();
  const editColsTargetRef = useRef();
  const [selected, setSelected] = useState({ tableIndex: "" });

  const [loadingSource, setLoadingSource] = useState(false);
  const [loadingTarget, setLoadingTarget] = useState(false);
  const [errorSource, setErrorSource] = useState(false);
  const [errorTarget, setErrorTarget] = useState(false);

  function checkConnection(connection, setLoad, setError) {
    async function check() {
      setLoad(true);

      const res = await axios
        .post("/config/check-connection", {
          connection: JSON.stringify(connection),
        })
        .then((res) => {
          console.log(res.data);
          setError(false);
          return res.data;
        })
        .catch((err) => {
          console.error(err);
          setError(true);
          return null;
        })
        .finally(() => setLoad(false));
    }

    check();
  }

  function clearNewDB() {
    setNewDB({
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

    setShowNewDB(false);
  }

  function saveNewDB(e) {
    e.preventDefault();

    if (newDB.tables.length === 0) {
      alert("Tables is required!");
    } else {
      setDatabases((prev) => [newDB, ...prev]);

      clearNewDB();
    }
  }

  function updateTablesHandler(e, tableIndex, key) {
    setNewDB({
      ...newDB,
      tables: newDB.tables.map((table, index) => {
        if (index === tableIndex) {
          table[key] = e.target.value;
        }

        return table;
      }),
    });
  }

  function updateTablesFilterHandler(e, tableIndex, key) {
    setNewDB({
      ...newDB,
      tables: newDB.tables.map((table, index) => {
        if (index === tableIndex) {
          table.filterByCol[key] = e.target.value;
        }

        return table;
      }),
    });
  }

  async function pushNewColumn() {
    async function add() {
      if (
        editColsSourceRef.current.value.length === 0 ||
        editColsTargetRef.current.value.length === 0
      )
        alert("Column names must not be empty!");
      else {
        setNewColumns((prev) => [
          ...prev,
          {
            source: editColsSourceRef.current.value,
            target: editColsTargetRef.current.value,
          },
        ]);
      }
    }

    await add();

    editColsSourceRef.current.value = "";
    editColsTargetRef.current.value = "";

    editColsSourceRef.current.focus();
  }

  function saveEditColsHandler(tableIndex) {
    setNewDB({
      ...newDB,
      tables: newDB.tables.map((table, i) => {
        if (i === tableIndex) {
          table.columns = newColumns;
        }

        return table;
      }),
    });

    setEditColumnsModal(false);
  }

  return (
    <>
      <Modal
        show={editColumnsModal}
        setShow={setEditColumnsModal}
        header="edit columns"
      >
        <div>
          <div className="tables-wrapper">
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
                    <input
                      ref={editColsSourceRef}
                      type="text"
                      placeholder="Column name"
                    />
                  </td>
                  <td>
                    <input
                      ref={editColsTargetRef}
                      type="text"
                      placeholder="Column name"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") pushNewColumn();
                      }}
                    />
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
              setEditColumnsModal(false);
              setSelected({ tableIndex: "" });
            }}
          >
            Cancel
          </button>
          <button
            className="btn green"
            onClick={() => saveEditColsHandler(selected.tableIndex)}
          >
            Save
          </button>
        </div>
      </Modal>
      <form
        onSubmit={saveNewDB}
        className={`database-container new ${showNewDB ? "" : "hide"}`}
      >
        <div className="connection">
          <div className="source">
            <h4 className="heading">Source</h4>
            <div className={`connection-wrapper ${errorSource ? "error" : ""}`}>
              <div className="connection-input-wrapper">
                <label htmlFor="source-database">Database</label>
                <input
                  id="source-database"
                  type="text"
                  placeholder="Database"
                  value={newDB.connection.source.database}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        source: {
                          ...newDB.connection.source,
                          database: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="source-user">User</label>
                <input
                  id="source-user"
                  type="text"
                  placeholder="User"
                  value={newDB.connection.source.user}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        source: {
                          ...newDB.connection.source,
                          user: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="source-password">Password</label>
                <input
                  id="source-password"
                  type="text"
                  placeholder="Password"
                  value={newDB.connection.source.password}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        source: {
                          ...newDB.connection.source,
                          password: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="source-host">Host</label>
                <input
                  id="source-host"
                  type="text"
                  placeholder="Host"
                  value={newDB.connection.source.host}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        source: {
                          ...newDB.connection.source,
                          host: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="source-port">Port</label>
                <input
                  id="source-port"
                  type="number"
                  placeholder="Port"
                  value={newDB.connection.source.port}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        source: {
                          ...newDB.connection.source,
                          port: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="source-dialect">Dialect</label>
                <input
                  id="source-dialect"
                  type="text"
                  placeholder="Dialect"
                  value={newDB.connection.source.dialect}
                  readOnly
                />
              </div>
              <div className="btn-container">
                <button
                  className="btn yellow"
                  onClick={() =>
                    checkConnection(
                      newDB.connection.source,
                      setLoadingSource,
                      setErrorSource
                    )
                  }
                  disabled={
                    loadingSource ||
                    newDB.connection.source.database.length === 0 ||
                    newDB.connection.source.user.length === 0 ||
                    newDB.connection.source.password.length === 0 ||
                    newDB.connection.source.host.length === 0 ||
                    newDB.connection.source.port.length === 0
                  }
                >
                  test
                  {loadingSource && (
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      className=" animate-spin"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="target">
            <h4 className="heading">Target</h4>
            <div className={`connection-wrapper ${errorTarget ? "error" : ""}`}>
              <div className="connection-input-wrapper">
                <label htmlFor="target-database">Database</label>
                <input
                  id="target-database"
                  type="text"
                  placeholder="Database"
                  value={newDB.connection.target.database}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        target: {
                          ...newDB.connection.target,
                          database: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="target-user">User</label>
                <input
                  id="target-user"
                  type="text"
                  placeholder="User"
                  value={newDB.connection.target.user}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        target: {
                          ...newDB.connection.target,
                          user: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="target-password">Password</label>
                <input
                  id="target-password"
                  type="text"
                  placeholder="Password"
                  value={newDB.connection.target.password}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        target: {
                          ...newDB.connection.target,
                          password: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="target-host">Host</label>
                <input
                  id="target-host"
                  type="text"
                  placeholder="Host"
                  value={newDB.connection.target.host}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        target: {
                          ...newDB.connection.target,
                          host: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="target-port">Port</label>
                <input
                  id="target-port"
                  type="number"
                  placeholder="Port"
                  value={newDB.connection.target.port}
                  onChange={(e) =>
                    setNewDB({
                      ...newDB,
                      connection: {
                        ...newDB.connection,
                        target: {
                          ...newDB.connection.target,
                          port: e.target.value,
                        },
                      },
                    })
                  }
                  required
                />
              </div>
              <div className="connection-input-wrapper">
                <label htmlFor="target-dialect">Dialect</label>
                <input
                  id="target-dialect"
                  type="text"
                  placeholder="Dialect"
                  value={newDB.connection.target.dialect}
                  readOnly
                />
              </div>
              <div className="btn-container">
                <button
                  className="btn yellow"
                  onClick={() =>
                    checkConnection(
                      newDB.connection.target,
                      setLoadingTarget,
                      setErrorTarget
                    )
                  }
                  disabled={
                    loadingTarget ||
                    newDB.connection.target.database.length === 0 ||
                    newDB.connection.target.user.length === 0 ||
                    newDB.connection.target.password.length === 0 ||
                    newDB.connection.target.host.length === 0 ||
                    newDB.connection.target.port.length === 0
                  }
                >
                  test
                  {loadingTarget && (
                    <FontAwesomeIcon
                      icon={faCircleNotch}
                      className=" animate-spin"
                    />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="tables">
          <h4 className="heading">Tables</h4>
          <div className="tables-wrapper">
            <table>
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Source Table</th>
                  <th scope="col">Target Table</th>
                  <th scope="col">filtered source col</th>
                  <th scope="col">filtered target col</th>
                  <th scope="col">filtered col type</th>
                  <th scope="col">Columns</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {newDB.tables.map((table, tableIndex) => (
                  <tr key={tableIndex}>
                    <th scope="row" className=" whitespace-pre">
                      {tableIndex + 1}
                    </th>
                    <td>
                      <input
                        type="text"
                        placeholder="Table name"
                        value={table.sourceTable}
                        onChange={(e) =>
                          updateTablesHandler(e, tableIndex, "sourceTable")
                        }
                        required
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Table name"
                        value={table.targetTable}
                        onChange={(e) =>
                          updateTablesHandler(e, tableIndex, "targetTable")
                        }
                        required
                      />
                    </td>
                    <td>
                      <select
                        value={table.filterByCol.source}
                        onChange={(e) =>
                          updateTablesFilterHandler(e, tableIndex, "source")
                        }
                        required
                      >
                        <option value="">Select Column</option>
                        {table.columns.map((col, colIndex) => (
                          <option key={colIndex} value={col.source}>
                            {col.source}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={table.filterByCol.target}
                        onChange={(e) =>
                          updateTablesFilterHandler(e, tableIndex, "target")
                        }
                        required
                      >
                        <option value="">Select Column</option>
                        {table.columns.map((col, colIndex) => (
                          <option key={colIndex} value={col.target}>
                            {col.target}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <select
                        value={table.filterByCol.type}
                        onChange={(e) =>
                          updateTablesFilterHandler(e, tableIndex, "type")
                        }
                        required
                      >
                        <option value="">Select Column</option>
                        <option value="PRIMARYKEY">PRIMARYKEY</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn fluid sky"
                        type="button"
                        onClick={() => {
                          setSelected({ tableIndex: tableIndex });
                          setNewColumns(table.columns);
                          setEditColumnsModal(true);
                        }}
                      >
                        edit
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn fluid red"
                        type="button"
                        onClick={() =>
                          setNewDB({
                            ...newDB,
                            tables: newDB.tables.filter(
                              (tb, i) => i !== tableIndex
                            ),
                          })
                        }
                      >
                        delete
                      </button>
                    </td>
                  </tr>
                ))}

                {/* New Table */}
                <tr>
                  <td>#</td>
                  <td>
                    <input
                      type="text"
                      placeholder="source"
                      value={newTableDB.sourceTable}
                      onChange={(e) =>
                        setNewTableDB({
                          ...newTableDB,
                          sourceTable: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      placeholder="target"
                      value={newTableDB.targetTable}
                      onChange={(e) =>
                        setNewTableDB({
                          ...newTableDB,
                          targetTable: e.target.value,
                        })
                      }
                    />
                  </td>
                  <td>
                    <select
                      value={newTableDB.filterByCol.source}
                      onChange={(e) =>
                        setNewTableDB({
                          ...newTableDB,
                          filterByCol: {
                            ...newTableDB.filterByCol,
                            source: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Select Column</option>
                      {newTableDB.columns.map((col, i) => (
                        <option key={i} value={col.source}>
                          {col.source}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={newTableDB.filterByCol.target}
                      onChange={(e) =>
                        setNewTableDB({
                          ...newTableDB,
                          filterByCol: {
                            ...newTableDB.filterByCol,
                            target: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="">Select Column</option>
                      {newTableDB.columns.map((col, i) => (
                        <option key={i} value={col.target}>
                          {col.target}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      value={newTableDB.filterByCol.type}
                      onChange={(e) =>
                        setNewTableDB({
                          ...newTableDB,
                          filterByCol: {
                            ...newTableDB.filterByCol,
                            type: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="PRIMARYKEY">PRIMARYKEY</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="btn fluid sky"
                      type="button"
                      onClick={() => {
                        setNewColumns(newTableDB.columns);
                        setColumnsModal(true);
                      }}
                    >
                      edit
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn fluid green"
                      type="button"
                      disabled={
                        newTableDB.sourceTable.length === 0 ||
                        newTableDB.targetTable.length === 0 ||
                        newTableDB.filterByCol.source.length === 0 ||
                        newTableDB.filterByCol.target.length === 0 ||
                        newTableDB.columns.length === 0
                      }
                      onClick={() => {
                        setNewDB({
                          ...newDB,
                          tables: [...newDB.tables, newTableDB],
                        });
                        setNewTableDB({
                          sourceTable: "",
                          targetTable: "",
                          filterByCol: {
                            source: "",
                            target: "",
                            type: "PRIMARYKEY",
                          },
                          columns: [],
                        });
                      }}
                    >
                      add
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="btn-container">
          <button className="btn red" type="reset" onClick={clearNewDB}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn green"
            disabled={errorSource || errorTarget || newDB.tables.length === 0}
          >
            Save
          </button>
        </div>
      </form>
    </>
  );
}

NewDBConfig.propTypes = {
  showNewDB: PropTypes.bool.isRequired,
  setShowNewDB: PropTypes.func.isRequired,
  setColumnsModal: PropTypes.func.isRequired,
  newColumns: PropTypes.array.isRequired,
  setNewColumns: PropTypes.func.isRequired,
  newTableDB: PropTypes.object.isRequired,
  setNewTableDB: PropTypes.func.isRequired,
  newDB: PropTypes.object.isRequired,
  setNewDB: PropTypes.func.isRequired,
  setDatabases: PropTypes.func.isRequired,
};

export default NewDBConfig;
