import React from "react";
import { usePagination, PaginationItemType } from "@heroui/react";
import { ChevronIcon } from "../../icons/ChevronIcon";
import cn from "classnames";

const PaginacionArmarios = ({ armarios, currentPage, setCurrentPage }) => {
    const { range, onNext, onPrevious, setPage } = usePagination({
        total: armarios.length,
        page: currentPage,
        siblings: 1,
        onChange: (page) => setCurrentPage(page),
    });

    if (armarios.length <= 1) {
        return null; // No mostrar paginación si solo hay un armario o menos
    }

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="pagination-text">
                <ul className="flex flex-col gap-2 items-center">
                    {range.map((page) => {
                        if (page === PaginationItemType.NEXT) {
                            return (
                                <li key={page} aria-label="next page" className="w-8 h-8">
                                    <button
                                        className="w-full h-full text-white bg-celeste rounded-full flex items-center justify-center transition-transform duration-200 hover:bg-primario hover:scale-105"
                                        onClick={onNext}
                                    >
                                        <ChevronIcon className="rotate-180" />
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
                                        <ChevronIcon />
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
