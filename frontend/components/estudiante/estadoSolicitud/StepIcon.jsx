import React from "react";
import { FaCheckCircle, FaTimesCircle, FaClock } from "react-icons/fa";

const StepIcon = ({ estado }) => {
    const getIcon = () => {
        switch (estado) {
            case "aceptada":
                return (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center border-2 border-green-500">
                        <FaCheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                    </div>
                );
            case "rechazada":
                return (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center border-2 border-red-500">
                        <FaTimesCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-500" />
                    </div>
                );
            case "espera":
                return (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center border-2 border-yellow-500">
                        <FaClock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
                    </div>
                );
            default:
                return (
                    <div className="h-8 w-8 sm:h-10 sm:w-10 bg-white rounded-full flex items-center justify-center border-2 border-blue-500">
                        <FaClock className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>
                );
        }
    };

    return getIcon();
};

export default StepIcon;
