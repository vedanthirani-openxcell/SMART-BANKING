// components/Card.jsx
import React from "react";

const Card = ({ title, value }) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6 flex flex-col justify-center items-center text-center">
      <h3 className="text-sm font-medium text-gray-600 mb-2">{title}</h3>
      <p className="text-xl font-bold text-gray-900 break-words">{value}</p>
    </div>
  );
};

export default Card;
