import React, { useEffect, useRef, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";
import Modal from "../../components/Modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import DatabaseConfig from "../../components/DatabaseConfig";
import NewDBConfig from "../../components/NewDBConfig";

export default function Database() {
  const [databases, setDatabases] = useState([]);
  const [columnsModal, setColumnsModal] = useState(false);

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
  const targetNameRef = useRef();

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

  useEffect(() => {
    async function fetchDatabases() {
      await axios
        .get("/config")
        .then((res) => {
          setDatabases(res.data.config);
        })
        .catch((err) => {
          console.error("Error while fetching Database Configuration: ", err);
        });
    }

    fetchDatabases();
  }, []);

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
      if (
        sourceNameRef.current.value.length === 0 ||
        targetNameRef.current.value.length === 0
      )
        alert("Column names must not be empty!");
      else {
        setNewColumns((prev) => [
          ...prev,
          {
            source: sourceNameRef.current.value,
            target: targetNameRef.current.value,
          },
        ]);
      }
    }

    await add();

    sourceNameRef.current.value = "";
    targetNameRef.current.value = "";

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

  return (
    <>
      <button
        className={`fixed bottom-10 right-10 p-4 text-white z-40 transition-all duration-300 ease-in-out rounded-full ${
          showNewDB ? "rotate-45 bg-red-400" : "rotate-0 bg-black"
        }`}
        onClick={() => setShowNewDB(!showNewDB)}
      >
        <div className="px-[2px]">
          <FontAwesomeIcon icon={faPlus} size="2xl" />
        </div>
      </button>
      <Modal
        show={columnsModal}
        setShow={setColumnsModal}
        header="Edit Columns"
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
                      ref={sourceNameRef}
                      type="text"
                      placeholder="Column name"
                    />
                  </td>
                  <td>
                    <input
                      ref={targetNameRef}
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
          <button className="btn gray" onClick={() => setColumnsModal(false)}>
            Cancel
          </button>
          <button className="btn green" onClick={editAndNewColumnsHandler}>
            Save
          </button>
        </div>
      </Modal>
      <Layout>
        <div className="text-2xl font-bold text-slate-950 mb-4">Databases</div>

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
        />

        {/* Databases */}
        {databases.length > 0 &&
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
            />
          ))}
      </Layout>
    </>
  );
}
