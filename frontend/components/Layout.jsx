import React from "react";
import Sidebar from "./Sidebar";
import { HeroUIProvider } from "@heroui/react";
import { Button } from "@heroui/react";

const Layout = ({ children }) => {
  return (
    <HeroUIProvider>
      <div className="h-screen flex flex-row justify-start">
        <Sidebar />
        <div className="bg-white flex-1 p-4 text-white">
          {children}
        </div>
      </div>
    </HeroUIProvider>
  );
};

export default Layout;
