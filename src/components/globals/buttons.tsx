"use client"

import { forms, typoGraphy } from "@/lib/cssConfig";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import React, { ReactNode } from "react";
import { Button } from "../ui/button";

export type ButtonProps = {
  text: string;
  icon?: ReactNode;
  iconAction?: ReactNode;
  navigateTo?:string
};

export type LoadingProps = {
  type: "submit" | "reset" | "button";
  text:string
  className?: string;
  loading?: boolean;
  onClick?: () => void
};

export const Button01 = ({ text, icon, iconAction, navigateTo }: ButtonProps) => {
    const router = useRouter()


  return (
    <div className="flex py-5 px-4 gap-4 items-center bg-purple03 rounded-3xl cursor-pointer hover:bg-purple02" onClick={()=>{
        navigateTo && router.push(navigateTo)
    }}>
      <span className="p-3 rounded-full bg-purple04">
        {icon}
      </span>

      <span className={clsx("flex-1", typoGraphy.textBaseSB)}>{text}</span>

      <span className="p-1 rounded-full bg">{iconAction}</span>
    </div>
  );
};


export const LoadingButton = ({ type = "submit", className, loading, text,onClick }:LoadingProps) => {
  return (
    <Button
      type={type}
      className={clsx(
        "flex items-center justify-center py-4 rounded-lg",
        forms.buttonPuple,
        className,
        {
          "cursor-not-allowed opacity-70": loading,
        }
      )}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <svg
          className="animate-spin h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          ></path>
        </svg>
      ) : (
        text
      )}
    </Button>
  );
};


