import { faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useRef, useState } from "react";

export default function ReadWriteSQL({ query, setQuery }) {
  const [newColumnsSQL, setNewColumnsSQL] = useState([]);
  const [columnName, setColumnName] = useState("");
  const [columnAsName, setColumnAsName] = useState("");

  const valueNameRef = useRef();

  useEffect(() => {
    setQuery({ ...query, columnsSQL: newColumnsSQL });
  }, [newColumnsSQL]);

  async function pushNewColumnSQL() {
    async function push() {
      setNewColumnsSQL((prev) => [
        ...prev,
        { column: columnName, name: columnAsName },
      ]);
    }

    await push();

    setColumnName("");
    setColumnAsName("");
  }

  function changeColumnSQL(colSQLIndex, property, value) {
    setNewColumnsSQL(
      newColumnsSQL.map((item, index) => {
        if (index === colSQLIndex) item[property] = value;

        return item;
      })
    );
  }

  return (
    <>
      <h6 className="mt-2 font-semibold">COLUMNS & TABLES</h6>
      <div className="flex flex-row gap-4 w-full">
        <div className="p-3 flex flex-col gap-4 border rounded-md w-full">
          <p>SELECT</p>
          {newColumnsSQL.map((colSQL, colSQLIndex) => (
            <div key={colSQLIndex} className="inline-flex gap-2 items-center">
              <input
                type="text"
                className="px-3 py-1.5 border rounded"
                value={colSQL.column}
                onChange={(e) =>
                  changeColumnSQL(colSQLIndex, "column", e.target.value)
                }
              />
              <span>as</span>
              <input
                type="text"
                className="px-3 py-1.5 border rounded"
                value={colSQL.name}
                onChange={(e) =>
                  changeColumnSQL(colSQLIndex, "name", e.target.value)
                }
              />
              <button
                className="btn red"
                onClick={() =>
                  setNewColumnsSQL(
                    newColumnsSQL.filter((item, i) => i !== colSQLIndex)
                  )
                }
              >
                Delete
              </button>
            </div>
          ))}
          <div className="inline-flex gap-2 items-center">
            <input
              type="text"
              className="px-3 py-1.5 rounded border"
              placeholder="Column/function"
              value={columnName}
              onChange={(e) => setColumnName(e.target.value)}
            />
            <input
              type="text"
              className="px-3 py-1.5 rounded border"
              placeholder="AS name"
              value={columnAsName}
              onChange={(e) => setColumnAsName(e.target.value)}
            />
            <button
              className="btn green"
              onClick={pushNewColumnSQL}
              disabled={columnName.length === 0 || columnAsName.length === 0}
            >
              add
            </button>
          </div>

          <div className="inline-flex gap-4 items-center">
            <label htmlFor="from-table">FROM</label>
            <input
              id="from-table"
              type="text"
              className="px-3 py-1.5 border rounded"
              placeholder="Table name..."
              value={query.from}
              onChange={(e) => setQuery({ ...query, from: e.target.value })}
            />
          </div>
        </div>
        <div className="p-3 flex flex-col gap-2 border rounded-md w-full">
          <p>INSERT</p>
          <input
            type="text"
            className="px-3 py-1.5 border rounded"
            placeholder="Table name..."
            value={query.targetTable}
            onChange={(e) =>
              setQuery({ ...query, targetTable: e.target.value })
            }
          />
          <p>VALUES</p>
          <div className="inline-flex gap-2 items-center">
            <select
              ref={valueNameRef}
              className="px-3 py-1.5 border rounded w-full"
            >
              <option value="">Select column name</option>
              {newColumnsSQL
                .filter(
                  (item) => !query.values.some((value) => value === item.name)
                )
                .map((colSQL, colSQLIndex) => (
                  <option key={colSQLIndex} value={colSQL.name}>
                    {colSQL.name}
                  </option>
                ))}
            </select>
            <button
              className="btn green"
              onClick={() => {
                setQuery({
                  ...query,
                  values: [...query.values, valueNameRef.current.value],
                });
                valueNameRef.current.value = "";
              }}
            >
              add
            </button>
          </div>

          {query.values.map((value, valueIndex) => (
            <div
              key={valueIndex}
              className="inline-flex justify-between items-center px-2 py-1 rounded bg-slate-100 text-slate-500 font-semibold"
            >
              {value}
              <button
                onClick={() =>
                  setQuery({
                    ...query,
                    values: query.values.filter((va, i) => i !== valueIndex),
                  })
                }
              >
                <FontAwesomeIcon icon={faTrashCan} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
