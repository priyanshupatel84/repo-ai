import { SidebarProvider } from "@/components/ui/sidebar";
import React from "react";
import AppSidebar from "./app-sidebar";
import { SignOut } from "@/components/sign-out";
import { UserAvatar } from "@/components/userAvatar";


type Props = {
  children: React.ReactNode;
};

const SidebarLayout = async ({ children }: Props) => {

  
  
  return (
      <SidebarProvider>
        <AppSidebar />

        <main className="m-2 w-full">
          <div className="item-center flex gap-2 rounded-md border border-sidebar-border bg-sidebar p-2 px-4 shadow sticky top-2 z-50">
            {/* <SearchBar /> */}
            <div className="ml-auto bg-blue-800 w-2"></div>
            <UserAvatar  className="mr-2" />
            <SignOut />
          </div>

          <div className="h-4"></div>

          {/* main content */}
          <div className="h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border border-sidebar-border bg-sidebar p-4 shadow">
            {children}
          </div>
        </main>
      </SidebarProvider>
  );
};

export default SidebarLayout;
