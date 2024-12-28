"use client";
import React from "react";
import SessionLayout from "./SessionLayout";

export default function SessionWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const handleFinish = () => {
    console.log("Finish button clicked");
    // add logic here to stop the timer and save the data
    // Example: call a function that handles the async logic
    handleAsyncFinish();
  };

  const handleAsyncFinish = async () => {
    // add async logic here to stop the timer and save the data
  };
  return <SessionLayout onFinish={handleFinish}>{children}</SessionLayout>;
}
