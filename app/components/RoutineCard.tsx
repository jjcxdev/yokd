import React from "react";
import { startTransition } from "react";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { FaRegTrashAlt } from "react-icons/fa";

import SecondaryButton from "@/app/components/SecondaryButton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

import { startWorkoutSession } from "../actions/workout";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface RoutineCardProps {
  id: string;
  label: string;
  exercises: Array<{ name: string }>;
  icon?: JSX.Element;
  onDelete?: () => void;
}

export default function RoutineCard({
  id,
  label,
  exercises,
  onDelete,
  icon,
}: RoutineCardProps) {
  // Convert exercises array to comma-separated string
  const exerciseList = exercises.map((ex) => ex.name).join(", ");

  const handleStartRoutine = () => {
    startTransition(() => {
      startWorkoutSession(id).catch((error) => {
        console.error("Error starting workout:", error);
      });
    });
  };

  return (
    <>
      <Card className="bg-button">
        <CardContent className="p-6">
          <CardTitle className="flex items-center justify-between">
            {label}
            <Drawer>
              <DrawerTrigger asChild>
                <span className="cursor-pointer hover:text-accent">
                  <BiDotsHorizontalRounded size={20} />
                </span>
              </DrawerTrigger>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle>{label}</DrawerTitle>
                </DrawerHeader>
                <div className="p-4">
                  <Button
                    variant="destructive"
                    className="flex w-full items-center justify-center gap-2"
                    onClick={onDelete}
                  >
                    <FaRegTrashAlt />
                    Delete Routine
                  </Button>
                </div>
                <DrawerFooter>
                  <DrawerClose asChild>
                    <Button variant="outline" className="w-full">
                      Cancel
                    </Button>
                  </DrawerClose>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </CardTitle>
          <div className="line-clamp-2 pb-2 text-xs text-dimmed">
            {exerciseList}
          </div>
          <Button
            className="w-full text-background"
            onClick={handleStartRoutine}
          >
            Start Routine
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
