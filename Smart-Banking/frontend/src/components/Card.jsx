import React from "react";

const Card = ({ title, value }) => {
  return (
    <div className="bg-white shadow rounded p-4 flex flex-col justify-center items-center">
      <h2 className="text-gray-500 text-sm">{title}</h2>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  );
};

export default Card;

