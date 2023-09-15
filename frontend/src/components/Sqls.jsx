import React from "react";
import PropTypes from "prop-types";
import formatDate from "../../lib/convertDate";

function Sqls({ sqls }) {
  return (
    <div className="sqls">
      <h4 className="heading">SQL</h4>
      <div className="tables-wrapper">
        <table>
          <thead>
            <tr>
              <th scope="col">#</th>
              <th scope="col">Label</th>
              <th scope="col">Connection</th>
              <th scope="col">Date</th>
              <th scope="col">Action</th>
            </tr>
          </thead>
          <tbody>
            {sqls.map((sql, sqlIndex) => (
              <tr key={sqlIndex}>
                <th scope="row" className="whitespace-pre">
                  {sqlIndex + 1}
                </th>
                <td>{sql.label}</td>
                <td>{sql.connection}</td>
                <td>{formatDate(new Date(sql.date))}</td>
                <td>
                  <div className="inline-flex gap-2">
                    <button type="button" className="btn sky">
                      edit
                    </button>
                    <button className="btn red">delete</button>
                  </div>
                </td>
              </tr>
            ))}

            {/* New Row */}
            <tr>
              <td colSpan={6}>
                <div className="flex flex-row items-center">
                  {sqls.length === 0 && (
                    <div className="text-slate-400">There is no SQL</div>
                  )}
                  <button type="button" className="ml-auto btn green">
                    Add SQL
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

Sqls.propTypes = {
  sqls: PropTypes.array.isRequired,
};

export default Sqls;
