import React from "react";
import { usePagination, PaginationItemType } from "@heroui/react";
import { ChevronIcon } from "../../icons/ChevronIcon";
import cn from "classnames";

const PaginacionArmarios = ({ 
    armarios, 
    currentPage, 
    onPageChange 
}) => {
    const { range, onNext, onPrevious, setPage } = usePagination({
        total: armarios.length,
        page: currentPage,
        siblings: 1,
        onChange: (page) => onPageChange(page),
    });

    return (
        <div className="flex flex-col lg:flex-col items-center justify-center">
        
            <div className="pagination-text">
                <ul className="flex lg:flex-col flex-row gap-2 items-center justify-center flex-wrap">
                    {range.map((page) => {
                        if (page === PaginationItemType.NEXT) {
                            return (
                                <li key={page} aria-label="next page" className="w-8 h-8">
                                    <button
                                        className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:scale-105"
                                        onClick={onNext}
                                    >
                                        <ChevronIcon className="lg:rotate-180 rotate-90" />
                                    </button>
                                </li>
                            );
                        }

                        if (page === PaginationItemType.PREV) {
                            return (
                                <li key={page} aria-label="previous page" className="w-8 h-8">
                                    <button
                                        className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105"
                                        onClick={onPrevious}
                                    >
                                        <ChevronIcon className="lg:rotate-0 -rotate-90" />
                                    </button>
                                </li>
                            );
                        }

                        if (page === PaginationItemType.DOTS) {
                            return (
                                <li key={page} className="w-8 h-8 flex items-center justify-center">
                                    ...
                                </li>
                            );
                        }

                        return (
                            <li key={page} aria-label={`page ${page}`} className="w-8 h-8">
                                <button
                                    className={cn(
                                        "w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:text-white hover:scale-105",
                                        currentPage === page && "bg-primario text-white"
                                    )}
                                    onClick={() => setPage(page)}
                                >
                                    {armarios[page - 1]?.id}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};

export default PaginacionArmarios;
