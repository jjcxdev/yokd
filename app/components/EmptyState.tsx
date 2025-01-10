import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";
import { BsCollectionFill } from "react-icons/bs";
import { FaDumbbell } from "react-icons/fa6";
import Image from "next/image";
import YokdLogo from "@/public/favicon.svg";

interface EmptyStateProps {
  onCreateFolder: () => void;
  onCreateRoutine: () => void;
}

export default function EmptyState({
  onCreateFolder,
  onCreateRoutine,
}: EmptyStateProps) {
  return (
    <>
      <Card className="h-min-screen bg-gradient-to-tr from-[#1A1A1A] via-[#1A1A1A] to-[#E7FC00]/20">
        <CardHeader>
          <CardTitle className="flex w-full flex-col items-center justify-center gap-2">
            <Image
              className="rounded-lg"
              src={YokdLogo}
              alt="YOKD Logo"
              width={60}
              height={60}
            />
            Welcome to YOKD
          </CardTitle>
          <CardDescription className="flex w-full justify-center text-xs">
            Let&apos;s get you started
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <h3 className="font-semibold">1. Create a Program</h3>
          <p className="text-center text-xs text-dimmed">
            Start by creating a program to organize your routines
          </p>
          <Button>
            <BsCollectionFill />
            New Program
          </Button>
        </CardContent>
        <CardContent className="flex flex-col items-center justify-center gap-4">
          <h3 className="font-semibold">2. Add a Routine</h3>
          <p className="text-center text-xs text-dimmed">
            Create your first workout routine with exercises
          </p>
          <Button>
            <FaDumbbell />
            New Routine
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
