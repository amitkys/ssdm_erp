"use client";

import { GraduationCap, MenuIcon, PanelsTopLeft } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { StudentMenu } from "@/app/student/_components/student-menu";
import { Menu } from "@/components/menu";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SheetMenu() {
  const pathname = usePathname();
  const isStudent = pathname?.startsWith("/student");

  return (
    <Sheet>
      <SheetTrigger className="lg:hidden" asChild>
        <Button className="h-8" variant="outline" size="icon">
          <MenuIcon size={20} />
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:w-72 px-3 h-full flex flex-col" side="left">
        <SheetHeader>
          <Button
            className="flex justify-center items-center pb-2 pt-1"
            variant="link"
            asChild
          >
            {isStudent ? (
              <Link
                href="/student/dashboard"
                className="flex items-center gap-2"
              >
                <GraduationCap className="w-6 h-6 mr-1" />
                <SheetTitle className="font-bold text-lg">
                  Student Portal
                </SheetTitle>
              </Link>
            ) : (
              <Link href="/college" className="flex items-center gap-2">
                <PanelsTopLeft className="w-6 h-6 mr-1" />
                <SheetTitle className="font-bold text-lg">SSDM ERP</SheetTitle>
              </Link>
            )}
          </Button>
        </SheetHeader>
        {isStudent ? <StudentMenu isOpen /> : <Menu isOpen />}
      </SheetContent>
    </Sheet>
  );
}
