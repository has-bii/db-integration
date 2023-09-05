import React, { useEffect, useState } from "react";
import Layout from "../../components/Layout";
import axios from "../../../lib/axios";

export default function Database() {
  const [databases, setDatabases] = useState([]);

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

  return (
    <Layout>
      <div className="text-2xl font-bold text-slate-950 mb-4">Databases</div>
      {databases.length > 0 &&
        databases.map((database, index) => (
          <div key={index} className="database-container">
            <div className="connection">
              <div className="source">
                <h4 className="heading">Source</h4>
                <div className="connection-wrapper">
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-database">Database</label>
                    <input
                      id="source-database"
                      type="text"
                      placeholder="Database"
                      value={database.connection.source.database}
                      onChange={(e) => {
                        updateConnectionSourceHandler(e, index, "database");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-user">User</label>
                    <input
                      id="source-user"
                      type="text"
                      placeholder="User"
                      value={database.connection.source.user}
                      onChange={(e) => {
                        updateConnectionSourceHandler(e, index, "user");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-password">Password</label>
                    <input
                      id="source-password"
                      type="text"
                      placeholder="Password"
                      value={database.connection.source.password}
                      onChange={(e) => {
                        updateConnectionSourceHandler(e, index, "password");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-host">Host</label>
                    <input
                      id="source-host"
                      type="text"
                      placeholder="Host"
                      value={database.connection.source.host}
                      onChange={(e) => {
                        updateConnectionSourceHandler(e, index, "host");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-port">Port</label>
                    <input
                      id="source-port"
                      type="number"
                      placeholder="Port"
                      value={database.connection.source.port}
                      onChange={(e) => {
                        updateConnectionSourceHandler(e, index, "port");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="source-dialect">Dialect</label>
                    <input
                      id="source-dialect"
                      type="text"
                      placeholder="Dialect"
                      value="oracle"
                      readOnly
                    />
                  </div>
                </div>
              </div>
              <div className="target">
                <h4 className="heading">Target</h4>
                <div className="connection-wrapper">
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-database">Database</label>
                    <input
                      id="target-database"
                      type="text"
                      placeholder="Database"
                      value={database.connection.target.database}
                      onChange={(e) => {
                        updateConnectionTargetHandler(e, index, "database");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-user">User</label>
                    <input
                      id="target-user"
                      type="text"
                      placeholder="User"
                      value={database.connection.target.user}
                      onChange={(e) => {
                        updateConnectionTargetHandler(e, index, "user");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-password">Password</label>
                    <input
                      id="target-password"
                      type="text"
                      placeholder="Password"
                      value={database.connection.target.password}
                      onChange={(e) => {
                        updateConnectionTargetHandler(e, index, "password");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-host">Host</label>
                    <input
                      id="target-host"
                      type="text"
                      placeholder="Host"
                      value={database.connection.target.host}
                      onChange={(e) => {
                        updateConnectionTargetHandler(e, index, "host");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-port">Port</label>
                    <input
                      id="target-port"
                      type="number"
                      placeholder="Port"
                      value={database.connection.target.port}
                      onChange={(e) => {
                        updateConnectionTargetHandler(e, index, "port");
                      }}
                      required
                    />
                  </div>
                  <div className="connection-input-wrapper">
                    <label htmlFor="target-dialect">Dialect</label>
                    <input
                      id="target-dialect"
                      type="text"
                      placeholder="Dialect"
                      value="postgres"
                      readOnly
                    />
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
                    {database.tables.map((table, i) => (
                      <tr key={i}>
                        <th scope="row" className=" whitespace-nowrap">
                          {++i}
                        </th>
                        <td>{table.sourceTable}</td>
                        <td>{table.targetTable}</td>
                        <td>
                          <select
                            value={table.filterByCol.source}
                            className="w-full"
                          >
                            {table.columns.map((column, index) => (
                              <option key={index} value={column.source}>
                                {column.source}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select
                            value={table.filterByCol.target}
                            className="w-full"
                          >
                            {table.columns.map((column, index) => (
                              <option key={index} value={column.target}>
                                {column.target}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <select value={table.filterByCol.type}>
                            <option value="PRIMARYKEY">PRIMARYKEY</option>
                            <option value="TIMESTAMP">TIMESTAMP</option>
                          </select>
                        </td>
                        <td>
                          <button className="btn sky">edit</button>
                        </td>
                        <td>
                          <button className="btn red">delete</button>
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td>#</td>
                      <td>
                        <input type="text" placeholder="source" />
                      </td>
                      <td>
                        <input type="text" placeholder="target" />
                      </td>
                      <td>
                        <input type="text" placeholder="Source column name" />
                      </td>
                      <td>
                        <input type="text" placeholder="Target column name" />
                      </td>
                      <td>
                        <select>
                          <option value="PRIMARYKEY">PRIMARYKEY</option>
                          <option value="TIMESTAMP">TIMESTAMP</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn sky">edit</button>
                      </td>
                      <td>
                        <button className="btn green">add</button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ))}
    </Layout>
  );
}
