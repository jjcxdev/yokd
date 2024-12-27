import React from "react";
import { deleteFolder } from "../actions/folders";

import SecondaryButton from "@/app/components/SecondaryButton";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { BiDotsHorizontalRounded } from "react-icons/bi";
import { Button } from "@/components/ui/button";
import { FaRegTrashAlt } from "react-icons/fa";

interface RoutineCardProps {
  label: string;
  exercises: Array<{ name: string }>;
  icon?: JSX.Element;
  onDelete?: () => void;
}

export default function RoutineCard({ ...props }: RoutineCardProps) {
  // Convert exercises array to comma-separated string
  const exerciseList = props.exercises.map((ex) => ex.name).join(", ");

  return (
    <div className="flex flex-col gap-1 rounded-lg border border-border bg-primary p-4">
      <div className="flex items-center justify-between font-bold">
        <div>{props.label}</div>
        <div className="flex items-center gap-2">
          <Drawer>
            <DrawerTrigger asChild>
              <span className="cursor-pointer hover:text-accent">
                <BiDotsHorizontalRounded size={20} />
              </span>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{props.label}</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <Button
                  variant="destructive"
                  className="flex w-full items-center justify-center gap-2"
                  onClick={props.onDelete}
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
          {props.icon}
        </div>
      </div>
      <div className="line-clamp-2 text-xs text-dimmed">{exerciseList}</div>
      <div>
        <SecondaryButton label="Start Routine" />
      </div>
    </div>
  );
}
